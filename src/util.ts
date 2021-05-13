import {promisify} from 'util';

export async function captureOutput (options: {
  stderr?: boolean,
  stdout?: boolean
}, fn: Function) {
  if (typeof options === 'function') fn = options;
  if (options.stdout === undefined) options.stdout = true;

  const output: Uint8Array[] & string[] = [];
  const stdoutWrite = process.stdout.write;
  const stderrWrite = process.stderr.write;
  if (options.stdout) process.stdout.write = (chunk: Uint8Array & string) :boolean => !!output.push(chunk);
  if (options.stderr) process.stderr.write = (chunk: Uint8Array & string) :boolean => !!output.push(chunk);

  try {
    await fn();
  } finally {
    process.stdout.write = stdoutWrite;
    process.stderr.write = stderrWrite;
  }

  return output.length && Buffer.isBuffer(output[0]) ? Buffer.concat(output) : output.join('');
}

export function decodeURIComponentSafe (value: string) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return null;
  }
}

export const sleep = promisify(setTimeout);

export function tablify (rows: string[][]) {
  const spec = [];

  const table = rows.map(row => {
    return row.map((col, i) => {
      col = (col == null ? '' : typeof col === 'string' ? col : '' + col).replace(/[\r\n]/g, '');
      if (col.length >= (spec[i] || 0)) spec[i] = col.length;
      return col;
    });
  });

  const lines = table.map(row => row.map((col, i) => i === row.length - 1 ? col : col.padEnd(spec[i])).join('  '));
  return lines.join('\n') + '\n';
}
