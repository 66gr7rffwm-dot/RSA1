import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../config/api';

interface Trip {
  id: string;
  trip_date: string;
  trip_time: string;
  origin_address: string;
  destination_address: string;
  total_distance_km: number;
  base_trip_cost: number;
  available_seats: number;
  is_women_only: boolean;
  driver_name?: string;
  driver_phone?: string;
  driver_rating?: number;
}

const TripDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { tripId } = route.params || {};
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const res = await api.get(`/trips/${tripId}`);
      setTrip(res.data.data);
    } catch (error: any) {
      console.error('Load trip error:', error);
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading trip details...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorTitle}>Trip not found</Text>
        <Text style={styles.errorText}>This trip may have been cancelled or doesn't exist.</Text>
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
        {trip.is_women_only && (
          <View style={styles.womenOnlyBadge}>
            <Text style={styles.womenOnlyText}>👩 Women Only</Text>
          </View>
        )}
      </View>

      {/* Trip Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trip Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {new Date(trip.trip_date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at {trip.trip_time}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📏</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{trip.total_distance_km.toFixed(1)} km</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>💺</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Available Seats</Text>
            <Text style={styles.detailValue}>
              {trip.available_seats} {trip.available_seats === 1 ? 'seat' : 'seats'}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>💰</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Base Cost (Full Route)</Text>
            <Text style={styles.detailValue}>PKR {trip.base_trip_cost.toFixed(0)}</Text>
            <Text style={styles.detailNote}>
              Your cost will be calculated based on your pickup and drop-off points
            </Text>
          </View>
        </View>
      </View>

      {/* Driver Info Card */}
      {trip.driver_name && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Driver Information</Text>
          
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>
                {trip.driver_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{trip.driver_name}</Text>
              {trip.driver_phone && (
                <Text style={styles.driverPhone}>{trip.driver_phone}</Text>
              )}
              {trip.driver_rating && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>⭐ {trip.driver_rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Cost Calculation</Text>
          <Text style={styles.infoText}>
            The final cost depends on your pickup and drop-off locations. 
            You'll see the exact amount before confirming your booking.
          </Text>
        </View>
      </View>

      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, trip.available_seats === 0 && styles.bookButtonDisabled]}
          onPress={() => navigation.navigate('Booking' as never, { trip } as never)}
          disabled={trip.available_seats === 0}
        >
          <Text style={styles.bookButtonText}>
            {trip.available_seats === 0 ? 'No Seats Available' : 'Book This Ride'}
          </Text>
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
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
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
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  destination: {
    fontSize: 16,
    color: '#6b7280',
  },
  womenOnlyBadge: {
    backgroundColor: '#fce7f3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  womenOnlyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#be185d',
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  detailIcon: {
    fontSize: 24,
    width: 32,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  detailNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  driverInfo: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
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
  bookButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TripDetailsScreen;
