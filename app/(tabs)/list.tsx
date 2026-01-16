import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Link, useRouter, useFocusEffect, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Button, Alert, TouchableOpacity } from 'react-native';
import { useMissions } from '../../hooks/useMissions';
import { useLocation } from '../../hooks/useLocation';
import { MissionCard } from '../../components/MissionCard';
import { NoteModal } from '../../components/NoteModal';
import { calculateDistance } from '../../utils/distance';

export default function MissionListScreen() {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<'custom' | 'closest' | 'farthest'>('custom');
  const [isEditMode, setIsEditMode] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState('');

  const {
    missions,
    isLoading,
    refreshMissions,
    deleteMission,
    importMissions,
    reorderMissions,
    saveMissionNote
  } = useMissions();
  const { location, errorMsg } = useLocation();

  useFocusEffect(
    useCallback(() => {
      refreshMissions();
    }, [refreshMissions])
  );

  const sortedMissions = React.useMemo(() => {
    if (sortMode === 'custom') return missions;
    if (!location) return missions;

    return [...missions].sort((a, b) => {
      const distA = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        a.latitude,
        a.longitude
      );
      const distB = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        b.latitude,
        b.longitude
      );
      return sortMode === 'closest' ? distA - distB : distB - distA;
    });
  }, [missions, location, sortMode]);

  const handlePressCamera = (id: string) => {
    router.push(`/camera/${id}`);
  };

  const handlePressMission = (mission: any) => {
    router.push({
      pathname: '/mission-map',
      params: {
        name: mission.name,
        latitude: mission.latitude,
        longitude: mission.longitude,
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteMission(id);
  }

  const handlePressNote = (id: string) => {
    const mission = missions.find(m => m.id === id);
    if (mission) {
      setEditingMissionId(id);
      setEditingNote(mission.note || '');
      setNoteModalVisible(true);
    }
  };

  const handleSaveNote = async (note: string) => {
    if (editingMissionId && saveMissionNote) {
      await saveMissionNote(editingMissionId, note);
    }
  };

  const handleExport = async () => {
    try {
      if (missions.length === 0) {
        Alert.alert('No Data', 'No missions to export.');
        return;
      }
      const fileUri = FileSystem.cacheDirectory + 'missions_export.json';
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(missions, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to export missions');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);

      let parsedData;
      try {
        parsedData = JSON.parse(fileContent);
      } catch (e) {
        Alert.alert('Error', 'Invalid JSON file.');
        return;
      }

      if (!Array.isArray(parsedData)) {
        Alert.alert('Error', 'Invalid data format. Expected an array of missions.');
        return;
      }

      // Basic validation (check for required fields in the first item if exists)
      // Ideally validate every item or use a schema library like Zod, but simple check is okay for now.
      const isValid = parsedData.every((item: any) =>
        item && typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.latitude === 'number' &&
        typeof item.longitude === 'number'
      );

      if (!isValid) {
        Alert.alert('Error', 'Invalid mission data structure.');
        return;
      }

      Alert.alert(
        'Import Missions',
        'This will overwrite all existing missions. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              await importMissions(parsedData);
              Alert.alert('Success', 'Missions imported successfully.');
            }
          }
        ]
      );

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to import missions.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        headerLeft: () => (
          <Button title={isEditMode ? "Done" : "Edit"} onPress={() => setIsEditMode(!isEditMode)} />
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Import" onPress={handleImport} />
            <Button title="Export" onPress={handleExport} />
          </View>
        )
      }} />

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortMode === 'custom' && styles.sortButtonActive]}
          onPress={() => setSortMode('custom')}
        >
          <Text style={[styles.sortButtonText, sortMode === 'custom' && styles.sortButtonTextActive]}>Original</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortMode === 'closest' && styles.sortButtonActive]}
          onPress={() => setSortMode('closest')}
        >
          <Text style={[styles.sortButtonText, sortMode === 'closest' && styles.sortButtonTextActive]}>Closest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortMode === 'farthest' && styles.sortButtonActive]}
          onPress={() => setSortMode('farthest')}
        >
          <Text style={[styles.sortButtonText, sortMode === 'farthest' && styles.sortButtonTextActive]}>Farthest</Text>
        </TouchableOpacity>
      </View>

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      <DraggableFlatList
        data={sortedMissions}
        onDragEnd={({ data }) => {
          if (sortMode === 'custom') {
            reorderMissions(data);
          }
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, drag, isActive }: RenderItemParams<any>) => {
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
            <ScaleDecorator>
              <MissionCard
                mission={item}
                currentLat={location?.coords.latitude ?? null}
                currentLon={location?.coords.longitude ?? null}
                distance={distance}
                isWithinRange={isWithinRange}
                onPressCamera={handlePressCamera}
                onDelete={handleDelete}
                onPress={() => handlePressMission(item)}
                onPressNote={handlePressNote}
                drag={sortMode === 'custom' ? drag : undefined}
                isActive={isActive}
                isEditMode={isEditMode}
              />
            </ScaleDecorator>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No missions yet. Add one!</Text>
        }
      />

      {isEditMode && (
        <Link href="/add-mission" asChild>
          <TouchableOpacity style={styles.fab}>
            <MaterialIcons name="add" size={32} color="white" />
          </TouchableOpacity>
        </Link>
      )}

      <NoteModal
        visible={noteModalVisible}
        initialNote={editingNote}
        onClose={() => setNoteModalVisible(false)}
        onSave={handleSaveNote}
      />
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
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
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#333',
  },
  sortButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
});
