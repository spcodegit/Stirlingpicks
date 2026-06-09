'use client';
import React, { useEffect, useState } from 'react';
import MatchesTable, { Match } from '@/app/components/sports/MatchesTable';
import { betService, MatchOdds } from '@/app/services/betService';
import { Loader2 } from 'lucide-react';

const formatDateTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

const isTodayOrFuture = (isoDate: string): boolean => {
    const matchDate = new Date(isoDate);
    if (Number.isNaN(matchDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    matchDate.setHours(0, 0, 0, 0);

    return matchDate >= today;
};

// Helper function to convert decimal odds to fractional
// The API already returns odds in the correct format (fractional strings for 'fra',
// decimal numbers for 'decimal') based on the 'output' query param sent by betService.
const convertToMatch = (matchOdds: MatchOdds): Match | null => {
    try {
        const h2hMarket = matchOdds.bookmaker?.markets?.find(m => m.key === 'h2h');
        if (!h2hMarket || !h2hMarket.outcomes) return null;

        const homeOutcome = h2hMarket.outcomes.find(o => o.name === matchOdds.home_team);
        const awayOutcome = h2hMarket.outcomes.find(o => o.name === matchOdds.away_team);
        const drawOutcome = h2hMarket.outcomes.find(o => o.name === 'Draw');

        const formatOdds = (price: any) => {
            if (price === undefined || price === null || price === '') return 'N/A';
            return price.toString();
        };

        return {
            id: matchOdds.id,
            dateTime: formatDateTime(matchOdds.commence_time),
            homeTeam: matchOdds.home_team,
            awayTeam: matchOdds.away_team,
            odds: {
                home: formatOdds(homeOutcome?.price),
                draw: formatOdds(drawOutcome?.price),
                away: formatOdds(awayOutcome?.price),
            },
            points: '+' + Math.floor(Math.random() * 400 + 50).toString(),
        };
    } catch (error) {
        console.error('Error converting match:', error);
        return null;
    }
};

export default function SportsIndexPage() {
    const [leaguesData, setLeaguesData] = useState<{ [key: string]: Match[] }>({});
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [oddsFormat, setOddsFormat] = useState<'fra' | 'decimal'>('fra');

    // Fix hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const fetchMatches = async () => {
            setLoading(true);
            try {
                // Default to Soccer/Football for the main sports page
                const response = await betService.getOddsBySport('Soccer', oddsFormat);

                if (response.status === 200 && response.data) {
                    const grouped: { [key: string]: Match[] } = {};

                    // Preserving league structure from API response
                    Object.entries(response.data).forEach(([leagueName, leagueMatches]) => {
                        if (Array.isArray(leagueMatches)) {
                            const formattedMatches = leagueMatches
                                .filter((m) => isTodayOrFuture((m as MatchOdds).commence_time))
                                .map(m => convertToMatch(m as MatchOdds))
                                .filter((m): m is Match => m !== null);

                            if (formattedMatches.length > 0) {
                                grouped[leagueName] = formattedMatches;
                            }
                        }
                    });

                    setLeaguesData(grouped);
                }
            } catch (error) {
                console.error('Failed to fetch matches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [mounted, oddsFormat]);

    const handleOddsFormatChange = (format: 'fra' | 'decimal') => {
        setOddsFormat(format);
    };

    if (!mounted) {
        return null;
    }

    if (loading) {
        return (
            <div className="w-full h-full bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-[var(--bg-green-primary)]" />
                    <p className="text-[var(--text-secondary)] font-inter text-sm">Loading matches...</p>
                </div>
            </div>
        );
    }

    const hasLeagues = Object.keys(leaguesData).length > 0;

    return (
        <div className="w-full h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {hasLeagues ? (
                    <MatchesTable
                        leaguesData={leaguesData}
                        oddsFormat={oddsFormat}
                        onOddsFormatChange={handleOddsFormatChange}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-[var(--text-muted)] font-inter">No matches available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
