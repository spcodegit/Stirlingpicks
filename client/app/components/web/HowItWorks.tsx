"use client";
import React, { useState } from "react";
import TermsDropdown from "./TermsDropdown";
import Footer from "../layout/Footer";
import TermsContent from "./TermsContent";

const steps = [
  {
    number: "1",
    title: "SIGN UP",
    description: "Create your account today"
  },
  {
    number: "2",
    title: "PLACE A QUALIFYING BET",
    description: "Min £5 at odds 1/2 or greater"
  },
  {
    number: "3",
    title: "GET 4 X £5 FREE BETS",
    description: "on sports"
  }
];

export default function HowItWorks() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <div className="w-full bg-[var(--bg-primary)] flex flex-col">
      <div className="h-[40px] bg-[var(--bg-black)] w-full"></div>
      <div className="flex-grow">
        <div className="w-full bg-[var(--bg-black)] py-12 border-y border-[var(--border-primary)]/10">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-20">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-row md:flex-col lg:flex-row items-center md:items-start lg:items-center gap-6 md:gap-4 lg:gap-6 group">
                  <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[var(--bg-green-primary)] flex items-center justify-center transition-all">
                    <span className="text-[var(--text-primary)] font-orbitron font-black text-2xl sm:text-3xl ">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[var(--text-primary)] font-orbitron font-black text-lg sm:text-xl lg:text-2xl tracking-tight leading-tight mb-2 uppercase group-hover:text-[var(--bg-green-primary)] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[var(--text-muted)] font-inter text-[13px] sm:text-[14px] lg:text-[15px] font-medium leading-relaxed max-w-[260px] md:max-w-none lg:max-w-[260px]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full bg-black">
          <TermsDropdown externalOpen={isTermsOpen} onToggle={() => setIsTermsOpen(!isTermsOpen)} />
          {isTermsOpen && <TermsContent />}
        </div>
      </div>
      <Footer />
    </div>
  );
}
