import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useMissions } from '../../hooks/useMissions';
import { useLocation } from '../../hooks/useLocation';
import { MissionCard } from '../../components/MissionCard';
import { calculateDistance } from '../../utils/distance';

export default function MissionListScreen() {
  const router = useRouter();
  const { missions, isLoading, refreshMissions, deleteMission } = useMissions();
  const { location, errorMsg } = useLocation();

  useFocusEffect(
    useCallback(() => {
      refreshMissions();
    }, [refreshMissions])
  );

  const handlePressCamera = (id: string) => {
    router.push(`/camera/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteMission(id);
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          let distance = 0;
          let isWithinRange = false;

          if (location) {
            distance = calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              item.latitude,
              item.longitude
            );
            isWithinRange = distance <= 50;
          }

          return (
            <MissionCard
              mission={item}
              currentLat={location?.coords.latitude ?? null}
              currentLon={location?.coords.longitude ?? null}
              distance={distance}
              isWithinRange={isWithinRange}
              onPressCamera={handlePressCamera}
              onDelete={handleDelete}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No missions yet. Add one!</Text>
        }
      />

      <Link href="/add-mission" asChild>
        <MaterialIcons
          name="add-circle"
          size={64}
          color="#007AFF"
          style={styles.fab}
        />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 16,
  },
});
