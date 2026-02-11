import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getVar } from "@/lib/var";

const DATA_DIR = getVar('ENC_DATA.T2');
const MAX_FILES = 5;

export async function GET() {
    try {
        const files = fs
            .readdirSync(DATA_DIR)
            .filter((f) => /^data_\d{8}_\d{6}\.json$/.test(f))
            .sort((a, b) => b.localeCompare(a)); // newest first via filename

        if (files.length === 0) {
            return NextResponse.json(
                { error: "No enclosure JSON files found" },
                { status: 404 }
            );
        }

        // delete old files beyond last 5
        if (files.length > MAX_FILES) {
            const toDelete = files.slice(MAX_FILES);
            for (const f of toDelete) {
                try {
                    fs.unlinkSync(path.join(DATA_DIR, f));
                } catch (e) {
                    console.error("Failed deleting old enclosure file:", f, e);
                }
            }
        }

        const latest = files[0];
        const filePath = path.join(DATA_DIR, latest);

        const raw = fs.readFileSync(filePath, "utf-8");
        const parsedOuter = JSON.parse(raw);

        // Outer: { JSONDATA: "...." }
        if (!parsedOuter.JSONDATA) {
            return NextResponse.json(
                { error: "JSONDATA field missing" },
                { status: 500 }
            );
        }

        const inner = JSON.parse(parsedOuter.JSONDATA);

        // Convert to [{ key, value }] like Boltwood route
        const arr = Object.entries(inner).map(([key, value]) => ({
            key,
            value,
        }));

        return NextResponse.json({
            filename: latest,
            data: arr,
        });

    } catch (err: any) {
        console.error("Central enclosure route error:", err);
        return NextResponse.json(
            { error: err.message ?? "Unknown error" },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
