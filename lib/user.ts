import { query } from "./db";

export type DBUser = {
    id: number;
    github_id: string | number | null;
    github_login: string | null;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    role: "user" | "admin";
    is_active: boolean;
    created_at: string;
    last_login_at: string | null;
};

export async function upsertUserFromGitHubProfile(p: {
    github_id: string | number;
    github_login: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
}): Promise<DBUser> {
    const { github_id, github_login, name, email, avatar_url } = p;
    const sql = `
    INSERT INTO user_data.users (github_id, github_login, name, email, avatar_url, last_login_at)
    VALUES ($1, $2, $3, $4, $5, now())
    ON CONFLICT (github_id) DO UPDATE
      SET github_login = EXCLUDED.github_login,
          name        = COALESCE(EXCLUDED.name, user_data.users.name),
          email       = COALESCE(EXCLUDED.email, user_data.users.email),
          avatar_url  = COALESCE(EXCLUDED.avatar_url, user_data.users.avatar_url),
          last_login_at = now()
    RETURNING id, github_id, github_login, name, email, avatar_url, role, is_active, created_at, last_login_at;
  `;
    const { rows } = await query<DBUser>(sql, [github_id, github_login, name ?? null, email ?? null, avatar_url ?? null]);
    return rows[0];
}

export async function getUserByLogin(login: string): Promise<DBUser | null> {
    const { rows } = await query<DBUser>(
        `SELECT id, github_id, github_login, name, email, avatar_url, role, is_active, created_at, last_login_at
     FROM user_data.users WHERE github_login = $1`,
        [login]
    );
    return rows[0] ?? null;
}

export async function addOrActivateUser(login: string, role: "user" | "admin" = "user"): Promise<DBUser> {
    const sql = `
    INSERT INTO user_data.users (github_login, role, is_active)
    VALUES ($1, $2, TRUE)
    ON CONFLICT (github_login) DO UPDATE SET role = EXCLUDED.role, is_active = TRUE
    RETURNING id, github_id, github_login, name, email, avatar_url, role, is_active, created_at, last_login_at;
  `;
    const { rows } = await query<DBUser>(sql, [login, role]);
    return rows[0];
}

export async function setUserRole(login: string, role: "user" | "admin"): Promise<DBUser | null> {
    const { rows } = await query<DBUser>(
        `UPDATE user_data.users SET role = $2 WHERE github_login = $1 RETURNING id, github_login, role, is_active`,
        [login, role]
    );
    return rows[0] ?? null;
}

export async function setUserActive(login: string, isActive: boolean): Promise<DBUser | null> {
    const { rows } = await query<DBUser>(
        `UPDATE user_data.users SET is_active = $2 WHERE github_login = $1 RETURNING id, github_login, role, is_active`,
        [login, isActive]
    );
    return rows[0] ?? null;
}

export async function listUsers(): Promise<DBUser[]> {
    const { rows } = await query<DBUser>(
        `SELECT id, github_id, github_login, name, email, avatar_url, role, is_active, created_at, last_login_at
     FROM user_data.users ORDER BY created_at DESC`
    );
    return rows;
}
