"use client";

// /app/dashboard/turbositter/page.tsx
// Complete GUI for the TURBOSitter page.
// - Weather card with Refresh (gracefully handles missing API)
// - General Site Camera card (placeholder <video>)
// - Three expandable Enclosure blocks (North, Central, South)
//   Each enclosure shows summary badges when collapsed and reveals:
//     • Monitor feed (placeholder <video>)
//     • 3 mounts × 2 telescope cameras (names only, no images)
//
// You can wire real data later by replacing placeholder feeds and
// populating details from your DB/API. This file intentionally has no
// server-only exports (e.g., no `metadata`) so it compiles as a client page.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Camera,
  Cloud,
  DoorClosed,
  Droplets,
  Gauge,
  RefreshCw,
  ThermometerSun,
  Video,
  Wind,
  ChevronDown,
  ChevronRight,
  Expand,
  Shrink,
} from "lucide-react";

// ====== Types ======
export type WeatherRow = {
  clienttransactionid: number | null;
  servertransactionid: number | null;
  errornumber: number | null;
  errormessage: string | null;
  avgperiod: number | null;
  cloudcover: number | null; // 0-1 or %
  dewpoint: number | null; // °C
  humidity: number | null; // % or 0-1
  pressure: number | null; // hPa
  rainrate: number | null; // mm/hr
  skybrightness: number | null; // mag/arcsec² or a.u.
  skyquality: number | null; // a.u.
  skytemp: number | null; // °C
  starfwhm: number | null; // arcsec
  temperature: number | null; // °C
  winddirection: number | null; // deg
  windgust: number | null; // m/s
  windspeed: number | null; // m/s
  created_at?: string | null; // ISO
};

// ====== Helpers ======
function fmt(value: number | null | undefined, unit = "") {
  if (value === null || value === undefined) return "—";
  const s = Number.isInteger(value)
    ? String(value)
    : (value as number).toFixed(2);
  return unit ? `${s} ${unit}` : s;
}

function pct(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  const v = value > 1 ? value / 100 : value; // accept 0–1 or 0–100
  return `${Math.round(Math.max(0, Math.min(1, v)) * 100)}%`;
}

async function fetchLatestWeather(): Promise<WeatherRow | null> {
  try {
    const res = await fetch("/api/turbositter/weather", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; row: WeatherRow | null };
    return data.row ?? null;
  } catch {
    return null; // OK if API not present yet
  }
}

// ====== Page ======
export default function TurboSitterPage() {
  const router = useRouter();
  const [row, setRow] = useState<WeatherRow | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingWeather(true);
      const r = await fetchLatestWeather();
      if (!cancelled) {
        setRow(r);
        setLoadingWeather(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Enclosure UI state
  const [open, setOpen] = useState<{ [k: string]: boolean }>({
    north: false,
    central: false,
    south: false,
  });
  const allOpen = open.north && open.central && open.south;

  const enclosures = useMemo(
    () => [
      {
        id: "north",
        name: "North Enclosure",
        details: {
          lid: "Closed",
          rain: "Dry",
          windLockout: "Inactive",
          temp: "—",
        },
        monitorSrc: "/feeds/north-monitor.m3u8",
        mounts: [
          { name: "Mount A", cams: ["A1 Telescope Cam", "A2 Telescope Cam"] },
          { name: "Mount B", cams: ["B1 Telescope Cam", "B2 Telescope Cam"] },
          { name: "Mount C", cams: ["C1 Telescope Cam", "C2 Telescope Cam"] },
        ],
      },
      {
        id: "central",
        name: "Central Enclosure",
        details: {
          lid: "Closed",
          rain: "Dry",
          windLockout: "Inactive",
          temp: "—",
        },
        monitorSrc: "/feeds/central-monitor.m3u8",
        mounts: [
          { name: "Mount A", cams: ["A1 Telescope Cam", "A2 Telescope Cam"] },
          { name: "Mount B", cams: ["B1 Telescope Cam", "B2 Telescope Cam"] },
          { name: "Mount C", cams: ["C1 Telescope Cam", "C2 Telescope Cam"] },
        ],
      },
      {
        id: "south",
        name: "South Enclosure",
        details: {
          lid: "Closed",
          rain: "Dry",
          windLockout: "Inactive",
          temp: "—",
        },
        monitorSrc: "/feeds/south-monitor.m3u8",
        mounts: [
          { name: "Mount A", cams: ["A1 Telescope Cam", "A2 Telescope Cam"] },
          { name: "Mount B", cams: ["B1 Telescope Cam", "B2 Telescope Cam"] },
          { name: "Mount C", cams: ["C1 Telescope Cam", "C2 Telescope Cam"] },
        ],
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">TURBOSitter</h1>
          <div className="flex items-center gap-2 text-slate-500">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
              onClick={() =>
                setOpen({ north: true, central: true, south: true })
              }
            >
              <Expand className="w-4 h-4" /> Expand all
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
              onClick={() =>
                setOpen({ north: false, central: false, south: false })
              }
            >
              <Shrink className="w-4 h-4" /> Collapse all
            </button>
          </div>
        </header>

        {/* Grid: Weather (2 cols) + Quick Enclosure summary (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* WEATHER CARD */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Latest Weather Data
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setLoadingWeather(true);
                    fetchLatestWeather().then((r) => {
                      setRow(r);
                      setLoadingWeather(false);
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 active:scale-[0.99]"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>

              <div className="p-5">
                {loadingWeather ? (
                  <div className="text-slate-500">Loading…</div>
                ) : row ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    <KV
                      label="Air Temp"
                      value={fmt(row.temperature, "°C")}
                      icon={<ThermometerSun className="w-4 h-4" />}
                    />
                    <KV
                      label="Dew Point"
                      value={fmt(row.dewpoint, "°C")}
                      icon={<Droplets className="w-4 h-4" />}
                    />
                    <KV
                      label="Humidity"
                      value={pct(row.humidity)}
                      icon={<Droplets className="w-4 h-4" />}
                    />
                    <KV
                      label="Pressure"
                      value={fmt(row.pressure, "hPa")}
                      icon={<Gauge className="w-4 h-4" />}
                    />
                    <KV
                      label="Wind Speed"
                      value={fmt(row.windspeed, "m/s")}
                      icon={<Wind className="w-4 h-4" />}
                    />
                    <KV
                      label="Wind Gust"
                      value={fmt(row.windgust, "m/s")}
                      icon={<Wind className="w-4 h-4" />}
                    />
                    <KV
                      label="Wind Dir"
                      value={fmt(row.winddirection, "°")}
                      icon={<Activity className="w-4 h-4" />}
                    />
                    <KV
                      label="Cloud Cover"
                      value={pct(row.cloudcover)}
                      icon={<Cloud className="w-4 h-4" />}
                    />
                    <KV
                      label="Rain Rate"
                      value={fmt(row.rainrate, "mm/hr")}
                      icon={<Cloud className="w-4 h-4" />}
                    />
                    <KV
                      label="Sky Temp"
                      value={fmt(row.skytemp, "°C")}
                      icon={<ThermometerSun className="w-4 h-4" />}
                    />
                    <KV
                      label="Sky Brightness"
                      value={fmt(row.skybrightness, "mag/arcsec²")}
                      icon={<Camera className="w-4 h-4" />}
                    />
                    <KV
                      label="Sky Quality"
                      value={fmt(row.skyquality)}
                      icon={<Camera className="w-4 h-4" />}
                    />
                    <KV
                      label="Star FWHM"
                      value={fmt(row.starfwhm, "arcsec")}
                      icon={<Camera className="w-4 h-4" />}
                    />
                    <KV
                      label="Avg Period"
                      value={fmt(row.avgperiod, "s")}
                      icon={<Gauge className="w-4 h-4" />}
                    />
                    <KV
                      label="Server Txn ID"
                      value={fmt(row.servertransactionid)}
                      icon={<Gauge className="w-4 h-4" />}
                    />
                    <KV
                      label="Client Txn ID"
                      value={fmt(row.clienttransactionid)}
                      icon={<Gauge className="w-4 h-4" />}
                    />
                  </div>
                ) : (
                  <div className="text-slate-500">
                    No data found (API not wired yet).
                  </div>
                )}

                {row?.errormessage ? (
                  <div className="mt-4 text-sm text-amber-600">
                    Error Message: {row.errormessage}
                  </div>
                ) : null}

                <div className="mt-4 text-xs text-slate-500">
                  {row?.created_at ? (
                    <span>
                      Last updated: {new Date(row.created_at).toLocaleString()}
                    </span>
                  ) : (
                    <span>Showing placeholders until API is connected.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick summary card (optional space filler) */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <DoorClosed className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Enclosures
                  </h2>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <BadgeLine
                  label="North"
                  value={open.north ? "Expanded" : "Collapsed"}
                />
                <BadgeLine
                  label="Central"
                  value={open.central ? "Expanded" : "Collapsed"}
                />
                <BadgeLine
                  label="South"
                  value={open.south ? "Expanded" : "Collapsed"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* General Site Camera */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                General Site Camera
              </h2>
            </div>
          </div>
          <div className="p-5">
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <div className="aspect-video bg-slate-100 flex items-center justify-center">
                <video className="w-full h-full" controls muted>
                  <source
                    src="/feeds/site-general.m3u8"
                    type="application/vnd.apple.mpegurl"
                  />
                </video>
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-sm text-slate-700">
                Whole Site Overview
              </div>
            </div>
          </div>
        </div>

        {/* Enclosure Blocks */}
        <div className="space-y-6">
          {enclosures.map((enc) => (
            <EnclosureBlock
              key={enc.id}
              id={enc.id}
              name={enc.name}
              details={enc.details}
              monitorSrc={enc.monitorSrc}
              mounts={enc.mounts}
              open={open[enc.id as keyof typeof open]}
              setOpen={(v) => setOpen((s) => ({ ...s, [enc.id]: v }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== Components ======
function KV({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
      </div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function BadgeLine({
  label,
  value,
  icon,
  tone = "muted",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "ok" | "warn" | "err" | "muted";
}) {
  const toneMap: Record<string, string> = {
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
    err: "bg-rose-50 text-rose-700 border-rose-200",
    muted: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border ${toneMap[tone]}`}
      >
        {icon}
        {value}
      </span>
    </div>
  );
}

function EnclosureBlock({
  id,
  name,
  details,
  monitorSrc,
  mounts,
  open,
  setOpen,
}: {
  id: string;
  name: string;
  details: { lid: string; rain: string; windLockout: string; temp?: string };
  monitorSrc: string;
  mounts: { name: string; cams: string[] }[];
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50"
        aria-expanded={open}
        aria-controls={`${id}-content`}
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="w-5 h-5 text-indigo-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-indigo-600" />
          )}
          <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
        </div>
        <span className="text-sm text-slate-500">
          {open ? "Hide" : "Show"} cameras
        </span>
      </button>

      {/* Summary badges */}
      <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <BadgeLine
          label="Lid"
          value={details.lid}
          tone={details.lid === "Closed" ? "ok" : "warn"}
        />
        <BadgeLine
          label="Rain"
          value={details.rain}
          tone={details.rain === "Dry" ? "ok" : "warn"}
        />
        <BadgeLine
          label="Wind Lockout"
          value={details.windLockout}
          tone={details.windLockout === "Inactive" ? "ok" : "warn"}
        />
        <BadgeLine label="Internal Temp" value={details.temp || "—"} />
      </div>

      {/* Expandable content */}
      {open && (
        <div id={`${id}-content`} className="px-5 pb-5">
          {/* Monitor Feed */}
          <div className="mb-4">
            <div className="text-sm font-medium text-slate-700 mb-2">
              Monitor Camera
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <div className="aspect-video bg-slate-100 flex items-center justify-center">
                <video className="w-full h-full" controls muted>
                  <source
                    src={monitorSrc}
                    type="application/vnd.apple.mpegurl"
                  />
                </video>
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-sm text-slate-700">
                {name} Monitor
              </div>
            </div>
          </div>

          {/* Mounts & Cameras */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mounts.map((m) => (
              <div key={m.name} className="rounded-xl border border-slate-200">
                <div className="px-4 py-2 border-b border-slate-100 font-medium text-slate-800">
                  {m.name}
                </div>
                <ul className="divide-y divide-slate-100">
                  {m.cams.map((c) => (
                    <li
                      key={c}
                      className="px-4 py-2 text-sm text-slate-700 flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4 text-slate-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
