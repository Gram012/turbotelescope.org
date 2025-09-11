// app/dashboard/users/users-client.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, Trash2 } from "lucide-react";

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

export default function UsersClient({
  users,
  isAdmin,
  addUserAction,
  changeRoleAction,
  removeUserAction,
  loadError,
}: {
  users: DBUser[];
  isAdmin: boolean;
  addUserAction: (formData: FormData) => Promise<void>;
  changeRoleAction: (formData: FormData) => Promise<void>;
  removeUserAction: (formData: FormData) => Promise<void>;
  loadError?: string | null;
}) {
  const [openAdd, setOpenAdd] = useState(false);
  const [newLogin, setNewLogin] = useState("");
  const [confirming, setConfirming] = useState(false);

  const fmt = (v: any) => ((v ?? "") === "" ? "–" : String(v));
  const sorted = [...users].sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
  );

  return (
    <div className="space-y-6">
      {/* top row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Team Members</h2>
          <p className="text-slate-600 mt-1">
            Manage access and roles for your organization.
          </p>
        </div>

        {isAdmin && (
          <Dialog
            open={openAdd}
            onOpenChange={(o) => {
              setOpenAdd(o);
              setConfirming(false);
            }}
          >
            <DialogTrigger asChild>
              <Button>Add user</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {confirming
                    ? "Confirm new user"
                    : "Add a new user by GitHub username"}
                </DialogTitle>
              </DialogHeader>
              {!confirming ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setConfirming(true);
                  }}
                >
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      GitHub username
                    </label>
                    <Input
                      placeholder="e.g. octocat"
                      value={newLogin}
                      onChange={(e) => setNewLogin(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      They’ll be added as a <strong>standard user</strong>.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOpenAdd(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!newLogin.trim()}>
                      Continue
                    </Button>
                  </DialogFooter>
                </form>
              ) : (
                <form
                  action={async (fd: FormData) => {
                    await addUserAction(fd);
                    setOpenAdd(false);
                    setNewLogin("");
                  }}
                >
                  <input
                    name="github_login"
                    hidden
                    value={newLogin.trim().toLowerCase()}
                    readOnly
                  />
                  <div className="space-y-3">
                    <p className="text-slate-700">
                      Add{" "}
                      <span className="font-semibold">
                        @{newLogin.trim().toLowerCase()}
                      </span>{" "}
                      as a standard user?
                    </p>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfirming(false)}
                    >
                      Back
                    </Button>
                    <Button type="submit">Confirm & Add</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
          {loadError}
        </div>
      )}

      <Separator />

      {/* users grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sorted.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            isAdmin={isAdmin}
            changeRoleAction={changeRoleAction}
            removeUserAction={removeUserAction}
            fmt={fmt}
          />
        ))}
        {sorted.length === 0 && !loadError && (
          <p className="text-slate-500">No users found.</p>
        )}
      </div>
    </div>
  );
}

function UserCard({
  user,
  isAdmin,
  changeRoleAction,
  removeUserAction,
  fmt,
}: {
  user: DBUser;
  isAdmin: boolean;
  changeRoleAction: (formData: FormData) => Promise<void>;
  removeUserAction: (formData: FormData) => Promise<void>;
  fmt: (v: any) => string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const loginLC = (user.github_login || "").toLowerCase();

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="truncate max-w-[16rem]">
                {fmt(user.github_login)}
              </span>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              {!user.is_active && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  inactive
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {fmt(user.name)} {user.email ? `• ${user.email}` : ""}
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            title={open ? "Hide details" : "More"}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            {/* role change */}
            <form action={changeRoleAction} className="flex items-center gap-2">
              <input type="hidden" name="login" value={loginLC} />
              <label className="text-sm text-slate-600">Role</label>
              <select
                name="role"
                defaultValue={user.role}
                className="text-sm border rounded-md px-2 py-1"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <Button type="submit" variant="outline" size="sm">
                Update
              </Button>
            </form>

            {/* remove user */}
            <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-auto"
                  title={
                    user.is_active ? "Deactivate or delete user" : "Delete user"
                  }
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove @{loginLC}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 text-sm text-slate-700">
                  <p>
                    Choose how you want to remove this user.{" "}
                    <strong>Deactivate</strong> is reversible and prevents
                    sign-in.
                  </p>
                </div>

                <div className="mt-2 grid gap-2">
                  {/* Soft-remove */}
                  <form
                    action={async (fd: FormData) => {
                      await removeUserAction(fd);
                      setConfirmRemove(false);
                    }}
                  >
                    <input type="hidden" name="login" value={loginLC} />
                    <input type="hidden" name="mode" value="deactivate" />
                    <Button type="submit" variant="outline" className="w-full">
                      Deactivate user
                    </Button>
                  </form>

                  {/* Hard delete */}
                  <form
                    action={async (fd: FormData) => {
                      await removeUserAction(fd);
                      setConfirmRemove(false);
                    }}
                  >
                    <input type="hidden" name="login" value={loginLC} />
                    <input type="hidden" name="mode" value="delete" />
                    <Button
                      type="submit"
                      variant="destructive"
                      className="w-full"
                    >
                      Delete permanently
                    </Button>
                  </form>
                </div>

                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmRemove(false)}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {open && (
          <div className="rounded-lg border bg-slate-50 p-3 text-sm">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <dt className="text-slate-500">ID</dt>
              <dd className="text-slate-900">{fmt(user.id)}</dd>
              <dt className="text-slate-500">GitHub ID</dt>
              <dd className="text-slate-900">{fmt(user.github_id)}</dd>
              <dt className="text-slate-500">GitHub Login</dt>
              <dd className="text-slate-900">{fmt(user.github_login)}</dd>
              <dt className="text-slate-500">Name</dt>
              <dd className="text-slate-900">{fmt(user.name)}</dd>
              <dt className="text-slate-500">Email</dt>
              <dd className="text-slate-900">{fmt(user.email)}</dd>
              <dt className="text-slate-500">Avatar</dt>
              <dd className="text-slate-900">
                {user.avatar_url ? (
                  <a
                    className="text-blue-600 underline"
                    href={user.avatar_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                ) : (
                  "–"
                )}
              </dd>
              <dt className="text-slate-500">Active</dt>
              <dd className="text-slate-900">
                {user.is_active ? "true" : "false"}
              </dd>
              <dt className="text-slate-500">Created</dt>
              <dd className="text-slate-900">
                {fmt(new Date(user.created_at).toLocaleString())}
              </dd>
              <dt className="text-slate-500">Last Login</dt>
              <dd className="text-slate-900">
                {user.last_login_at
                  ? new Date(user.last_login_at).toLocaleString()
                  : "–"}
              </dd>
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
