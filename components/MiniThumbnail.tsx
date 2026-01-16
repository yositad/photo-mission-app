import React from 'react';
import { Image, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { useMissionImage } from '../hooks/useMissionImage';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';

type MiniThumbnailProps = {
    photo: { uri: string; assetId?: string };
    missionId?: string;
};

export const MiniThumbnail: React.FC<MiniThumbnailProps> = ({ photo, missionId }) => {
    const router = useRouter();
    const imageUri = useMissionImage(photo.uri, photo.assetId);

    const handlePress = () => {
        if (imageUri) {
            const encodedUri = encodeURIComponent(imageUri);
            router.push({
                pathname: '/photo-view',
                params: {
                    uri: encodedUri,
                    missionId: missionId
                }
            });
        }
    };

    const handleLongPress = async () => {
        if (imageUri) {
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert('Error', 'Sharing is not available on this platform');
                return;
            }
            try {
                await Sharing.shareAsync(imageUri);
            } catch (error) {
                console.error("Error sharing image:", error);
            }
        }
    };

    if (!imageUri) return <View style={[styles.thumbnail, { backgroundColor: '#eee' }]} />;

    return (
        <TouchableOpacity onPress={handlePress} onLongPress={handleLongPress}>
            <Image source={{ uri: imageUri }} style={styles.thumbnail} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    thumbnail: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 4,
    },
});
