import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMissions } from '../hooks/useMissions';

export default function PhotoViewerScreen() {
    const { uri, missionId } = useLocalSearchParams<{ uri: string; missionId?: string }>();
    const router = useRouter();
    const { deletePhoto } = useMissions();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!uri) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>No photo URI provided</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <MaterialIcons name="close" size={30} color="white" />
                </TouchableOpacity>
            </View>
        );
    }

    // Decode URI component just in case it was encoded
    const decodedUri = decodeURIComponent(uri);

    const handleDelete = () => {
        Alert.alert(
            'Delete Photo',
            'Are you sure you want to delete this photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (missionId) {
                            setIsDeleting(true);
                            await deletePhoto(missionId, decodedUri);
                            setIsDeleting(false);
                            router.back();
                        } else {
                            // If no missionId (legacy?), maybe just can't delete contextually
                            Alert.alert('Error', 'Cannot delete this photo (missing mission context)');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Image source={{ uri: decodedUri }} style={styles.image} resizeMode="contain" />

            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>

            {missionId && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={isDeleting}>
                    <MaterialIcons name="delete" size={30} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    error: {
        color: 'white',
        fontSize: 18,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 25,
    },
    deleteButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        zIndex: 10,
        padding: 15,
        backgroundColor: 'rgba(255,0,0,0.6)',
        borderRadius: 30,
    },
});
