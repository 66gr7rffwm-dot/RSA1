import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import { colors, typography, spacing, borderRadius, shadows, gradients } from '../../theme';

const { width } = Dimensions.get('window');

interface Trip {
  id: string;
  trip_date: string;
  trip_time: string;
  origin_address: string;
  destination_address: string;
  available_seats: number;
  is_women_only: boolean;
  total_distance_km?: number;
  base_trip_cost?: number;
}

const SearchRidesScreen = () => {
  const navigation = useNavigation();
  const [date, setDate] = useState(getTodayDate());
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [womenOnly, setWomenOnly] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (date) {
      search();
    }
  }, []);

  useEffect(() => {
    Animated.timing(filterAnim, {
      toValue: showFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFilters]);

  const search = async () => {
    if (!date) {
      return;
    }
    setLoading(true);
    try {
      const params: any = { tripDate: date };
      if (origin) params.origin = origin;
      if (destination) params.destination = destination;
      if (womenOnly) params.womenOnly = true;

      const res = await api.get('/trips/search', { params });
      setTrips(res.data.data || []);
    } catch (error: any) {
      console.error('Search error:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: Trip; index: number }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('TripDetails' as never, { tripId: item.id } as never)}
          activeOpacity={0.8}
        >
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
            {item.is_women_only && (
              <View style={styles.womenOnlyBadge}>
                <Text style={styles.womenOnlyText}>👩</Text>
              </View>
            )}
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>📅</Text>
              </View>
              <Text style={styles.detailText}>
                {formatDate(item.trip_date)} at {item.trip_time}
              </Text>
            </View>
            {item.total_distance_km && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Text style={styles.detailIconText}>📏</Text>
                </View>
                <Text style={styles.detailText}>{item.total_distance_km.toFixed(1)} km</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>💺</Text>
              </View>
              <Text style={styles.detailText}>
                {item.available_seats} {item.available_seats === 1 ? 'seat' : 'seats'} available
              </Text>
            </View>
            {item.base_trip_cost && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Text style={styles.detailIconText}>💰</Text>
                </View>
                <Text style={styles.detailText}>PKR {item.base_trip_cost.toFixed(0)}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => navigation.navigate('TripDetails' as never, { tripId: item.id } as never)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.primary}
                style={styles.bookButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.bookButtonText}>View Details</Text>
                <Text style={styles.bookButtonArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const filterHeight = filterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>Find Your Ride</Text>
          <Text style={styles.headerSubtitle}>Search for available trips</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Quick Date Selection */}
          <View style={styles.quickDateContainer}>
            <TouchableOpacity
              style={[styles.quickDateButton, date === getTodayDate() && styles.quickDateButtonActive]}
              onPress={() => {
                setDate(getTodayDate());
                setTimeout(() => search(), 100);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickDateText, date === getTodayDate() && styles.quickDateTextActive]}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickDateButton, date === getTomorrowDate() && styles.quickDateButtonActive]}
              onPress={() => {
                setDate(getTomorrowDate());
                setTimeout(() => search(), 100);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickDateText, date === getTomorrowDate() && styles.quickDateTextActive]}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDateButton}
              onPress={() => setShowFilters(!showFilters)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickDateText}>📅 Custom</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <View
              style={[
                styles.inputContainer,
                focusedInput === 'date' && styles.inputContainerFocused,
              ]}
            >
              <Text style={styles.inputIcon}>📅</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                placeholderTextColor={colors.textTertiary}
                onFocus={() => setFocusedInput('date')}
                onBlur={() => {
                  setFocusedInput(null);
                  if (date) search();
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={search}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.primary}
                style={styles.searchButtonGradient}
              >
                <Text style={styles.searchButtonText}>🔍</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterButtonText}>
              {showFilters ? '▲ Hide Filters' : '▼ Show Filters'}
            </Text>
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.filtersContainer,
              {
                maxHeight: filterHeight,
                opacity: filterAnim,
              },
            ]}
          >
            <View style={styles.filtersContent}>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'origin' && styles.inputContainerFocused,
                ]}
              >
                <Text style={styles.inputIcon}>📍</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Origin (optional)"
                  value={origin}
                  onChangeText={setOrigin}
                  placeholderTextColor={colors.textTertiary}
                  onFocus={() => setFocusedInput('origin')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'destination' && styles.inputContainerFocused,
                ]}
              >
                <Text style={styles.inputIcon}>🎯</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Destination (optional)"
                  value={destination}
                  onChangeText={setDestination}
                  placeholderTextColor={colors.textTertiary}
                  onFocus={() => setFocusedInput('destination')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              <TouchableOpacity
                style={[styles.checkbox, womenOnly && styles.checkboxActive]}
                onPress={() => setWomenOnly(!womenOnly)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkboxBox, womenOnly && styles.checkboxBoxActive]}>
                  {womenOnly && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>Women-only rides</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Results */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching rides...</Text>
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>No rides found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search filters or check back later
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={search}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.primary}
                style={styles.retryButtonGradient}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>
              Found {trips.length} {trips.length === 1 ? 'ride' : 'rides'}
            </Text>
            <FlatList
              data={trips}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h1,
    fontSize: 28,
    color: colors.white,
    marginBottom: spacing.xs,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.95,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    marginTop: -spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  searchBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    ...shadows.sm,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
    ...shadows.md,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  dateInput: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
  },
  searchButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  searchButtonGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 24,
  },
  quickDateContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickDateButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickDateButtonActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  quickDateText: {
    ...typography.smallMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  quickDateTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  filterButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  filterButtonText: {
    ...typography.smallMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  filtersContainer: {
    overflow: 'hidden',
  },
  filtersContent: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  filterInput: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  checkboxActive: {
    // Active state handled by checkboxBoxActive
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxCheck: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  resultsContainer: {
    paddingHorizontal: spacing.lg,
  },
  resultsHeader: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  cardContainer: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
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
    gap: spacing.md,
  },
  locationDot: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
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
  womenOnlyBadge: {
    backgroundColor: colors.warningContainer,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  womenOnlyText: {
    fontSize: 18,
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
    width: 28,
    alignItems: 'center',
  },
  detailIconText: {
    fontSize: 18,
  },
  detailText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  bookButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  bookButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
  bookButtonArrow: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
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
  retryButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  retryButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
});

export default SearchRidesScreen;
