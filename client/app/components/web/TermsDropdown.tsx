"use client";
import { useState } from "react";

interface TermsDropdownProps {
  externalOpen?: boolean;
  onToggle?: () => void;
}

export default function TermsDropdown({ externalOpen, onToggle }: TermsDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const toggle = onToggle || (() => setInternalOpen(!internalOpen));

  return (
    <div className="w-full bg-black ">
      <div
        className="max-w-[1156px] mx-auto flex items-center justify-between py-6 cursor-pointer px-4 md:px-6 hover:bg-white/5 transition-colors"
        onClick={toggle}
      >
        <span className="text-[var(--bg-green-primary)] font-orbitron font-bold text-lg md:text-xl uppercase tracking-wider">
          Terms & Conditions
        </span>
        <div className="flex items-center justify-center w-8 h-8 rounded-full text-[var(--bg-green-primary)]">
          <span className="text-2xl md:text-3xl font-light transition-transform duration-300 ease-out" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
            +
          </span>
        </div>
      </div>
    </div>
  );
} 
