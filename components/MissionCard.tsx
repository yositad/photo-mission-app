import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Mission } from '../stores/missionStore';

type MissionCardProps = {
    mission: Mission;
    currentLat: number | null;
    currentLon: number | null;
    distance: number;
    isWithinRange: boolean;
    onPressCamera: (id: string) => void;
    onDelete: (id: string) => void;
};

export const MissionCard: React.FC<MissionCardProps> = ({
    mission,
    distance,
    isWithinRange,
    onPressCamera,
    onDelete,
}) => {
    return (
        <View style={styles.card}>
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
                    <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>COMPLETED</Text>
                    </View>
                ) : (
                    <Text style={styles.status}>
                        {isWithinRange ? 'エリア内 - 撮影可能' : 'エリア外'}
                    </Text>
                )}
            </View>
            <View style={styles.actions}>
                {!mission.isCompleted && isWithinRange && (
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={() => onPressCamera(mission.id)}
                    >
                        <MaterialIcons name="camera-alt" size={24} color="white" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(mission.id)}
                >
                    <MaterialIcons name="delete" size={24} color="#ff4444" />
                </TouchableOpacity>
            </View>
        </View>
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
    }
});
