import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Image } from 'react-native';
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const prepare = async () => {
      try {
        // Start animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();

        // Show splash for 2.5 seconds (same as error screen)
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide native splash screen immediately
        await SplashScreen.hideAsync();
        // Call onFinish immediately
        onFinish();
      }
    };

    prepare();
  }, []);

  const buildDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const buildVersion = '1.0.3';
  const buildNumber = '4';

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6', '#EC4899']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Animated Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: rotate },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F3F4F6']}
            style={styles.logoGradient}
          >
            <Text style={styles.logoIcon}>🚗</Text>
            {/* Animated dots around logo */}
            <Animated.View
              style={[
                styles.animatedDot,
                styles.dot1,
                {
                  opacity: fadeAnim,
                  transform: [{ rotate: rotate }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.animatedDot,
                styles.dot2,
                {
                  opacity: fadeAnim,
                  transform: [{ rotate: rotate }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.animatedDot,
                styles.dot3,
                {
                  opacity: fadeAnim,
                  transform: [{ rotate: rotate }],
                },
              ]}
            />
          </LinearGradient>
        </Animated.View>

        {/* App Name with Animation */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.appName}>Carpool</Text>
          <Text style={styles.tagline}>Share Rides, Save Money</Text>
        </Animated.View>

        {/* Animated Features */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Save Money</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌱</Text>
            <Text style={styles.featureText}>Eco Friendly</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤝</Text>
            <Text style={styles.featureText}>Connect</Text>
          </View>
        </Animated.View>

        {/* Build Info */}
        <Animated.View
          style={[
            styles.buildInfo,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.buildText}>Version {buildVersion} (Build {buildNumber})</Text>
          <Text style={styles.buildText}>{buildDate}</Text>
        </Animated.View>

        {/* Powered By */}
        <Animated.View
          style={[
            styles.poweredBy,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.poweredByText}>Powered by</Text>
          <Text style={styles.companyName}>AFC Solutions</Text>
        </Animated.View>

        {/* Loading Indicator with Animation */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.loadingDot,
              {
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              styles.loadingDotDelay1,
              {
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              styles.loadingDotDelay2,
              {
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>
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
    width: '100%',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  logoGradient: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 70,
  },
  animatedDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dot1: {
    top: -10,
    left: '50%',
    marginLeft: -6,
  },
  dot2: {
    bottom: -10,
    left: '50%',
    marginLeft: -6,
  },
  dot3: {
    top: '50%',
    right: -10,
    marginTop: -6,
  },
  appName: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.sm,
    fontWeight: '800',
    fontSize: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    ...typography.body,
    color: colors.white,
    opacity: 0.95,
    marginBottom: spacing.xl * 2,
    fontSize: 20,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
    gap: spacing.lg,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 80,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  featureText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  buildInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
  },
  buildText: {
    ...typography.small,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
    fontSize: 13,
  },
  poweredBy: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    width: width * 0.6,
  },
  poweredByText: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  companyName: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 18,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    marginHorizontal: 6,
    opacity: 0.8,
  },
  loadingDotDelay1: {
    // Animation handled by transform
  },
  loadingDotDelay2: {
    // Animation handled by transform
  },
});

export default CustomSplashScreen;
