import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows, gradients } from '../../theme';
import { useNavigation } from '@react-navigation/native';

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
  earnings?: number;
  total_earnings?: number;
  total_distance_km?: number;
  base_trip_cost?: number;
}

const MyRidesScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [driverStats, setDriverStats] = useState({
    totalEarnings: 0,
    totalTrips: 0,
    completedTrips: 0,
    activeTrips: 0,
  });

  const loadTrips = async () => {
    setLoading(true);
    try {
      if (user?.role === 'driver') {
        const res = await api.get('/trips/my-trips');
        const tripsData = res.data.data || [];
        setTrips(tripsData);

        // Calculate driver stats
        const totalEarnings = tripsData.reduce((sum: number, trip: any) => {
          return sum + (trip.total_earnings || trip.earnings || 0);
        }, 0);

        const completedTrips = tripsData.filter((t: any) => 
          t.status === 'completed' || new Date(t.trip_date) < new Date()
        ).length;

        const activeTrips = tripsData.filter((t: any) => 
          new Date(t.trip_date) >= new Date() && (t.status === 'active' || t.status === 'confirmed')
        ).length;

        setDriverStats({
          totalEarnings,
          totalTrips: tripsData.length,
          completedTrips,
          activeTrips,
        });
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
            base_trip_cost: b.cost || b.estimated_cost,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return colors.success;
      case 'pending':
      case 'active':
        return colors.warning;
      case 'cancelled':
      case 'rejected':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderItem = ({ item }: { item: Trip }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.routeContainer}>
          <View style={styles.locationDot}>
            <View style={[styles.dot, styles.dotOrigin]} />
            <View style={styles.line} />
            <View style={[styles.dot, styles.dotDestination]} />
          </View>
          <View style={styles.routeText}>
            <Text style={styles.origin} numberOfLines={1}>{item.origin_address}</Text>
            <Text style={styles.destination} numberOfLines={1}>{item.destination_address}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>
            {formatDate(item.trip_date)} at {item.trip_time}
          </Text>
        </View>
        {item.total_distance_km && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📏</Text>
            <Text style={styles.detailText}>{item.total_distance_km.toFixed(1)} km</Text>
          </View>
        )}
        {typeof item.available_seats === 'number' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>💺</Text>
            <Text style={styles.detailText}>
              {item.available_seats}/{item.max_seats} seats
            </Text>
          </View>
        )}
        {user?.role === 'driver' && (item.earnings || item.total_earnings) && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>💰</Text>
            <Text style={[styles.detailText, styles.earningsText]}>
              Earnings: PKR {(item.earnings || item.total_earnings || 0).toFixed(0)}
            </Text>
          </View>
        )}
        {user?.role === 'passenger' && item.base_trip_cost && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>💰</Text>
            <Text style={styles.detailText}>
              Cost: PKR {item.base_trip_cost.toFixed(0)}
            </Text>
          </View>
        )}
      </View>

      {user?.role === 'passenger' && item.bookingId && (
        <TouchableOpacity
          style={styles.rateButton}
          onPress={() => {
            // Rating functionality
            Alert.alert('Rate Ride', 'Rating feature coming soon!');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.rateText}>Rate Ride</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading rides...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Driver Stats Header */}
      {user?.role === 'driver' && driverStats.totalTrips > 0 && (
        <View style={styles.statsHeader}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.statsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statsTitle}>📊 Driver Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>PKR {driverStats.totalEarnings.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{driverStats.totalTrips}</Text>
                <Text style={styles.statLabel}>Total Trips</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{driverStats.completedTrips}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{driverStats.activeTrips}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Rides List */}
      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            {user?.role === 'driver' ? '🚗' : '📋'}
          </Text>
          <Text style={styles.emptyTitle}>No rides yet</Text>
          <Text style={styles.emptyText}>
            {user?.role === 'driver'
              ? 'Create your first trip to start earning!'
              : 'Book your first ride to get started!'}
          </Text>
          {user?.role === 'driver' && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('Search' as never, { screen: 'CreateTrip' } as never)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.primary}
                style={styles.createButtonGradient}
              >
                <Text style={styles.createButtonText}>Create Trip</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.listHeader}>
            {user?.role === 'driver' ? 'My Trips' : 'My Bookings'} ({trips.length})
          </Text>
          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={loadTrips}
                colors={[colors.primary]}
              />
            }
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  statsHeader: {
    margin: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  statsGradient: {
    padding: spacing.lg,
  },
  statsTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
  },
  listContainer: {
    padding: spacing.lg,
  },
  listHeader: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  routeContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.sm,
  },
  locationDot: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotOrigin: {
    backgroundColor: colors.primary,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  dotDestination: {
    backgroundColor: colors.success,
  },
  routeText: {
    flex: 1,
  },
  origin: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  destination: {
    ...typography.small,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  statusText: {
    ...typography.captionMedium,
    color: colors.white,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardDetails: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailIcon: {
    fontSize: 18,
    width: 24,
  },
  detailText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  earningsText: {
    ...typography.bodyMedium,
    color: colors.success,
    fontWeight: '700',
  },
  rateButton: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  rateText: {
    ...typography.smallMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    minHeight: 400,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  createButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  createButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  createButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
});

export default MyRidesScreen;
