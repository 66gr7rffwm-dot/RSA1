/**
 * Pricing Engine Service
 * Implements the formula-based cost-sharing mechanism as per BRD Section 4.7
 */

export interface PricingInput {
  distance: number; // in kilometers
  fuelRatePerKm: number; // PKR per km
  vehicleFactor: number; // Adjustment for vehicle type (default: 1.0)
  numberOfPassengers: number; // Current number of passengers (1-3)
  partialDistanceFactor?: number; // For partial journeys (0-1)
}

export interface PricingOutput {
  totalTripCost: number;
  driverContribution: number;
  passengerCost: number;
  costPerPassenger: number;
  breakdown: {
    baseCost: number;
    vehicleAdjustedCost: number;
    driverShare: number;
    passengerShare: number;
  };
}

export class PricingEngine {
  private readonly DRIVER_SHARE_FACTOR = 0.5; // Driver pays 50% when only 1 passenger

  /**
   * Calculate base trip cost
   * Formula: Distance × FuelRatePerKm × VehicleFactor
   */
  private calculateBaseTripCost(
    distance: number,
    fuelRatePerKm: number,
    vehicleFactor: number
  ): number {
    return distance * fuelRatePerKm * vehicleFactor;
  }

  /**
   * Calculate driver contribution
   * - If 1 passenger: Driver pays 50% of total cost
   * - If 2-3 passengers: Driver pays 0%
   */
  private calculateDriverContribution(
    totalTripCost: number,
    numberOfPassengers: number
  ): number {
    if (numberOfPassengers === 1) {
      return totalTripCost * this.DRIVER_SHARE_FACTOR;
    }
    return 0;
  }

  /**
   * Calculate passenger cost for a booking
   * Handles both full route and partial journey scenarios
   */
  calculatePricing(input: PricingInput): PricingOutput {
    const {
      distance,
      fuelRatePerKm,
      vehicleFactor,
      numberOfPassengers,
      partialDistanceFactor = 1.0, // Default to full journey
    } = input;

    // Validate inputs
    if (distance <= 0) {
      throw new Error('Distance must be greater than 0');
    }
    if (numberOfPassengers < 1 || numberOfPassengers > 3) {
      throw new Error('Number of passengers must be between 1 and 3');
    }
    if (partialDistanceFactor < 0 || partialDistanceFactor > 1) {
      throw new Error('Partial distance factor must be between 0 and 1');
    }

    // Calculate base trip cost for full route
    const baseCost = this.calculateBaseTripCost(
      distance / partialDistanceFactor, // Full route distance
      fuelRatePerKm,
      vehicleFactor
    );

    const vehicleAdjustedCost = baseCost;

    // Calculate driver contribution for full route
    const driverContributionFullRoute = this.calculateDriverContribution(
      vehicleAdjustedCost,
      numberOfPassengers
    );

    // Apply partial distance factor
    const driverContribution = driverContributionFullRoute * partialDistanceFactor;
    const remainingCost = (vehicleAdjustedCost - driverContributionFullRoute) * partialDistanceFactor;

    // Calculate passenger cost
    let passengerCost: number;
    let costPerPassenger: number;

    if (numberOfPassengers === 1) {
      // Single passenger: pays remaining cost after driver contribution
      passengerCost = remainingCost;
      costPerPassenger = passengerCost;
    } else {
      // Multiple passengers: share the cost equally
      // Driver doesn't pay, so passengers split the full cost proportionally
      const totalPassengerCost = vehicleAdjustedCost * partialDistanceFactor;
      passengerCost = totalPassengerCost;
      costPerPassenger = totalPassengerCost / numberOfPassengers;
    }

    return {
      totalTripCost: vehicleAdjustedCost * partialDistanceFactor,
      driverContribution: Math.round(driverContribution * 100) / 100,
      passengerCost: Math.round(passengerCost * 100) / 100,
      costPerPassenger: Math.round(costPerPassenger * 100) / 100,
      breakdown: {
        baseCost: Math.round(baseCost * 100) / 100,
        vehicleAdjustedCost: Math.round(vehicleAdjustedCost * 100) / 100,
        driverShare: Math.round(driverContribution * 100) / 100,
        passengerShare: Math.round(passengerCost * 100) / 100,
      },
    };
  }

  /**
   * Calculate cost for a new passenger joining an existing trip
   * Simplified version for estimation (assumes 1 passenger scenario)
   */
  calculatePassengerCostForBooking(
    totalTripCost: number,
    partialDistanceFactor: number,
    currentPassengerCount?: number,
    newPassengerCount?: number
  ): number {
    // If passenger counts are provided, use the full calculation
    if (currentPassengerCount !== undefined && newPassengerCount !== undefined) {
      if (newPassengerCount === 1) {
        // First passenger: pays 50% of their portion
        const driverContribution = totalTripCost * this.DRIVER_SHARE_FACTOR;
        return (totalTripCost - driverContribution) * partialDistanceFactor;
      } else if (newPassengerCount === 2 || newPassengerCount === 3) {
        // Multiple passengers: split cost equally
        return (totalTripCost * partialDistanceFactor) / newPassengerCount;
      }
      throw new Error('Invalid passenger count');
    }
    
    // Simplified estimation: assume single passenger scenario
    const driverContribution = totalTripCost * this.DRIVER_SHARE_FACTOR;
    return (totalTripCost - driverContribution) * partialDistanceFactor;
  }

  /**
   * Recalculate costs when a passenger cancels
   */
  recalculateAfterCancellation(
    totalTripCost: number,
    previousPassengerCount: number,
    newPassengerCount: number
  ): { driverContribution: number; costPerPassenger: number } {
    if (newPassengerCount === 0) {
      return { driverContribution: 0, costPerPassenger: 0 };
    }

    if (newPassengerCount === 1) {
      const driverContribution = totalTripCost * this.DRIVER_SHARE_FACTOR;
      return {
        driverContribution,
        costPerPassenger: totalTripCost - driverContribution,
      };
    }

    // 2-3 passengers: driver pays 0, passengers split equally
    return {
      driverContribution: 0,
      costPerPassenger: totalTripCost / newPassengerCount,
    };
  }
}

// Export singleton instance
export const pricingEngine = new PricingEngine();

