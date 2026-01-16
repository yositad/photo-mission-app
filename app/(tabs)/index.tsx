import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useMissions } from '../../hooks/useMissions';
import { useLocation } from '../../hooks/useLocation';

export default function MissionMapTab() {
    const { missions, isLoading } = useMissions();
    const { location } = useLocation();

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    let initialRegion = {
        latitude: 35.681236,
        longitude: 139.767125, // Tokyo Station default
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    if (missions.length > 0) {
        const latitudes = missions.map(m => m.latitude);
        const longitudes = missions.map(m => m.longitude);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLon = Math.min(...longitudes);
        const maxLon = Math.max(...longitudes);

        // Center
        const midLat = (minLat + maxLat) / 2;
        const midLon = (minLon + maxLon) / 2;

        // Deltas with some padding (multiply by 1.2 or similar)
        // Ensure minimum zoom so it doesn't look too zoomed in on a single point
        const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
        const lonDelta = Math.max((maxLon - minLon) * 1.5, 0.01);

        initialRegion = {
            latitude: midLat,
            longitude: midLon,
            latitudeDelta: latDelta,
            longitudeDelta: lonDelta,
        };
    } else if (location) {
        initialRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                showsMyLocationButton={true}
                initialRegion={initialRegion}
            >
                {missions.map((mission) => (
                    <Marker
                        key={mission.id}
                        coordinate={{
                            latitude: mission.latitude,
                            longitude: mission.longitude,
                        }}
                        title={mission.name}
                        description={mission.caption}
                        pinColor={mission.isCompleted ? 'green' : 'red'}
                    />
                ))}
            </MapView>
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
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});
