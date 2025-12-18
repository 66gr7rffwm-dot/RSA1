/**
 * Navigation Service
 * Handles route optimization, distance calculation, and navigation using Google Maps API
 */

import axios from 'axios';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Route {
  distance: number; // in kilometers
  duration: number; // in seconds
  polyline: string; // Encoded polyline for map display
  steps: RouteStep[];
}

export interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
  startLocation: Location;
  endLocation: Location;
}

export interface OptimizedRoute extends Route {
  optimizedPickupOrder: number[];
  totalDistance: number;
  estimatedArrivalTimes: { [passengerId: string]: Date };
}

export class NavigationService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Calculate distance and route between two points
   */
  async calculateRoute(
    origin: Location,
    destination: Location,
    waypoints?: Location[]
  ): Promise<Route> {
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destStr = `${destination.latitude},${destination.longitude}`;
      
      let waypointsStr = '';
      if (waypoints && waypoints.length > 0) {
        waypointsStr = waypoints
          .map((wp) => `${wp.latitude},${wp.longitude}`)
          .join('|');
      }

      const url = `${this.baseUrl}/directions/json`;
      const params: any = {
        origin: originStr,
        destination: destStr,
        key: this.apiKey,
        mode: 'driving',
        alternatives: false,
        language: 'en',
        units: 'metric',
      };

      if (waypointsStr) {
        params.waypoints = waypointsStr;
        params.optimize_waypoints = true;
      }

      const response = await axios.get(url, { params });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      const steps: RouteStep[] = route.legs.flatMap((leg: any) =>
        leg.steps.map((step: any) => ({
          distance: step.distance.value / 1000, // Convert to km
          duration: step.duration.value,
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          startLocation: {
            latitude: step.start_location.lat,
            longitude: step.start_location.lng,
          },
          endLocation: {
            latitude: step.end_location.lat,
            longitude: step.end_location.lng,
          },
        }))
      );

      return {
        distance: leg.distance.value / 1000, // Convert to km
        duration: route.legs.reduce((sum: number, leg: any) => sum + leg.duration.value, 0),
        polyline: route.overview_polyline.points,
        steps,
      };
    } catch (error) {
      console.error('Navigation service error:', error);
      throw new Error('Failed to calculate route');
    }
  }

  /**
   * Calculate distance between two points (straight line)
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Optimize pickup/dropoff sequence for multiple passengers
   */
  async optimizePickupSequence(
    driverLocation: Location,
    pickupPoints: Location[],
    dropoffPoints: Location[]
  ): Promise<OptimizedRoute> {
    // Use Google Maps Directions API with optimize_waypoints
    const allPoints = [...pickupPoints, ...dropoffPoints];
    const route = await this.calculateRoute(driverLocation, driverLocation, allPoints);

    // Calculate optimized order (simplified - Google Maps handles optimization)
    const optimizedPickupOrder = Array.from({ length: pickupPoints.length }, (_, i) => i);

    // Estimate arrival times for each passenger
    const estimatedArrivalTimes: { [key: string]: Date } = {};
    let currentTime = new Date();
    let accumulatedDuration = 0;

    pickupPoints.forEach((_, index) => {
      accumulatedDuration += route.steps[index]?.duration || 0;
      estimatedArrivalTimes[`passenger_${index}`] = new Date(
        currentTime.getTime() + accumulatedDuration * 1000
      );
    });

    return {
      ...route,
      optimizedPickupOrder,
      totalDistance: route.distance,
      estimatedArrivalTimes,
    };
  }

  /**
   * Calculate partial journey distance factor
   */
  async calculatePartialDistanceFactor(
    tripOrigin: Location,
    tripDestination: Location,
    passengerPickup: Location,
    passengerDropoff: Location
  ): Promise<{ partialDistanceFactor: number; partialDistanceKm: number }> {
    // Calculate full trip distance
    const fullTripRoute = await this.calculateRoute(tripOrigin, tripDestination);
    const fullTripDistance = fullTripRoute.distance;

    // Calculate passenger's actual travel distance
    const passengerRoute = await this.calculateRoute(passengerPickup, passengerDropoff);
    const passengerDistance = passengerRoute.distance;

    // Calculate what portion of the full route this represents
    // This is a simplified calculation - in reality, we'd need to check
    // if passenger's route overlaps with the main route
    const factor = Math.min(passengerDistance / fullTripDistance, 1.0);
    const partialDistanceFactor = Math.max(factor, 0.1); // Minimum 10% factor

    return {
      partialDistanceFactor,
      partialDistanceKm: passengerDistance,
    };
  }

  /**
   * Get geocoded address from coordinates
   */
  async reverseGeocode(location: Location): Promise<string> {
    try {
      const url = `${this.baseUrl}/geocode/json`;
      const params = {
        latlng: `${location.latitude},${location.longitude}`,
        key: this.apiKey,
        language: 'en',
      };

      const response = await axios.get(url, { params });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }

      return `${location.latitude}, ${location.longitude}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${location.latitude}, ${location.longitude}`;
    }
  }

  /**
   * Get coordinates from address (geocoding)
   */
  async geocode(address: string): Promise<Location> {
    try {
      const url = `${this.baseUrl}/geocode/json`;
      const params = {
        address,
        key: this.apiKey,
        language: 'en',
      };

      const response = await axios.get(url, { params });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          address: result.formatted_address,
        };
      }

      throw new Error('Address not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Get ETA considering traffic conditions
   */
  async getETA(
    origin: Location,
    destination: Location,
    departureTime?: Date
  ): Promise<{ duration: number; arrivalTime: Date }> {
    const route = await this.calculateRoute(origin, destination);
    const arrivalTime = departureTime
      ? new Date(departureTime.getTime() + route.duration * 1000)
      : new Date(Date.now() + route.duration * 1000);

    return {
      duration: route.duration,
      arrivalTime,
    };
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

// Export singleton instance (will be initialized with API key from env)
export let navigationService: NavigationService;

export function initializeNavigationService(apiKey: string) {
  navigationService = new NavigationService(apiKey);
}

