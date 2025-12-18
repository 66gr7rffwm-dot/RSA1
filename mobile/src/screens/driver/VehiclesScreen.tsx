import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert, Image, Modal, ScrollView } from 'react-native';
import api from '../../config/api';
import * as ImagePicker from 'expo-image-picker';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  fuel_type: string;
  seating_capacity: number;
  registration_number: string;
  color?: string;
  vehicle_images?: string[];
  is_active: boolean;
}

const emptyForm = {
  make: '',
  model: '',
  year: '',
  fuelType: 'petrol',
  seatingCapacity: '4',
  registrationNumber: '',
  color: '',
  images: [] as string[],
};

const VehiclesScreen = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.data || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setForm({ ...emptyForm });
    setModalVisible(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      year: String(vehicle.year),
      fuelType: vehicle.fuel_type,
      seatingCapacity: String(vehicle.seating_capacity),
      registrationNumber: vehicle.registration_number,
      color: vehicle.color || '',
      images: vehicle.vehicle_images || [],
    });
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setForm((prev) => ({ ...prev, images: [...prev.images, uri] }));
    }
  };

  const saveVehicle = async () => {
    if (!form.make || !form.model || !form.year || !form.registrationNumber) {
      Alert.alert('Error', 'Please fill required fields.');
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append('make', form.make);
      data.append('model', form.model);
      data.append('year', form.year);
      data.append('fuelType', form.fuelType);
      data.append('seatingCapacity', form.seatingCapacity);
      data.append('registrationNumber', form.registrationNumber);
      if (form.color) data.append('color', form.color);

      form.images.forEach((uri, index) => {
        data.append('images', {
          uri,
          name: `vehicle-${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/vehicles', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setModalVisible(false);
      await loadVehicles();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const deleteVehicle = async (vehicle: Vehicle) => {
    Alert.alert('Delete Vehicle', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/vehicles/${vehicle.id}`);
            await loadVehicles();
          } catch {
            Alert.alert('Error', 'Failed to delete vehicle');
          }
        },
      },
    ]);
  };

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {item.make} {item.model} ({item.year})
        </Text>
        <Text style={styles.cardText}>Reg: {item.registration_number}</Text>
        <Text style={styles.cardText}>
          {item.fuel_type.toUpperCase()} • Seats: {item.seating_capacity}
        </Text>
        {item.color && <Text style={styles.cardText}>Color: {item.color}</Text>}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteVehicle(item)} style={[styles.smallButton, { backgroundColor: '#FF3B30' }]}>
          <Text style={styles.smallButtonText}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <>
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            renderItem={renderVehicle}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No vehicles yet.</Text>}
          />
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add Vehicle</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Make *"
            value={form.make}
            onChangeText={(t) => setForm((p) => ({ ...p, make: t }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Model *"
            value={form.model}
            onChangeText={(t) => setForm((p) => ({ ...p, model: t }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Year *"
            value={form.year}
            onChangeText={(t) => setForm((p) => ({ ...p, year: t }))}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Fuel Type (petrol/diesel/cng/hybrid/electric)"
            value={form.fuelType}
            onChangeText={(t) => setForm((p) => ({ ...p, fuelType: t }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Seating Capacity"
            value={form.seatingCapacity}
            onChangeText={(t) => setForm((p) => ({ ...p, seatingCapacity: t }))}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Registration Number *"
            value={form.registrationNumber}
            onChangeText={(t) => setForm((p) => ({ ...p, registrationNumber: t }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Color"
            value={form.color}
            onChangeText={(t) => setForm((p) => ({ ...p, color: t }))}
          />

          <Text style={styles.sectionTitle}>Images</Text>
          <View style={styles.imagesRow}>
            {form.images.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.imagePreview} />
            ))}
            <TouchableOpacity style={styles.imageAdd} onPress={pickImage}>
              <Text style={{ fontSize: 24, color: '#007AFF' }}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveVehicle} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardText: {
    fontSize: 13,
    color: '#555',
  },
  cardActions: {
    justifyContent: 'space-between',
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 4,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    backgroundColor: '#28A745',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  imagePreview: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  imageAdd: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelText: {
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default VehiclesScreen;


