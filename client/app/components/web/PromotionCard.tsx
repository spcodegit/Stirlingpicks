"use client";

import React from "react";
import Image from "next/image";

interface PromotionCardProps {
    title: React.ReactNode;
    subtitle: string;
    buttonText: string;
    imageSrc: string;
    footerText?: string;
}

export default function PromotionCard({
    title,
    subtitle,
    buttonText,
    imageSrc,
    footerText,
}: PromotionCardProps) {
    return (
        <div
            className="relative w-[296px] h-[155px]"
        >
            {/* Background Graphic (dil/shape) */}
            <div
                className="absolute top-[-15px] right-[0px] pointer-events-none w-[170px] h-[185px] rounded-[30px] opacity-[0.37] rotate-180 scale-x-[-1] bg-[var(--bg-gray-shape)]"
            ></div>
            <div className="relative flex flex-col bg-[var(--bg-green-card)] rounded-[10px]  shadow-lg group h-[100%] w-[100%] overflow-hidden">
                {/* Athlete Image - Centered/Right aligned */}
                <div className="absolute right-0 bottom-0 h-[100%] w-[150px] z-10 select-none pointer-events-none group-hover:scale-105 transition-transform duration-500 origin-bottom">
                    <Image
                        src={imageSrc}
                        alt=""
                        fill
                        className="object-contain object-bottom"
                        priority
                    />
                </div>

                {/* Content Layer (Top-Left) */}
                <div className="relative z-20 flex flex-col h-full p-5 justify-start">
                    <div className="max-w-[170px]">
                        <h2 className="font-inter font-black text-[20px] leading-[100%] text-[var(--text-primary)] drop-shadow-md uppercase mb-1">
                            {title}
                        </h2>
                        <p className="font-inter font-bold text-[var(--text-secondary)] text-[10px] mb-4">
                            {subtitle}
                        </p>
                    </div>

                    <button
                        className="font-raleway font-bold text-[10px] text-[var(--text-black)] bg-[var(--bg-yellow-primary)] rounded-[10px] border border-[var(--border-white)] transition-all uppercase flex items-center justify-center cursor-pointer shadow-md mt-auto mb-8"
                        style={{ width: '82px', height: '24px' }}
                    >
                        {buttonText}
                    </button>
                </div>

                {/* Footer Overlay (The translucent green area at the bottom) */}
                <div className="h-[34px] absolute bottom-0 left-0 w-full bg-[var(--overlay-white)]  flex items-center px-4 z-30 rounded-[10px]">
                    <p className="text-[var(--bg-navy-primary)] text-[8px] leading-[1.1] font-inter font-bold line-clamp-2 w-[70%]">
                        {footerText || ""}
                    </p>
                </div>
            </div>
        </div>
    );
}
