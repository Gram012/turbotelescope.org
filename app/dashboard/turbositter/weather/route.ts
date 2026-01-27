import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";

type WeatherRow = {
    clienttransactionid: number | null;
    servertransactionid: number | null;
    errornumber: number | null;
    errormessage: string | null;
    avgperiod: number | null;
    cloudcover: number | null;
    dewpoint: number | null;
    humidity: number | null;
    pressure: number | null;
    rainrate: number | null;
    skybrightness: number | null;
    skyquality: number | null;
    skytemp: number | null;
    starfwhm: number | null;
    temperature: number | null;
    winddirection: number | null;
    windgust: number | null;
    windspeed: number | null;
    created_at?: string | null;
};

export const dynamic = "force-dynamic";

async function queryLatestWeather(): Promise<WeatherRow | null> {
    const client = createClient();

    await client.connect();
    try {
        const res = await client.query<WeatherRow>(`
      SELECT clienttransactionid, servertransactionid, errornumber, errormessage,
             avgperiod, cloudcover, dewpoint, humidity, pressure, rainrate,
             skybrightness, skyquality, skytemp, starfwhm, temperature,
             winddirection, windgust, windspeed,
             created_at
        FROM turbositter.mro_weather
        ORDER BY COALESCE(created_at, NOW()) DESC NULLS LAST
        LIMIT 1;
    `);
        return res.rows[0] ?? null;
    } finally {
        await client.end();
    }
}

export async function GET() {
    try {
        const row = await queryLatestWeather();
        return NextResponse.json({ ok: true, row });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
    }
}
