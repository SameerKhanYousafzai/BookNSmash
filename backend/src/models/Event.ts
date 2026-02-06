import { Event } from '../types';

// In-memory event storage
const events: Event[] = [];

// Initialize with sample events
events.push(
    {
        id: 'event-001',
        title: 'Summer Cricket Championship',
        description: 'Annual cricket tournament featuring top teams from the region',
        sport: 'cricket',
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-03-17'),
        entryFee: 1000,
        maxParticipants: 16,
        venueId: 'venue-001',
        registeredUserIds: [],
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'event-002',
        title: 'Badminton Open 2026',
        description: 'Open badminton tournament for all skill levels',
        sport: 'badminton',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-02'),
        entryFee: 500,
        maxParticipants: 32,
        venueId: 'venue-002',
        registeredUserIds: [],
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
);

let eventIdCounter = 3;
const generateEventId = (): string => {
    return `event-${String(eventIdCounter++).padStart(3, '0')}`;
};

// CRUD operations
export const createEvent = (data: Omit<Event, 'id' | 'registeredUserIds' | 'createdAt' | 'updatedAt'>): Event => {
    const event: Event = {
        id: generateEventId(),
        ...data,
        registeredUserIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    events.push(event);
    return event;
};

export const findEventById = (id: string): Event | undefined => {
    return events.find((e) => e.id === id);
};

export const getAllEvents = (filters?: { sport?: string; status?: string }): Event[] => {
    let filtered = events;

    if (filters?.sport) {
        filtered = filtered.filter((e) => e.sport.toLowerCase() === filters.sport?.toLowerCase());
    }

    if (filters?.status) {
        filtered = filtered.filter((e) => e.status === filters.status);
    }

    return filtered;
};

export const updateEvent = (id: string, data: Partial<Omit<Event, 'id' | 'createdAt'>>): Event | null => {
    const eventIndex = events.findIndex((e) => e.id === id);
    if (eventIndex === -1) return null;

    events[eventIndex] = {
        ...events[eventIndex],
        ...data,
        updatedAt: new Date(),
    };
    return events[eventIndex];
};

export const deleteEvent = (id: string): boolean => {
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) return false;
    events.splice(index, 1);
    return true;
};

// Registration operations
export const registerUserForEvent = (eventId: string, userId: string): Event | null => {
    const event = findEventById(eventId);
    if (!event) return null;

    if (event.registeredUserIds.includes(userId)) {
        throw new Error('User already registered for this event');
    }

    if (event.registeredUserIds.length >= event.maxParticipants) {
        throw new Error('Event is full');
    }

    event.registeredUserIds.push(userId);
    event.updatedAt = new Date();
    return event;
};

export const unregisterUserFromEvent = (eventId: string, userId: string): Event | null => {
    const event = findEventById(eventId);
    if (!event) return null;

    const index = event.registeredUserIds.indexOf(userId);
    if (index === -1) {
        throw new Error('User not registered for this event');
    }

    event.registeredUserIds.splice(index, 1);
    event.updatedAt = new Date();
    return event;
};
