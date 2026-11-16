import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import Ajv from 'ajv';
import ts from 'typescript';

// Source-only implementation of WEBMCP.md and shared/webmcp.md. No site code
// executes here. Unknown expressions fail measurement instead of becoming PASS.
// The reviewed generic registrar consumes WEBMCP_TOOLS through a dynamic loop.
// Pin its exact bytes so arbitrary dynamic registrations never inherit this proof.
const REGISTRAR_SHA256 = '02004d5ccb12c5a5e3dd63929dc0535c9242df84e44ffd2cfe4ca3d3072f5a62';
const NAME = /^[A-Za-z0-9_.-]{1,128}$/;
const SENSITIVE =
  /pay|checkout|book|submit|file_|file-|subscribe|purchase|order|send|donate|charge/i;
const ACTION =
  /add|create|update|delete|remove|filter|navigate|set_|set-|cart|apply|select|open|start|fill/i;
const extensions = new Set(['.html', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.mdx']);
const ignored = new Set(['node_modules', '.git', '.wrangler', '.beads']);
const tools = [];
const ajv = new Ajv({ allErrors: true });
let scanned = 0;
const invalid = [];
const unknown = [];

function literal(node) {
  if (!node) throw new Error('missing value');
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) {
    const result = {};
    for (const member of node.properties) {
      if (
        !ts.isPropertyAssignment(member) ||
        member.name.kind === ts.SyntaxKind.ComputedPropertyName
      )
        throw new Error('dynamic object member');
      const key = member.name.text;
      if (Object.hasOwn(result, key)) throw new Error('duplicate object key');
      Object.defineProperty(result, key, { value: literal(member.initializer), enumerable: true });
    }
    return result;
  }
  throw new Error('dynamic expression');
}

function schema(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.type !== 'object')
    throw new Error('inputSchema must be an object schema');
  if (!ajv.validateSchema(value)) throw new Error(`invalid JSON Schema: ${ajv.errorsText()}`);
}

function descriptor(node, file) {
  if (!ts.isObjectLiteralExpression(node)) {
    unknown.push(`${file}: dynamic descriptor`);
    return;
  }
  const members = new Map();
  for (const member of node.properties) {
    if (
      (!ts.isPropertyAssignment(member) && !ts.isMethodDeclaration(member)) ||
      !member.name ||
      member.name.kind === ts.SyntaxKind.ComputedPropertyName
    ) {
      unknown.push(`${file}: dynamic descriptor member`);
      return;
    }
    const key = member.name.text;
    if (members.has(key)) invalid.push(`${file}: duplicate descriptor key ${key}`);
    members.set(key, member);
  }
  const value = (key) => literal(members.get(key)?.initializer);
  let name, description, cls;
  try {
    name = members.has('name') ? value('name') : '';
    description = members.has('description') ? value('description') : '';
    cls = members.has('webmcpClass') ? value('webmcpClass') : null;
  } catch (error) {
    unknown.push(`${file}: ${error.message}`);
    return;
  }
  if (typeof name !== 'string' || !NAME.test(name)) invalid.push(`${file}: invalid name`);
  if (typeof description !== 'string' || description.trim().length < 10)
    invalid.push(`${file}: invalid description`);
  if (cls !== null && !['answer', 'action', 'sensitive'].includes(cls))
    invalid.push(`${file}: invalid class`);
  cls ||= SENSITIVE.test(`${name} ${description}`)
    ? 'sensitive'
    : ACTION.test(`${name} ${description}`)
      ? 'action'
      : 'answer';
  const execute = members.get('execute');
  if (
    !execute ||
    !(
      ts.isMethodDeclaration(execute) ||
      (execute.initializer &&
        (ts.isArrowFunction(execute.initializer) || ts.isFunctionExpression(execute.initializer)))
    )
  )
    invalid.push(`${file}: ${name} missing executable function`);
  try {
    schema(value('inputSchema'));
  } catch (error) {
    invalid.push(`${file}: ${name} ${error.message}`);
  }
  if (cls === 'sensitive' && !/confirm|human|hold|approval/i.test(node.getText()))
    invalid.push(`${file}: ${name} missing confirmation marker`);
  tools.push({ name, cls });
}

function scan(file) {
  const text = readFileSync(file, 'utf8');
  scanned++;
  if (extname(file) === '.html' || extname(file) === '.mdx') {
    for (const match of text.matchAll(/<form\b[^>]*>/gi)) {
      const name = /\btoolname\s*=\s*["']([^"']*)["']/i.exec(match[0])?.[1];
      if (name === undefined) continue;
      const description = /\btooldescription\s*=\s*["']([^"']*)["']/i.exec(match[0])?.[1] || '';
      if (!NAME.test(name) || description.trim().length < 10)
        invalid.push(`${file}: invalid declarative form`);
      const cls = SENSITIVE.test(`${name} ${description}`) ? 'sensitive' : 'action';
      if (cls === 'sensitive' && !/confirm|human|hold|approval/i.test(match[0]))
        invalid.push(`${file}: missing confirmation marker`);
      tools.push({ name, cls });
    }
    return;
  }
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    extname(file) === '.tsx' || extname(file) === '.jsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  if (source.parseDiagnostics.length) {
    invalid.push(`${file}: syntax errors`);
    return;
  }
  const canonical = createHash('sha256').update(text).digest('hex') === REGISTRAR_SHA256;
  function visit(node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(source) === 'form'
    ) {
      const attributes = new Map(
        node.attributes.properties
          .filter(ts.isJsxAttribute)
          .map((a) => [a.name.getText(source), a.initializer]),
      );
      if (attributes.has('toolname')) {
        try {
          const read = (key) => {
            let value = attributes.get(key);
            if (value && ts.isJsxExpression(value)) value = value.expression;
            return value ? literal(value) : '';
          };
          const name = read('toolname');
          const description = read('tooldescription');
          if (
            typeof name !== 'string' ||
            !NAME.test(name) ||
            typeof description !== 'string' ||
            description.trim().length < 10
          )
            invalid.push(`${file}: invalid declarative form`);
          const cls = SENSITIVE.test(`${name} ${description}`) ? 'sensitive' : 'action';
          if (cls === 'sensitive' && !/confirm|human|hold|approval/i.test(node.getText(source)))
            invalid.push(`${file}: missing confirmation marker`);
          tools.push({ name, cls });
        } catch (error) {
          unknown.push(`${file}: ${error.message}`);
        }
      }
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(node.left) &&
      node.left.expression.getText(source) === 'window' &&
      node.left.name.text === 'WEBMCP_TOOLS'
    ) {
      if (!ts.isArrayLiteralExpression(node.right)) unknown.push(`${file}: dynamic inventory`);
      else for (const item of node.right.elements) descriptor(item, file);
    }
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'registerTool'
    ) {
      if (node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0]))
        descriptor(node.arguments[0], file);
      else if (!canonical) unknown.push(`${file}: unresolved registerTool call`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

function walk(path) {
  const stat = statSync(path);
  if (!stat.isDirectory()) {
    if (extensions.has(extname(path))) scan(path);
    return;
  }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const child = join(path, entry.name);
    if (entry.isSymbolicLink()) {
      unknown.push(`${child}: symlink requires review`);
      continue;
    }
    walk(child);
  }
}

const args = process.argv.slice(2);
const tier = args[args.indexOf('--require') + 1];
let code = 2;
try {
  if (args[0] !== '--source' || !args[1] || !['1', '2', '3'].includes(tier))
    throw new Error('use --source <path> --require 1|2|3');
  walk(resolve(args[1]));
  if (!scanned) unknown.push('no scannable files');
  const seen = new Set();
  for (const tool of tools) {
    if (seen.has(tool.name)) invalid.push(`duplicate name ${tool.name}`);
    seen.add(tool.name);
  }
  const answer = tools.filter((t) => t.cls === 'answer').length;
  const action = tools.filter((t) => t.cls === 'action').length;
  if (!tools.length || (tier === '2' && !answer) || (tier === '1' && (!answer || !action)))
    invalid.push('tier minimum unmet');
  code = unknown.length ? 2 : invalid.length ? 1 : 0;
  console.log(
    JSON.stringify({
      verdict: code === 0 ? 'ok' : code === 1 ? 'bad' : 'unmeasured',
      tools,
      invalid,
      unknown,
      scope: 'source declarations only; execution and live deployment remain separate',
    }),
  );
} catch (error) {
  console.log(JSON.stringify({ verdict: 'unmeasured', error: error.message }));
}
process.exitCode = code;
