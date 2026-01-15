import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Button, Alert, Text } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useMissions } from '../hooks/useMissions';

export default function AddMissionScreen() {
    const router = useRouter();
    const { addMission } = useMissions();
    const [name, setName] = useState('');
    const [caption, setCaption] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [region, setRegion] = useState({
        latitude: 35.681236,
        longitude: 139.767125,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            }
        })();
    }, []);

    const handleMapPress = (e: MapPressEvent) => {
        setSelectedLocation(e.nativeEvent.coordinate);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a mission name');
            return;
        }
        if (!selectedLocation) {
            Alert.alert('Error', 'Please select a location on the map');
            return;
        }

        await addMission(name, caption, selectedLocation.latitude, selectedLocation.longitude);
        router.back();
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Mission Name"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Caption (optional)"
                    value={caption}
                    onChangeText={setCaption}
                />
                <Button title="Save Mission" onPress={handleSave} />
            </View>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                onPress={handleMapPress}
                showsUserLocation
            >
                {selectedLocation && (
                    <Marker coordinate={selectedLocation} title="Selected Location" />
                )}
            </MapView>
            <View style={styles.hint}>
                <Text style={styles.hintText}>Tap on map to select location</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inputContainer: {
        padding: 16,
        backgroundColor: 'white',
        zIndex: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    map: {
        flex: 1,
    },
    hint: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    hintText: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: 'white',
        padding: 8,
        borderRadius: 16,
        overflow: 'hidden'
    }
});
