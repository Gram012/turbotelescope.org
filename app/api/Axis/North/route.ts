import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getVar } from "@/lib/var";

const IMAGE_DIR = getVar('AXIS_CAM.T3');
const MAX_IMAGES = 5;

export async function GET() {
    try {
        const files = fs
            .readdirSync(IMAGE_DIR)
            .filter((f) => /^capture_\d{8}_\d{6}\.jpg$/.test(f))
            .sort((a, b) => b.localeCompare(a));

        if (files.length === 0) {
            return NextResponse.json(
                { url: null, error: "No JPG files found" },
                { status: 404 }
            );
        }

        // delete old beyond last 5
        if (files.length > MAX_IMAGES) {
            const toDelete = files.slice(MAX_IMAGES);
            for (const f of toDelete) {
                try {
                    fs.unlinkSync(path.join(IMAGE_DIR, f));
                } catch { }
            }
        }

        const latest = files[0];
        const filePath = path.join(IMAGE_DIR, latest);

        const buffer = fs.readFileSync(filePath);
        const base64 = buffer.toString("base64");

        return NextResponse.json({
            url: `data:image/jpeg;base64,${base64}`,
            filename: latest,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
