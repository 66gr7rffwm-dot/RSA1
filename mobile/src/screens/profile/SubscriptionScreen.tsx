import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../../config/api';

interface Subscription {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  amount: string;
  currency: string;
}

const SubscriptionScreen = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subscriptions/my-subscription');
      setSubscription(res.data.data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const subscribe = async () => {
    setSaving(true);
    try {
      // Step 1: mock payment
      const payRes = await api.post('/payments/process', {
        amount: 500,
        currency: 'PKR',
        paymentMethod: 'mock',
        contextType: 'subscription',
      });
      const transactionId = payRes.data?.data?.transactionId;

      // Step 2: create subscription
      await api.post('/subscriptions', {
        paymentMethod: 'mock',
        paymentTransactionId: transactionId,
      });

      Alert.alert('Success', 'Subscription activated.');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to subscribe');
    } finally {
      setSaving(false);
    }
  };

  const isActive = subscription?.status === 'active';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscription</Text>
      <Text style={styles.subtitle}>500 PKR / month • No per-ride commission</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : subscription ? (
        <View style={styles.card}>
          <Text style={styles.status}>
            Status: {subscription.status.toUpperCase()}
          </Text>
          <Text>Start: {subscription.start_date}</Text>
          <Text>End: {subscription.end_date}</Text>
          <Text>
            Amount: {subscription.amount} {subscription.currency}
          </Text>
        </View>
      ) : (
        <Text style={{ marginVertical: 16 }}>No subscription yet.</Text>
      )}

      <TouchableOpacity
        style={[styles.button, isActive && styles.buttonSecondary]}
        onPress={subscribe}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isActive ? 'Renew Subscription' : 'Subscribe Now'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  card: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
    marginBottom: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SubscriptionScreen;


