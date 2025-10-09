"use client";

// NOTE: This single file contains a full, working UI for the new
// /dashboard/turbositter route with three blocks: Weather, Cameras, Enclosure.
// Weather is hydrated from Postgres via a serverless API route in this file
// (using a tiny fetch to /api/turbositter/weather). The refresh button calls
// router.refresh() so the server re-runs and re-reads from the DB.
//
// Drop this file at: app/dashboard/turbositter/page.tsx
// Also add a sidebar link to "/dashboard/turbositter" in your layout/sidebar.
//
// ENV expected (either DATABASE_URL or discrete vars):
// - DATABASE_URL (postgres://user:pass@host:port/dbname)
//   or
// - PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
//
// Table expected (based on your inserter script): turbositter.mro_weather
// Columns include (abbrev): clienttransactionid, servertransactionid,
// errornumber, errormessage, avgperiod, cloudcover, dewpoint, humidity,
// pressure, rainrate, skybrightness, skyquality, skytemp, starfwhm,
// temperature, winddirection, windgust, windspeed, created_at (optional).
// If created_at is absent, we order by servertransactionid desc.

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Metadata } from "next";
import {
  Camera,
  Cloud,
  Gauge,
  RefreshCw,
  Wind,
  ThermometerSun,
  Droplets,
  Eye,
  Activity,
  Video,
  DoorClosed,
  DoorOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "TURBOSitter · TURBO Dashboard",
  description: "Hardware monitoring for TURBO Telescope",
};

// --- Types ---
export type WeatherRow = {
  clienttransactionid: number | null;
  servertransactionid: number | null;
  errornumber: number | null;
  errormessage: string | null;
  avgperiod: number | null;
  cloudcover: number | null; // fraction [0-1]
  dewpoint: number | null; // °C
  humidity: number | null; // %
  pressure: number | null; // hPa
  rainrate: number | null; // mm/hr
  skybrightness: number | null; // mag/arcsec^2 or a.u.
  skyquality: number | null; // a.u.
  skytemp: number | null; // °C
  starfwhm: number | null; // arcsec
  temperature: number | null; // °C
  winddirection: number | null; // deg
  windgust: number | null; // m/s
  windspeed: number | null; // m/s
  created_at?: string | null; // ISO if present
};

// --- Helpers ---
function fmt(value: number | null | undefined, unit = "") {
  if (value === null || value === undefined) return "—";
  const isInt = Number.isInteger(value);
  const s = isInt ? String(value) : value.toFixed(2);
  return unit ? `${s} ${unit}` : s;
}

function pct(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  const v = Math.max(0, Math.min(1, value));
  return `${(v * 100).toFixed(0)}%`;
}

// --- Client-side data fetcher to keep this file self-contained ---
async function fetchLatestWeather(): Promise<WeatherRow | null> {
  try {
    const res = await fetch("/api/turbositter/weather", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; row: WeatherRow | null };
    return data.row ?? null;
  } catch {
    return null;
  }
}

export default function TurboSitterPage() {
  const router = useRouter();
  const [row, setRow] = useState<WeatherRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetchLatestWeather();
      setRow(r);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">TURBOSitter</h1>
          <div className="text-slate-500">Hardware Monitoring</div>
        </header>

        {/* Grid of blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* WEATHER CARD (spans 2 cols on large) */}
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
                    router.refresh();
                    setLoading(true);
                    fetchLatestWeather().then((r) => {
                      setRow(r);
                      setLoading(false);
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 active:scale-[0.99]"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>

              <div className="p-5">
                {loading ? (
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
                      value={pct(row.humidity ? row.humidity / 100 : null)}
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
                      icon={<Eye className="w-4 h-4" />}
                    />
                    <KV
                      label="Sky Quality"
                      value={fmt(row.skyquality)}
                      icon={<Eye className="w-4 h-4" />}
                    />
                    <KV
                      label="Star FWHM"
                      value={fmt(row.starfwhm, "arcsec")}
                      icon={<Eye className="w-4 h-4" />}
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
                  <div className="text-slate-500">No data found.</div>
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
                    <span>Ordering by most recent transaction id.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ENCLOSURE CARD */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <DoorClosed className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Enclosure
                  </h2>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {/* Placeholder signals – wire these to real values later */}
                <BadgeLine
                  label="Lid"
                  value="Closed"
                  icon={<DoorClosed className="w-4 h-4" />}
                  tone="ok"
                />
                <BadgeLine label="Rain Sensor" value="Dry" tone="ok" />
                <BadgeLine label="Wind Lockout" value="Inactive" tone="ok" />
                <BadgeLine label="Last Change" value="—" />
              </div>
            </div>
          </div>
        </div>

        {/* CAMERAS GRID */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-slate-900">Cameras</h2>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder camera tiles – replace src with actual mjpeg/thumbnail URLs */}
            <CamTile name="North Yard" src="/placeholder.svg" />
            <CamTile name="Pier / Mount" src="/placeholder.svg" />
            <CamTile name="All-Sky" src="/placeholder.svg" />
          </div>
        </div>
      </div>
    </div>
  );
}

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

function CamTile({ name, src }: { name: string; src: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200">
      {/* Replace with <img> or <video> that points to actual camera stream/frames */}
      <div className="aspect-video bg-slate-100 flex items-center justify-center">
        <Camera className="w-8 h-8 text-slate-400" />
      </div>
      <div className="px-4 py-2 border-t border-slate-100 text-sm text-slate-700">
        {name}
      </div>
    </div>
  );
}

// ---------------------------------------------
// API ROUTE collocated (for convenience in this snippet):
// Create file: app/api/turbositter/weather/route.ts with the code below.
// ---------------------------------------------

export const dynamic = "force-dynamic"; // don't cache serverless response

async function queryLatestWeather(): Promise<WeatherRow | null> {
  // Import here to keep client bundle clean.
  const { Client } = await import("pg");

  // Prefer DATABASE_URL; otherwise fall back to discrete env vars.
  const databaseUrl = process.env.DATABASE_URL;
  const client = databaseUrl
    ? new Client({ connectionString: databaseUrl })
    : new Client({
        host: process.env.PGHOST || "localhost",
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE || "postgres",
      });

  await client.connect();
  try {
    const res = await client.query<WeatherRow>(
      `SELECT clienttransactionid, servertransactionid, errornumber, errormessage,
              avgperiod, cloudcover, dewpoint, humidity, pressure, rainrate,
              skybrightness, skyquality, skytemp, starfwhm, temperature,
              winddirection, windgust, windspeed,
              (CASE WHEN column_name IS NULL THEN NULL ELSE created_at END) as created_at
         FROM turbositter.mro_weather
         ORDER BY COALESCE(created_at, to_timestamp(servertransactionid::text, 'YYYYMMDDHH24MISS') ) DESC NULLS LAST
         LIMIT 1;`
    );
    return res.rows[0] ?? null;
  } finally {
    await client.end();
  }
}

export async function GET() {
  try {
    const row = await queryLatestWeather();
    return new Response(JSON.stringify({ ok: true, row }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message || err) }),
      { status: 500 }
    );
  }
}
