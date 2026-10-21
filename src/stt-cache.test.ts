import { describe, expect, it, vi } from 'vitest';
import worker from './index';

type Env = Parameters<typeof worker.scheduled>[1];

function fixture() {
  const stored = new Map<string, string>();
  const run = vi.fn(async (_model: string) => ({ text: 'A synthetic transcription.' }));
  const get = vi.fn(async (key: string) => {
    const value = stored.get(key);
    return value ? JSON.parse(value) : null;
  });
  const put = vi.fn(async (key: string, value: string) => {
    stored.set(key, value);
  });
  const limiter = { limit: vi.fn(async () => ({ success: true })) };
  // SAFETY: STT uses only run/get/put. Unimplemented binding members are absent
  // so unexpected calls fail; these stubs never invoke external services.
  const env: Env = {
    AI: { run } as unknown as Ai,
    FRESHNESS: { get, put } as unknown as KVNamespace,
    MEDIA_LIMIT: limiter,
    CHAT_LIMIT: limiter,
    SITE_ORIGIN: 'https://16bedlimit.com',
  };
  const transcribe = (audio = 'synthetic audio') =>
    worker.fetch(
      new Request('https://16bedlimit.com/api/stt', {
        method: 'POST',
        headers: { 'content-type': 'audio/webm' },
        body: audio,
      }),
      env,
    );
  return { env, run, get, put, stored, limiter, transcribe };
}

describe('STT cache through the actual Worker handler', () => {
  it('reuses a successful transcript for matching audio without a second inference', async () => {
    const f = fixture();
    const first = await f.transcribe();
    expect(await first.json()).toEqual({ text: 'A synthetic transcription.' });
    expect(first.headers.get('x-stt-cache')).toBe('MISS');
    const second = await f.transcribe();
    expect(await second.json()).toEqual({ text: 'A synthetic transcription.' });
    expect(second.headers.get('x-stt-cache')).toBe('HIT');
    expect(f.run).toHaveBeenCalledTimes(1);
    expect(f.put).toHaveBeenCalledWith(
      expect.stringMatching(/^stt:[a-f0-9]{64}$/),
      JSON.stringify({ text: 'A synthetic transcription.', model: 'nova-3' }),
      { expirationTtl: 604800 },
    );
    expect(f.limiter.limit).toHaveBeenCalledTimes(2);
    await f.transcribe('different synthetic audio');
    expect(f.run).toHaveBeenCalledTimes(2);
  });

  it('rejects a malformed cached transcript and runs inference', async () => {
    const f = fixture();
    f.get.mockResolvedValue({ text: 42, model: 'nova-3' });
    const response = await f.transcribe();
    expect(await response.json()).toEqual({ text: 'A synthetic transcription.' });
    expect(f.run).toHaveBeenCalledTimes(1);
  });

  it('continues when optional cache reads and writes fail', async () => {
    const f = fixture();
    f.get.mockRejectedValue(new Error('KV read failed'));
    f.put.mockRejectedValue(new Error('KV write failed'));
    expect(await (await f.transcribe()).json()).toEqual({ text: 'A synthetic transcription.' });
    expect(f.run).toHaveBeenCalledTimes(1);
    delete f.env.FRESHNESS;
    expect(await (await f.transcribe('cache absent')).json()).toEqual({
      text: 'A synthetic transcription.',
    });
    expect(f.run).toHaveBeenCalledTimes(2);
  });

  it('caches the fallback model only after successful transcription', async () => {
    const f = fixture();
    f.run.mockRejectedValueOnce(new Error('Nova unavailable'));
    const first = await f.transcribe();
    expect(first.headers.get('x-stt-model')).toBe('whisper-large-v3-turbo');
    const second = await f.transcribe();
    expect(second.headers.get('x-stt-model')).toBe('whisper-large-v3-turbo');
    expect(second.headers.get('x-stt-cache')).toBe('HIT');
    expect(f.run).toHaveBeenCalledTimes(2);
  });

  it('does not cache empty or failed model responses', async () => {
    const f = fixture();
    f.run.mockResolvedValue({ text: '' });
    const empty = await f.transcribe();
    expect(await empty.json()).toEqual({ error: 'No speech detected in that clip.' });
    expect(f.put).not.toHaveBeenCalled();
    f.run.mockRejectedValue(new Error('model unavailable'));
    expect((await f.transcribe()).status).toBe(503);
    expect(f.put).not.toHaveBeenCalled();
  });
});
