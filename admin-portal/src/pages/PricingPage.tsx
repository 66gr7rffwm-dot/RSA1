import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';

interface PricingConfig {
  fuel_rate_per_km: number;
  vehicle_factors: Record<string, number>;
  driver_share_factor_single_passenger: number;
  subscription_monthly_fee: number;
  platform_commission_percent: number;
}

interface CalculatorResult {
  baseCost: number;
  driverContribution: number;
  passengerCost: number;
  totalCost: number;
}

const PricingPage: React.FC = () => {
  const [config, setConfig] = useState<PricingConfig>({
    fuel_rate_per_km: 25,
    vehicle_factors: {
      petrol: 1.0,
      diesel: 0.9,
      cng: 0.7,
      hybrid: 0.8,
      electric: 0.6,
    },
    driver_share_factor_single_passenger: 0.5,
    subscription_monthly_fee: 500,
    platform_commission_percent: 0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Calculator state
  const [calcDistance, setCalcDistance] = useState<number>(20);
  const [calcFuelType, setCalcFuelType] = useState<string>('petrol');
  const [calcPassengers, setCalcPassengers] = useState<number>(1);
  const [calcPartialFactor, setCalcPartialFactor] = useState<number>(1);
  const [calcResult, setCalcResult] = useState<CalculatorResult | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/pricing-config');
      if (res.data.data) {
        setConfig({
          ...config,
          ...res.data.data
        });
      }
    } catch (error) {
      console.log('Using default pricing config');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/pricing-config', config);
      toast.success('Configuration saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const calculatePrice = () => {
    const vehicleFactor = config.vehicle_factors[calcFuelType] || 1;
    const baseCost = calcDistance * config.fuel_rate_per_km * vehicleFactor;
    
    let driverContribution = 0;
    if (calcPassengers === 1) {
      driverContribution = baseCost * config.driver_share_factor_single_passenger;
    } else if (calcPassengers === 0) {
      driverContribution = baseCost; // Driver pays full if no passengers
    }
    
    const remainingCost = baseCost - driverContribution;
    const passengerCost = calcPassengers > 0 
      ? (remainingCost / calcPassengers) * calcPartialFactor 
      : 0;
    
    setCalcResult({
      baseCost: Math.round(baseCost),
      driverContribution: Math.round(driverContribution),
      passengerCost: Math.round(passengerCost),
      totalCost: Math.round(baseCost),
    });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    calculatePrice();
  }, [calcDistance, calcFuelType, calcPassengers, calcPartialFactor, config]);

  const fuelTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      petrol: '⛽',
      diesel: '🛢️',
      cng: '💨',
      hybrid: '🔋',
      electric: '⚡'
    };
    return emojis[type] || '🚗';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading pricing configuration...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>💰 Pricing & AI Configuration</h2>
          <p className="subtitle">Manage pricing formulas and AI parameters</p>
        </div>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? '💾 Saving...' : '💾 Save Configuration'}
        </button>
      </div>

      <div className="pricing-grid">
        {/* Pricing Formula Section */}
        <div className="pricing-card">
          <h3>📊 Pricing Formula</h3>
          <div className="formula-display">
            <div className="formula-box">
              <strong>Base Cost</strong> = Distance × Fuel Rate × Vehicle Factor
            </div>
            <div className="formula-box">
              <strong>Driver Share</strong> = Base Cost × {(config.driver_share_factor_single_passenger * 100).toFixed(0)}% (if 1 passenger)
            </div>
            <div className="formula-box">
              <strong>Passenger Cost</strong> = (Base Cost - Driver Share) ÷ Passengers × Partial Factor
            </div>
          </div>

          <div className="config-section">
            <h4>⛽ Base Fuel Rate</h4>
            <div className="config-row">
              <label>Fuel Rate per KM (PKR)</label>
              <input
                type="number"
                min="1"
                value={config.fuel_rate_per_km}
                onChange={(e) => setConfig({ ...config, fuel_rate_per_km: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="config-section">
            <h4>🚗 Vehicle Fuel Type Factors</h4>
            <p className="config-hint">Lower factor = lower cost (e.g., electric vehicles are cheaper to run)</p>
            <div className="vehicle-factors-grid">
              {Object.entries(config.vehicle_factors).map(([type, factor]) => (
                <div key={type} className="factor-row">
                  <span className="factor-label">{fuelTypeEmoji(type)} {type}</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={factor}
                    onChange={(e) => setConfig({
                      ...config,
                      vehicle_factors: {
                        ...config.vehicle_factors,
                        [type]: Number(e.target.value),
                      },
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="config-section">
            <h4>👥 Driver Cost Sharing</h4>
            <div className="config-row">
              <label>Driver Share Factor (Single Passenger)</label>
              <div className="range-input">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.driver_share_factor_single_passenger}
                  onChange={(e) => setConfig({
                    ...config,
                    driver_share_factor_single_passenger: Number(e.target.value),
                  })}
                />
                <span className="range-value">{(config.driver_share_factor_single_passenger * 100).toFixed(0)}%</span>
              </div>
              <p className="config-hint">
                With 1 passenger, driver pays {(config.driver_share_factor_single_passenger * 100).toFixed(0)}% of the cost.
                With 2+ passengers, driver pays 0%.
              </p>
            </div>
          </div>

          <div className="config-section">
            <h4>💳 Subscription Settings</h4>
            <div className="config-row">
              <label>Monthly Subscription Fee (PKR)</label>
              <input
                type="number"
                min="0"
                value={config.subscription_monthly_fee}
                onChange={(e) => setConfig({ ...config, subscription_monthly_fee: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Price Calculator Section */}
        <div className="pricing-card calculator-card">
          <h3>🧮 Price Calculator</h3>
          <p className="config-hint">Test the pricing formula with different parameters</p>

          <div className="calculator-form">
            <div className="calc-row">
              <label>Distance (km)</label>
              <input
                type="number"
                min="1"
                value={calcDistance}
                onChange={(e) => setCalcDistance(Number(e.target.value))}
              />
            </div>

            <div className="calc-row">
              <label>Vehicle Fuel Type</label>
              <select value={calcFuelType} onChange={(e) => setCalcFuelType(e.target.value)}>
                {Object.keys(config.vehicle_factors).map(type => (
                  <option key={type} value={type}>{fuelTypeEmoji(type)} {type}</option>
                ))}
              </select>
            </div>

            <div className="calc-row">
              <label>Number of Passengers</label>
              <input
                type="number"
                min="0"
                max="3"
                value={calcPassengers}
                onChange={(e) => setCalcPassengers(Number(e.target.value))}
              />
            </div>

            <div className="calc-row">
              <label>Partial Journey Factor</label>
              <div className="range-input">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={calcPartialFactor}
                  onChange={(e) => setCalcPartialFactor(Number(e.target.value))}
                />
                <span className="range-value">{(calcPartialFactor * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {calcResult && (
            <div className="calculator-result">
              <h4>💵 Calculation Result</h4>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">Base Trip Cost</span>
                  <span className="result-value">PKR {calcResult.baseCost}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Driver Contribution</span>
                  <span className="result-value driver">PKR {calcResult.driverContribution}</span>
                </div>
                <div className="result-item highlight">
                  <span className="result-label">Per Passenger Cost</span>
                  <span className="result-value">PKR {calcResult.passengerCost}</span>
                </div>
              </div>
              
              <div className="breakdown-visual">
                <div className="breakdown-bar">
                  <div 
                    className="bar-segment driver-segment" 
                    style={{ width: `${(calcResult.driverContribution / calcResult.totalCost) * 100}%` }}
                    title={`Driver: PKR ${calcResult.driverContribution}`}
                  >
                    Driver
                  </div>
                  <div 
                    className="bar-segment passenger-segment" 
                    style={{ width: `${((calcResult.totalCost - calcResult.driverContribution) / calcResult.totalCost) * 100}%` }}
                    title={`Passengers: PKR ${calcResult.totalCost - calcResult.driverContribution}`}
                  >
                    Passengers
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="info-banner-large">
        <h4>📖 Pricing Logic Explained</h4>
        <div className="info-content-grid">
          <div className="info-block">
            <h5>🚗 Base Cost Calculation</h5>
            <p>The base cost is calculated by multiplying the distance traveled by the fuel rate per kilometer, adjusted by a vehicle factor that accounts for different fuel efficiencies.</p>
          </div>
          <div className="info-block">
            <h5>👥 Cost Sharing Rules</h5>
            <ul>
              <li><strong>1 Passenger:</strong> Driver pays {(config.driver_share_factor_single_passenger * 100).toFixed(0)}%, passenger pays {((1 - config.driver_share_factor_single_passenger) * 100).toFixed(0)}%</li>
              <li><strong>2+ Passengers:</strong> Driver pays 0%, cost split equally among passengers</li>
              <li><strong>Partial Journey:</strong> Passengers only pay for the portion of the route they travel</li>
            </ul>
          </div>
          <div className="info-block">
            <h5>⚡ Vehicle Factors</h5>
            <p>Different fuel types have different running costs. Electric vehicles (0.6x) are the most economical, while petrol (1.0x) is the baseline.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
