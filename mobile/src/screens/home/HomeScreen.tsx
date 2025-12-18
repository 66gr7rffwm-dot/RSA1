import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import api from '../../config/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface QuickStats {
  activeTrips?: number;
  upcomingBookings?: number;
  totalRides?: number;
}

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<QuickStats>({});

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (user?.role === 'driver') {
        const res = await api.get('/trips/my-trips');
        const trips = res.data.data || [];
        setStats({
          activeTrips: trips.filter((t: any) => new Date(t.trip_date) >= new Date()).length,
          totalRides: trips.length,
        });
      } else {
        const res = await api.get('/bookings/my-bookings');
        const bookings = res.data.data || [];
        setStats({
          upcomingBookings: bookings.filter((b: any) => 
            b.status === 'confirmed' && new Date(b.trip_date) >= new Date()
          ).length,
          totalRides: bookings.length,
        });
      }
    } catch (error) {
      // Silently fail - stats are optional
    }
  };

  const isDriver = user?.role === 'driver';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{user?.fullName || 'User'}</Text>
            <Text style={styles.subtitle}>
              {isDriver ? 'Ready to start your trip?' : 'Where would you like to go?'}
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.fullName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats Cards */}
      <View style={styles.statsContainer}>
        {isDriver ? (
          <>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.infoLight }]}>
                <Text style={styles.statIconText}>🚗</Text>
              </View>
              <Text style={styles.statValue}>{stats.activeTrips || 0}</Text>
              <Text style={styles.statLabel}>Active Trips</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                <Text style={styles.statIconText}>📊</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalRides || 0}</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.infoLight }]}>
                <Text style={styles.statIconText}>📅</Text>
              </View>
              <Text style={styles.statValue}>{stats.upcomingBookings || 0}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                <Text style={styles.statIconText}>✅</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalRides || 0}</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </View>
          </>
        )}
      </View>

      {/* Main Action Button */}
      <View style={styles.mainActionContainer}>
        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={() => {
            if (isDriver) {
              navigation.navigate('Search' as never, { screen: 'CreateTrip' } as never);
            } else {
              navigation.navigate('Search' as never);
            }
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.mainActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.mainActionIcon}>
              {isDriver ? '🚗' : '🔍'}
            </Text>
            <Text style={styles.mainActionText}>
              {isDriver ? 'Create New Trip' : 'Find a Ride'}
            </Text>
            <Text style={styles.mainActionArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {isDriver ? (
            <>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Search' as never, { screen: 'CreateTrip' } as never)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: colors.infoLight }]}>
                  <Text style={styles.actionIcon}>🚗</Text>
                </View>
                <Text style={styles.actionText}>Create Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Profile' as never, { screen: 'Vehicles' } as never)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: colors.successLight }]}>
                  <Text style={styles.actionIcon}>🚙</Text>
                </View>
                <Text style={styles.actionText}>My Vehicles</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('MyRides' as never)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: colors.warningLight }]}>
                  <Text style={styles.actionIcon}>📅</Text>
                </View>
                <Text style={styles.actionText}>My Trips</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Search' as never)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: colors.infoLight }]}>
                  <Text style={styles.actionIcon}>🔍</Text>
                </View>
                <Text style={styles.actionText}>Find Rides</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('MyRides' as never)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: colors.successLight }]}>
                  <Text style={styles.actionIcon}>📋</Text>
                </View>
                <Text style={styles.actionText}>My Bookings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Profile' as never, { screen: 'Subscription' } as never)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: colors.warningLight }]}>
                  <Text style={styles.actionIcon}>💳</Text>
                </View>
                <Text style={styles.actionText}>Subscription</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Text style={styles.infoIcon}>💡</Text>
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Save Money & Time</Text>
          <Text style={styles.infoText}>
            {isDriver
              ? 'Share your ride and save up to 50% on fuel costs while helping others commute!'
              : 'Carpooling helps reduce traffic, saves money, and makes your daily commute more enjoyable!'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.small,
    color: colors.white,
    opacity: 0.8,
  },
  avatarContainer: {
    marginLeft: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: -spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statIconText: {
    fontSize: 24,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainActionContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  mainActionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  mainActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  mainActionIcon: {
    fontSize: 28,
  },
  mainActionText: {
    ...typography.button,
    color: colors.white,
    flex: 1,
  },
  mainActionArrow: {
    ...typography.h3,
    color: colors.white,
  },
  section: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: (width - spacing.lg * 2 - spacing.md * 2) / 3,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionText: {
    ...typography.smallMedium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  infoCard: {
    margin: spacing.lg,
    marginTop: 0,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    ...shadows.sm,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default HomeScreen;
