"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export function InviteUserModal() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);
    const res = await fetch("/api/invite-user", {
      method: "POST",
      body: JSON.stringify({ username }),
    });

    if (res.ok) {
      toast({
        title: "User invited",
        description: `${username} can now sign in.`,
      });
      setUsername("");
    } else {
      toast({
        title: "Error",
        description: "Failed to invite user",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite GitHub User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add GitHub Username</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="GitHub username (e.g. newUser123)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleInvite} disabled={loading || !username}>
            {loading ? "Inviting..." : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
