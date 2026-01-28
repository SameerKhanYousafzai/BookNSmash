import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import {
    venues as initialVenues,
    upcomingEvents as initialEvents,
    players as initialPlayers,
    matches as initialMatches,
    products as initialProducts,
    teams as initialTeams
} from '../data/mockData';

const DataContext = createContext(null);

// Action types
const ACTIONS = {
    // Venues
    ADD_VENUE: 'ADD_VENUE',
    UPDATE_VENUE: 'UPDATE_VENUE',
    DELETE_VENUE: 'DELETE_VENUE',

    // Events
    ADD_EVENT: 'ADD_EVENT',
    UPDATE_EVENT: 'UPDATE_EVENT',
    DELETE_EVENT: 'DELETE_EVENT',

    // Players (Community)
    ADD_PLAYER: 'ADD_PLAYER',
    UPDATE_PLAYER: 'UPDATE_PLAYER',
    DELETE_PLAYER: 'DELETE_PLAYER',

    // Matches
    ADD_MATCH: 'ADD_MATCH',
    UPDATE_MATCH: 'UPDATE_MATCH',
    DELETE_MATCH: 'DELETE_MATCH',

    // Teams
    ADD_TEAM: 'ADD_TEAM',
    UPDATE_TEAM: 'UPDATE_TEAM',
    DELETE_TEAM: 'DELETE_TEAM',

    // Sync
    SYNC_DATA: 'SYNC_DATA',
    INIT_DATA: 'INIT_DATA',
};

// Reducer function
function dataReducer(state, action) {
    switch (action.type) {
        // Venues
        case ACTIONS.ADD_VENUE:
            return { ...state, venues: [...state.venues, { ...action.payload, adminOnly: true }] };
        case ACTIONS.UPDATE_VENUE:
            return {
                ...state,
                venues: state.venues.map(v => v.id === action.payload.id ? action.payload : v)
            };
        case ACTIONS.DELETE_VENUE:
            return { ...state, venues: state.venues.filter(v => v.id !== action.payload) };

        // Events
        case ACTIONS.ADD_EVENT:
            return { ...state, events: [...state.events, { ...action.payload, adminOnly: true }] };
        case ACTIONS.UPDATE_EVENT:
            return {
                ...state,
                events: state.events.map(e => e.id === action.payload.id ? action.payload : e)
            };
        case ACTIONS.DELETE_EVENT:
            return { ...state, events: state.events.filter(e => e.id !== action.payload) };

        // Players
        case ACTIONS.ADD_PLAYER:
            return { ...state, players: [...state.players, { ...action.payload, adminOnly: true }] };
        case ACTIONS.UPDATE_PLAYER:
            return {
                ...state,
                players: state.players.map(p => p.id === action.payload.id ? action.payload : p)
            };
        case ACTIONS.DELETE_PLAYER:
            return { ...state, players: state.players.filter(p => p.id !== action.payload) };

        // Matches
        case ACTIONS.ADD_MATCH:
            return { ...state, matches: [...state.matches, { ...action.payload, adminOnly: true }] };
        case ACTIONS.UPDATE_MATCH:
            return {
                ...state,
                matches: state.matches.map(m => m.id === action.payload.id ? action.payload : m)
            };
        case ACTIONS.DELETE_MATCH:
            return { ...state, matches: state.matches.filter(m => m.id !== action.payload) };

        // Teams
        case ACTIONS.ADD_TEAM:
            return {
                ...state,
                teams: [...(Array.isArray(state.teams) ? state.teams : []), action.payload]
            };
        case ACTIONS.UPDATE_TEAM:
            return {
                ...state,
                teams: (Array.isArray(state.teams) ? state.teams : []).map(t => t.id === action.payload.id ? action.payload : t)
            };
        case ACTIONS.DELETE_TEAM:
            return {
                ...state,
                teams: (Array.isArray(state.teams) ? state.teams : []).filter(t => t.id !== action.payload)
            };

        // Sync
        case ACTIONS.SYNC_DATA:
            return {
                ...action.payload,
                teams: Array.isArray(action.payload.teams) ? action.payload.teams : []
            };
        case ACTIONS.INIT_DATA:
            return {
                ...action.payload,
                teams: Array.isArray(action.payload.teams) ? action.payload.teams : []
            };

        default:
            return state;
    }
}

// Initial state
const initialState = {
    venues: initialVenues.map(v => ({ ...v, adminOnly: true })),
    events: initialEvents.map(e => ({ ...e, adminOnly: true })),
    players: initialPlayers.map(p => ({ ...p, adminOnly: true })),
    matches: initialMatches.map(m => ({ ...m, adminOnly: true })),
    products: initialProducts,
    teams: Array.isArray(initialTeams) ? initialTeams.map(t => ({ ...t })) : [],
    bookings: [],
};

export const DataProvider = ({ children }) => {
    const [state, dispatch] = useReducer(dataReducer, initialState);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize from localStorage or seed with initial data
    useEffect(() => {
        const storedData = localStorage.getItem('booknsmash_data');
        if (storedData) {
            try {
                dispatch({ type: ACTIONS.INIT_DATA, payload: JSON.parse(storedData) });
            } catch (error) {
                console.error('Error parsing stored data:', error);
                localStorage.setItem('booknsmash_data', JSON.stringify(initialState));
            }
        } else {
            localStorage.setItem('booknsmash_data', JSON.stringify(initialState));
        }
        setIsInitialized(true);
    }, []);

    // Sync to localStorage on state change (ONLY after initialization)
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('booknsmash_data', JSON.stringify(state));
        }
    }, [state, isInitialized]);

    // Listen for storage events (cross-tab sync)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'booknsmash_data' && e.newValue) {
                try {
                    dispatch({ type: ACTIONS.SYNC_DATA, payload: JSON.parse(e.newValue) });
                } catch (error) {
                    console.error('Error syncing data:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Context value
    const value = {
        // State
        venues: state.venues,
        events: state.events,
        players: state.players,
        matches: state.matches,
        products: state.products,
        teams: state.teams,
        bookings: state.bookings,

        // Venue actions
        addVenue: (venue) => dispatch({ type: ACTIONS.ADD_VENUE, payload: venue }),
        updateVenue: (venue) => dispatch({ type: ACTIONS.UPDATE_VENUE, payload: venue }),
        deleteVenue: (id) => dispatch({ type: ACTIONS.DELETE_VENUE, payload: id }),

        // Event actions
        addEvent: (event) => dispatch({ type: ACTIONS.ADD_EVENT, payload: event }),
        updateEvent: (event) => dispatch({ type: ACTIONS.UPDATE_EVENT, payload: event }),
        deleteEvent: (id) => dispatch({ type: ACTIONS.DELETE_EVENT, payload: id }),

        // Player actions
        addPlayer: (player) => dispatch({ type: ACTIONS.ADD_PLAYER, payload: player }),
        updatePlayer: (player) => dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: player }),
        deletePlayer: (id) => dispatch({ type: ACTIONS.DELETE_PLAYER, payload: id }),

        // Match actions
        addMatch: (match) => dispatch({ type: ACTIONS.ADD_MATCH, payload: match }),
        updateMatch: (match) => dispatch({ type: ACTIONS.UPDATE_MATCH, payload: match }),
        deleteMatch: (id) => dispatch({ type: ACTIONS.DELETE_MATCH, payload: id }),

        // Team actions
        addTeam: (team) => dispatch({ type: ACTIONS.ADD_TEAM, payload: team }),
        updateTeam: (team) => dispatch({ type: ACTIONS.UPDATE_TEAM, payload: team }),
        deleteTeam: (id) => dispatch({ type: ACTIONS.DELETE_TEAM, payload: id }),
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

export default DataContext;
