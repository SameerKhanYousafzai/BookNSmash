import { Team } from '../types';

// In-memory team storage
const teams: Team[] = [];

// Initialize with sample teams
teams.push(
    {
        id: 'team-001',
        name: 'Thunder Strikers',
        captainId: 'user-000001',
        memberIds: ['user-000001', 'user-000002', 'user-000003'],
        sport: 'cricket',
        wins: 5,
        losses: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'team-002',
        name: 'Smash Masters',
        captainId: 'user-000004',
        memberIds: ['user-000004', 'user-000005'],
        sport: 'badminton',
        wins: 8,
        losses: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
);

let teamIdCounter = 3;
const generateTeamId = (): string => {
    return `team-${String(teamIdCounter++).padStart(3, '0')}`;
};

// CRUD operations
export const createTeam = (data: {
    name: string;
    captainId: string;
    sport: string;
}): Team => {
    // Check if captain already has a team in this sport
    const existingTeam = teams.find(
        (t) => t.sport === data.sport && (t.captainId === data.captainId || t.memberIds.includes(data.captainId))
    );

    if (existingTeam) {
        throw new Error('User already has a team in this sport');
    }

    const team: Team = {
        id: generateTeamId(),
        name: data.name,
        captainId: data.captainId,
        memberIds: [data.captainId], // Captain is automatically a member
        sport: data.sport,
        wins: 0,
        losses: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    teams.push(team);
    return team;
};

export const findTeamById = (id: string): Team | undefined => {
    return teams.find((t) => t.id === id);
};

export const getAllTeams = (filters?: { sport?: string }): Team[] => {
    let filtered = teams;

    if (filters?.sport) {
        filtered = filtered.filter((t) => t.sport.toLowerCase() === filters.sport?.toLowerCase());
    }

    return filtered;
};

export const updateTeam = (id: string, data: Partial<Pick<Team, 'name' | 'wins' | 'losses'>>): Team | null => {
    const teamIndex = teams.findIndex((t) => t.id === id);
    if (teamIndex === -1) return null;

    teams[teamIndex] = {
        ...teams[teamIndex],
        ...data,
        updatedAt: new Date(),
    };
    return teams[teamIndex];
};

export const deleteTeam = (id: string): boolean => {
    const index = teams.findIndex((t) => t.id === id);
    if (index === -1) return false;
    teams.splice(index, 1);
    return true;
};

// Member management
export const addTeamMember = (teamId: string, userId: string): Team | null => {
    const team = findTeamById(teamId);
    if (!team) return null;

    if (team.memberIds.includes(userId)) {
        throw new Error('User is already a member of this team');
    }

    // Check if user already has a team in this sport
    const userTeam = teams.find(
        (t) => t.sport === team.sport && t.id !== teamId && t.memberIds.includes(userId)
    );

    if (userTeam) {
        throw new Error('User already belongs to another team in this sport');
    }

    team.memberIds.push(userId);
    team.updatedAt = new Date();
    return team;
};

export const removeTeamMember = (teamId: string, userId: string): Team | null => {
    const team = findTeamById(teamId);
    if (!team) return null;

    if (userId === team.captainId) {
        throw new Error('Cannot remove team captain. Transfer captaincy first or delete the team');
    }

    const index = team.memberIds.indexOf(userId);
    if (index === -1) {
        throw new Error('User is not a member of this team');
    }

    team.memberIds.splice(index, 1);
    team.updatedAt = new Date();
    return team;
};

export const isTeamCaptain = (teamId: string, userId: string): boolean => {
    const team = findTeamById(teamId);
    return team?.captainId === userId;
};
