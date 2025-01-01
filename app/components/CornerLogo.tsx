"use client";

import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function CornerLogo() {
  return (
    <div className="fixed bottom-4 right-4 flex items-center z-50 bg-[#1E1E1E] px-5 py-3 rounded-lg">
      <span className={`${inter.className} text-2xl tracking-[0.15em]`}>
        <span className="text-gray-400 font-normal">Sentiment</span>
        <span className="text-[#FF6B8A] font-normal">AI</span>
      </span>
      <div className="w-[1px] h-6 bg-gray-700 mx-5"></div>
      <Image
        src="/logo.svg"
        alt="OES Logo"
        width={85}
        height={24}
        className="w-auto h-auto"
        style={{ filter: 'invert(56%) sepia(83%) saturate(1550%) hue-rotate(314deg) brightness(100%) contrast(97%)' }}
      />
    </div>
  );
}
