import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../config/api';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  registration_number: string;
}

const CreateTripScreen = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '',
    tripDate: '',
    tripTime: '',
    originAddress: '',
    originLatitude: '',
    originLongitude: '',
    destinationAddress: '',
    destinationLatitude: '',
    destinationLongitude: '',
    maxSeats: '3',
    isWomenOnly: false,
  });

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const res = await api.get('/vehicles');
        setVehicles(res.data.data || []);
      } catch (e) {
        Alert.alert('Error', 'Failed to load vehicles');
      } finally {
        setLoadingVehicles(false);
      }
    };
    loadVehicles();
  }, []);

  const handleCreate = async () => {
    if (!form.vehicleId || !form.tripDate || !form.tripTime || !form.originAddress || !form.destinationAddress) {
      Alert.alert('Error', 'Please fill required fields.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/trips', {
        vehicleId: form.vehicleId,
        tripDate: form.tripDate,
        tripTime: form.tripTime,
        originAddress: form.originAddress,
        originLatitude: parseFloat(form.originLatitude || '0'),
        originLongitude: parseFloat(form.originLongitude || '0'),
        destinationAddress: form.destinationAddress,
        destinationLatitude: parseFloat(form.destinationLatitude || '0'),
        destinationLongitude: parseFloat(form.destinationLongitude || '0'),
        maxSeats: parseInt(form.maxSeats || '3', 10),
        isWomenOnly: form.isWomenOnly,
      });
      Alert.alert('Success', 'Trip created successfully.');
      setForm({
        vehicleId: '',
        tripDate: '',
        tripTime: '',
        originAddress: '',
        originLatitude: '',
        originLongitude: '',
        destinationAddress: '',
        destinationLatitude: '',
        destinationLongitude: '',
        maxSeats: '3',
        isWomenOnly: false,
      });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to create trip');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Trip</Text>

      {loadingVehicles ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : vehicles.length === 0 ? (
        <Text style={{ marginVertical: 10 }}>No vehicles found. Please add a vehicle first.</Text>
      ) : (
        <>
          <Text style={styles.label}>Vehicle *</Text>
          {vehicles.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[
                styles.vehicleOption,
                form.vehicleId === v.id && styles.vehicleOptionSelected,
              ]}
              onPress={() => setForm((p) => ({ ...p, vehicleId: v.id }))}
            >
              <Text style={styles.vehicleText}>
                {v.make} {v.model} ({v.registration_number})
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Trip Date (YYYY-MM-DD)"
        value={form.tripDate}
        onChangeText={(t) => setForm((p) => ({ ...p, tripDate: t }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Trip Time (HH:MM)"
        value={form.tripTime}
        onChangeText={(t) => setForm((p) => ({ ...p, tripTime: t }))}
      />

      <TextInput
        style={styles.input}
        placeholder="Origin Address"
        value={form.originAddress}
        onChangeText={(t) => setForm((p) => ({ ...p, originAddress: t }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Origin Latitude"
        value={form.originLatitude}
        onChangeText={(t) => setForm((p) => ({ ...p, originLatitude: t }))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Origin Longitude"
        value={form.originLongitude}
        onChangeText={(t) => setForm((p) => ({ ...p, originLongitude: t }))}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Destination Address"
        value={form.destinationAddress}
        onChangeText={(t) => setForm((p) => ({ ...p, destinationAddress: t }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Destination Latitude"
        value={form.destinationLatitude}
        onChangeText={(t) => setForm((p) => ({ ...p, destinationLatitude: t }))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Destination Longitude"
        value={form.destinationLongitude}
        onChangeText={(t) => setForm((p) => ({ ...p, destinationLongitude: t }))}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Max Seats (1-3)"
        value={form.maxSeats}
        onChangeText={(t) => setForm((p) => ({ ...p, maxSeats: t }))}
        keyboardType="number-pad"
      />

      <TouchableOpacity
        style={styles.toggle}
        onPress={() => setForm((p) => ({ ...p, isWomenOnly: !p.isWomenOnly }))}
      >
        <View style={[styles.checkbox, form.isWomenOnly && styles.checkboxChecked]} />
        <Text style={styles.toggleText}>Women-only ride</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={saving || loadingVehicles}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Trip</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  vehicleOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 6,
  },
  vehicleOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E8F0FE',
  },
  vehicleText: {
    fontSize: 14,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateTripScreen;

