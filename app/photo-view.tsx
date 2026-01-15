import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function PhotoViewerScreen() {
    const { uri } = useLocalSearchParams<{ uri: string }>();
    const router = useRouter();

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

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Image source={{ uri: decodedUri }} style={styles.image} resizeMode="contain" />

            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
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
});
