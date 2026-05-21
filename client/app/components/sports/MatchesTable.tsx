'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Ticket, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useBet } from '../../context/BetContext';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface Match {
    id: string;
    dateTime: string;
    homeTeam: string;
    awayTeam: string;
    odds: {
        home: string;
        draw: string;
        away: string;
    };
    points: string;
    highlighted?: 'home' | 'draw' | 'away';
}

interface MatchesTableProps {
    leaguesData?: { [key: string]: Match[] };
    oddsFormat: 'fra' | 'decimal';
    onOddsFormatChange: (format: 'fra' | 'decimal') => void;
}

export default function MatchesTable({ leaguesData = {}, oddsFormat, onOddsFormatChange }: MatchesTableProps) {
    const { openBetSlip } = useBet();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const leagueNames = Object.keys(leaguesData || {});

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 1);
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [leagueNames]);

    useEffect(() => {
        const timer = setTimeout(checkScroll, 200);
        return () => clearTimeout(timer);
    }, [leagueNames]);

    const handleScrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const handleScrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const leagueParam = searchParams.get('league');

    // The active league is determined by the URL query parameter if valid, otherwise falls back to the first available league
    const activeLeague = (leagueParam && leaguesData[leagueParam]) ? leagueParam : (leagueNames[0] || '');

    const handleLeagueChange = (league: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('league', league);
        const search = current.toString();
        const query = search ? `?${search}` : '';
        router.push(`${pathname}${query}`);
    };


    const activeMatches = (activeLeague && leaguesData[activeLeague]) ? leaguesData[activeLeague] : [];

    const handleBetClick = (match: Match, type: 'home' | 'draw' | 'away') => {
        const odds = match.odds[type];
        openBetSlip({
            match,
            type,
            odds
        });
    };

    return (
        <div className="w-full">
            <div className="sm:hidden flex flex-col bg-[var(--bg-secondary)] mb-2 border-b border-[var(--border-primary)]">
                <div className="px-4 py-3 flex flex-col gap-2">
                    <div className="w-full overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-4">
                            {leagueNames.map((league) => (
                                <button
                                    key={league}
                                    onClick={() => handleLeagueChange(league)}
                                    className={`font-orbitron font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap pb-1
                                        ${activeLeague === league
                                            ? 'text-[var(--bg-yellow-primary)] border-b-2 border-[var(--bg-yellow-primary)]'
                                            : 'text-[var(--text-muted)]'
                                        }`}
                                >
                                    {league}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="relative">
                            <select
                                value={oddsFormat}
                                onChange={(e) => onOddsFormatChange(e.target.value as 'fra' | 'decimal')}
                                className="appearance-none bg-[var(--bg-navy-secondary)] text-white font-inter font-extrabold text-[10px] pl-3 pr-7 py-1.5 rounded-lg border border-white/10 cursor-pointer focus:outline-none shadow-md uppercase"
                            >
                                <option value="fra" className="bg-[var(--bg-navy-secondary)]">Fra</option>
                                <option value="decimal" className="bg-[var(--bg-navy-secondary)]">Dec</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-3 h-3 text-[var(--bg-yellow-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden sm:block bg-[var(--bg-green-primary)]">
                <div className="relative group/nav">
                    {/* Left Scroll Arrow */}
                    {showLeftArrow && (
                        <div
                            onClick={handleScrollLeft}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-md text-[var(--text-black)] shadow-sm flex items-center justify-center transition-all cursor-pointer border border-black/5"
                        >
                            <ChevronLeft size={18} strokeWidth={3} />
                        </div>
                    )}

                    {/* Right Scroll Arrow */}
                    {showRightArrow && (
                        <div
                            onClick={handleScrollRight}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-md text-[var(--text-black)] shadow-sm flex items-center justify-center transition-all cursor-pointer border border-black/5"
                        >
                            <ChevronRight size={18} strokeWidth={3} />
                        </div>
                    )}

                    {/* Leagues Navigation - Top Full Width */}
                    <div 
                        ref={scrollContainerRef}
                        onScroll={checkScroll}
                        className="w-full py-3 px-10 border-b border-black/5 flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth relative"
                    >
                        {leagueNames.map((league) => (
                            <button
                                key={league}
                                onClick={() => handleLeagueChange(league)}
                                className={`font-orbitron font-bold text-[11px] uppercase tracking-wider transition-all whitespace-nowrap
                                    ${activeLeague === league
                                        ? 'text-[var(--text-black)] border-b-2 border-black pb-0.5'
                                        : 'text-[var(--text-black)]/40 hover:text-[var(--text-black)]'
                                    }`}
                            >
                                {league}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Headers Grid - Column Labels & Options */}
                <div className="grid sm:grid-cols-[80px_minmax(150px,1fr)_80px_100px_100px_100px_100px] items-center">
                    <div className="col-span-3" />
                    <div className="py-3 px-2 text-center text-[var(--text-black)] font-orbitron font-bold text-[14px]">Home</div>
                    <div className="py-3 px-2 text-center text-[var(--text-black)] font-orbitron font-bold text-[14px]">Draw</div>
                    <div className="py-3 px-2 text-center text-[var(--text-black)] font-orbitron font-bold text-[14px]">Away</div>
                    
                    <div className="py-3 px-4 flex justify-end items-center">
                        <div className="relative group/odds">
                            <select
                                value={oddsFormat}
                                onChange={(e) => onOddsFormatChange(e.target.value as 'fra' | 'decimal')}
                                className="appearance-none bg-[var(--bg-navy-secondary)] text-white font-inter font-extrabold text-[11px] pl-3 pr-7 py-2 rounded-lg border border-white/10 cursor-pointer hover:border-[var(--bg-yellow-primary)] transition-all duration-300 focus:outline-none shadow-md uppercase"
                            >
                                <option value="fra" className="bg-[var(--bg-navy-secondary)]">Fra</option>
                                <option value="decimal" className="bg-[var(--bg-navy-secondary)]">Dec</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover/odds:scale-110 transition-transform duration-200">
                                <svg className="w-3 h-3 text-[var(--bg-yellow-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--bg-primary)] sm:bg-transparent max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar pr-1">
                {activeMatches.map((match) => (
                    <div key={match.id}>
                        {/* Mobile Card View */}
                        <div className="sm:hidden mb-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[var(--text-tertiary)] font-inter text-[11px] font-medium">
                                    {match.dateTime}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Ticket size={14} className="text-[var(--text-yellow)] rotate-[-45deg] opacity-70" />
                                    <span className="text-[var(--text-muted)] font-inter font-bold text-[12px]">
                                        {match.points}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4 text-left">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-[var(--text-primary)] font-inter font-bold text-[15px] leading-tight">
                                        {match.homeTeam}
                                    </h3>
                                    <span className="text-[var(--bg-yellow-primary)]/40 text-[10px] font-black">VS</span>
                                    <h3 className="text-[var(--text-primary)] font-inter font-bold text-[15px] leading-tight">
                                        {match.awayTeam}
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { type: 'home', label: 'Home', odds: match.odds.home },
                                    { type: 'draw', label: 'Draw', odds: match.odds.draw },
                                    { type: 'away', label: 'Away', odds: match.odds.away }
                                ].map((choice) => (
                                    <div
                                        key={choice.type}
                                        onClick={() => choice.odds !== 'N/A' && handleBetClick(match, choice.type as any)}
                                        className={`
                                            flex flex-col items-center py-2 px-1 rounded-md border border-transparent transition-all
                                            ${choice.odds === 'N/A' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                            ${match.highlighted === choice.type
                                                ? 'bg-[var(--bg-yellow-primary)] border-[var(--bg-yellow-primary)]'
                                                : choice.odds !== 'N/A' ? 'bg-[var(--bg-tertiary)] hover:border-[var(--bg-yellow-primary)]/40' : 'bg-[var(--bg-tertiary)]'
                                            }
                                        `}
                                    >
                                        <span className={`text-[9px] uppercase font-bold mb-0.5 ${match.highlighted === choice.type ? 'text-[var(--text-black)]/60' : 'text-[var(--text-muted)]'}`}>
                                            {choice.label}
                                        </span>
                                        <span className={`text-[15px] font-black font-inter ${match.highlighted === choice.type ? 'text-[var(--text-black)]' : 'text-[var(--text-primary)]'}`}>
                                            {choice.odds}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Row View */}
                        <div
                            className={`
                                hidden sm:grid sm:grid-cols-[80px_minmax(150px,1fr)_80px_100px_100px_100px_100px]
                                items-center border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]
                                transition-colors hover:bg-[var(--bg-tertiary)]/50
                            `}
                        >
                            <div className="flex items-center py-3 px-2">
                                <span className="text-[var(--text-tertiary)] font-inter text-[12px] whitespace-nowrap">
                                    {match.dateTime}
                                </span>
                            </div>

                            <div className="py-3 px-3 flex items-center gap-2 min-w-0">
                                <span className="text-[var(--text-primary)] font-inter font-bold text-[13px] truncate">
                                    {match.homeTeam} <span className="text-[var(--bg-yellow-primary)]/40 mx-1">VS</span> {match.awayTeam}
                                </span>
                            </div>

                            <div className="flex items-center justify-center py-3">
                                <Ticket size={14} className="text-[var(--text-yellow)] rotate-[-45deg] opacity-70" />
                            </div>

                            {/* Home Odds */}
                            <div className="py-2 px-2 flex justify-center">
                                <div
                                    onClick={() => match.odds.home !== 'N/A' && handleBetClick(match, 'home')}
                                    className={`
                                        w-full py-2 rounded-[4px] text-center
                                        transition-all duration-200 border border-transparent
                                        ${match.odds.home === 'N/A' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                        ${match.highlighted === 'home'
                                            ? 'bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover)]'
                                            : match.odds.home !== 'N/A' ? 'bg-[var(--bg-tertiary)] hover:border-[var(--bg-yellow-primary)]/50 group' : 'bg-[var(--bg-tertiary)]'
                                        }
                                    `}
                                >
                                    <span className={`
                                        font-inter font-bold text-[14px]
                                        ${match.highlighted === 'home'
                                            ? 'text-[var(--text-black)]'
                                            : 'text-[var(--text-primary)] group-hover:text-[var(--text-yellow)]'
                                        }
                                    `}>
                                        {match.odds.home}
                                    </span>
                                </div>
                            </div>

                            {/* Draw Odds */}
                            <div className="py-2 px-2 flex justify-center">
                                <div
                                    onClick={() => match.odds.draw !== 'N/A' && handleBetClick(match, 'draw')}
                                    className={`
                                        w-full py-2 rounded-[4px] text-center
                                        transition-all duration-200 border border-transparent
                                        ${match.odds.draw === 'N/A' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                        ${match.highlighted === 'draw'
                                            ? 'bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover)]'
                                            : match.odds.draw !== 'N/A' ? 'bg-[var(--bg-tertiary)] hover:border-[var(--bg-yellow-primary)]/50 group' : 'bg-[var(--bg-tertiary)]'
                                        }
                                    `}
                                >
                                    <span className={`
                                        font-inter font-bold text-[14px]
                                        ${match.highlighted === 'draw'
                                            ? 'text-[var(--text-black)]'
                                            : 'text-[var(--text-primary)] group-hover:text-[var(--text-yellow)]'
                                        }
                                    `}>
                                        {match.odds.draw}
                                    </span>
                                </div>
                            </div>

                            {/* Away Odds */}
                            <div className="py-2 px-2 flex justify-center">
                                <div
                                    onClick={() => match.odds.away !== 'N/A' && handleBetClick(match, 'away')}
                                    className={`
                                        w-full py-2 rounded-[4px] text-center
                                        transition-all duration-200 border border-transparent
                                        ${match.odds.away === 'N/A' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                        ${match.highlighted === 'away'
                                            ? 'bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover)]'
                                            : match.odds.away !== 'N/A' ? 'bg-[var(--bg-tertiary)] hover:border-[var(--bg-yellow-primary)]/50 group' : 'bg-[var(--bg-tertiary)]'
                                        }
                                    `}
                                >
                                    <span className={`
                                        font-inter font-bold text-[14px]
                                        ${match.highlighted === 'away'
                                            ? 'text-[var(--text-black)]'
                                            : 'text-[var(--text-primary)] group-hover:text-[var(--text-yellow)]'
                                        }
                                    `}>
                                        {match.odds.away}
                                    </span>
                                </div>
                            </div>

                            <div className="py-3 px-2 flex justify-center items-center">
                                <span className="text-[var(--text-muted)] font-inter font-medium text-[13px]">
                                    {match.points}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
