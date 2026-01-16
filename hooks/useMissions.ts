import { useState, useEffect, useCallback } from 'react';
import {
    Mission,
    loadMissions,
    addMissionToStore,
    updateMissionInStore,
    deleteMissionFromStore,
    saveMissions
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
            const currentPhotos = mission.photos || [];
            if (currentPhotos.length >= 5) {
                // Should be prevented by UI, but safety check
                return;
            }

            const newPhoto = { uri: photoUri, assetId, createdAt: Date.now() };
            const updatedPhotos = [...currentPhotos, newPhoto];

            const updatedMission = {
                ...mission,
                isCompleted: true,
                photos: updatedPhotos,
                // Keep legacy fields in sync for now if needed, or just ignore them
                photoUri: updatedPhotos[0].uri,
                assetId: updatedPhotos[0].assetId
            };
            const updatedList = await updateMissionInStore(updatedMission);
            setMissions(updatedList);
        }
    };

    const deleteMission = async (id: string) => {
        const updatedList = await deleteMissionFromStore(id);
        setMissions(updatedList);
    }

    const importMissions = async (newMissions: Mission[]) => {
        await saveMissions(newMissions);
        setMissions(newMissions);
    };

    const reorderMissions = async (newMissions: Mission[]) => {
        setMissions(newMissions); // Optimistic
        await saveMissions(newMissions);
    };

    const deletePhoto = async (missionId: string, photoUri: string) => {
        const mission = missions.find((m) => m.id === missionId);
        if (mission && mission.photos) {
            const updatedPhotos = mission.photos.filter((p) => p.uri !== photoUri);
            const isCompleted = updatedPhotos.length > 0;

            const updatedMission = {
                ...mission,
                isCompleted,
                photos: updatedPhotos,
                // Sync legacy fields
                photoUri: updatedPhotos.length > 0 ? updatedPhotos[0].uri : undefined,
                assetId: updatedPhotos.length > 0 ? updatedPhotos[0].assetId : undefined,
            };

            const updatedList = await updateMissionInStore(updatedMission);
            setMissions(updatedList);
        }
    };

    const saveMissionNote = async (id: string, note: string) => {
        const mission = missions.find((m) => m.id === id);
        if (mission) {
            const updatedMission = { ...mission, note };
            const updatedList = await updateMissionInStore(updatedMission);
            setMissions(updatedList);
        }
    };

    return { missions, isLoading, addMission, completeMission, deleteMission, refreshMissions, importMissions, reorderMissions, deletePhoto, saveMissionNote };
};
