'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

// Helper function to convert decimal odds to fractional
const decimalToFractional = (decimal: any): string => {
    if (typeof decimal === 'string') {
        if (decimal.includes('/')) return decimal;
        decimal = parseFloat(decimal);
    }
    if (isNaN(decimal) || decimal <= 1) return '1/1';

    const decimalMinusOne = decimal - 1;
    const tolerance = 1.0e-6;

    // Common fractions lookup for better display
    const commonFractions: { [key: string]: string } = {
        '0.5': '1/2',
        '0.33': '1/3',
        '0.25': '1/4',
        '0.2': '1/5',
        '0.67': '2/3',
        '0.75': '3/4',
        '1': '1/1',
        '1.5': '3/2',
        '2': '2/1',
        '2.5': '5/2',
        '3': '3/1',
        '4': '4/1',
        '5': '5/1',
    };

    const rounded = Math.round(decimalMinusOne * 100) / 100;
    const key = rounded.toString();

    if (commonFractions[key]) {
        return commonFractions[key];
    }

    // Calculate fraction using continued fractions algorithm
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimalMinusOne;

    for (let i = 0; i < 16; i++) {
        const a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);

        if (Math.abs(decimalMinusOne - h1 / k1) < tolerance) break;
    }

    return `${h1}/${k1}`;
};

// Convert API match data to our Match interface
const convertToMatch = (matchOdds: MatchOdds, currentFormat: 'fra' | 'decimal'): Match | null => {
    try {
        const h2hMarket = matchOdds.bookmaker?.markets?.find(m => m.key === 'h2h');
        if (!h2hMarket || !h2hMarket.outcomes) return null;

        const homeOutcome = h2hMarket.outcomes.find(o => o.name === matchOdds.home_team);
        const awayOutcome = h2hMarket.outcomes.find(o => o.name === matchOdds.away_team);
        const drawOutcome = h2hMarket.outcomes.find(o => o.name === 'Draw');

        // Helper function for safe format conversion
        const formatOdds = (price: any) => {
            if (price === undefined || price === null || price === '') return 'N/A';
            if (typeof price === 'string' && price.includes('/')) return price;
            return currentFormat === 'fra' ? decimalToFractional(price) : price.toString();
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

export default function SportsPage() {
    const params = useParams();
    const [leaguesData, setLeaguesData] = useState<{ [key: string]: Match[] }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [sportName, setSportName] = useState<string>('');
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
                // Get sport name from slug
                const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug || '';
                const formattedSportName = slug
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                setSportName(formattedSportName);

                const response = await betService.getOddsBySport(formattedSportName, oddsFormat);

                if (response.status === 200 && response.data) {
                    const grouped: { [key: string]: Match[] } = {};

                    // Preserving league structure from API response
                    Object.entries(response.data).forEach(([leagueName, leagueMatches]) => {
                        if (Array.isArray(leagueMatches)) {
                            const formattedMatches = leagueMatches
                                .map(m => convertToMatch(m as MatchOdds, oddsFormat))
                                .filter((m): m is Match => m !== null);

                            if (formattedMatches.length > 0) {
                                grouped[leagueName] = formattedMatches;
                            }
                        }
                    });

                    setLeaguesData(grouped);
                    setError(''); // Clear error if success
                } else {
                    setError('No matches found for this sport');
                }
            } catch (err: any) {
                console.error('Failed to fetch matches:', err);
                setError(err.message || 'Failed to load matches');
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [params.slug, mounted, oddsFormat]);

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
                    <p className="text-[var(--text-secondary)] font-inter text-sm">Loading {sportName} matches...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[var(--text-secondary)] font-inter text-lg mb-2">{error}</p>
                    <p className="text-[var(--text-muted)] font-inter text-sm">Try selecting a different sport</p>
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
