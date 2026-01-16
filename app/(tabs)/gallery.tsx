import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useMissions } from '../../hooks/useMissions';
import { PhotoThumbnail } from '../../components/PhotoThumbnail';

import { TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';

type GalleryItem = {
    id: string; // unique ID for key
    uri: string;
    assetId?: string;
    missionName: string;
    missionId: string;
};

export default function GalleryScreen() {
    const { missions, refreshMissions } = useMissions();
    const navigation = useNavigation();
    const [selectedUris, setSelectedUris] = React.useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = React.useState(false);

    useFocusEffect(
        useCallback(() => {
            refreshMissions();
        }, [refreshMissions])
    );

    // Flatten all photos including legacy ones
    const allPhotos: GalleryItem[] = missions.flatMap((m) => {
        const items: GalleryItem[] = [];
        // Legacy
        if (m.photoUri) {
            items.push({
                id: m.id + '_legacy',
                uri: m.photoUri,
                assetId: m.assetId,
                missionName: m.name,
                missionId: m.id
            });
        }
        // New array
        if (m.photos) {
            m.photos.forEach((p, idx) => {
                // ... logic ...
            });
        }
        return items;
    });

    // Correct flattening logic
    const galleryItems: GalleryItem[] = missions.flatMap((m) => {
        if (m.photos && m.photos.length > 0) {
            return m.photos.map((p, idx) => ({
                id: `${m.id}_${idx}`,
                uri: p.uri,
                assetId: p.assetId,
                missionName: m.name,
                missionId: m.id
            }));
        } else if (m.photoUri) {
            return [{
                id: `${m.id}_legacy`,
                uri: m.photoUri,
                assetId: m.assetId,
                missionName: m.name,
                missionId: m.id
            }];
        }
        return [];
    });

    const toggleSelection = (uri: string) => {
        const newSet = new Set(selectedUris);
        if (newSet.has(uri)) {
            newSet.delete(uri);
            if (newSet.size === 0) setIsSelectionMode(false);
        } else {
            newSet.add(uri);
        }
        setSelectedUris(newSet);
    };

    const handleLongPress = (uri: string) => {
        setIsSelectionMode(true);
        const newSet = new Set(selectedUris);
        newSet.add(uri);
        setSelectedUris(newSet);
    };

    const handleShare = async () => {
        if (selectedUris.size === 0) return;

        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert('Error', 'Sharing is not available on this platform');
            return;
        }

        // Sharing multiple files limitation check
        const uris = Array.from(selectedUris);
        if (uris.length === 1) {
            await Sharing.shareAsync(uris[0]);
            setIsSelectionMode(false);
            setSelectedUris(new Set());
        } else {
            Alert.alert(
                'Multiple Sharing',
                'Sharing multiple photos at once might not be supported. Sending them one by one.',
                [
                    {
                        text: 'OK',
                        onPress: async () => {
                            for (const uri of uris) {
                                await Sharing.shareAsync(uri);
                            }
                            setIsSelectionMode(false);
                            setSelectedUris(new Set());
                        }
                    },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        }
    };

    const handleCancel = () => {
        setIsSelectionMode(false);
        setSelectedUris(new Set());
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: isSelectionMode ? () => (
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity onPress={handleShare}>
                        <MaterialIcons name="share" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancel}>
                        <Text style={{ color: '#007AFF', fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            ) : undefined,
            title: isSelectionMode ? `${selectedUris.size} selected` : 'Gallery'
        });
    }, [navigation, isSelectionMode, selectedUris]);

    return (
        <View style={styles.container}>
            <FlatList
                data={galleryItems}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.thumbnailContainer}>
                        <PhotoThumbnail
                            photoUri={item.uri}
                            missionName={item.missionName}
                            assetId={item.assetId}
                            onLongPress={() => handleLongPress(item.uri)}
                            onPress={isSelectionMode ? () => toggleSelection(item.uri) : undefined}
                            selected={selectedUris.has(item.uri)}
                            selectionMode={isSelectionMode}
                            missionId={item.missionId}
                        />
                        {isSelectionMode && (
                            <View style={styles.selectionOverlay}>
                                <MaterialIcons
                                    name={selectedUris.has(item.uri) ? "check-circle" : "radio-button-unchecked"}
                                    size={24}
                                    color={selectedUris.has(item.uri) ? "#007AFF" : "white"}
                                />
                            </View>
                        )}
                    </View>
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
    thumbnailContainer: {
        position: 'relative',
        width: '32%',
        aspectRatio: 1,
        marginBottom: '1.5%',
        marginRight: '1.3%',
    },
    selectionOverlay: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#888',
        fontSize: 16,
    },
});
