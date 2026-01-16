import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';

type PhotoThumbnailProps = {
    photoUri: string;
    missionName: string;
    assetId?: string;
    onPress?: () => void;
    onLongPress?: () => void;
    selected?: boolean;
    selectionMode?: boolean;
};

import { useMissionImage } from '../hooks/useMissionImage';

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
    photoUri,
    missionName,
    assetId,
    onPress,
    onLongPress,
    selected,
    selectionMode
}) => {
    const router = useRouter();
    const imageUri = useMissionImage(photoUri, assetId);

    const handlePress = () => {
        if (onPress) {
            onPress();
            return;
        }
        if (imageUri) {
            const encodedUri = encodeURIComponent(imageUri);
            router.push({ pathname: '/photo-view', params: { uri: encodedUri } });
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            onLongPress={onLongPress}
            style={styles.container}
            activeOpacity={0.7}
            disabled={false}
        >
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={[styles.image, selected && styles.selectedImage]} />
            ) : (
                <View style={[styles.image, styles.placeholder]}>
                    <MaterialIcons name="image-not-supported" size={24} color="#999" />
                </View>
            )}
            <View style={styles.overlay}>
                <Text style={styles.text} numberOfLines={1}>{missionName}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    selectedImage: {
        opacity: 0.7,
    },
    placeholder: {
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
    text: {
        color: 'white',
        fontSize: 10,
        textAlign: 'center',
    }
});
