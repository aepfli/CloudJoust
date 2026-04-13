import { useEffect, useState } from "preact/hooks";
import * as api from "./api";
import type { FlagStatus } from "./api";

const FLAG_CONFIG = [
  {
    name: "trace_sampling_rate",
    label: "Trace Sampling Rate",
    description: "Controls what fraction of traces are sampled across all services",
    variants: ["off", "low", "half", "full"],
    setter: api.setSampling,
  },
  {
    name: "verbose_logging",
    label: "Verbose Logging",
    description: "Toggles DEBUG-level log export to Loki/Dynatrace",
    variants: ["on", "off"],
    setter: api.setVerboseLogging,
  },
  {
    name: "span_enrichment_config",
    label: "Span Enrichment",
    description: "Controls diagnostic attributes added to every span",
    variants: ["off", "basic", "flags", "full"],
    setter: api.setEnrichment,
  },
  {
    name: "metrics_filter_pattern",
    label: "Metrics Filter",
    description: "Filters which metrics are exported by name pattern",
    variants: ["none", "poll_only", "process_only"],
    setter: api.setMetricsFilter,
  },
];

export function App() {
  const [status, setStatus] = useState<FlagStatus>({});
  const [lastAction, setLastAction] = useState<string>("");

  const refreshStatus = async () => {
    try {
      const s = await api.getStatus();
      setStatus(s);
    } catch {
      // flagd or connect-proxy not available
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVariant = async (setter: (v: string) => Promise<void>, variant: string, label: string) => {
    await setter(variant);
    setLastAction(`Set ${label} → ${variant}`);
    refreshStatus();
  };

  const handlePreset = async (fn: () => Promise<void>, name: string) => {
    await fn();
    setLastAction(`Activated preset: ${name}`);
    refreshStatus();
  };

  return (
    <>
      <h1>OTel Pipeline Control</h1>
      <p class="subtitle">Dynamic OpenTelemetry control via OpenFeature / flagd</p>

      <div class="section-title">Presets</div>
      <div class="presets">
        <button class="preset-btn blast" onClick={() => handlePreset(api.presetFullBlast, "Full Blast")}>
          Full Blast
        </button>
        <button class="preset-btn quiet" onClick={() => handlePreset(api.presetQuiet, "Quiet")}>
          Quiet
        </button>
        <button class="preset-btn reset" onClick={() => handlePreset(api.resetAll, "Reset")}>
          Reset
        </button>
        <button
          class="preset-btn debug"
          onClick={() => {
            const serial = prompt("Controller serial:");
            if (serial) handlePreset(() => api.presetDebugController(serial), `Debug ${serial}`);
          }}
        >
          Debug Controller
        </button>
      </div>

      <div class="section-title">SDK Controls</div>
      <div class="cards">
        {FLAG_CONFIG.map((flag) => {
          const current = status[flag.name]?.defaultVariant ?? "—";
          return (
            <div class="card" key={flag.name}>
              <h3>{flag.label}</h3>
              <p class="description">{flag.description}</p>
              <p class="current">Current: {current}</p>
              <div class="variants">
                {flag.variants.map((v) => (
                  <button
                    key={v}
                    class={`variant-btn ${v === current ? "active" : ""}`}
                    onClick={() => handleVariant(flag.setter, v, flag.label)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div class="section-title">Observability</div>
      <div class="links">
        <a href="/jaeger/" target="_blank">Jaeger Traces</a>
        <a href="/grafana/d/otel-pipeline-control" target="_blank">Grafana Dashboard</a>
        <a href="/grafana/explore" target="_blank">Loki Logs</a>
      </div>

      {lastAction && <div class="status-bar">Last action: {lastAction}</div>}
    </>
  );
}
