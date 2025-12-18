import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import api from '../../config/api';

const BookingScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { trip } = route.params || {};

  const [pickupAddress, setPickupAddress] = useState(trip?.origin_address || '');
  const [pickupLatitude, setPickupLatitude] = useState('');
  const [pickupLongitude, setPickupLongitude] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState(trip?.destination_address || '');
  const [dropoffLatitude, setDropoffLatitude] = useState('');
  const [dropoffLongitude, setDropoffLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [sosLoading, setSosLoading] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for booking');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setPickupLatitude(location.coords.latitude.toString());
      setPickupLongitude(location.coords.longitude.toString());

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (addresses.length > 0) {
        const addr = addresses[0];
        setPickupAddress(
          `${addr.street || ''} ${addr.city || ''} ${addr.region || ''}`.trim() || 
          'Current Location'
        );
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const calculatePrice = async () => {
    if (!pickupLatitude || !pickupLongitude || !dropoffLatitude || !dropoffLongitude) {
      return;
    }

    setCalculatingPrice(true);
    try {
      // In a real app, you'd call an API endpoint to calculate price
      // For now, we'll estimate based on distance
      const res = await api.post('/bookings/estimate', {
        tripId: trip?.id,
        pickupLatitude: parseFloat(pickupLatitude),
        pickupLongitude: parseFloat(pickupLongitude),
        dropoffLatitude: parseFloat(dropoffLatitude),
        dropoffLongitude: parseFloat(dropoffLongitude),
      });
      setPrice(res.data.data?.estimatedCost || null);
    } catch (error) {
      // Estimate failed, will calculate on booking
    } finally {
      setCalculatingPrice(false);
    }
  };

  useEffect(() => {
    if (pickupLatitude && pickupLongitude && dropoffLatitude && dropoffLongitude) {
      calculatePrice();
    }
  }, [pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude]);

  const handleBook = async () => {
    if (!trip?.id) return;

    if (!pickupAddress || !dropoffAddress || !pickupLatitude || !pickupLongitude || 
        !dropoffLatitude || !dropoffLongitude) {
      Alert.alert('Error', 'Please fill all pickup and drop-off details.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/bookings', {
        tripId: trip.id,
        pickupAddress,
        pickupLatitude: parseFloat(pickupLatitude),
        pickupLongitude: parseFloat(pickupLongitude),
        dropoffAddress,
        dropoffLatitude: parseFloat(dropoffLatitude),
        dropoffLongitude: parseFloat(dropoffLongitude),
      });

      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your booking has been created successfully.${price ? ` Estimated cost: PKR ${price.toFixed(0)}` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MyRides' as never),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Booking Failed', e.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendSOS = async () => {
    if (!trip?.id) return;
    
    Alert.alert(
      'Send SOS Alert?',
      'This will notify emergency services and platform administrators of your location.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: async () => {
            setSosLoading(true);
            try {
              await api.post('/sos', {
                tripId: trip.id,
                latitude: pickupLatitude ? parseFloat(pickupLatitude) : undefined,
                longitude: pickupLongitude ? parseFloat(pickupLongitude) : undefined,
                address: pickupAddress || undefined,
              });
              Alert.alert('SOS Sent', 'Our team has been notified. Help is on the way!');
            } catch {
              Alert.alert('Error', 'Failed to send SOS. Please try again or call emergency services.');
            } finally {
              setSosLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorTitle}>No trip selected</Text>
        <Text style={styles.errorText}>Please go back and select a trip to book.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Route Header */}
      <View style={styles.routeHeader}>
        <View style={styles.routeVisual}>
          <View style={styles.locationDot}>
            <View style={styles.dot} />
            <View style={styles.line} />
            <View style={[styles.dot, styles.dotDestination]} />
          </View>
          <View style={styles.routeText}>
            <Text style={styles.origin}>{trip.origin_address}</Text>
            <Text style={styles.destination}>{trip.destination_address}</Text>
          </View>
        </View>
      </View>

      {/* Pickup Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Pickup Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Pickup Address"
          value={pickupAddress}
          onChangeText={setPickupAddress}
          placeholderTextColor="#9ca3af"
        />
        <View style={styles.coordsRow}>
          <TextInput
            style={[styles.input, styles.coordInput]}
            placeholder="Latitude"
            value={pickupLatitude}
            onChangeText={setPickupLatitude}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={[styles.input, styles.coordInput]}
            placeholder="Longitude"
            value={pickupLongitude}
            onChangeText={setPickupLongitude}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
          <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
        </TouchableOpacity>
      </View>

      {/* Dropoff Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Drop-off Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Drop-off Address"
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
          placeholderTextColor="#9ca3af"
        />
        <View style={styles.coordsRow}>
          <TextInput
            style={[styles.input, styles.coordInput]}
            placeholder="Latitude"
            value={dropoffLatitude}
            onChangeText={setDropoffLatitude}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={[styles.input, styles.coordInput]}
            placeholder="Longitude"
            value={dropoffLongitude}
            onChangeText={setDropoffLongitude}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Price Estimate */}
      {calculatingPrice ? (
        <View style={styles.priceCard}>
          <ActivityIndicator size="small" color="#4f46e5" />
          <Text style={styles.priceCalculating}>Calculating price...</Text>
        </View>
      ) : price !== null ? (
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Estimated Cost</Text>
          <Text style={styles.priceValue}>PKR {price.toFixed(0)}</Text>
          <Text style={styles.priceNote}>
            Final cost may vary based on exact route and traffic conditions
          </Text>
        </View>
      ) : null}

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoText}>
            Make sure your pickup and drop-off locations are accurate. 
            The driver will use these coordinates to navigate to you.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBook}
          disabled={loading || !pickupAddress || !dropoffAddress}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sosButton}
          onPress={sendSOS}
          disabled={sosLoading}
        >
          {sosLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.sosIcon}>🚨</Text>
              <Text style={styles.sosText}>SOS Emergency</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  routeHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  routeVisual: {
    flexDirection: 'row',
    gap: 16,
  },
  locationDot: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4f46e5',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  dotDestination: {
    backgroundColor: '#10b981',
  },
  routeText: {
    flex: 1,
  },
  origin: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  destination: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordInput: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: '#dbeafe',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  locationButtonText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '600',
  },
  priceCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  priceCalculating: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  bookButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  sosButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sosIcon: {
    fontSize: 20,
  },
  sosText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default BookingScreen;
