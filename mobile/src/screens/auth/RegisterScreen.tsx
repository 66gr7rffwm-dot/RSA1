import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows, gradients } from '../../theme';

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'passenger' as 'driver' | 'passenger',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { register } = useAuth();
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!formData.phoneNumber || !formData.password || !formData.fullName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        phoneNumber: formData.phoneNumber,
        email: formData.email || undefined,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
      });
      if (formData.role === 'driver') {
        Alert.alert(
          'Success', 
          'Registration successful! Please verify OTP. After verification, you will need to complete KYC verification to start accepting rides.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('OTPVerification' as never, { phoneNumber: formData.phoneNumber } as never),
            },
          ]
        );
      } else {
        Alert.alert('Success', 'Registration successful! Please verify OTP.');
        navigation.navigate('OTPVerification' as never, { phoneNumber: formData.phoneNumber } as never);
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={gradients.primary}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Modern Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.white, colors.gray100]}
                style={styles.logoGradient}
              >
                <Text style={styles.logoIcon}>🚗</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start your journey</Text>
          </View>

          {/* Modern Form Card */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Sign Up</Text>
              <Text style={styles.formSubtitle}>Fill in your details to get started</Text>
            </View>

            {/* Full Name Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name *</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'fullName' && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                  autoCapitalize="words"
                  onFocus={() => setFocusedInput('fullName')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Phone Number *</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'phone' && styles.inputContainerFocused,
                ]}
              >
                <Text style={styles.inputPrefix}>+92</Text>
                <View style={styles.inputDivider} />
                <TextInput
                  style={styles.input}
                  placeholder="300 1234567"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email (Optional)</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'email' && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password *</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'password' && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'confirmPassword' && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Role Selection - Modern Toggle */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>I want to</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'driver' && styles.roleButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'driver' })}
                  activeOpacity={0.7}
                >
                  {formData.role === 'driver' && (
                    <LinearGradient
                      colors={gradients.primary}
                      style={styles.roleButtonGradient}
                    >
                      <Text style={styles.roleIcon}>🚗</Text>
                      <Text style={styles.roleButtonTextActive}>Drive</Text>
                    </LinearGradient>
                  )}
                  {formData.role !== 'driver' && (
                    <>
                      <Text style={styles.roleIcon}>🚗</Text>
                      <Text style={styles.roleButtonText}>Drive</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'passenger' && styles.roleButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'passenger' })}
                  activeOpacity={0.7}
                >
                  {formData.role === 'passenger' && (
                    <LinearGradient
                      colors={gradients.primary}
                      style={styles.roleButtonGradient}
                    >
                      <Text style={styles.roleIcon}>👤</Text>
                      <Text style={styles.roleButtonTextActive}>Ride</Text>
                    </LinearGradient>
                  )}
                  {formData.role !== 'passenger' && (
                    <>
                      <Text style={styles.roleIcon}>👤</Text>
                      <Text style={styles.roleButtonText}>Ride</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.primary}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.loginButton}
              activeOpacity={0.7}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: height * 0.06,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xl,
  },
  logoIcon: {
    fontSize: 50,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    color: colors.white,
    marginBottom: spacing.sm,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.white,
    opacity: 0.95,
    textAlign: 'center',
    fontWeight: '400',
  },
  formContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl * 2,
    borderTopRightRadius: borderRadius.xl * 2,
    padding: spacing.xl,
    paddingTop: spacing.xl * 1.5,
    marginTop: 'auto',
    minHeight: height * 0.7,
    ...shadows.xl,
  },
  formHeader: {
    marginBottom: spacing.xl,
  },
  formTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  formSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  inputWrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.smallMedium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: '600',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    ...shadows.sm,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
    ...shadows.md,
  },
  inputPrefix: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  inputDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  passwordInput: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  eyeIcon: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  eyeIconText: {
    fontSize: 22,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    ...shadows.sm,
  },
  roleButtonActive: {
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  roleButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  roleButtonText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '700',
  },
  button: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loginText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginTextBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default RegisterScreen;
