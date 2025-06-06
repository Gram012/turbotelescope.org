import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

const USERS_FILE = path.resolve("config/allowed-users.json");

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { username } = body;

    if (!username || typeof username !== "string") {
        return new Response("Invalid username", { status: 400 });
    }

    const contents = await fs.readFile(USERS_FILE, "utf8");
    const users: string[] = JSON.parse(contents);

    if (!users.includes(username)) {
        users.push(username);
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    }

    return new Response("User added", { status: 200 });
}
