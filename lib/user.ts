import { pool } from "@/lib/db";

export type DBUser = {
  id: number;
  github_id: number | null;
  github_login: string | null;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};

export async function listUsers(): Promise<DBUser[]> {
  const result = await pool.query<DBUser>(
    `SELECT id, github_id, github_login, name, email, avatar_url, role, is_active, created_at, last_login_at
     FROM user_data.users
     ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function getUserByGitHubId(ghId: number): Promise<DBUser | null> {
  const result = await pool.query<DBUser>(
    `SELECT id, github_id, github_login, name, email, avatar_url, role, is_active, created_at, last_login_at
     FROM user_data.users
     WHERE github_id = $1
     LIMIT 1`,
    [ghId]
  );
  return result.rows[0] ?? null;
}

export async function getUserByLogin(login: string): Promise<DBUser | null> {
  const result = await pool.query<DBUser>(
    `SELECT id, github_id, github_login, name, email, avatar_url, role, is_active, created_at, last_login_at
     FROM user_data.users
     WHERE github_login = $1
     LIMIT 1`,
    [login.toLowerCase()]
  );
  return result.rows[0] ?? null;
}

export async function addOrActivateUser(
  login: string,
  role: "user" | "admin" = "user"
): Promise<DBUser> {
  const result = await pool.query<DBUser>(
    `INSERT INTO user_data.users (github_login, role, is_active)
     VALUES ($1, $2, TRUE)
     ON CONFLICT (github_login)
     DO UPDATE SET is_active = TRUE
     RETURNING id, github_id, github_login, name, email, avatar_url, role, is_active, created_at, last_login_at`,
    [login.toLowerCase(), role]
  );
  return result.rows[0];
}

export async function setUserRole(login: string, role: "user" | "admin"): Promise<void> {
  await pool.query(
    `UPDATE user_data.users
     SET role = $1
     WHERE github_login = $2`,
    [role, login.toLowerCase()]
  );
}

export async function setUserActive(login: string, is_active: boolean): Promise<DBUser | null> {
  const result = await pool.query<DBUser>(
    `UPDATE user_data.users
     SET is_active = $1
     WHERE github_login = $2
     RETURNING id, github_id, github_login, name, email, avatar_url, role, is_active, created_at, last_login_at`,
    [is_active, login.toLowerCase()]
  );
  return result.rows[0] ?? null;
}

/** Soft-remove: mark as inactive (recommended default) */
export async function deactivateUser(login: string): Promise<void> {
  await pool.query(
    `UPDATE user_data.users
     SET is_active = FALSE
     WHERE github_login = $1`,
    [login.toLowerCase()]
  );
}

/** Hard-remove: delete the row (irreversible) */
export async function deleteUserByLogin(login: string): Promise<void> {
  await pool.query(
    `DELETE FROM user_data.users
     WHERE github_login = $1`,
    [login.toLowerCase()]
  );
}

export async function upsertUserFromGitHubProfile(p: {
  github_id?: number;
  github_login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}): Promise<DBUser> {
  const login = p.github_login.toLowerCase();
  const result = await pool.query<DBUser>(
    `INSERT INTO user_data.users (github_id, github_login, name, email, avatar_url, is_active, last_login_at)
     VALUES ($1, $2, $3, $4, $5, TRUE, now())
     ON CONFLICT (github_login)
     DO UPDATE SET
       github_id     = COALESCE(EXCLUDED.github_id, user_data.users.github_id),
       name          = COALESCE(EXCLUDED.name, user_data.users.name),
       email         = COALESCE(EXCLUDED.email, user_data.users.email),
       avatar_url    = COALESCE(EXCLUDED.avatar_url, user_data.users.avatar_url),
       last_login_at = now()
     RETURNING id, github_id, github_login, name, email, avatar_url, role, is_active, created_at, last_login_at`,
    [p.github_id ?? null, login, p.name ?? null, p.email ?? null, p.avatar_url ?? null]
  );
  return result.rows[0];
}
