'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { betService } from '../../services/betService';
import { LucideIcon, Goal, Trophy, Target, Dumbbell, Bike, CircleDot, Swords, Users, Flame, Zap, Shield, Award, Activity, Globe, Star, Dribbble } from 'lucide-react';

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
            { id: 'pop-football', label: 'Football', href: '/popular/football', icon: '/images/sidebar/fb.png' },
            { id: 'pop-esports', label: 'E - Sports', href: '/popular/esports', icon: '/images/sidebar/e-s.png' },
            { id: 'pop-basketball', label: 'Basketball', href: '/popular/basketball', icon: '/images/sidebar/basket.png' },
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

export default function Sidebar() {
    const [apiSports, setApiSports] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

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
                            {section.links.map((link) => (
                                <Link
                                    key={link.id}
                                    href={link.href}
                                    className="w-[156px] h-[28px] flex items-center gap-2 px-2 py-4 bg-[var(--bg-white)] hover:bg-gray-100 transition-colors duration-200"
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
                                    <span
                                        className="text-[var(--text-black)] truncate font-inter font-semibold text-[12px] leading-[100%]"
                                    >
                                        {link.label}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                ))}

                {mounted && !loading && apiSports.length > 0 && (
                    <div className="mb-4 -mt-3">
                        <nav className="flex flex-col gap-1">
                            {apiSports.map((sport) => {
                                const IconComponent = getSportIcon(sport);
                                const sportSlug = sport.toLowerCase().replace(/\s+/g, '-');

                                return (
                                    <Link
                                        key={sport}
                                        href={`/sports/${sportSlug}`}
                                        className="w-[156px] h-[28px] flex items-center gap-2 px-2 py-4 bg-[var(--bg-white)] hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <div className="w-[20px] h-[20px] flex items-center justify-center flex-shrink-0">
                                            <IconComponent size={16} className="text-[var(--text-black)]" />
                                        </div>
                                        <span className="text-[var(--text-black)] truncate font-inter font-semibold text-[12px] leading-[100%]">
                                            {sport}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>
        </aside>
    );
}