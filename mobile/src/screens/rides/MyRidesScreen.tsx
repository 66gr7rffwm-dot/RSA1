import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface Trip {
  id: string;
  trip_date: string;
  trip_time: string;
  origin_address: string;
  destination_address: string;
  status: string;
  max_seats: number;
  available_seats: number;
  bookingId?: string; // for passenger side
}

const MyRidesScreen = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = async () => {
    setLoading(true);
    try {
      if (user?.role === 'driver') {
        const res = await api.get('/trips/my-trips');
        setTrips(res.data.data || []);
      } else {
        const res = await api.get('/bookings/my-bookings');
        setTrips(
          (res.data.data || []).map((b: any) => ({
            id: b.trip_id,
            trip_date: b.trip_date,
            trip_time: b.trip_time,
            origin_address: b.pickup_address,
            destination_address: b.dropoff_address,
            status: b.booking_status,
            max_seats: b.max_seats,
            available_seats: 0,
            bookingId: b.id,
          }))
        );
      }
    } catch {
      // ignore for now
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const renderItem = ({ item }: { item: Trip }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {item.origin_address} → {item.destination_address}
      </Text>
      <Text style={styles.cardText}>
        {item.trip_date} at {item.trip_time}
      </Text>
      <Text style={styles.cardText}>Status: {item.status}</Text>
      {typeof item.available_seats === 'number' && (
        <Text style={styles.cardText}>
          Seats: {item.available_seats}/{item.max_seats}
        </Text>
      )}
      {user?.role === 'passenger' && item.bookingId && (
        <TouchableOpacity
          style={styles.rateButton}
          onPress={() =>
            Alert.prompt?.(
              'Rate Ride (1-5)',
              'Optional comment:',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Submit',
                  onPress: async (value) => {
                    const [ratingStr, ...commentParts] = String(value || '').split(' ');
                    const rating = parseInt(ratingStr || '5', 10);
                    const comment = commentParts.join(' ');
                    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
                      Alert.alert('Error', 'Rating must be between 1 and 5');
                      return;
                    }
                    try {
                      await api.post('/ratings', {
                        bookingId: item.bookingId,
                        rating,
                        comment,
                      });
                      Alert.alert('Thank you', 'Your rating has been submitted.');
                    } catch (e: any) {
                      Alert.alert(
                        'Error',
                        e.response?.data?.error || 'Failed to submit rating'
                      );
                    }
                  },
                },
              ],
              'plain-text',
              '5 Great ride'
            ) || Alert.alert('Rate', 'Rating UI not supported on this platform.')
          }
        >
          <Text style={styles.rateText}>Rate</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={trips}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>No rides yet.</Text>
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTrips(); }} />
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: '#555',
  },
  rateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FF9500',
  },
  rateText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MyRidesScreen;

