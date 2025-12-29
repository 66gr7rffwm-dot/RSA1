import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows, gradients } from '../../theme';
import api from '../../config/api';

const { width } = Dimensions.get('window');

interface KYCStatus {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  verification_status?: string;
}

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loadingKYC, setLoadingKYC] = useState(true);

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

    if (user?.role === 'driver') {
      loadKYCStatus();
    }
  }, [user]);

  const loadKYCStatus = async () => {
    try {
      setLoadingKYC(true);
      const res = await api.get('/drivers/kyc/status');
      if (res.data.data) {
        setKycStatus({
          status: res.data.data.verification_status || res.data.data.status || 'not_submitted',
          verification_status: res.data.data.verification_status,
        });
      } else {
        setKycStatus({ status: 'not_submitted' });
      }
    } catch (error: any) {
      setKycStatus({ status: 'not_submitted' });
    } finally {
      setLoadingKYC(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getKYCStatusColor = () => {
    if (!kycStatus) return colors.primary;
    switch (kycStatus.status) {
      case 'approved':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'rejected':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getKYCStatusText = () => {
    if (!kycStatus) return 'KYC';
    switch (kycStatus.status) {
      case 'approved':
        return 'KYC ✓ Approved';
      case 'pending':
        return 'KYC ⏳ Pending';
      case 'rejected':
        return 'KYC ✗ Rejected';
      default:
        return 'Complete KYC';
    }
  };

  const getKYCStatusIcon = () => {
    if (!kycStatus) return '📋';
    switch (kycStatus.status) {
      case 'approved':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
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
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[colors.white, colors.gray100]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {(user?.fullName || 'U').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.name}>{user?.fullName || 'User'}</Text>
          <Text style={styles.phone}>{user?.phoneNumber || ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'driver' ? '🚗 Driver' : '👤 Passenger'}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Profile Info Card */}
      <Animated.View
        style={[
          styles.infoCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>👤</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{user?.fullName || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>📱</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{user?.phoneNumber || 'N/A'}</Text>
          </View>
        </View>
        {user?.email && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>📧</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
          </>
        )}
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>🎭</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>
              {user?.role === 'driver' ? 'Driver' : 'Passenger'}
            </Text>
          </View>
        </View>
        {user?.role === 'driver' && kycStatus && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>📋</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>KYC Status</Text>
                <View style={[styles.kycStatusBadge, { backgroundColor: getKYCStatusColor() }]}>
                  <Text style={styles.kycStatusText}>{getKYCStatusText()}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Subscription' as never)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.secondary}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.actionIcon}>💳</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Manage Subscription</Text>
              <Text style={styles.actionSubtitle}>500 PKR / month</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {user?.role === 'driver' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('DriverKYC' as never)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[getKYCStatusColor(), getKYCStatusColor()]}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.actionIcon}>{getKYCStatusIcon()}</Text>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>{getKYCStatusText()}</Text>
                <Text style={styles.actionSubtitle}>
                  {kycStatus?.status === 'approved' 
                    ? 'View your verified documents' 
                    : kycStatus?.status === 'pending'
                    ? 'Documents under review'
                    : kycStatus?.status === 'rejected'
                    ? 'Update your documents'
                    : 'Complete verification'}
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {user?.role === 'driver' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Vehicles' as never)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.success, colors.successLight]}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.actionIcon}>🚗</Text>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Manage Vehicles</Text>
                <Text style={styles.actionSubtitle}>Add or update vehicles</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <View style={styles.logoutButtonContent}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by AFC Solutions</Text>
      </View>
    </ScrollView>
  );
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
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xl,
  },
  avatarText: {
    ...typography.h1,
    fontSize: 40,
    color: colors.primary,
    fontWeight: '800',
  },
  name: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  phone: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  roleText: {
    ...typography.smallMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    marginTop: -spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoIconText: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  kycStatusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  kycStatusText: {
    ...typography.smallMedium,
    color: colors.white,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionIcon: {
    fontSize: 32,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    ...typography.bodyBold,
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  actionSubtitle: {
    ...typography.small,
    color: colors.white,
    opacity: 0.9,
  },
  actionArrow: {
    ...typography.h3,
    color: colors.white,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.md,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logoutIcon: {
    fontSize: 24,
  },
  logoutText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

export default ProfileScreen;
