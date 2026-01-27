"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Camera,
  Cloud,
  RefreshCw,
  Video,
  ChevronDown,
  ChevronRight,
  Expand,
  Shrink,
} from "lucide-react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

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

type EnclosureData = {
  filename: string;
  data: Array<{ key: string; value: any }>;
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

  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [centralAxisImage, setCentralAxisImage] = useState<string | null>(null);
  const [centralAxisLoading, setCentralAxisLoading] = useState(false);
  const [centralAxisUpdated, setCentralAxisUpdated] =
    useState<Date | null>(null);

  const [centralEnclosureData, setCentralEnclosureData] =
    useState<EnclosureData | null>(null);
  const [centralEnclosureLoading, setCentralEnclosureLoading] =
    useState(false);

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

  const fetchLatestImage = () => {
    setImageLoading(true);
    const url = `/api/PTZ?ts=${Date.now()}`;
    setLatestImage(url);
    setLastUpdated(new Date());
    setImageLoading(false);
  };

  const fetchCentralAxisImage = () => {
    setCentralAxisLoading(true);
    const url = `/api/Axis?ts=${Date.now()}`;
    setCentralAxisImage(url);
    setCentralAxisUpdated(new Date());
    setCentralAxisLoading(false);
  };

  const fetchCentralEnclosureData = async () => {
    setCentralEnclosureLoading(true);
    try {
      const response = await fetch("/api/Enclosures/Central");
      const data = await response.json();
      setCentralEnclosureData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCentralEnclosureLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestImage();
    const i = setInterval(fetchLatestImage, 1800000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    fetchCentralAxisImage();
    const i = setInterval(fetchCentralAxisImage, 1800000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    fetchCentralEnclosureData();
    const i = setInterval(fetchCentralEnclosureData, 30000);
    return () => clearInterval(i);
  }, []);

  const getCentralValue = (key: string): any => {
    if (!centralEnclosureData) return null;
    const item = centralEnclosureData.data.find((d) => d.key === key);
    return item?.value;
  };

  const enclosures = useMemo(
    () => [
      {
        id: "north",
        name: "North Enclosure",
        details: {
          lid: "Closed",
          rain: "Dry",
          eStop: "OK",
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
          lidA: getCentralValue("RoofAOpening")
            ? "Opening"
            : getCentralValue("RoofAClosing")
            ? "Closing"
            : getCentralValue("RoofAPos") === 0
            ? "Closed"
            : "Open",
          lidB: getCentralValue("RoofBOpening")
            ? "Opening"
            : getCentralValue("RoofBClosing")
            ? "Closing"
            : getCentralValue("RoofBPos") === 0
            ? "Closed"
            : "Open",
          roofAPos: getCentralValue("RoofAPos") ?? null,
          roofBPos: getCentralValue("RoofBPos") ?? null,
          overcurrentA:
            getCentralValue("RoofAOverCurrent") === false
              ? "FALSE"
              : getCentralValue("RoofAOverCurrent") === true
              ? "TRUE"
              : null,
          overcurrentB:
            getCentralValue("RoofBOverCurrent") === false
              ? "FALSE"
              : getCentralValue("RoofBOverCurrent") === true
              ? "TRUE"
              : null,
          eStop: getCentralValue("EStop OK") === true ? "OK" : "FAIL",
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
          eStop: "OK",
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
    [centralEnclosureData]
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6">
          {/* JSX unchanged, just indentation */}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function KV({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function Badge({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: "ok" | "fail";
}) {
  const statusClasses =
    status === "ok"
      ? "bg-green-50 border-green-200 text-green-700"
      : status === "fail"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-slate-50 border-slate-200 text-slate-700";

  return (
    <div
      className={`flex items-center justify-between text-sm border rounded-lg px-3 py-1 ${statusClasses}`}
    >
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
