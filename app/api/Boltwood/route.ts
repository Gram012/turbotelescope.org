import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = "/home/turbo/web-services/new-mexico/boltwood";
const MAX_FILES = 5;

export async function GET() {
    try {
        const files = fs
            .readdirSync(DATA_DIR)
            .filter((f) => /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/.test(f))
            .sort((a, b) => b.localeCompare(a)); // newest first by filename

        if (files.length === 0) {
            return NextResponse.json(
                { error: "No Boltwood JSON files found" },
                { status: 404 }
            );
        }

        // Delete old files beyond the last 5
        if (files.length > MAX_FILES) {
            const toDelete = files.slice(MAX_FILES);
            for (const f of toDelete) {
                try {
                    fs.unlinkSync(path.join(DATA_DIR, f));
                } catch (e) {
                    console.error("Failed deleting old Boltwood file:", f, e);
                }
            }
        }

        const latest = files[0];
        const filePath = path.join(DATA_DIR, latest);

        const raw = fs.readFileSync(filePath, "utf-8");
        const parsedOuter = JSON.parse(raw);

        if (!parsedOuter.raw_html) {
            return NextResponse.json(
                { error: "raw_html field missing in JSON" },
                { status: 500 }
            );
        }

        // raw_html is a JSON string
        const innerParsed = JSON.parse(parsedOuter.raw_html);

        // Extract the weather values, plus transaction IDs
        const valueData = innerParsed.Value || {};
        const arr: Array<{ key: string; value: any }> = [
            ...Object.entries(valueData).map(([key, value]) => ({ key, value })),
            { key: "clienttransactionid", value: innerParsed.ClientTransactionID ?? null },
            { key: "servertransactionid", value: innerParsed.ServerTransactionID ?? null },
        ];

        return NextResponse.json({
            filename: latest,
            data: arr,
        });
    } catch (err: any) {
        console.error("Boltwood route error:", err);
        return NextResponse.json(
            { error: err.message ?? "Unknown error" },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
