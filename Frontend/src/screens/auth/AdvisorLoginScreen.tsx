import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { advisorApiClient } from '../../api/advisorClient';
import { setSecureItem } from '../../api/client';
import { useAuthMock } from '../../navigation/RootNavigator';

export default function AdvisorLoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuthMock();

  const advisorLoginMutation = useMutation({
    mutationFn: async () => {
      // Calls dedicated advisor authentication endpoint
      const response = await advisorApiClient.post('/auth/signin', {
        email: email.toLowerCase().trim(),
        password,
      });
      return response.data;
    },
    onSuccess: async (resData) => {
      try {
        const { accessToken, refreshToken, user } = resData.data || resData;

        // Force user role to ADVISOR for route handling
        const advisorUser = {
          ...(user || {}),
          role: 'ADVISOR',
        };

        await setSecureItem('accessToken', accessToken);
        await setSecureItem('refreshToken', refreshToken);
        await setSecureItem('userInfo', JSON.stringify(advisorUser));

        login(advisorUser, accessToken, refreshToken);

        Alert.alert('Welcome Back', `Logged in successfully as Career Advisor!`);
        navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
      } catch (storeError) {
        console.error('ADVISOR SESSION PERSISTENCE ERROR:', storeError);
        Alert.alert('Storage Error', 'Failed to save active session token.');
      }
    },
    onError: (error: any) => {
      const errMsg =
        error?.response?.data?.message ||
        'Invalid advisor email or password credentials.';
      Alert.alert('Advisor Authentication Failed', errMsg);
    },
  });

  const handleAdvisorLoginSubmit = () => {
    if (!email || !password) {
      Alert.alert(
        'Required Fields Missing',
        'Please enter your registered advisor email and password.'
      );
      return;
    }
    advisorLoginMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* NAVBAR */}
      <View style={styles.navbarHeader}>
        <TouchableOpacity
          style={styles.closeButtonAction}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeActionIconText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitleTextText}>Advisor Portal</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.innerLayoutBodyFrame}>
          {/* BRANDING BADGE */}
          <View style={styles.badgeContainer}>
            <Text style={{ fontSize: 24 }}>💼</Text>
            <Text style={styles.badgeLabelText}>Career Advisor Portal</Text>
          </View>

          <Text style={styles.udemyStyleMainTitle}>
            Sign in to your Advisor Console
          </Text>

          {/* EMAIL FIELD */}
          <View style={styles.udemyFormFieldWrapper}>
            <TextInput
              style={[
                styles.udemyStyleInputFieldField,
                isFocusedEmail
                  ? styles.udemyStyleInputFieldFieldFocused
                  : styles.udemyStyleInputFieldFieldUnfocused,
              ]}
              placeholder="Advisor Email Address"
              placeholderTextColor="#6A6F73"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsFocusedEmail(true)}
              onBlur={() => setIsFocusedEmail(false)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!advisorLoginMutation.isPending}
            />
          </View>

          {/* PASSWORD FIELD WITH TOGGLE */}
          <View
            style={[
              styles.passwordContainerRow,
              isFocusedPass
                ? styles.udemyStyleInputFieldFieldFocused
                : styles.udemyStyleInputFieldFieldUnfocused,
            ]}
          >
            <TextInput
              style={styles.passwordInputField}
              placeholder="Password"
              placeholderTextColor="#6A6F73"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setIsFocusedPass(true)}
              onBlur={() => setIsFocusedPass(false)}
              secureTextEntry={!showPassword}
              editable={!advisorLoginMutation.isPending}
            />
            <TouchableOpacity
              style={styles.eyeIconButton}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* LOGIN SUBMIT BUTTON */}
          <TouchableOpacity
            style={[
              styles.udemySolidPrimaryButtonNode,
              advisorLoginMutation.isPending && { opacity: 0.7 },
            ]}
            onPress={handleAdvisorLoginSubmit}
            disabled={advisorLoginMutation.isPending}
          >
            {advisorLoginMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.udemySolidPrimaryButtonNodeText}>
                Log In as Career Advisor
              </Text>
            )}
          </TouchableOpacity>

          {/* FOOTER LINKS */}
          <View style={styles.flatFooterRedirectGroupRow}>
            <Text style={styles.flatFooterLabelSubtext}>
              Don't have an advisor account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdvisorSignUp')}
            >
              <Text style={styles.flatFooterActionLinkText}> Register here</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.flatFooterRedirectGroupRow}>
            <Text style={styles.flatFooterLabelSubtext}>Standard User?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.flatFooterActionLinkText}> Log in as Student/Instructor</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.flatFooterRedirectGroupRow}>
            <Text style={styles.flatFooterLabelSubtext}>Forgot Password?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPasswordScreen')}
            >
              <Text style={styles.flatFooterActionLinkText}> Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  navbarHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 8,
  },
  closeButtonAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeActionIconText: { fontSize: 16, color: '#1C1D1F', fontWeight: '300' },
  navbarTitleTextText: { fontSize: 15, fontWeight: '700', color: '#1C1D1F' },
  innerLayoutBodyFrame: { paddingHorizontal: 24, paddingTop: 24, flex: 1 },

  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  badgeLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginLeft: 8,
  },

  udemyStyleMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1D1F',
    marginBottom: 24,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  udemyFormFieldWrapper: { marginBottom: 14 },
  udemyStyleInputFieldField: {
    height: 50,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1C1D1F',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  udemyStyleInputFieldFieldUnfocused: {
    borderWidth: 1,
    borderColor: '#1C1D1F',
    borderRadius: 8,
  },
  udemyStyleInputFieldFieldFocused: {
    borderColor: '#4F46E5',
    borderWidth: 2,
    borderRadius: 8,
  },

  passwordContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  passwordInputField: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1C1D1F',
  },
  eyeIconButton: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  udemySolidPrimaryButtonNode: {
    backgroundColor: '#4F46E5',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    borderRadius: 8,
  },
  udemySolidPrimaryButtonNodeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  flatFooterRedirectGroupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  flatFooterLabelSubtext: { fontSize: 13, color: '#6A6F73' },
  flatFooterActionLinkText: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
});