import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';

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

  useEffect(() => {
    if (date) {
      search();
    }
  }, []);

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

  const renderItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TripDetails' as never, { tripId: item.id } as never)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.routeContainer}>
          <View style={styles.locationDot}>
            <View style={styles.dot} />
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
          <Text style={styles.detailLabel}>📅</Text>
          <Text style={styles.detailText}>
            {formatDate(item.trip_date)} at {item.trip_time}
          </Text>
        </View>
        {item.total_distance_km && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📏</Text>
            <Text style={styles.detailText}>{item.total_distance_km.toFixed(1)} km</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>💺</Text>
          <Text style={styles.detailText}>
            {item.available_seats} {item.available_seats === 1 ? 'seat' : 'seats'} available
          </Text>
        </View>
        {item.base_trip_cost && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💰</Text>
            <Text style={styles.detailText}>PKR {item.base_trip_cost.toFixed(0)} (full route)</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('TripDetails' as never, { tripId: item.id } as never)}
        >
          <Text style={styles.bookButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.dateInput}
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity style={styles.searchButton} onPress={search}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>
            {showFilters ? '▲ Hide Filters' : '▼ Show Filters'}
          </Text>
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <TextInput
              style={styles.filterInput}
              placeholder="Origin (optional)"
              value={origin}
              onChangeText={setOrigin}
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Destination (optional)"
              value={destination}
              onChangeText={setDestination}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              style={[styles.checkbox, womenOnly && styles.checkboxActive]}
              onPress={() => setWomenOnly(!womenOnly)}
            >
              <Text style={styles.checkboxText}>
                {womenOnly ? '☑️' : '☐'} Women-only rides
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Searching rides...</Text>
        </View>
      ) : trips.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyTitle}>No rides found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search filters or check back later
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={search}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultsHeader}>
              Found {trips.length} {trips.length === 1 ? 'ride' : 'rides'}
            </Text>
          }
        />
      )}
    </View>
  );
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
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
    backgroundColor: '#f3f4f6',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  searchButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  filterButton: {
    paddingVertical: 8,
  },
  filterButtonText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    marginTop: 12,
    gap: 12,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxActive: {
    // Add active state styling if needed
  },
  checkboxText: {
    fontSize: 16,
    color: '#1f2937',
  },
  list: {
    padding: 16,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
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
    marginVertical: 4,
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
  womenOnlyBadge: {
    backgroundColor: '#fce7f3',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  womenOnlyText: {
    fontSize: 16,
  },
  cardDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 16,
    width: 24,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  bookButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchRidesScreen;
