import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client'; 
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen({ route, navigation }: any) {
  // Extract custom param parsed straight out of the native routing link path node properties
  const token = route?.params?.token || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isFocusedPass, setIsFocusedPass] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      Alert.alert(
        'Missing Token Data',
        'This secure access password reset validation link is missing its authentication context. Please request a new one.',
        [{ text: 'Return to Log In', onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [token]);

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password: password.trim(),
      });
      return response.data;
    },
    onSuccess: (resData) => {
      Alert.alert(
        'Password Reset Complete',
        resData?.message || 'Your credentials have been refreshed successfully. Please log in with your updated configurations.',
        [
          {
            text: 'Proceed to Login',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              }),
          },
        ]
      );
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || 'This verification link has expired or already been parsed. Please request another transaction node.';
      Alert.alert('Modification Refused', errMsg);
    }
  });

  const executePasswordResetCommitPipeline = () => {
    if (!password || !confirmPassword) {
      Alert.alert('Required Fields Missing', 'Please enter your fresh account password and match validation properties.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Strength Constraint Rejection', 'Passwords must contain a structural layout minimum of 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Mismatched Inputs', 'The passwords typed across confirmation entry blocks do not match.');
      return;
    }

    resetPasswordMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navbarHeader}>
        <TouchableOpacity style={styles.closeButtonAction} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.closeActionIconText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitleTextText}>Update Credentials</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.innerLayoutBodyFrame}>
        <Text style={styles.udemyStyleMainTitle}>Choose a new password</Text>
        <Text style={styles.screenSubtextHeaderLabel}>
          Draft a complex string variation block containing symbols or capitalization metrics to isolate profile security layers.
        </Text>

        {/* FIELD BLOCK 1: NEW PASSWORD WITH EYE ACCESS DESIGN SYSTEM */}
        <View 
          style={[
            styles.passwordContainerRow, 
            isFocusedPass ? styles.udemyStyleInputFieldFieldFocused : styles.udemyStyleInputFieldFieldUnfocused
          ]}
        >
          <TextInput 
            style={styles.passwordInputField} 
            placeholder="New Password (Minimum 8 Characters)" 
            placeholderTextColor="#6A6F73"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setIsFocusedPass(true)}
            onBlur={() => setIsFocusedPass(false)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!resetPasswordMutation.isPending && !!token}
          />
          <TouchableOpacity 
            style={styles.eyeIconButton} 
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {/* FIELD BLOCK 2: MATCH VERIFICATION INPUT */}
        <View 
          style={[
            styles.passwordContainerRow, 
            isFocusedConfirm ? styles.udemyStyleInputFieldFieldFocused : styles.udemyStyleInputFieldFieldUnfocused
          ]}
        >
          <TextInput 
            style={styles.passwordInputField} 
            placeholder="Re-enter New Password" 
            placeholderTextColor="#6A6F73"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => setIsFocusedConfirm(true)}
            onBlur={() => setIsFocusedConfirm(false)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!resetPasswordMutation.isPending && !!token}
          />
        </View>

        <View style={styles.securityTrustBadgeRow}>
          <Text style={styles.trustBadgeTextIcon}>🛡️</Text>
          <Text style={styles.securityLabelSubtext}>
            Updating your administrative password node invalidates active persistent storage cookies across all connected device frames.
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.udemySolidPrimaryButtonNode, 
            (resetPasswordMutation.isPending || !token) && { opacity: 0.6 }
          ]} 
          onPress={executePasswordResetCommitPipeline}
          disabled={resetPasswordMutation.isPending || !token}
        >
          {resetPasswordMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.udemySolidPrimaryButtonNodeText}>Update Password</Text>
          )}
        </TouchableOpacity>

        {!token && (
          <Text style={styles.errorWarningMessageBannerText}>
            ⚠️ Verification parameters missing token identifier tracking values. Request a fresh URL sequence block to complete this task.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  navbarHeader: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 8 },
  closeButtonAction: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeActionIconText: { fontSize: 16, color: '#1C1D1F', fontWeight: '300' },
  navbarTitleTextText: { fontSize: 15, fontWeight: '700', color: '#1C1D1F' },
  innerLayoutBodyFrame: { paddingHorizontal: 24, paddingTop: 32, flex: 1 },
  udemyStyleMainTitle: { fontSize: 20, fontWeight: '800', color: '#1C1D1F', marginBottom: 12, letterSpacing: -0.3, textAlign: 'center'},
  screenSubtextHeaderLabel: { fontSize: 13, color: '#6A6F73', lineHeight: 19, textAlign: 'center', marginBottom: 24, paddingHorizontal: 8 },
  udemySolidPrimaryButtonNode: { backgroundColor: '#4f46e5', height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 8, borderRadius: 8 },
  udemySolidPrimaryButtonNodeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  passwordContainerRow: { flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#FFFFFF', marginBottom: 14, borderRadius: 8 },
  passwordInputField: { flex: 1, height: '100%', paddingHorizontal: 14, fontSize: 15, color: '#1C1D1F' },
  eyeIconButton: { paddingHorizontal: 14, height: '100%', justifyContent: 'center', alignItems: 'center' },
  udemyStyleInputFieldFieldUnfocused: { borderWidth: 1, borderColor: '#1C1D1F', borderRadius: 8 },
  udemyStyleInputFieldFieldFocused: { borderColor: '#4f46e5', borderWidth: 2, borderRadius: 8 },

  securityTrustBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 18, paddingHorizontal: 4, gap: 8 },
  trustBadgeTextIcon: { fontSize: 13 },
  securityLabelSubtext: { fontSize: 12, color: '#6A6F73', flex: 1, lineHeight: 16 },
  errorWarningMessageBannerText: { color: '#DC2626', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 16, lineHeight: 16, paddingHorizontal: 12 }
});