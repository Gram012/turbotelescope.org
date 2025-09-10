// app/api/admin/migrate/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/authz";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminSession(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await sql`CREATE SCHEMA IF NOT EXISTS user_data`;
        await sql`
      CREATE TABLE IF NOT EXISTS user_data.users (
        id BIGSERIAL PRIMARY KEY,
        github_id BIGINT,
        github_login TEXT UNIQUE,
        name TEXT,
        email TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_login_at TIMESTAMPTZ
      )
    `;
        await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_github_id_key ON user_data.users(github_id)`;
        await sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
          ALTER TABLE user_data.users ADD CONSTRAINT users_role_check CHECK (role IN ('user','admin'));
        END IF;
      END $$;
    `;
        return NextResponse.json({ ok: true, message: "Migration complete" });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message || "Migration failed" }, { status: 500 });
    }
}
