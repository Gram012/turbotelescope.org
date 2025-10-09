"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Camera,
  Cloud,
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

export type WeatherRow = {
  temperature: number | null;
  dewpoint: number | null;
  humidity: number | null;
  pressure: number | null;
  windspeed: number | null;
  windgust: number | null;
  winddirection: number | null;
  cloudcover: number | null;
  rainrate: number | null;
  skytemp: number | null;
  skybrightness: number | null;
  skyquality: number | null;
  starfwhm: number | null;
  avgperiod: number | null;
  servertransactionid: number | null;
  clienttransactionid: number | null;
};

function fmt(v: number | null | undefined, unit = "") {
  if (v === null || v === undefined) return "—";
  const val = Number.isInteger(v) ? v.toString() : v.toFixed(2);
  return `${val}${unit ? ` ${unit}` : ""}`;
}

function pct(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  const p = v > 1 ? v / 100 : v;
  return `${Math.round(p * 100)}%`;
}

export default function TurboSitterPage() {
  const [row, setRow] = useState<WeatherRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<{ [k: string]: boolean }>({
    north: false,
    central: false,
    south: false,
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setRow({
        temperature: 12.3,
        dewpoint: 4.5,
        humidity: 0.45,
        pressure: 1012,
        windspeed: 3.2,
        windgust: 4.5,
        winddirection: 270,
        cloudcover: 0.6,
        rainrate: 0.0,
        skytemp: -10,
        skybrightness: 20,
        skyquality: 1,
        starfwhm: 2.3,
        avgperiod: 5,
        servertransactionid: 1,
        clienttransactionid: 1,
      });
      setLoading(false);
    }, 500);
  }, []);

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
          {
            name: "North Mount",
            cams: ["N1 Telescope Cam", "N2 Telescope Cam"],
          },
          {
            name: "South Mount",
            cams: ["S1 Telescope Cam", "S2 Telescope Cam"],
          },
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
          {
            name: "North Mount",
            cams: ["N1 Telescope Cam", "N2 Telescope Cam"],
          },
          {
            name: "South Mount",
            cams: ["S1 Telescope Cam", "S2 Telescope Cam"],
          },
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
          {
            name: "North Mount",
            cams: ["N1 Telescope Cam", "N2 Telescope Cam"],
          },
          {
            name: "South Mount",
            cams: ["S1 Telescope Cam", "S2 Telescope Cam"],
          },
        ],
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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

        {/* Top row: Weather (taller) + Site Cam + Bot below */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weather */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[28rem] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                Latest Weather Data
              </h2>
              <button
                onClick={() => setLoading(true)}
                className="inline-flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-xl text-sm hover:bg-slate-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="text-slate-500">Loading…</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <KV label="Air Temp" value={fmt(row?.temperature, "°C")} />
                <KV label="Dew Point" value={fmt(row?.dewpoint, "°C")} />
                <KV label="Humidity" value={pct(row?.humidity)} />
                <KV label="Pressure" value={fmt(row?.pressure, "hPa")} />
                <KV label="Wind Speed" value={fmt(row?.windspeed, "m/s")} />
                <KV label="Wind Gust" value={fmt(row?.windgust, "m/s")} />
                <KV label="Wind Dir" value={fmt(row?.winddirection, "°")} />
                <KV label="Cloud Cover" value={pct(row?.cloudcover)} />
                <KV label="Rain Rate" value={fmt(row?.rainrate, "mm/hr")} />
                <KV label="Sky Temp" value={fmt(row?.skytemp, "°C")} />
              </div>
            )}
          </div>

          {/* Right column: Site cam and bot */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden p-5 h-56">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-2">
                <Video className="w-5 h-5 text-green-600" />
                General Site Camera
              </h2>
              <div className="rounded-xl overflow-hidden border border-slate-200 h-full">
                <video className="w-full h-full" controls muted>
                  <source
                    src="/feeds/site-general.m3u8"
                    type="application/vnd.apple.mpegurl"
                  />
                </video>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden p-5 h-56">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                TURBOSitter Bot Readout
              </h2>
              <div className="rounded-xl border border-slate-200 p-4 h-full overflow-auto">
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>
                    <span className="font-medium">Status:</span> Nominal
                  </li>
                  <li>
                    <span className="font-medium">Last Poll:</span> —
                  </li>
                  <li>
                    <span className="font-medium">Active Alerts:</span> None
                  </li>
                  <li>
                    <span className="font-medium">Recent Events:</span>
                    <ul className="ml-4 list-disc">
                      <li>—</li>
                      <li>—</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Enclosures */}
        <div className="space-y-6">
          {enclosures.map((enc) => (
            <div
              key={enc.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpen((s) => ({ ...s, [enc.id]: !s[enc.id] }))}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  {open[enc.id] ? (
                    <ChevronDown className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-indigo-600" />
                  )}
                  <h2 className="text-lg font-semibold text-slate-900">
                    {enc.name}
                  </h2>
                </div>
                <span className="text-sm text-slate-500">
                  {open[enc.id] ? "Hide" : "Show"} cameras
                </span>
              </button>
              <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Badge label="Lid" value={enc.details.lid} />
                <Badge label="Rain" value={enc.details.rain} />
                <Badge label="Wind Lockout" value={enc.details.windLockout} />
                <Badge label="Internal Temp" value={enc.details.temp || "—"} />
              </div>
              {open[enc.id] && (
                <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: cams */}
                  <div className="grid grid-cols-1 gap-4">
                    {enc.mounts.map((m) => (
                      <div
                        key={m.name}
                        className="rounded-xl border border-slate-200"
                      >
                        <div className="px-4 py-2 border-b border-slate-100 font-medium text-slate-800">
                          {m.name}
                        </div>
                        <ul className="divide-y divide-slate-100">
                          {m.cams.map((c) => (
                            <li
                              key={c}
                              className="px-4 py-2 text-sm text-slate-700 flex items-center gap-2"
                            >
                              <Camera className="w-4 h-4 text-slate-400" /> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {/* Right: monitor feed */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-48 flex flex-col">
                    <div className="bg-slate-100 flex items-center justify-center h-full">
                      <video className="w-full h-full" controls muted>
                        <source
                          src={enc.monitorSrc}
                          type="application/vnd.apple.mpegurl"
                        />
                      </video>
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 text-sm text-slate-700">
                      {enc.name} Monitor
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-1 bg-slate-50">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
