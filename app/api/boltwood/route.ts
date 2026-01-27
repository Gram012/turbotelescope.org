import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getVar } from "@/lib/var";



const JSON_DIR = getVar("BW_DATA");


export async function GET() {
    try {
        const files = fs
            .readdirSync(JSON_DIR)
            .filter((f) => f.endsWith(".json"))
            .map((f) => ({
                name: f,
                time: fs.statSync(path.join(JSON_DIR, f)).mtimeMs,
            }));

        if (files.length === 0) {
            return NextResponse.json(
                { error: "No JSON files found" },
                { status: 404 }
            );
        }

        const latest = files.sort((a, b) => b.time - a.time)[0];
        const filePath = path.join(JSON_DIR, latest.name);

        const raw = fs.readFileSync(filePath, "utf-8");
        const parsedOuter = JSON.parse(raw);

        const inner = JSON.parse(parsedOuter.JSONDATA);

        const arr = Object.entries(inner).map(([key, value]) => ({
            key,
            value,
        }));

        return NextResponse.json({
            filename: latest.name,
            data: arr,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}
