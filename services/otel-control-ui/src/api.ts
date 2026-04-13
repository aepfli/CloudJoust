const BASE = "/observability";

export interface FlagStatus {
  [flagName: string]: {
    defaultVariant: string;
    targeting: unknown;
  };
}

export async function getStatus(): Promise<FlagStatus> {
  const res = await fetch(`${BASE}/status`);
  return res.json();
}

export async function setSampling(rate: string): Promise<void> {
  await fetch(`${BASE}/sampling/${rate}`, { method: "POST" });
}

export async function setVerboseLogging(value: "on" | "off"): Promise<void> {
  await fetch(`${BASE}/verbose-logging/${value}`, { method: "POST" });
}

export async function setEnrichment(level: string): Promise<void> {
  await fetch(`${BASE}/enrichment/${level}`, { method: "POST" });
}

export async function setMetricsFilter(pattern: string): Promise<void> {
  await fetch(`${BASE}/metrics-filter/${pattern}`, { method: "POST" });
}

export async function resetAll(): Promise<void> {
  await fetch(`${BASE}/reset`, { method: "POST" });
}

export async function presetQuiet(): Promise<void> {
  await fetch(`${BASE}/preset/quiet`, { method: "POST" });
}

export async function presetFullBlast(): Promise<void> {
  await fetch(`${BASE}/preset/full-blast`, { method: "POST" });
}

export async function presetDebugController(serial: string): Promise<void> {
  await fetch(`${BASE}/preset/debug-controller?serial=${encodeURIComponent(serial)}`, {
    method: "POST",
  });
}
