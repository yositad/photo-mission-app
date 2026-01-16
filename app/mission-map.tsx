import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function MissionMapScreen() {
    const { name, latitude, longitude } = useLocalSearchParams<{
        name: string;
        latitude: string;
        longitude: string;
    }>();

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const isValid = !isNaN(lat) && !isNaN(lon);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: name || 'Mission Location' }} />
            {isValid && (
                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    <Marker
                        coordinate={{ latitude: lat, longitude: lon }}
                        title={name}
                    />
                </MapView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
