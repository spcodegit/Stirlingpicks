"use client";
import React from "react";

export default function PageTitleBar({ title }: { title: string }) {
  return (
    <div className="w-full bg-[var(--bg-primary)] flex items-center h-[60px] px-6 border-b border-[var(--border-primary)]">
      <div className="h-full flex flex-col items-center justify-center">
        <div className="mb-1 w-[80px] h-[3px] bg-[var(--bg-green-accent)]" />
        <h1 className="font-orbitron text-[var(--text-primary)] text-[14px] md:text-[16px] font-bold text-center leading-[1.1] tracking-[1px] uppercase">
          {title}
        </h1>
        <div className="mt-1 w-[80px] h-[3px] bg-[var(--bg-green-accent)]" />
      </div>
    </div>
  );
}