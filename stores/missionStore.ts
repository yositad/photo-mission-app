import AsyncStorage from '@react-native-async-storage/async-storage';

export type PhotoData = {
    uri: string;
    assetId?: string;
    createdAt?: number;
};

export type Mission = {
    id: string;
    name: string;
    caption?: string;
    note?: string;
    latitude: number;
    longitude: number;
    isCompleted: boolean;
    photoUri?: string; // Legacy
    assetId?: string; // Legacy
    photos?: PhotoData[];
    createdAt: number;
};

const MISSIONS_KEY = '@missions_data_v1';

export const saveMissions = async (missions: Mission[]): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(missions);
        await AsyncStorage.setItem(MISSIONS_KEY, jsonValue);
    } catch (e) {
        console.error('Failed to save missions', e);
    }
};

export const loadMissions = async (): Promise<Mission[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(MISSIONS_KEY);
        if (jsonValue != null) {
            const missions: Mission[] = JSON.parse(jsonValue);
            // Migrate old data
            return missions.map(m => {
                if (!m.photos && m.photoUri) {
                    return {
                        ...m,
                        photos: [{ uri: m.photoUri, assetId: m.assetId, createdAt: m.createdAt }]
                    };
                }
                if (!m.photos) {
                    return { ...m, photos: [] };
                }
                return m;
            });
        }
        return [];
    } catch (e) {
        console.error('Failed to load missions', e);
        return [];
    }
};

export const addMissionToStore = async (mission: Mission): Promise<Mission[]> => {
    const currentMissions = await loadMissions();
    const newMissions = [...currentMissions, mission];
    await saveMissions(newMissions);
    return newMissions;
};

export const updateMissionInStore = async (updatedMission: Mission): Promise<Mission[]> => {
    const currentMissions = await loadMissions();
    const newMissions = currentMissions.map((m) =>
        m.id === updatedMission.id ? updatedMission : m
    );
    await saveMissions(newMissions);
    return newMissions;
};

export const deleteMissionFromStore = async (id: string): Promise<Mission[]> => {
    const currentMissions = await loadMissions();
    const newMissions = currentMissions.filter((m) => m.id !== id);
    await saveMissions(newMissions);
    return newMissions;
};
