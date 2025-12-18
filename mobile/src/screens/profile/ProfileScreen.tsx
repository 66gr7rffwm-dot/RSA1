import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>Name: {user?.fullName}</Text>
      <Text>Phone: {user?.phoneNumber}</Text>
      <Text>Role: {user?.role}</Text>

      <TouchableOpacity
        style={styles.subscriptionButton}
        onPress={() => navigation.navigate('Subscription' as never)}
      >
        <Text style={styles.subscriptionText}>Manage Subscription (500 PKR / month)</Text>
      </TouchableOpacity>

      {user?.role === 'driver' && (
        <>
          <TouchableOpacity
            style={styles.kycButton}
            onPress={() => navigation.navigate('DriverKYC' as never)}
          >
            <Text style={styles.kycText}>Complete / Update Driver KYC</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.vehiclesButton}
            onPress={() => navigation.navigate('Vehicles' as never)}
          >
            <Text style={styles.vehiclesText}>Manage Vehicles</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  kycButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  kycText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  vehiclesButton: {
    marginTop: 10,
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  vehiclesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionButton: {
    marginTop: 20,
    backgroundColor: '#5856D6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscriptionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;

