"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicLayout } from './components/layout';
import HowItWorks from './components/web/HowItWorks';

export default function Home() {
    return (
        <>
            <PublicLayout>
                <div className="px-4 md:px-6 py-4">
                    <div
                        className="relative w-full rounded-[20px] overflow-hidden mb-8 mx-auto h-[220px] sm:h-[260px] md:h-[317px] max-w-[1156px]"
                    >
                        <Image
                            src="/images/home-1.png"
                            alt="Where Odds Meet Fortune"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Glassmorphism overlay */}
                        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4 mt-4 sm:mt-8'>
                            <div
                                className="max-w-[426px] mx-auto h-auto md:h-[109px] flex flex-col items-center justify-center bg-[rgba(255,255,255,0.12)] rounded-[30px] md:rounded-[77px] backdrop-blur-lg px-4 py-3 md:px-12 md:py-8 border border-[rgba(255,255,255,0.3)]"
                            >
                                <h1
                                    className="text-white text-center font-orbitron text-[18px] sm:text-[24px] md:text-[36px] font-bold leading-[1.2] tracking-[1px] md:tracking-[2px]"
                                >
                                    <span className="block">Where Odds</span>
                                    <span className="block">Meet Fortune</span>
                                </h1>
                            </div>
                        </div>
                        {/* Button at bottom center over image */}
                        <div className="absolute left-1/2 bottom-3 md:bottom-6 -translate-x-1/2 z-10">
                            <Link
                                href="/"
                                className="w-[100px] md:w-[115px] h-[30px] md:h-[35px] flex items-center justify-center bg-[#DBFF4D] text-black font-orbitron font-bold text-[14px] md:text-[16px] rounded-[8px] md:rounded-[10px] hover:bg-[#e6f53d] transition-colors duration-200 shadow-lg"
                            >
                                Start Now
                            </Link>
                        </div>
                    </div>
                    <div
                        className="flex flex-col lg:flex-row gap-6 mx-auto max-w-[1156px]"
                    >
                        {/* Bet Booster Card */}
                        <div
                            className="relative rounded-[15px] overflow-hidden flex-1 w-full max-w-[570px] min-h-[162px] bg-[#479466] p-[10px] md:p-[12px] flex items-center justify-center mx-auto lg:mx-0"
                        >
                            <div className="relative w-full h-full min-h-[142px] rounded-[10px] overflow-hidden">
                                <Image
                                    src="/images/home-2.png"
                                    alt="Bet Booster"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent flex flex-col items-end justify-center pr-6 md:pr-10">
                                    <h3
                                        className="text-white font-orbitron font-bold text-[18px] sm:text-2xl leading-tight tracking-[1px] text-right"
                                    >
                                        Bet<br />Booster
                                    </h3>
                                    <Link
                                        href="/bet-booster"
                                        className="inline-block mt-3 px-4 md:px-6 py-1.5 md:py-2 bg-[#DBFF4D] text-black font-orbitron font-bold text-xs md:text-sm rounded-[8px] md:rounded-[10px] hover:bg-[#e6f53d] transition-colors"
                                    >
                                        View Now
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Create Account Card */}
                        <div
                            className="relative rounded-[15px] overflow-hidden flex-1 flex items-center p-[10px] md:p-[12px] w-full max-w-[570px] min-h-[162px] bg-[#479466] mx-auto lg:mx-0"
                        >
                            <div className="w-full h-full min-h-[142px] flex items-center gap-3 md:gap-5 bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-[10px] border border-white/5">
                                <div className="w-[60px] h-[60px] md:w-[90px] md:h-[90px] rounded-full bg-[#1E1A2A] flex items-center justify-center flex-shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.3)] relative overflow-hidden ring-2 md:ring-4 ring-black/10">
                                    <div className="relative w-[30px] h-[30px] md:w-[50px] md:h-[50px]">
                                        <Image
                                            src="/images/template-get-started-icon.png"
                                            alt="Create Your Account icon"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h3
                                        className="text-white font-orbitron font-bold text-[16px] md:text-[22px] tracking-[1px] mb-1 truncate md:whitespace-normal"
                                    >
                                        Create Your Account
                                    </h3>
                                    <p
                                        className="text-white/80 text-[11px] md:text-[14px] leading-snug font-inter line-clamp-3 md:line-clamp-none"
                                    >
                                        Open your free account today and explore the new world of sports betting.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </PublicLayout>
            <div className="w-full mt-auto">
                <HowItWorks />
            </div>
        </>
    );
}
