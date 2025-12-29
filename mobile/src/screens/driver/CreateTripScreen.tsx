import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  Modal,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../../config/api';
import { colors, typography, spacing, borderRadius, shadows, gradients } from '../../theme';

const { width, height } = Dimensions.get('window');

interface Vehicle {
  id: string;
  make: string;
  model: string;
  registration_number: string;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
  address: string;
}

const CreateTripScreen = ({ navigation }: any) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [tripDate, setTripDate] = useState(new Date());
  const [tripTime, setTripTime] = useState(new Date());
  const [origin, setOrigin] = useState<LocationCoords | null>(null);
  const [destination, setDestination] = useState<LocationCoords | null>(null);
  const [maxSeats, setMaxSeats] = useState('3');
  const [isWomenOnly, setIsWomenOnly] = useState(false);
  
  // Picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectingLocation, setSelectingLocation] = useState<'origin' | 'destination'>('origin');
  
  // Map state
  const [mapRegion, setMapRegion] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [tempMarker, setTempMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    loadVehicles();
    getCurrentLocation();
  }, []);

  const loadVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.data || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load vehicles. Please add a vehicle first.');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const addr = results[0];
        const parts = [addr.street, addr.city, addr.region, addr.country].filter(Boolean);
        return parts.join(', ') || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
    } catch (error) {
      console.log('Reverse geocode error:', error);
    }
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setLoadingLocation(true);
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setMapRegion({
          ...mapRegion,
          latitude,
          longitude,
        });
        setTempMarker({ latitude, longitude });
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      } else {
        Alert.alert('Not Found', 'Location not found. Try a different search term.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setTempMarker({ latitude, longitude });
  };

  const confirmLocationSelection = async () => {
    if (!tempMarker) {
      Alert.alert('Select Location', 'Please tap on the map to select a location');
      return;
    }

    setLoadingLocation(true);
    const address = await reverseGeocode(tempMarker.latitude, tempMarker.longitude);
    
    const locationData: LocationCoords = {
      latitude: tempMarker.latitude,
      longitude: tempMarker.longitude,
      address,
    };

    if (selectingLocation === 'origin') {
      setOrigin(locationData);
    } else {
      setDestination(locationData);
    }

    setLoadingLocation(false);
    setShowMapModal(false);
    setTempMarker(null);
    setSearchQuery('');
  };

  const openMapForLocation = (type: 'origin' | 'destination') => {
    setSelectingLocation(type);
    setTempMarker(null);
    setSearchQuery('');
    setShowMapModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedVehicle) {
      newErrors.vehicle = 'Please select a vehicle';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(tripDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.date = 'Trip date cannot be in the past';
    }

    if (!origin) {
      newErrors.origin = 'Please select pickup location';
    }

    if (!destination) {
      newErrors.destination = 'Please select destination';
    }

    const seats = parseInt(maxSeats);
    if (isNaN(seats) || seats < 1 || seats > 6) {
      newErrors.seats = 'Seats must be between 1 and 6';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const formattedDate = tripDate.toISOString().split('T')[0];
      const formattedTime = `${tripTime.getHours().toString().padStart(2, '0')}:${tripTime.getMinutes().toString().padStart(2, '0')}`;

      await api.post('/trips', {
        vehicleId: selectedVehicle,
        tripDate: formattedDate,
        tripTime: formattedTime,
        originAddress: origin!.address,
        originLatitude: origin!.latitude,
        originLongitude: origin!.longitude,
        destinationAddress: destination!.address,
        destinationLatitude: destination!.latitude,
        destinationLongitude: destination!.longitude,
        maxSeats: parseInt(maxSeats),
        isWomenOnly,
      });

      Alert.alert(
        'Success! 🎉',
        'Your trip has been created successfully.',
        [
          {
            text: 'Create Another',
            onPress: () => resetForm(),
          },
          {
            text: 'View My Trips',
            onPress: () => navigation.navigate('MyRides'),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to create trip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedVehicle('');
    setTripDate(new Date());
    setTripTime(new Date());
    setOrigin(null);
    setDestination(null);
    setMaxSeats('3');
    setIsWomenOnly(false);
    setErrors({});
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient
          colors={gradients.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Create New Trip</Text>
          <Text style={styles.headerSubtitle}>Share your ride and earn money</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          {/* Vehicle Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚗 Select Vehicle</Text>
            {loadingVehicles ? (
              <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : vehicles.length === 0 ? (
              <View style={styles.noVehicleContainer}>
                <Text style={styles.noVehicleText}>No vehicles found</Text>
                <TouchableOpacity
                  style={styles.addVehicleButton}
                  onPress={() => navigation.navigate('Profile', { screen: 'Vehicles' })}
                >
                  <Text style={styles.addVehicleText}>+ Add Vehicle</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.vehicleList}>
                {vehicles.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.vehicleCard,
                      selectedVehicle === v.id && styles.vehicleCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedVehicle(v.id);
                      setErrors({ ...errors, vehicle: '' });
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.vehicleIcon}>
                      <Text style={styles.vehicleIconText}>🚙</Text>
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleName}>{v.make} {v.model}</Text>
                      <Text style={styles.vehicleNumber}>{v.registration_number}</Text>
                    </View>
                    {selectedVehicle === v.id && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.vehicle && <Text style={styles.errorText}>{errors.vehicle}</Text>}
          </View>

          {/* Date & Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Date & Time</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[styles.dateTimeButton, errors.date && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateTimeIcon}>📅</Text>
                <View style={styles.dateTimeContent}>
                  <Text style={styles.dateTimeLabel}>Date</Text>
                  <Text style={styles.dateTimeValue}>{formatDate(tripDate)}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateTimeIcon}>⏰</Text>
                <View style={styles.dateTimeContent}>
                  <Text style={styles.dateTimeLabel}>Time</Text>
                  <Text style={styles.dateTimeValue}>{formatTime(tripTime)}</Text>
                </View>
              </TouchableOpacity>
            </View>
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>

          {/* Location Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Route</Text>
            
            {/* Origin */}
            <TouchableOpacity
              style={[styles.locationButton, errors.origin && styles.inputError]}
              onPress={() => openMapForLocation('origin')}
              activeOpacity={0.7}
            >
              <View style={[styles.locationDot, styles.originDot]} />
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text style={styles.locationValue} numberOfLines={2}>
                  {origin?.address || 'Tap to select on map'}
                </Text>
              </View>
              <Text style={styles.locationArrow}>→</Text>
            </TouchableOpacity>
            {errors.origin && <Text style={styles.errorText}>{errors.origin}</Text>}

            <View style={styles.routeLine}>
              <View style={styles.routeLineInner} />
            </View>

            {/* Destination */}
            <TouchableOpacity
              style={[styles.locationButton, errors.destination && styles.inputError]}
              onPress={() => openMapForLocation('destination')}
              activeOpacity={0.7}
            >
              <View style={[styles.locationDot, styles.destinationDot]} />
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Drop-off Location</Text>
                <Text style={styles.locationValue} numberOfLines={2}>
                  {destination?.address || 'Tap to select on map'}
                </Text>
              </View>
              <Text style={styles.locationArrow}>→</Text>
            </TouchableOpacity>
            {errors.destination && <Text style={styles.errorText}>{errors.destination}</Text>}
          </View>

          {/* Seats & Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Options</Text>
            
            <View style={styles.optionsRow}>
              <View style={[styles.seatsContainer, errors.seats && styles.inputError]}>
                <Text style={styles.seatsLabel}>Available Seats</Text>
                <View style={styles.seatsSelector}>
                  {[1, 2, 3, 4].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.seatButton,
                        maxSeats === num.toString() && styles.seatButtonSelected,
                      ]}
                      onPress={() => {
                        setMaxSeats(num.toString());
                        setErrors({ ...errors, seats: '' });
                      }}
                    >
                      <Text style={[
                        styles.seatButtonText,
                        maxSeats === num.toString() && styles.seatButtonTextSelected,
                      ]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            {errors.seats && <Text style={styles.errorText}>{errors.seats}</Text>}

            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => setIsWomenOnly(!isWomenOnly)}
              activeOpacity={0.7}
            >
              <View style={[styles.toggleCheckbox, isWomenOnly && styles.toggleCheckboxActive]}>
                {isWomenOnly && <Text style={styles.toggleCheckmark}>✓</Text>}
              </View>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>Women-only ride</Text>
                <Text style={styles.toggleDescription}>Only female passengers can book</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
            disabled={saving || loadingVehicles}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={saving ? [colors.gray400, colors.gray500] : gradients.primary}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.createButtonIcon}>🚀</Text>
                  <Text style={styles.createButtonText}>Create Trip</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={tripDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) {
              setTripDate(date);
              setErrors({ ...errors, date: '' });
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={tripTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (date) setTripTime(date);
          }}
        />
      )}

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity
              style={styles.mapCloseButton}
              onPress={() => setShowMapModal(false)}
            >
              <Text style={styles.mapCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.mapTitle}>
              Select {selectingLocation === 'origin' ? 'Pickup' : 'Drop-off'} Location
            </Text>
            <View style={styles.mapCloseButton} />
          </View>

          {/* Search Bar */}
          <View style={styles.mapSearchContainer}>
            <TextInput
              style={styles.mapSearchInput}
              placeholder="Search location..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchLocation}
              returnKeyType="search"
              placeholderTextColor={colors.textTertiary}
            />
            <TouchableOpacity
              style={styles.mapSearchButton}
              onPress={searchLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.mapSearchButtonText}>🔍</Text>
              )}
            </TouchableOpacity>
          </View>

          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            onRegionChangeComplete={setMapRegion}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton
          >
            {tempMarker && (
              <Marker
                coordinate={tempMarker}
                draggable
                onDragEnd={(e) => setTempMarker(e.nativeEvent.coordinate)}
              >
                <View style={[
                  styles.markerContainer,
                  selectingLocation === 'origin' ? styles.originMarker : styles.destinationMarker
                ]}>
                  <Text style={styles.markerText}>
                    {selectingLocation === 'origin' ? '📍' : '🎯'}
                  </Text>
                </View>
              </Marker>
            )}
          </MapView>

          <View style={styles.mapFooter}>
            <Text style={styles.mapHint}>
              Tap on the map or search to select location
            </Text>
            <TouchableOpacity
              style={[
                styles.mapConfirmButton,
                !tempMarker && styles.mapConfirmButtonDisabled,
              ]}
              onPress={confirmLocationSelection}
              disabled={!tempMarker || loadingLocation}
            >
              <LinearGradient
                colors={tempMarker ? gradients.primary : [colors.gray400, colors.gray500]}
                style={styles.mapConfirmGradient}
              >
                {loadingLocation ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.mapConfirmText}>Confirm Location</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    padding: spacing.lg,
    marginTop: -spacing.lg,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  loader: {
    marginVertical: spacing.lg,
  },
  noVehicleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  noVehicleText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  addVehicleButton: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  addVehicleText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  vehicleList: {
    gap: spacing.sm,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  vehicleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  vehicleIconText: {
    fontSize: 24,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  vehicleNumber: {
    ...typography.small,
    color: colors.textSecondary,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  dateTimeContent: {
    flex: 1,
  },
  dateTimeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dateTimeValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  locationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  originDot: {
    backgroundColor: colors.primary,
  },
  destinationDot: {
    backgroundColor: colors.success,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  locationValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  locationArrow: {
    ...typography.h4,
    color: colors.primary,
  },
  routeLine: {
    paddingLeft: 24,
    height: 24,
  },
  routeLineInner: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginLeft: 7,
  },
  optionsRow: {
    marginBottom: spacing.md,
  },
  seatsContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  seatsLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  seatsSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  seatButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  seatButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  seatButtonText: {
    ...typography.h4,
    color: colors.textSecondary,
  },
  seatButtonTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleCheckbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  toggleCheckboxActive: {
    backgroundColor: colors.primary,
  },
  toggleCheckmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  toggleDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  createButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  createButtonIcon: {
    fontSize: 24,
  },
  createButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 18,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  // Map Modal Styles
  mapContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  mapCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCloseText: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  mapTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  mapSearchContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  mapSearchInput: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  mapSearchButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapSearchButtonText: {
    fontSize: 20,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  originMarker: {
    backgroundColor: colors.primary,
  },
  destinationMarker: {
    backgroundColor: colors.success,
  },
  markerText: {
    fontSize: 24,
  },
  mapFooter: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.lg,
  },
  mapHint: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  mapConfirmButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  mapConfirmButtonDisabled: {
    opacity: 0.7,
  },
  mapConfirmGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  mapConfirmText: {
    ...typography.button,
    color: colors.white,
  },
});

export default CreateTripScreen;
