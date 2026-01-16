import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Mission } from '../stores/missionStore';
import { useMissionImage } from '../hooks/useMissionImage';
import { MiniThumbnail } from './MiniThumbnail';

type MissionCardProps = {
    mission: Mission;
    currentLat: number | null;
    currentLon: number | null;
    distance: number;
    isWithinRange: boolean;
    onPressCamera: (id: string) => void;
    onDelete: (id: string) => void;
    onPress: (id: string) => void;
    onPressNote?: (id: string) => void;
    drag?: () => void;
    isActive?: boolean;
    isEditMode?: boolean;
};

export const MissionCard: React.FC<MissionCardProps> = ({
    mission,
    currentLat,
    currentLon,
    distance,
    isWithinRange,
    onPressCamera,
    onDelete,
    onPress,
    onPressNote,
    drag,
    isActive,
    isEditMode = false,
}) => {
    const router = useRouter();
    // imageUri is legacy single photo logic, mostly used inside mini thumbnail now.
    // We don't necessarily need it here if we just render MiniThumbnails.

    // Legacy fallback
    const photos = mission.photos && mission.photos.length > 0
        ? mission.photos
        : (mission.photoUri ? [{ uri: mission.photoUri, assetId: mission.assetId }] : []);

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => onPress(mission.id)}
            onLongPress={drag}
            disabled={isActive}
            style={[styles.card, isActive && { backgroundColor: '#e0e0e0', transform: [{ scale: 1.05 }] }]}
        >
            <View style={styles.info}>
                <Text style={styles.title}>{mission.name}</Text>
                <View style={styles.detailsRow}>
                    <Text style={styles.distance}>
                        {distance < 1000
                            ? `${Math.round(distance)}m`
                            : `${(distance / 1000).toFixed(1)}km`}
                    </Text>
                    {mission.caption ? (
                        <Text style={styles.caption} numberOfLines={1}> - {mission.caption}</Text>
                    ) : null}
                </View>
                {mission.isCompleted ? (
                    <View style={styles.completedContainer}>
                        <View style={styles.badgeColumn}>
                            <View style={styles.completedBadge}>
                                <Text style={styles.completedText}>COMPLETED</Text>
                            </View>
                            {photos.length > 0 && photos[0].createdAt && (
                                <Text style={styles.completedDate}>
                                    {new Date(photos[0].createdAt).toLocaleString('ja-JP', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            {photos.slice(0, 5).map((photo, index) => (
                                <MiniThumbnail key={index} photo={photo} missionId={mission.id} />
                            ))}
                        </View>
                    </View>
                ) : (
                    <Text style={styles.status}>
                        {isWithinRange ? 'エリア内 - 撮影可能' : 'エリア外'}
                    </Text>
                )}
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.noteButton}
                    onPress={() => onPressNote && onPressNote(mission.id)}
                >
                    <MaterialIcons name="note-add" size={24} color={mission.note ? "#007AFF" : "#888"} />
                </TouchableOpacity>
                {photos.length < 5 && isWithinRange && (
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={() => onPressCamera(mission.id)}
                    >
                        <MaterialIcons name="camera-alt" size={24} color="white" />
                    </TouchableOpacity>
                )}
                {isEditMode && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDelete(mission.id)}
                    >
                        <MaterialIcons name="delete" size={24} color="#ff4444" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    distance: {
        fontSize: 14,
        color: '#666',
    },
    caption: {
        fontSize: 14,
        color: '#888',
        flex: 1,
    },
    status: {
        fontSize: 12,
        color: '#888',
    },
    completedBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    completedText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    completedDate: {
        color: '#888',
        fontSize: 10,
        marginTop: 2,
    },
    badgeColumn: {
        flexDirection: 'column',
        marginRight: 8,
        alignItems: 'flex-start',
    },
    deleteText: {
        color: '#FF3B30',
        fontSize: 12,
        fontWeight: 'bold',
    },
    completedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnail: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    cameraButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 24,
    },
    deleteButton: {
        padding: 8,
    },
    noteButton: {
        padding: 8,
    }
});
