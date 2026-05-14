'use client';
import React from 'react';
import MatchesTable, { Match } from '@/app/components/sports/MatchesTable';

const mockMatches: Match[] = [
    {
        id: '1',
        dateTime: '22 Jul 20:00',
        homeTeam: 'England Women',
        awayTeam: 'Italy Women',
        
        odds: {
            home: '1/2',
            draw: '3/1',
            away: '24/5',
        },
        points: '+280',
    },
    {
        id: '2',
        dateTime: '23 Jul 20:00',
        homeTeam: 'Germany Women',
        awayTeam: 'Spain Women',
        
        odds: {
            home: '4/1',
            draw: '16/5',
            away: '8/15',
        },
        points: '+164',
    },
    {
        id: '3',
        dateTime: '21 Jul 17:00',
        homeTeam: 'Unirea Slobozia',
        awayTeam: 'Miercurea Ciuc',
        
        odds: {
            home: '10/11',
            draw: '11/5',
            away: '14/5',
        },
        points: '+109',
    },
    {
        id: '4',
        dateTime: '21 Jul 18:00',
        homeTeam: 'Norrkoping',
        awayTeam: 'Varnamo',
        
        odds: {
            home: '5/4',
            draw: '5/2',
            away: '19/10',
        },
        points: '+209',
    },
    {
        id: '5',
        dateTime: '21 Jul 18:00',
        homeTeam: 'Landskrona',
        awayTeam: 'Trelleborg',
        
        odds: {
            home: '6/5',
            draw: '9/4',
            away: '2/1',
        },
        points: '+59',
    },
    {
        id: '6',
        dateTime: '21 Jul 18:00',
        homeTeam: 'Utsikten',
        awayTeam: 'Helsingborg',
        
        odds: {
            home: '19/10',
            draw: '12/5',
            away: '6/5',
        },
        points: '+105',
    },
    {
        id: '7',
        dateTime: '24 Jul 15:00',
        homeTeam: 'Manchester City',
        awayTeam: 'Liverpool',
        
        odds: {
            home: '6/5',
            draw: '5/2',
            away: '2/1',
        },
        points: '+320',
    },
    {
        id: '8',
        dateTime: '24 Jul 17:30',
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        
        odds: {
            home: '4/5',
            draw: '3/1',
            away: '7/2',
        },
        points: '+185',
    },
    {
        id: '9',
        dateTime: '25 Jul 20:00',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        
        odds: {
            home: '11/10',
            draw: '12/5',
            away: '5/4',
        },
        points: '+450',
    },
    {
        id: '10',
        dateTime: '25 Jul 18:00',
        homeTeam: 'Bayern Munich',
        awayTeam: 'Dortmund',
        
        odds: {
            home: '8/11',
            draw: '3/1',
            away: '7/2',
        },
        points: '+275',
    },
    {
        id: '11',
        dateTime: '26 Jul 14:00',
        homeTeam: 'PSG',
        awayTeam: 'Lyon',
        
        odds: {
            home: '1/2',
            draw: '7/2',
            away: '5/1',
        },
        points: '+145',
    },
    {
        id: '12',
        dateTime: '26 Jul 19:00',
        homeTeam: 'Juventus',
        awayTeam: 'AC Milan',
        
        odds: {
            home: '6/5',
            draw: '11/5',
            away: '2/1',
        },
        points: '+310',
    },
];

export default function PopularPage() {
    return (
        <div className="w-full h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <MatchesTable matches={mockMatches} />
            </div>
        </div>
    );
}

