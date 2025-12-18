import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

type DocField =
  | 'cnicFront'
  | 'cnicBack'
  | 'drivingLicense'
  | 'vehicleRegistration'
  | 'tokenTax'
  | 'selfie';

const fieldLabels: Record<DocField, string> = {
  cnicFront: 'CNIC Front',
  cnicBack: 'CNIC Back',
  drivingLicense: 'Driving License',
  vehicleRegistration: 'Vehicle Registration',
  tokenTax: 'Token Tax',
  selfie: 'Selfie',
};

const KYCUploadScreen = () => {
  const { user } = useAuth();
  const [cnicNumber, setCnicNumber] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [docs, setDocs] = useState<Record<DocField, string | null>>({
    cnicFront: null,
    cnicBack: null,
    drivingLicense: null,
    vehicleRegistration: null,
    tokenTax: null,
    selfie: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async (field: DocField) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setDocs((prev) => ({ ...prev, [field]: uri }));
    }
  };

  const handleSubmit = async () => {
    if (user?.role !== 'driver') {
      Alert.alert('Error', 'Only drivers can submit KYC');
      return;
    }

    if (!cnicNumber || !drivingLicenseNumber) {
      Alert.alert('Error', 'Please provide CNIC number and Driving License number.');
      return;
    }

    const missing = Object.entries(docs).filter(([, uri]) => !uri);
    if (missing.length) {
      Alert.alert('Error', `Please upload: ${missing.map(([k]) => fieldLabels[k as DocField]).join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('cnicNumber', cnicNumber);
      form.append('drivingLicenseNumber', drivingLicenseNumber);

      (Object.keys(docs) as DocField[]).forEach((field) => {
        const uri = docs[field];
        if (uri) {
          form.append(field, {
            uri,
            name: `${field}.jpg`,
            type: 'image/jpeg',
          } as any);
        }
      });

      await api.post('/drivers/kyc', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'KYC submitted. Awaiting approval.');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to submit KYC';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Driver KYC</Text>
      <Text style={styles.subtitle}>Upload required documents for verification.</Text>

      <TextInput
        style={styles.input}
        placeholder="CNIC Number"
        value={cnicNumber}
        onChangeText={setCnicNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Driving License Number"
        value={drivingLicenseNumber}
        onChangeText={setDrivingLicenseNumber}
      />

      {(Object.keys(docs) as DocField[]).map((field) => (
        <View key={field} style={styles.docRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.docLabel}>{fieldLabels[field]}</Text>
            {docs[field] && <Image source={{ uri: docs[field] as string }} style={styles.preview} />}
          </View>
          <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(field)}>
            <Text style={styles.uploadText}>{docs[field] ? 'Replace' : 'Upload'}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit KYC</Text>}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  uploadButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#28A745',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    width: 100,
    height: 70,
    borderRadius: 8,
    marginTop: 6,
  },
});

export default KYCUploadScreen;


