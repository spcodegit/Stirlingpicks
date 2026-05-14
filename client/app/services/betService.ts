import apiClient from './apiClient';
import { API_ROUTES } from './apiRoutes';

export interface SportsResponse {
    status: number;
    message: string;
    data: string[];
}

export interface PlaceBetRequest {
    sport: {
        name: string;
        league: string;
    };
    bet: {
        matchId: string;
        homeTeam: string;
        awayTeam: string;
        matchDate?: string;
        odds: {
            home: string;
            draw: string;
            away: string;
        };
    };
    placedBet: {
        name: 'home' | 'draw' | 'away';
        value: number;
    };
    price: number;
}

export interface PlaceBetResponse {
    status: number;
    message: string;
    data?: unknown;
}

export interface PopulatedUser {
    _id: string;
    name: string;
    email: string;
    role?: number;
    accountType?: string;
}

export interface BetItem {
    _id: string;
    userId: string | PopulatedUser;
    sport: {
        name: string;
        league: string;
    };
    bet: {
        matchId?: string;
        homeTeam?: string;
        awayTeam?: string;
        matchDate?: string;
        odds?: {
            home?: string;
            draw?: string;
            away?: string;
        };
    };
    placedBet: {
        name: 'home' | 'draw' | 'away';
        value: number;
    };
    price: number;
    status: 'placed' | 'finalizing' | 'win' | 'lose' | 'loss' | 'plan expire';
    accountType: 'standard' | 'professional';
    pnl?: number | null;
    createdAt: string;
}

interface BetAllResponse {
    status: number;
    message: string;
    data: {
        data: BetItem[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

interface BetByIdResponse {
    status: number;
    message: string;
    data: BetItem;
}

// Odds by Sport Types
export interface Outcome {
    name: string;
    price: number;
}

export interface Market {
    key: string;
    last_update: string;
    outcomes: Outcome[];
}

export interface Bookmaker {
    key: string;
    title: string;
    last_update: string;
    markets: Market[];
}

export interface MatchOdds {
    id: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    bookmaker: Bookmaker;
}

export interface OddsBySportResponse {
    status: number;
    message: string;
    data: {
        [league: string]: MatchOdds[];
    };
}

export const betService = {
    /**
     * Fetch all available sports
     */
    getSports: async (groupNames: boolean = true, keys: boolean = false): Promise<SportsResponse> => {
        const response = await apiClient.get(API_ROUTES.BET.SPORTS, {
            params: { groupNames, keys }
        });
        return response.data;
    },

    /**
     * Fetch odds by sport name
     */
    getOddsBySport: async (sportName: string, output: 'fra' | 'decimal' = 'fra'): Promise<OddsBySportResponse> => {
        const response = await apiClient.get(API_ROUTES.BET.ODDS_BY_SPORT, {
            params: { sportName, output }
        });
        return response.data;
    },

    placeBet: async (payload: PlaceBetRequest): Promise<PlaceBetResponse> => {
        const response = await apiClient.post(API_ROUTES.BET.PLACE, payload);
        return response.data;
    },

    getAllBets: async (
        page: number = 1,
        limit: number = 50,
        filters?: { status?: string; accountType?: string }
    ): Promise<BetAllResponse> => {
        const params: Record<string, string | number> = { page, limit };
        if (filters?.status) params.status = filters.status;
        if (filters?.accountType) params.accountType = filters.accountType;
        const response = await apiClient.get(API_ROUTES.BET.ALL, { params });
        return response.data;
    },

    getBetById: async (id: string): Promise<BetByIdResponse> => {
        const response = await apiClient.get(`${API_ROUTES.BET.BY_ID}/${id}`);
        return response.data;
    },

    updateBet: async (id: string, payload: { status: string }): Promise<{ status: number; message: string; data: BetItem }> => {
        const response = await apiClient.put(`${API_ROUTES.BET.BY_ID}/${id}`, payload);
        return response.data;
    },

    finalizeBet: async (id: string, status: 'win' | 'loss'): Promise<{ status: number; message: string; data: BetItem }> => {
        const response = await apiClient.put(`/bet/finalize/${id}`, { status });
        return response.data;
    },

};
