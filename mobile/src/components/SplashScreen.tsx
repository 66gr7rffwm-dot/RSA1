import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../theme';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

interface SplashScreenProps {
  onFinish: () => void;
}

const CustomSplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const prepare = async () => {
      try {
        // Simulate loading time (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide native splash screen
        await SplashScreen.hideAsync();
        // Call onFinish after a brief delay
        setTimeout(() => {
          onFinish();
        }, 500);
      }
    };

    prepare();
  }, []);

  const buildDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const buildVersion = '1.0.0';
  const buildNumber = '1';

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🚗</Text>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Carpool</Text>
        <Text style={styles.tagline}>Share Rides, Save Money</Text>

        {/* Build Info */}
        <View style={styles.buildInfo}>
          <Text style={styles.buildText}>Version {buildVersion} (Build {buildNumber})</Text>
          <Text style={styles.buildText}>{buildDate}</Text>
        </View>

        {/* Powered By */}
        <View style={styles.poweredBy}>
          <Text style={styles.poweredByText}>Powered by</Text>
          <Text style={styles.companyName}>AFC Solutions</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
          <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 60,
  },
  appName: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.sm,
    fontWeight: '700',
    fontSize: 42,
  },
  tagline: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xl * 2,
    fontSize: 18,
  },
  buildInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
    marginTop: spacing.xl,
  },
  buildText: {
    ...typography.small,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  poweredBy: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    width: width * 0.6,
  },
  poweredByText: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.7,
    marginBottom: spacing.xs,
    fontSize: 11,
  },
  companyName: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  loadingDotDelay1: {
    animationDelay: '0.2s',
  },
  loadingDotDelay2: {
    animationDelay: '0.4s',
  },
});

export default CustomSplashScreen;

