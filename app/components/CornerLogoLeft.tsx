"use client";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function CornerLogoLeft() {
  return (
    <div className="fixed bottom-4 left-4 flex items-center z-50 bg-[#1E1E1E] px-5 py-3 rounded-lg">
      <span className={`${inter.className} text-2xl tracking-[0.15em]`}>
        <span className="text-gray-400 font-normal">OES Sales Excellence</span>
        <span className="text-[#FF6B8A] font-normal">.AI</span>
      </span>
    </div>
  );
}
