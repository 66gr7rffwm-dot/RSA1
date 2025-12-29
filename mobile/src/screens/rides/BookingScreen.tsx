import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import api from '../../config/api';
import { colors, typography, spacing, borderRadius, shadows, gradients } from '../../theme';

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const priceAnim = useRef(new Animated.Value(0)).current;

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
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (price !== null) {
      Animated.spring(priceAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [price]);

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.primary}
            style={styles.backButtonGradient}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

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
        {/* Route Header */}
        <LinearGradient
          colors={gradients.primary}
          style={styles.routeHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[
              styles.routeContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.routeVisual}>
              <View style={styles.locationDot}>
                <View style={[styles.dot, styles.dotOrigin]} />
                <View style={styles.line} />
                <View style={[styles.dot, styles.dotDestination]} />
              </View>
              <View style={styles.routeText}>
                <Text style={styles.origin} numberOfLines={2}>{trip.origin_address}</Text>
                <Text style={styles.destination} numberOfLines={2}>{trip.destination_address}</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Pickup Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📍</Text>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
          </View>
          <View
            style={[
              styles.inputContainer,
              focusedInput === 'pickup' && styles.inputContainerFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Pickup Address"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholderTextColor={colors.textTertiary}
              onFocus={() => setFocusedInput('pickup')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
          <View style={styles.coordsRow}>
            <View
              style={[
                styles.inputContainer,
                styles.coordInput,
                focusedInput === 'pickupLat' && styles.inputContainerFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Latitude"
                value={pickupLatitude}
                onChangeText={setPickupLatitude}
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
                onFocus={() => setFocusedInput('pickupLat')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
            <View
              style={[
                styles.inputContainer,
                styles.coordInput,
                focusedInput === 'pickupLng' && styles.inputContainerFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Longitude"
                value={pickupLongitude}
                onChangeText={setPickupLongitude}
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
                onFocus={() => setFocusedInput('pickupLng')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            activeOpacity={0.8}
          >
            <Text style={styles.locationButtonIcon}>📍</Text>
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Dropoff Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎯</Text>
            <Text style={styles.sectionTitle}>Drop-off Location</Text>
          </View>
          <View
            style={[
              styles.inputContainer,
              focusedInput === 'dropoff' && styles.inputContainerFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Drop-off Address"
              value={dropoffAddress}
              onChangeText={setDropoffAddress}
              placeholderTextColor={colors.textTertiary}
              onFocus={() => setFocusedInput('dropoff')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
          <View style={styles.coordsRow}>
            <View
              style={[
                styles.inputContainer,
                styles.coordInput,
                focusedInput === 'dropoffLat' && styles.inputContainerFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Latitude"
                value={dropoffLatitude}
                onChangeText={setDropoffLatitude}
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
                onFocus={() => setFocusedInput('dropoffLat')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
            <View
              style={[
                styles.inputContainer,
                styles.coordInput,
                focusedInput === 'dropoffLng' && styles.inputContainerFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Longitude"
                value={dropoffLongitude}
                onChangeText={setDropoffLongitude}
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
                onFocus={() => setFocusedInput('dropoffLng')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>
        </Animated.View>

        {/* Price Estimate */}
        {calculatingPrice ? (
          <View style={styles.priceCard}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.priceCalculating}>Calculating price...</Text>
          </View>
        ) : price !== null ? (
          <Animated.View
            style={[
              styles.priceCard,
              styles.priceCardActive,
              {
                opacity: priceAnim,
                transform: [
                  {
                    scale: priceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.priceLabel}>Estimated Cost</Text>
            <Text style={styles.priceValue}>PKR {price.toFixed(0)}</Text>
            <Text style={styles.priceNote}>
              Final cost may vary based on exact route and traffic conditions
            </Text>
          </Animated.View>
        ) : null}

        {/* Info Banner */}
        <Animated.View
          style={[
            styles.infoBanner,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              Make sure your pickup and drop-off locations are accurate. 
              The driver will use these coordinates to navigate to you.
            </Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.bookButton, (loading || !pickupAddress || !dropoffAddress) && styles.bookButtonDisabled]}
            onPress={handleBook}
            disabled={loading || !pickupAddress || !dropoffAddress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={gradients.primary}
              style={styles.bookButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.bookButtonText}>Confirm Booking</Text>
                  <Text style={styles.bookButtonIcon}>✓</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sosButton}
            onPress={sendSOS}
            disabled={sosLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.error, '#DC2626']}
              style={styles.sosButtonGradient}
            >
              {sosLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.sosIcon}>🚨</Text>
                  <Text style={styles.sosText}>SOS Emergency</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  backButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
  routeHeader: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  routeContent: {
    // Content wrapper
  },
  routeVisual: {
    flexDirection: 'row',
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
    backgroundColor: colors.white,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.white,
    opacity: 0.5,
    marginVertical: spacing.xs,
  },
  dotDestination: {
    backgroundColor: colors.successLight,
  },
  routeText: {
    flex: 1,
  },
  origin: {
    ...typography.bodyBold,
    color: colors.white,
    marginBottom: spacing.xs,
    fontSize: 18,
  },
  destination: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
  },
  section: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  inputContainer: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
    ...shadows.md,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  coordInput: {
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.infoContainer,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.info,
  },
  locationButtonIcon: {
    fontSize: 20,
  },
  locationButtonText: {
    ...typography.smallMedium,
    color: colors.onInfoContainer,
    fontWeight: '600',
  },
  priceCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  priceCardActive: {
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: colors.successContainer,
  },
  priceCalculating: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  priceLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  priceValue: {
    ...typography.h1,
    fontSize: 36,
    color: colors.success,
    marginBottom: spacing.xs,
    fontWeight: '800',
  },
  priceNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: colors.warningContainer,
    margin: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    gap: spacing.sm,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    ...typography.small,
    color: colors.onWarningContainer,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  bookButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  bookButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  bookButtonIcon: {
    ...typography.h3,
    color: colors.white,
  },
  sosButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  sosButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  sosIcon: {
    fontSize: 24,
  },
  sosText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
});

export default BookingScreen;
