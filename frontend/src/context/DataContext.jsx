import { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import api from '../services/api';

const sportsCategories = [
    { id: 1, name: 'Tennis', icon: '🎾', color: 'bg-yellow-500' },
    { id: 2, name: 'Basketball', icon: '🏀', color: 'bg-orange-500' },
    { id: 3, name: 'Football', icon: '⚽', color: 'bg-green-500' },
    { id: 4, name: 'Badminton', icon: '🏸', color: 'bg-blue-500' },
    { id: 5, name: 'Cricket', icon: '🏏', color: 'bg-red-500' },
    { id: 6, name: 'Volleyball', icon: '🏐', color: 'bg-purple-500' },
    { id: 7, name: 'Table Tennis', icon: '🏓', color: 'bg-pink-500' },
    { id: 8, name: 'Swimming', icon: '🏊', color: 'bg-cyan-500' },
];

const DataContext = createContext(null);

// Action types
const ACTIONS = {
    SET_EVENTS: 'SET_EVENTS',
    SET_VENUES: 'SET_VENUES',
    SET_PLAYERS: 'SET_PLAYERS',
    SET_TEAMS: 'SET_TEAMS',
    SET_MATCHES: 'SET_MATCHES',
    SET_PRODUCTS: 'SET_PRODUCTS',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',

    ADD_PLAYER: 'ADD_PLAYER',
    UPDATE_PLAYER: 'UPDATE_PLAYER',
    DELETE_PLAYER: 'DELETE_PLAYER',

    ADD_EVENT: 'ADD_EVENT',
    UPDATE_EVENT: 'UPDATE_EVENT',
    DELETE_EVENT: 'DELETE_EVENT',

    ADD_VENUE: 'ADD_VENUE',
    UPDATE_VENUE: 'UPDATE_VENUE',
    DELETE_VENUE: 'DELETE_VENUE',

    ADD_TEAM: 'ADD_TEAM',
    UPDATE_TEAM: 'UPDATE_TEAM',
    DELETE_TEAM: 'DELETE_TEAM',
};

// Reducer
function dataReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_EVENTS:
            return { ...state, events: action.payload, eventsLoaded: true };
        case ACTIONS.SET_VENUES:
            return { ...state, venues: action.payload, venuesLoaded: true };
        case ACTIONS.SET_PLAYERS:
            return { ...state, players: action.payload, playersLoaded: true };
        case ACTIONS.SET_TEAMS:
            return { ...state, teams: action.payload, teamsLoaded: true };
        case ACTIONS.SET_MATCHES:
            return { ...state, matches: action.payload, matchesLoaded: true };
        case ACTIONS.SET_PRODUCTS:
            return { ...state, products: action.payload, productsLoaded: true };
        case ACTIONS.SET_LOADING:
            return { ...state, loading: { ...state.loading, ...action.payload } };
        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload };

        // Players
        case ACTIONS.ADD_PLAYER:
            return { ...state, players: [...state.players, action.payload] };
        case ACTIONS.UPDATE_PLAYER:
            return {
                ...state,
                players: state.players.map(p => p.id === action.payload.id ? action.payload : p),
            };
        case ACTIONS.DELETE_PLAYER:
            return { ...state, players: state.players.filter(p => p.id !== action.payload) };

        // Events
        case ACTIONS.ADD_EVENT:
            return { ...state, events: [...state.events, action.payload] };
        case ACTIONS.UPDATE_EVENT:
            return {
                ...state,
                events: state.events.map(e => e.id === action.payload.id ? action.payload : e),
            };
        case ACTIONS.DELETE_EVENT:
            return { ...state, events: state.events.filter(e => e.id !== action.payload) };

        // Venues
        case ACTIONS.ADD_VENUE:
            return { ...state, venues: [...state.venues, action.payload] };
        case ACTIONS.UPDATE_VENUE:
            return {
                ...state,
                venues: state.venues.map(v => v.id === action.payload.id ? action.payload : v),
            };
        case ACTIONS.DELETE_VENUE:
            return { ...state, venues: state.venues.filter(v => v.id !== action.payload) };

        // Teams
        case ACTIONS.ADD_TEAM:
            return { ...state, teams: [...state.teams, action.payload] };
        case ACTIONS.UPDATE_TEAM:
            return {
                ...state,
                teams: state.teams.map(t => t.id === action.payload.id ? action.payload : t),
            };
        case ACTIONS.DELETE_TEAM:
            return { ...state, teams: state.teams.filter(t => t.id !== action.payload) };

        default:
            return state;
    }
}

// Initial state — empty until API responds
const initialState = {
    events: [],
    venues: [],
    players: [],
    teams: [],
    matches: [],
    products: [],
    eventsLoaded: false,
    venuesLoaded: false,
    playersLoaded: false,
    teamsLoaded: false,
    matchesLoaded: false,
    productsLoaded: false,
    loading: { events: false, venues: false, players: false, teams: false, matches: false, products: false },
    error: null,
};

export const DataProvider = ({ children }) => {
    const [state, dispatch] = useReducer(dataReducer, initialState);
    const [fetchedRef] = useState({ events: false, venues: false, players: false, teams: false, matches: false, products: false });
    const hasFetched = useRef(false);

    // ─── Fetch events from backend API ────────────────────────────────────────
    const fetchEvents = useCallback(async (force = false) => {
        if (fetchedRef.events && !force) return;

        console.log('🔄 Fetching events from backend...');
        dispatch({ type: ACTIONS.SET_LOADING, payload: { events: true } });

        try {
            // Append timestamp for cache busting
            const res = await api.get(`/events?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                const fetchedEvents = data.events || [];
                console.log(`✅ Events fetched: ${fetchedEvents.length} items`);
                dispatch({ type: ACTIONS.SET_EVENTS, payload: fetchedEvents });
                fetchedRef.events = true; // Only mark as fetched if successful
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.warn('⚠️ Server returned error for events:', errorData.message || res.statusText);
                dispatch({ type: ACTIONS.SET_EVENTS, payload: [] });
                fetchedRef.events = false;
            }
        } catch (error) {
            console.error('❌ Events fetch error:', error.message);
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load events' });
            dispatch({ type: ACTIONS.SET_EVENTS, payload: [] });
            fetchedRef.events = false;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { events: false } });
        }
    }, [fetchedRef]);

    // ─── Fetch venues from backend API ────────────────────────────────────────
    const fetchVenues = useCallback(async (force = false) => {
        if (fetchedRef.venues && !force) return;

        console.log('🔄 Fetching venues from backend...');
        dispatch({ type: ACTIONS.SET_LOADING, payload: { venues: true } });

        try {
            const res = await api.get(`/venues?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                const fetchedVenues = data.venues || [];
                console.log(`✅ Venues fetched: ${fetchedVenues.length} items`);
                dispatch({ type: ACTIONS.SET_VENUES, payload: fetchedVenues });
                fetchedRef.venues = true;
            } else {
                console.warn('⚠️ Server returned error for venues:', res.statusText);
                dispatch({ type: ACTIONS.SET_VENUES, payload: [] });
                fetchedRef.venues = false;
            }
        } catch (error) {
            console.error('❌ Venues fetch error:', error.message);
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load venues' });
            dispatch({ type: ACTIONS.SET_VENUES, payload: [] });
            fetchedRef.venues = false;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { venues: false } });
        }
    }, [fetchedRef]);

    // ─── Fetch players from backend API ───────────────────────────────────────
    const fetchPlayers = useCallback(async (force = false) => {
        if (fetchedRef.players && !force) return;

        console.log('🔄 Fetching players (users) from backend...');
        dispatch({ type: ACTIONS.SET_LOADING, payload: { players: true } });

        try {
            const res = await api.get(`/users?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                const fetchedUsers = data.users || [];
                console.log(`✅ Players fetched: ${fetchedUsers.length} items`);
                dispatch({ type: ACTIONS.SET_PLAYERS, payload: fetchedUsers });
                fetchedRef.players = true;
            }
        } catch (error) {
            console.error('❌ Players fetch error:', error.message);
            dispatch({ type: ACTIONS.SET_PLAYERS, payload: [] });
            fetchedRef.players = false;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { players: false } });
        }
    }, [fetchedRef]);

    // ─── Fetch teams from backend API ──────────────────────────────────────────
    const fetchTeams = useCallback(async (force = false) => {
        if (fetchedRef.teams && !force) return;

        console.log('🔄 Fetching teams from backend...');
        dispatch({ type: ACTIONS.SET_LOADING, payload: { teams: true } });

        try {
            const res = await api.get(`/teams?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                const fetchedTeams = data.teams || [];
                console.log(`✅ Teams fetched: ${fetchedTeams.length} items`);
                dispatch({ type: ACTIONS.SET_TEAMS, payload: fetchedTeams });
                fetchedRef.teams = true;
            }
        } catch (error) {
            console.error('❌ Teams fetch error:', error.message);
            dispatch({ type: ACTIONS.SET_TEAMS, payload: [] });
            fetchedRef.teams = false;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { teams: false } });
        }
    }, [fetchedRef]);

    // ─── Fetch matches from backend API ─────────────────────────────────────────
    const fetchMatches = useCallback(async (force = false) => {
        if (fetchedRef.matches && !force) return;

        console.log('🔄 Fetching matches from backend...');
        dispatch({ type: ACTIONS.SET_LOADING, payload: { matches: true } });

        try {
            const res = await api.get(`/matches?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                const fetchedMatches = data.matches || [];
                console.log(`✅ Matches fetched: ${fetchedMatches.length} items`);
                dispatch({ type: ACTIONS.SET_MATCHES, payload: fetchedMatches });
                fetchedRef.matches = true;
            }
        } catch (error) {
            console.error('❌ Matches fetch error:', error.message);
            dispatch({ type: ACTIONS.SET_MATCHES, payload: [] });
            fetchedRef.matches = false;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { matches: false } });
        }
    }, [fetchedRef]);

    // ─── Fetch products from backend API ────────────────────────────────────────
    const fetchProducts = useCallback(async (force = false) => {
        if (fetchedRef.products && !force) return;

        console.log('🔄 Fetching products from backend...');
        dispatch({ type: ACTIONS.SET_LOADING, payload: { products: true } });

        try {
            const res = await api.get(`/products?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                const fetchedProducts = data.products || [];
                console.log(`✅ Products fetched: ${fetchedProducts.length} items`);
                dispatch({ type: ACTIONS.SET_PRODUCTS, payload: fetchedProducts });
                fetchedRef.products = true;
            }
        } catch (error) {
            console.error('❌ Products fetch error:', error.message);
            dispatch({ type: ACTIONS.SET_PRODUCTS, payload: [] });
            fetchedRef.products = false;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: { products: false } });
        }
    }, [fetchedRef]);

    // Fetch on mount
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        
        // First-time load
        fetchEvents();
        fetchVenues();
        fetchPlayers();
        fetchTeams();
        fetchMatches();
        fetchProducts();
    }, []);

    // ─── CRUD helpers (forward to API, then update local state) ───────────────

    const addEvent = useCallback(async (eventData) => {
        try {
            const res = await api.post('/events', eventData);
            if (res.ok) {
                const data = await res.json();
                dispatch({ type: ACTIONS.ADD_EVENT, payload: data.event });
                return data.event;
            }
            throw new Error('Failed to create event');
        } catch (error) {
            console.error('❌ Add event failed:', error);
            throw error;
        }
    }, []);

    const updateEventAction = useCallback(async (id, eventData) => {
        try {
            const res = await api.put(`/events/${id}`, eventData);
            if (res.ok) {
                const data = await res.json();
                dispatch({ type: ACTIONS.UPDATE_EVENT, payload: data.event });
                return data.event;
            }
            throw new Error('Failed to update event');
        } catch (error) {
            console.error('❌ Update event failed:', error);
            throw error;
        }
    }, []);

    const deleteEventAction = useCallback(async (id) => {
        // Optimistic delete
        dispatch({ type: ACTIONS.DELETE_EVENT, payload: id });
        try {
            const res = await api.delete(`/events/${id}`);
            if (!res.ok) {
                // Rollback: re-fetch
                fetchedRef.events = false;
                fetchEvents();
                throw new Error('Failed to delete event');
            }
        } catch (error) {
            console.error('❌ Delete event failed:', error);
            throw error;
        }
    }, [fetchEvents, fetchedRef]);

    const addVenue = useCallback(async (venueData) => {
        try {
            const res = await api.post('/venues', venueData);
            if (res.ok) {
                const data = await res.json();
                dispatch({ type: ACTIONS.ADD_VENUE, payload: data.venue });
                return data.venue;
            }
            throw new Error('Failed to create venue');
        } catch (error) {
            console.error('❌ Add venue failed:', error);
            throw error;
        }
    }, []);

    const updateVenueAction = useCallback(async (id, venueData) => {
        try {
            const res = await api.put(`/venues/${id}`, venueData);
            if (res.ok) {
                const data = await res.json();
                dispatch({ type: ACTIONS.UPDATE_VENUE, payload: data.venue });
                return data.venue;
            }
            throw new Error('Failed to update venue');
        } catch (error) {
            console.error('❌ Update venue failed:', error);
            throw error;
        }
    }, []);

    const deleteVenueAction = useCallback(async (id) => {
        dispatch({ type: ACTIONS.DELETE_VENUE, payload: id });
        try {
            const res = await api.delete(`/venues/${id}`);
            if (!res.ok) {
                fetchedRef.venues = false;
                fetchVenues();
                throw new Error('Failed to delete venue');
            }
        } catch (error) {
            console.error('❌ Delete venue failed:', error);
            throw error;
        }
    }, [fetchVenues, fetchedRef]);

    const addTeam = useCallback(async (teamData) => {
        try {
            const res = await api.post('/teams', teamData);
            if (res.ok) {
                const data = await res.json();
                dispatch({ type: ACTIONS.ADD_TEAM, payload: data.team });
                return data.team;
            }
            throw new Error('Failed to create team');
        } catch (error) {
            console.error('❌ Add team failed:', error);
            throw error;
        }
    }, []);

    const updateTeamAction = useCallback(async (teamData) => {
        try {
            const res = await api.put(`/teams/${teamData.id}`, teamData);
            if (res.ok) {
                const data = await res.json();
                dispatch({ type: ACTIONS.UPDATE_TEAM, payload: data.team });
                return data.team;
            }
            throw new Error('Failed to update team');
        } catch (error) {
            console.error('❌ Update team failed:', error);
            throw error;
        }
    }, []);

    const deleteTeamAction = useCallback(async (id) => {
        dispatch({ type: ACTIONS.DELETE_TEAM, payload: id });
        try {
            const res = await api.delete(`/teams/${id}`);
            if (!res.ok) {
                fetchedRef.teams = false;
                fetchTeams();
                throw new Error('Failed to delete team');
            }
        } catch (error) {
            console.error('❌ Delete team failed:', error);
            throw error;
        }
    }, [fetchTeams, fetchedRef]);

    const addPlayer = useCallback(async (playerData) => {
        try {
            const res = await api.post('/users', playerData);
            if (res.ok) {
                const data = await res.json();
                dispatch({ type: ACTIONS.ADD_PLAYER, payload: data.user });
                return data.user;
            }
            throw new Error('Failed to create player');
        } catch (error) {
            console.error('❌ Add player failed:', error);
            throw error;
        }
    }, []);

    const updatePlayer = useCallback(async (playerData) => {
        try {
            const res = await api.put(`/users/${playerData.id}`, playerData);
            if (res.ok) {
                const data = await res.json();
                dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: data.user });
                return data.user;
            }
            throw new Error('Failed to update player');
        } catch (error) {
            console.error('❌ Update player failed:', error);
            throw error;
        }
    }, []);

    const deletePlayer = useCallback(async (id) => {
        dispatch({ type: ACTIONS.DELETE_PLAYER, payload: id });
        try {
            const res = await api.delete(`/users/${id}`);
            if (!res.ok) {
                fetchedRef.players = false;
                fetchPlayers();
                throw new Error('Failed to delete player');
            }
        } catch (error) {
            console.error('❌ Delete player failed:', error);
            throw error;
        }
    }, [fetchPlayers, fetchedRef]);

    // ─── Refresh helpers ──────────────────────────────────────────────────────
    const refreshEvents = useCallback(() => {
        fetchedRef.events = false;
        fetchEvents();
    }, [fetchEvents, fetchedRef]);

    const refreshVenues = useCallback(() => {
        fetchedRef.venues = false;
        fetchVenues();
    }, [fetchVenues, fetchedRef]);

    // ─── Context value ────────────────────────────────────────────────────────
    const value = {
        // Data
        events: state.events,
        venues: state.venues,
        players: state.players,
        teams: state.teams,
        matches: state.matches,
        products: state.products,
        sportsCategories,

        // Loading & error
        loading: state.loading,
        eventsLoaded: state.eventsLoaded,
        venuesLoaded: state.venuesLoaded,
        playersLoaded: state.playersLoaded,
        teamsLoaded: state.teamsLoaded,
        error: state.error,

        // Event CRUD
        addEvent,
        updateEvent: updateEventAction,
        deleteEvent: deleteEventAction,
        refreshEvents,

        // Venue CRUD
        addVenue,
        updateVenue: updateVenueAction,
        deleteVenue: deleteVenueAction,
        refreshVenues,

        // Team CRUD
        addTeam,
        updateTeam: updateTeamAction,
        deleteTeam: deleteTeamAction,

        // Player CRUD
        addPlayer,
        updatePlayer,
        deletePlayer,
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
