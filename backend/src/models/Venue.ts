import { Venue } from '../types';

// In-memory venue storage
const venues: Venue[] = [];

// Initialize with sample venues
venues.push(
    {
        id: 'venue-001',
        name: 'City Sports Complex',
        location: 'Downtown, Main Street',
        sports: ['cricket', 'football', 'tennis'],
        amenities: ['Parking', 'Changing Rooms', 'Cafeteria', 'First Aid'],
        pricePerHour: 2000,
        images: [
            'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
            'https://images.unsplash.com/photo-1577223625816-7546f13df25d',
        ],
        operatingHours: {
            open: '06:00',
            close: '22:00',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'venue-002',
        name: 'Elite Badminton Arena',
        location: 'North Zone, Sports Avenue',
        sports: ['badminton', 'table tennis'],
        amenities: ['AC Courts', 'Equipment Rental', 'Locker Rooms', 'Parking'],
        pricePerHour: 1500,
        images: [
            'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
        ],
        operatingHours: {
            open: '07:00',
            close: '23:00',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    }
);

let venueIdCounter = 3;
const generateVenueId = (): string => {
    return `venue-${String(venueIdCounter++).padStart(3, '0')}`;
};

// CRUD operations
export const createVenue = (data: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>): Venue => {
    const venue: Venue = {
        id: generateVenueId(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    venues.push(venue);
    return venue;
};

export const findVenueById = (id: string): Venue | undefined => {
    return venues.find((v) => v.id === id);
};

export const getAllVenues = (filters?: { sport?: string; location?: string }): Venue[] => {
    let filtered = venues;

    if (filters?.sport) {
        filtered = filtered.filter((v) =>
            v.sports.some((s) => s.toLowerCase() === filters.sport?.toLowerCase())
        );
    }

    if (filters?.location) {
        filtered = filtered.filter((v) =>
            v.location.toLowerCase().includes(filters.location?.toLowerCase() || '')
        );
    }

    return filtered;
};

export const updateVenue = (id: string, data: Partial<Omit<Venue, 'id' | 'createdAt'>>): Venue | null => {
    const venueIndex = venues.findIndex((v) => v.id === id);
    if (venueIndex === -1) return null;

    venues[venueIndex] = {
        ...venues[venueIndex],
        ...data,
        updatedAt: new Date(),
    };
    return venues[venueIndex];
};

export const deleteVenue = (id: string): boolean => {
    const index = venues.findIndex((v) => v.id === id);
    if (index === -1) return false;
    venues.splice(index, 1);
    return true;
};
