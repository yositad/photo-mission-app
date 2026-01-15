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
};

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({ photoUri, missionName, assetId }) => {
    const router = useRouter();
    // If it's a ph:// URI, don't try to render it directly. Wait for resolution.
    const [imageUri, setImageUri] = useState<string | null>(
        photoUri.startsWith('ph://') ? null : photoUri
    );

    useEffect(() => {
        const resolveUri = async () => {
            if (photoUri.startsWith('ph://')) {
                if (assetId) {
                    try {
                        const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
                        if (assetInfo?.localUri) {
                            setImageUri(assetInfo.localUri);
                        } else {
                            // Could not resolve
                            console.warn('Could not resolve asset URI');
                        }
                    } catch (e) {
                        console.error('Failed to resolve asset URI for display', e);
                    }
                }
            } else {
                setImageUri(photoUri);
            }
        };
        resolveUri();
    }, [assetId, photoUri]);

    const openPhoto = () => {
        if (!imageUri) {
            Alert.alert('Error', 'Image not available');
            return;
        }
        // Encode the URI to ensure it passes correctly as a query param
        const encodedUri = encodeURIComponent(imageUri);
        router.push({ pathname: '/photo-view', params: { uri: encodedUri } });
    };

    return (
        <TouchableOpacity onPress={openPhoto} style={styles.container}>
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
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
        width: '32%',
        aspectRatio: 1,
        marginBottom: '1.5%',
        marginRight: '1.3%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
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
