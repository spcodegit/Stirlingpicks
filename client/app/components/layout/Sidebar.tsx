'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { betService } from '../../services/betService';
import { LucideIcon, Goal, Trophy, Target, Dumbbell, Bike, CircleDot, Swords, Users, Flame, Zap, Shield, Award, Activity, Globe, Star, Dribbble, ChevronDown, ChevronUp } from 'lucide-react';

interface SidebarLink {
    id: string;
    label: string;
    href: string;
    icon: string;
}

interface SidebarSection {
    id: string;
    title?: string;
    links: SidebarLink[];
}

const sidebarSections: SidebarSection[] = [
    {
        id: 'main',
        links: [
            { id: 'live', label: 'Live', href: '/sports/live', icon: '/images/sidebar/live.png' },
            { id: 'search', label: 'Search', href: '/sports/search', icon: '/images/sidebar/search.png' },
        ],
    },
    {
        id: 'popular',
        title: 'POPULAR',
        links: [
            { id: 'pop-football', label: 'Football', href: '/popular/football', icon: 'Goal' },
            { id: 'pop-basketball', label: 'Basketball', href: '/popular/basketball', icon: 'Dribbble' },
            { id: 'pop-tennis', label: 'Tennis', href: '/popular/tennis', icon: 'Globe' },
        ],
    },
    {
        id: 'all-sports',
        title: 'All SPORTS',
        links: [
            { id: 'az-sports', label: 'A - Z Sports (8)', href: '/', icon: '/images/sidebar/a-z.png' },
        ],
    },
];

// Map popular icon names to Lucide icons
const popularIconMap: Record<string, LucideIcon> = {
    'Goal': Goal,
    'Dribbble': Dribbble,
    'Globe': Globe,
};

// Map sport names to Lucide icons
const getSportIcon = (sportName: string) => {
    const iconMap: Record<string, LucideIcon> = {
        'American Football': Trophy,
        'Aussie Rules': Trophy,
        'Baseball': Target,
        'Basketball': Dribbble,
        'Boxing': Dumbbell,
        'Cricket': CircleDot,
        'Golf': Bike,
        'Handball': Activity,
        'Ice Hockey': Shield,
        'Lacrosse': Zap,
        'Mixed Martial Arts': Swords,
        'Politics': Users,
        'Rugby League': Flame,
        'Rugby Union': Award,
        'Soccer': Goal,
        'Tennis': Globe,
    };
    return iconMap[sportName] || Star;
};

// Helper to determine active sport from URL pathname
const getActiveSportFromPath = (pathname: string) => {
    if (!pathname) return null;

    if (pathname.startsWith('/sports/')) {
        const slug = pathname.split('/')[2];
        if (slug === 'live') return null;
        if (slug === 'search') return null;
        const mapped = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        if (mapped === 'Football') return 'Soccer';
        return mapped;
    }

    if (pathname.startsWith('/popular/')) {
        const slug = pathname.split('/')[2];
        const mapped = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        if (mapped === 'Football') return 'Soccer';
        return mapped;
    }

    return null;
};

// Helper to determine unique expand key from pathname
const getActiveExpandKeyFromPath = (pathname: string) => {
    if (!pathname) return null;

    if (pathname.startsWith('/sports/')) {
        const slug = pathname.split('/')[2];
        if (slug === 'live' || slug === 'search') return null;
        const mapped = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const sportName = mapped === 'Football' ? 'Soccer' : mapped;
        return `az-${sportName}`;
    }

    if (pathname.startsWith('/popular/')) {
        const slug = pathname.split('/')[2]; // e.g. 'football' or 'soccer'
        const popularSlug = slug === 'soccer' ? 'football' : slug;
        return `pop-${popularSlug}`;
    }

    return null;
};

// Map expand key to sport name for API request
const getSportNameFromKey = (key: string) => {
    if (key.startsWith('az-')) {
        return key.substring(3);
    }
    if (key === 'pop-football') return 'Soccer';
    if (key === 'pop-basketball') return 'Basketball';
    if (key === 'pop-tennis') return 'Tennis';
    return key;
};

function SidebarContent() {
    const [apiSports, setApiSports] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSports, setExpandedSports] = useState<Record<string, boolean>>({});
    const [leaguesBySport, setLeaguesBySport] = useState<Record<string, string[]>>({});

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeLeague = searchParams.get('league') || '';
    const activeSport = getActiveSportFromPath(pathname);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const fetchSports = async () => {
            try {
                const data = await betService.getSports(true, false);

                if (data.status === 200 && data.data) {
                    setApiSports(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch sports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSports();
    }, [mounted]);

    // Auto-expand active sport from pathname on load/navigation
    useEffect(() => {
        const expandKey = getActiveExpandKeyFromPath(pathname);
        if (!expandKey) return;

        setExpandedSports({
            [expandKey]: true
        });

        const sportName = getSportNameFromKey(expandKey);

        const checkAndFetch = async () => {
            try {
                const response = await betService.getOddsBySport(sportName);
                if (response.status === 200 && response.data) {
                    setLeaguesBySport(prev => {
                        if (prev[sportName]) return prev;
                        return {
                            ...prev,
                            [sportName]: Object.keys(response.data)
                        };
                    });
                }
            } catch (error) {
                console.error(`Failed to fetch leagues for ${sportName}:`, error);
            }
        };

        checkAndFetch();
    }, [pathname, activeSport]);

    const toggleSportExpanded = async (expandKey: string) => {
        const isExpanding = !expandedSports[expandKey];
        setExpandedSports({
            [expandKey]: isExpanding
        });

        const sportName = getSportNameFromKey(expandKey);

        if (isExpanding && !leaguesBySport[sportName]) {
            try {
                const response = await betService.getOddsBySport(sportName);
                if (response.status === 200 && response.data) {
                    setLeaguesBySport(prev => ({
                        ...prev,
                        [sportName]: Object.keys(response.data)
                    }));
                }
            } catch (error) {
                console.error(`Failed to fetch leagues for ${sportName}:`, error);
            }
        }
    };

    const filteredSports = apiSports.filter(sport => {
        const query = searchQuery.toLowerCase();
        const displayName = sport === 'Soccer' ? 'football' : sport.toLowerCase();
        return displayName.includes(query) || sport.toLowerCase().includes(query);
    });

    return (
        <aside
            className={`w-[193px] h-full bg-[var(--bg-green-header)] overflow-y-auto no-scrollbar`}
        >
            <div className="py-7 px-4">
                {sidebarSections.map((section) => (
                    <div key={section.id} className="mb-4">
                        {section.title && (
                            <h3
                                className="text-[var(--text-primary)] font-inter font-semibold text-[12px] leading-[100%] mb-2 px-2 tracking-wide uppercase"
                            >
                                {section.title}
                            </h3>
                        )}
                        <nav className="flex flex-col gap-1">
                            {section.links.map((link) => {
                                if (link.id === 'search') {
                                    return (
                                        <div key={link.id} className="w-[156px] min-h-[28px]">
                                            {isSearching ? (
                                                <div className="w-[156px] h-[28px] flex items-center gap-2 px-2 bg-[var(--bg-white)] rounded-[3px] border border-[var(--border-light)]">
                                                    <div className="w-[20px] h-[20px] relative flex-shrink-0">
                                                        <Image
                                                            src={link.icon}
                                                            alt={link.label}
                                                            fill
                                                            sizes="20px"
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        onBlur={(e) => {
                                                            if (!e.target.value) {
                                                                setIsSearching(false);
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Escape') {
                                                                setSearchQuery('');
                                                                setIsSearching(false);
                                                            }
                                                        }}
                                                        className="w-full bg-transparent text-[var(--text-black)] font-inter font-semibold text-[12px] leading-tight focus:outline-none border-none p-0 placeholder:text-gray-400"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setIsSearching(true)}
                                                    className="w-[156px] h-[28px] flex items-center gap-2 px-2 py-4 bg-[var(--bg-white)] hover:bg-gray-100 transition-colors duration-200 rounded-[3px] text-left cursor-pointer"
                                                >
                                                    <div className="w-[20px] h-[20px] relative flex-shrink-0">
                                                        <Image
                                                            src={link.icon}
                                                            alt={link.label}
                                                            fill
                                                            sizes="20px"
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <span className="text-[var(--text-black)] truncate font-inter font-semibold text-[12px] leading-[100%]">
                                                        {link.label}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                }

                                const isLucideIcon = !link.icon.startsWith('/');
                                const IconComponent = isLucideIcon ? (popularIconMap[link.icon] || Star) : null;
                                const linkSportName = link.label === 'Football' ? 'Soccer' : link.label;

                                return (
                                    <div key={link.id} className="flex flex-col gap-1">
                                        <Link
                                            href={link.href}
                                            onClick={() => toggleSportExpanded(link.id)}
                                            className="w-[156px] h-[28px] flex items-center justify-between px-2 bg-[var(--bg-white)] hover:bg-gray-100 transition-colors duration-200 rounded-[3px]"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                {isLucideIcon && IconComponent ? (
                                                    <div className="w-[20px] h-[20px] flex items-center justify-center flex-shrink-0">
                                                        <IconComponent size={16} className="text-[var(--text-black)]" />
                                                    </div>
                                                ) : (
                                                    <div className="w-[20px] h-[20px] relative flex-shrink-0">
                                                        <Image
                                                            src={link.icon}
                                                            alt={link.label}
                                                            fill
                                                            sizes="20px"
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                )}
                                                <span
                                                    className="text-[var(--text-black)] truncate font-inter font-semibold text-[12px] leading-[100%]"
                                                >
                                                    {link.label}
                                                </span>
                                            </div>

                                            <div
                                                className="p-0.5 rounded flex items-center justify-center"
                                            >
                                                {expandedSports[link.id] ? (
                                                    <ChevronUp size={14} className="text-[var(--text-black)]" />
                                                ) : (
                                                    <ChevronDown size={14} className="text-[var(--text-black)]" />
                                                )}
                                            </div>
                                        </Link>

                                        {/* Show subcategories if this popular sport is expanded */}
                                        {expandedSports[link.id] && (
                                            <div className="flex flex-col gap-1 py-1.5 bg-black/10 rounded-md w-[156px]">
                                                {!leaguesBySport[linkSportName] ? (
                                                    <span className="text-white/60 font-inter text-[10px] px-3 py-1">Loading...</span>
                                                ) : leaguesBySport[linkSportName].length === 0 ? (
                                                    <span className="text-white/60 font-inter text-[10px] px-3 py-1">No leagues</span>
                                                ) : (
                                                    leaguesBySport[linkSportName].map((league) => {
                                                        const isActiveLeague = activeLeague === league;
                                                        const sportSlug = linkSportName.toLowerCase().replace(/\s+/g, '-');
                                                        const targetPath = pathname.startsWith('/popular/')
                                                            ? link.href
                                                            : `/sports/${sportSlug}`;
                                                        return (
                                                            <Link
                                                                key={league}
                                                                href={`${targetPath}?league=${encodeURIComponent(league)}`}
                                                                className={`w-[140px] ml-2 h-[26px] flex items-center px-2 rounded font-inter text-[10px] font-bold uppercase transition-colors duration-200
                                                                    ${isActiveLeague
                                                                        ? 'bg-[var(--bg-yellow-primary)] text-[var(--text-black)]'
                                                                        : 'text-white/85 hover:text-white hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                <span className="truncate">{league}</span>
                                                            </Link>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                ))}

                {mounted && !loading && searchQuery.trim() !== '' && filteredSports.length === 0 && (
                    <div className="mb-4 -mt-3">
                        <p className="text-white/60 font-inter text-[11px] px-2 py-2">
                            No results found for &quot;{searchQuery}&quot;
                        </p>
                    </div>
                )}

                {mounted && !loading && filteredSports.length > 0 && (
                    <div className="mb-4 -mt-3">
                        <nav className="flex flex-col gap-1">
                            {filteredSports.map((sport) => {
                                const IconComponent = getSportIcon(sport);
                                const sportSlug = sport.toLowerCase().replace(/\s+/g, '-');

                                return (
                                    <div key={sport} className="flex flex-col gap-1">
                                        <Link
                                            href={`/sports/${sportSlug}`}
                                            onClick={() => toggleSportExpanded(`az-${sport}`)}
                                            className="w-[156px] h-[28px] flex items-center justify-between px-2 bg-[var(--bg-white)] hover:bg-gray-100 transition-colors duration-200 rounded-[3px]"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="w-[20px] h-[20px] flex items-center justify-center flex-shrink-0">
                                                    <IconComponent size={16} className="text-[var(--text-black)]" />
                                                </div>
                                                <span className="text-[var(--text-black)] truncate font-inter font-semibold text-[12px] leading-[100%]">
                                                    {sport === 'Soccer' ? 'Football' : sport}
                                                </span>
                                            </div>

                                            <div
                                                className="p-0.5 rounded flex items-center justify-center"
                                            >
                                                {expandedSports[`az-${sport}`] ? (
                                                    <ChevronUp size={14} className="text-[var(--text-black)]" />
                                                ) : (
                                                    <ChevronDown size={14} className="text-[var(--text-black)]" />
                                                )}
                                            </div>
                                        </Link>

                                        {/* Show subcategories if this sport is expanded */}
                                        {expandedSports[`az-${sport}`] && (
                                            <div className="flex flex-col gap-1 py-1.5 bg-black/10 rounded-md w-[156px]">
                                                {!leaguesBySport[sport] ? (
                                                    <span className="text-white/60 font-inter text-[10px] px-3 py-1">Loading...</span>
                                                ) : leaguesBySport[sport].length === 0 ? (
                                                    <span className="text-white/60 font-inter text-[10px] px-3 py-1">No leagues</span>
                                                ) : (
                                                    leaguesBySport[sport].map((league) => {
                                                        const isActiveLeague = activeLeague === league;
                                                        return (
                                                            <Link
                                                                key={league}
                                                                href={`/sports/${sportSlug}?league=${encodeURIComponent(league)}`}
                                                                className={`w-[140px] ml-2 h-[26px] flex items-center px-2 rounded font-inter text-[10px] font-bold uppercase transition-colors duration-200
                                                                    ${isActiveLeague
                                                                        ? 'bg-[var(--bg-yellow-primary)] text-[var(--text-black)]'
                                                                        : 'text-white/85 hover:text-white hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                <span className="truncate">{league}</span>
                                                            </Link>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default function Sidebar() {
    return (
        <Suspense fallback={<aside className="w-[193px] h-full bg-[var(--bg-green-header)]" />}>
            <SidebarContent />
        </Suspense>
    );
}
