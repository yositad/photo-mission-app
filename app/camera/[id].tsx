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
    const { completeMission } = useMissions();
    const [permission, requestPermission] = useCameraPermissions();
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
    const cameraRef = useRef<CameraView>(null);
    const [isTakingPicture, setIsTakingPicture] = useState(false);

    useEffect(() => {
        if (!permission?.granted) requestPermission();
        if (!mediaPermission?.granted) requestMediaPermission();
    }, []);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current && !isTakingPicture) {
            setIsTakingPicture(true);
            try {
                const photo = await cameraRef.current.takePictureAsync();
                if (photo) {
                    // Save to gallery
                    const asset = await MediaLibrary.createAssetAsync(photo.uri);

                    // Mark mission as complete
                    await completeMission(id, asset.uri, asset.id);
                    Alert.alert('Success', 'Mission Completed!', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to take picture');
            } finally {
                setIsTakingPicture(false);
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
