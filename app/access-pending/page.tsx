"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export default function AccessPendingPage() {
  const [value, setValue] = useState(0);

  // simple looping animation (0 → 100 → 0 …)
  useEffect(() => {
    let dir = 1;
    const id = setInterval(() => {
      setValue((v) => {
        const next = v + dir * 2;
        if (next >= 100) {
          dir = -1;
          return 100;
        }
        if (next <= 0) {
          dir = 1;
          return 0;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen grid place-items-center bg-white">
      {/* force indicator to blue-600, track to a soft blue */}
      <div className="w-72">
        <Progress
          value={value}
          aria-label="Loading"
          className="h-3 rounded-full bg-blue-100 [&>div]:bg-blue-600"
        />
      </div>
    </main>
  );
}
