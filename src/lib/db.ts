import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(runtimeDir, "../../../data/database.json");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function readDatabase(): Record<string, unknown> {
  if (!fs.existsSync(dbPath)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function writeDatabase(data: Record<string, unknown>) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
}

export function loadState(): Record<string, unknown> {
  return readDatabase();
}

export function saveState(state: Record<string, unknown>) {
  const current = readDatabase();
  const next = { ...current, ...state };
  writeDatabase(next);
}

export function getValue(key: string): unknown {
  const state = readDatabase();
  return state[key] ?? null;
}

export function setValue(key: string, value: unknown) {
  const state = readDatabase();
  state[key] = value;
  writeDatabase(state);
}
