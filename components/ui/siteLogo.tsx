"use client";

import * as React from "react";
import Link from "next/link";

export default function SiteLogo() {
  return (
    <div className="flex items-center space-x-2 px-2 py-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center">
        <img src="/turboIconB.png" className="text-color-blue-600" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        <Link href="/">TURBO Telescope</Link>
      </span>
    </div>
  );
}
