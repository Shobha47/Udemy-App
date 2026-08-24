import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client'; 
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [sent, setSent] = useState(false);

  // --- RECOVERY DISPATCH PIPELINE MUTATION ---
  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/forgot-password', {
        email: email.toLowerCase().trim(),
      });
      return response.data;
    },
    onSuccess: (resData) => {
      setSent(true);
      Alert.alert('Success', resData?.message || 'Password reset email dispatched.');
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || 'Could not dispatch recovery link. Verify your network interface.';
      Alert.alert('Reset Failed', errMsg);
    }
  });

  const handleResetRequestSubmission = () => {
    if (!email) {
      Alert.alert('Required Field Missing', 'Please enter your account email credentials.');
      return;
    }
    forgotPasswordMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* HEADER SPECS MATCHING LOGIN MODULES */}
      <View style={styles.navbarHeader}>
        <TouchableOpacity style={styles.closeButtonAction} onPress={() => navigation.goBack()}>
          <Text style={styles.closeActionIconText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitleTextText}>Reset Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.innerLayoutBodyFrame}>
        
        {sent ? (
          /* --- FLOW STATE A: SUCCESS INSTRUCTIONS CARD --- */
          <View style={styles.successStateBoxContainer}>
            <Text style={styles.successBadgeIcon}>✉️</Text>
            <Text style={styles.udemyStyleMainTitle}>Check Your Inbox</Text>
            
            <Text style={styles.successBodyDescriptionText}>
              We have securely dispatched an authorization recovery link directly to:
            </Text>
            
            <Text style={styles.highlightedUserEmailSpan}>{email.toLowerCase().trim()}</Text>
            
            <Text style={styles.successBodyWarningSubtext}>
              ⏳ The authentication parameters inside this verification track will expire in 15 minutes.
            </Text>

            <TouchableOpacity 
              style={[styles.udemySolidPrimaryButtonNode, { marginTop: 28 }]} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.udemySolidPrimaryButtonNodeText}>Return to Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.inlineActionLinkButton} 
              onPress={() => {
                setSent(false);
                setEmail('');
              }}
            >
              <Text style={styles.flatFooterActionLinkText}>Try a different email address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* --- FLOW STATE B: DISPATCH INITIAL RECOVERY INPUT --- */
          <>
            <Text style={styles.udemyStyleMainTitle}>Find your account</Text>
            <Text style={styles.screenSubtextHeaderLabel}>
              Enter your account email credentials below, and we will send a direct confirmation token node to reset your password profile.
            </Text>

            <View style={styles.udemyFormFieldWrapper}>
              <TextInput 
                style={[
                  styles.udemyStyleInputFieldField, 
                  isFocusedEmail ? styles.udemyStyleInputFieldFieldFocused : styles.udemyStyleInputFieldFieldUnfocused
                ]} 
                placeholder="Email Address" 
                placeholderTextColor="#6A6F73"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsFocusedEmail(true)}
                onBlur={() => setIsFocusedEmail(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!forgotPasswordMutation.isPending}
              />
            </View>

            <View style={styles.securityTrustBadgeRow}>
              <Text style={styles.trustBadgeTextIcon}>🛡️</Text>
              <Text style={styles.securityLabelSubtext}>
                We only send balance updates and credential links to verified accounts.
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.udemySolidPrimaryButtonNode, forgotPasswordMutation.isPending && { opacity: 0.7 }]} 
              onPress={handleResetRequestSubmission}
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.udemySolidPrimaryButtonNodeText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CORE LAYOUT MATRIX COPIED EXACTLY FROM YOUR LOGIN DESIGN
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  navbarHeader: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 8 },
  closeButtonAction: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeActionIconText: { fontSize: 16, color: '#1C1D1F', fontWeight: '300' },
  navbarTitleTextText: { fontSize: 15, fontWeight: '700', color: '#1C1D1F' },
  innerLayoutBodyFrame: { paddingHorizontal: 24, paddingTop: 32, flex: 1 },
  udemyStyleMainTitle: { fontSize: 20, fontWeight: '800', color: '#1C1D1F', marginBottom: 12, letterSpacing: -0.3, textAlign: 'center'},
  screenSubtextHeaderLabel: { fontSize: 13, color: '#6A6F73', lineHeight: 19, textAlign: 'center', marginBottom: 24, paddingHorizontal: 4 },
  udemyFormFieldWrapper: { marginBottom: 14 },
  udemyStyleInputFieldField: { height: 50, paddingHorizontal: 14, fontSize: 15, color: '#1C1D1F', backgroundColor: '#FFFFFF', borderRadius: 8 },
  udemyStyleInputFieldFieldUnfocused: { borderWidth: 1, borderColor: '#1C1D1F', borderRadius: 8 },
  udemyStyleInputFieldFieldFocused: { borderColor: '#4f46e5', borderWidth: 2, borderRadius: 8 },
  udemySolidPrimaryButtonNode: { backgroundColor: '#4f46e5', height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 14, borderRadius: 8 },
  udemySolidPrimaryButtonNodeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // NEW: CUSTOM SPECIFIC HOOK STYLES FOR RECOVERY FLOW 
  securityTrustBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 16, paddingHorizontal: 4, gap: 8 },
  trustBadgeTextIcon: { fontSize: 13 },
  securityLabelSubtext: { fontSize: 12, color: '#6A6F73', flex: 1, lineHeight: 16 },
  
  successStateBoxContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 20, width: '100%' },
  successBadgeIcon: { fontSize: 44, marginBottom: 16, textAlign: 'center' },
  successBodyDescriptionText: { fontSize: 14, color: '#6A6F73', textAlign: 'center', lineHeight: 20, marginBottom: 10 },
  highlightedUserEmailSpan: { fontSize: 15, fontWeight: '700', color: '#4f46e5', textAlign: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, overflow: 'hidden' },
  successBodyWarningSubtext: { fontSize: 12, color: '#6A6F73', textAlign: 'center', marginTop: 16, lineHeight: 18, paddingHorizontal: 12 },
  inlineActionLinkButton: { marginTop: 24, padding: 8 },
  flatFooterActionLinkText: { fontSize: 14, fontWeight: '700', color: '#4f46e5', textAlign: 'center' },
});