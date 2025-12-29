import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../config/api';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width, height } = Dimensions.get('window');

interface Props {
  children: ReactNode;
  navigation?: any;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isReporting: boolean;
  reportSent: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isReporting: false,
      reportSent: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.reportCrash(error, errorInfo);
  }

  reportCrash = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      this.setState({ isReporting: true });
      
      const crashReport = {
        type: 'app_crash',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        platform: 'mobile',
        appVersion: '1.0.2',
        buildNumber: 3,
        deviceInfo: {
          width,
          height,
        },
      };

      await api.post('/logs/crash', crashReport);
      this.setState({ reportSent: true });
    } catch (e) {
      console.error('Failed to report crash:', e);
    } finally {
      this.setState({ isReporting: false });
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      reportSent: false,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>😔</Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              We're sorry, but the app encountered an unexpected error.
            </Text>

            <View style={styles.statusContainer}>
              {this.state.isReporting ? (
                <View style={styles.statusRow}>
                  <Text style={styles.statusIcon}>📤</Text>
                  <Text style={styles.statusText}>Sending crash report...</Text>
                </View>
              ) : this.state.reportSent ? (
                <View style={styles.statusRow}>
                  <Text style={styles.statusIcon}>✅</Text>
                  <Text style={styles.statusTextSuccess}>
                    Crash report sent to our team
                  </Text>
                </View>
              ) : (
                <View style={styles.statusRow}>
                  <Text style={styles.statusIcon}>⚠️</Text>
                  <Text style={styles.statusTextError}>
                    Could not send crash report
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <ScrollView style={styles.errorScroll} nestedScrollEnabled>
                <Text style={styles.errorMessage}>
                  {this.state.error?.message || 'Unknown error'}
                </Text>
                {__DEV__ && this.state.error?.stack && (
                  <Text style={styles.errorStack}>
                    {this.state.error.stack}
                  </Text>
                )}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.retryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.retryIcon}>🔄</Text>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              If the problem persists, please contact support.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: -spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statusContainer: {
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statusTextSuccess: {
    ...typography.body,
    color: colors.success,
  },
  statusTextError: {
    ...typography.body,
    color: colors.error,
  },
  errorBox: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: 200,
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorScroll: {
    maxHeight: 120,
  },
  errorMessage: {
    ...typography.small,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorStack: {
    ...typography.caption,
    color: colors.textTertiary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  retryButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
    marginBottom: spacing.lg,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  retryIcon: {
    fontSize: 20,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  helpText: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

export default ErrorBoundary;

