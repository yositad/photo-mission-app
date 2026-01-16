import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMissions } from '../../hooks/useMissions';
import { MaterialIcons } from '@expo/vector-icons';

export default function CameraScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { missions, completeMission } = useMissions();
    const [permission, requestPermission] = useCameraPermissions();
    const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
    const cameraRef = useRef<CameraView>(null);
    const [facing, setFacing] = useState<'front' | 'back'>('back');

    const mission = missions.find(m => m.id === id);
    const photoCount = mission?.photos?.length || 0;
    const isMaxPhotos = photoCount >= 5;

    useEffect(() => {
        (async () => {
            const cameraPerm = await requestPermission();
            const mediaPerm = await requestMediaLibraryPermission();
            if (!cameraPerm?.granted || !mediaPerm?.granted) {
                Alert.alert(
                    'Permission required',
                    'Camera and Media Library permissions are needed to take and save photos.'
                );
            }
        })();
    }, []);

    useEffect(() => {
        // Force back if mission not found or error, but give it a moment to load?
        // Actually missions might be empty initially if loading.
    }, [mission]);

    if (!permission?.granted || !mediaLibraryPermission?.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>
                    We need your permission to show the camera and save photos.
                </Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (isMaxPhotos) {
            Alert.alert('Limit Reached', 'You have already taken 5 photos for this mission.');
            return;
        }

        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            if (photo) {
                try {
                    const asset = await MediaLibrary.createAssetAsync(photo.uri);
                    if (asset && typeof id === 'string') {
                        await completeMission(id, photo.uri, asset.id);
                        // Don't auto-close if less than 5? Or ask user? 
                        // Previous behavior was 'router.back()'.
                        // Now we want to allow 5.
                        if (photoCount + 1 >= 5) {
                            Alert.alert('Mission Completed', 'You reached the limit of 5 photos.', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } else {
                            Alert.alert('Saved', `Photo ${photoCount + 1}/5 saved.`, [
                                { text: 'Done', onPress: () => router.back() },
                                { text: 'Take Another', style: 'cancel' }
                            ]);
                        }
                    } else {
                        Alert.alert('Error', 'Failed to save photo or mission ID is invalid.');
                    }
                } catch (e) {
                    console.error('Failed to save photo to media library', e);
                    Alert.alert('Error', 'Failed to save photo.');
                }
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} ref={cameraRef} />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={takePicture}>
                    <View style={styles.outerCircle}>
                        <View style={styles.innerCircle} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 64,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    button: {
        alignItems: 'center',
    },
    outerCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'white',
    }
});
