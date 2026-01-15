import { useState, useEffect, useCallback } from 'react';
import {
    Mission,
    loadMissions,
    addMissionToStore,
    updateMissionInStore,
    deleteMissionFromStore
} from '../stores/missionStore';

export const useMissions = () => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshMissions = useCallback(async () => {
        setIsLoading(true);
        const data = await loadMissions();
        setMissions(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        refreshMissions();
    }, [refreshMissions]);

    const addMission = async (name: string, caption: string, latitude: number, longitude: number) => {
        const newMission: Mission = {
            id: Date.now().toString(),
            name,
            caption,
            latitude,
            longitude,
            isCompleted: false,
            createdAt: Date.now(),
        };
        const updated = await addMissionToStore(newMission);
        setMissions(updated);
    };

    const completeMission = async (id: string, photoUri: string, assetId?: string) => {
        const mission = missions.find((m) => m.id === id);
        if (mission) {
            const updatedMission = { ...mission, isCompleted: true, photoUri, assetId };
            const updatedList = await updateMissionInStore(updatedMission);
            setMissions(updatedList);
        }
    };

    const deleteMission = async (id: string) => {
        const updatedList = await deleteMissionFromStore(id);
        setMissions(updatedList);
    }

    return { missions, isLoading, addMission, completeMission, deleteMission, refreshMissions };
};
