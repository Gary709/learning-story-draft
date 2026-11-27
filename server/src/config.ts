import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

/** Repo root both for `server/src` (dev, tests) and `server/dist` (production). */
export function repoRoot(): string {
  return path.resolve(moduleDir, '../..');
}

/**
 * Load a local .env without overriding variables that are already set.
 * Values are never logged.
 */
export function loadDotEnv(env: NodeJS.ProcessEnv = process.env): void {
  const files = [path.join(repoRoot(), '.env'), path.resolve(process.cwd(), '.env')];
  const seen = new Set<string>();
  for (const file of files) {
    if (seen.has(file) || !fs.existsSync(file)) continue;
    seen.add(file);
    const text = fs.readFileSync(file, 'utf8');
    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
      if (env[key] !== undefined) continue;
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }
}

export type LlmMode = 'rules' | 'model';

export type AppConfig = {
  port: number;
  mode: LlmMode;
  openaiModel: string;
  openaiBaseUrl: string;
  apiKey: string;
};

export function readConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const apiKey = env.OPENAI_API_KEY?.trim() ?? '';
  const port = Number(env.PORT ?? 8787);
  const base = (env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1').replace(/\/$/, '');
  return {
    port: Number.isFinite(port) && port > 0 ? port : 8787,
    mode: apiKey ? 'model' : 'rules',
    openaiModel: env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
    openaiBaseUrl: base,
    apiKey,
  };
}
