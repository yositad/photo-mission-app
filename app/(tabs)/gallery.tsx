import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useMissions } from '../../hooks/useMissions';
import { PhotoThumbnail } from '../../components/PhotoThumbnail';

export default function GalleryScreen() {
    const { missions, refreshMissions } = useMissions();

    useFocusEffect(
        useCallback(() => {
            refreshMissions();
        }, [refreshMissions])
    );

    const completedMissions = missions.filter(
        (m) => m.isCompleted && m.photoUri
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={completedMissions}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <PhotoThumbnail
                        photoUri={item.photoUri!}
                        missionName={item.name}
                        assetId={item.assetId}
                    />
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No photos yet.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        padding: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#888',
        fontSize: 16,
    },
});
