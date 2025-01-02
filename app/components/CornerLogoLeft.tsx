"use client";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function CornerLogoLeft() {
  return (
    <div className="fixed bottom-4 left-4 flex items-center z-50 bg-[#1E1E1E] px-5 py-3 rounded-lg">
      <span className={`${inter.className} text-[#8b8b8b] text-base tracking-[0.15em]`}>
        <span className="font-normal">OES Sales Excellence</span>
        <span className="font-normal">.AI</span>
      </span>
    </div>
  );
}
