import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { apiClient, setSecureItem } from '../../api/client'; 
import { useAuthMock } from '../../navigation/RootNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

type UserRole = 'student' | 'instructor' | 'admin';

export default function LoginScreen({ navigation }: any) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);
  // NEW: State to track password visibility
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuthMock();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password: password,
      });
      return response.data;
    },
    onSuccess: async (resData) => {
      try {
        const { accessToken, refreshToken, user } = resData.data;

        await setSecureItem('accessToken', accessToken);
        await setSecureItem('refreshToken', refreshToken);
        await setSecureItem('userInfo', JSON.stringify(user));

        login(user, accessToken, refreshToken); 

        Alert.alert('Success', `Welcome back, ${user.name}!`);
        navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
      } catch (storeError) {
        console.error('STORAGE PERSISTENCE ERROR:', storeError);
        Alert.alert('Storage Error', 'Failed to save login session.');
      }
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || 'Invalid email or password credentials.';
      Alert.alert('Authentication Failed', errMsg);
    }
  });

  const handleAuthenticationSubmissionPipeline = () => {
    if (!email || !password) {
      Alert.alert('Required Fields Missing', 'Please enter your account email credentials and password.');
      return;
    }
    loginMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navbarHeader}>
        <TouchableOpacity style={styles.closeButtonAction} onPress={() => navigation.goBack()}>
          <Text style={styles.closeActionIconText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitleTextText}>Log In</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.innerLayoutBodyFrame}>
        <Text style={styles.udemyStyleMainTitle}>Log in to your account</Text>

        <View style={styles.udemyFormFieldWrapper}>
          <TextInput 
            style={[
              styles.udemyStyleInputFieldField, 
              isFocusedEmail ? styles.udemyStyleInputFieldFieldFocused : styles.udemyStyleInputFieldFieldUnfocused
            ]} 
            placeholder="Email" 
            placeholderTextColor="#6A6F73"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setIsFocusedEmail(true)}
            onBlur={() => setIsFocusedEmail(false)}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loginMutation.isPending}
          />
        </View>

        {/* MODIFIED: Password Field Wrapper with Row styling */}
        <View 
          style={[
            styles.passwordContainerRow, 
            isFocusedPass ? styles.udemyStyleInputFieldFieldFocused : styles.udemyStyleInputFieldFieldUnfocused
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
            // NEW: Inverted logic logic for visibility
            secureTextEntry={!showPassword}
            editable={!loginMutation.isPending}
          />
          {/* NEW: Toggle Visibility Button */}
          <TouchableOpacity 
            style={styles.eyeIconButton} 
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.udemySolidPrimaryButtonNode, loginMutation.isPending && { opacity: 0.7 }]} 
          onPress={handleAuthenticationSubmissionPipeline}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.udemySolidPrimaryButtonNodeText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* SPECIAL ACTION LINK: LOG IN AS CAREER ADVISOR */}
        <TouchableOpacity 
          style={styles.advisorLoginOutlineButton}
          onPress={() => navigation.navigate('AdvisorLogin')}
        >
          <Text style={{ fontSize: 16, marginRight: 6 }}>💼</Text>
          <Text style={styles.advisorLoginOutlineButtonText}>Log in as Career Advisor</Text>
        </TouchableOpacity>

        <View style={styles.flatFooterRedirectGroupRow}>
          <Text style={styles.flatFooterLabelSubtext}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AuthGate')}>
            <Text style={styles.flatFooterActionLinkText}> Sign up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.flatFooterRedirectGroupRow}>
          <Text style={styles.flatFooterLabelSubtext}>Forgot Passowrd?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
            <Text style={styles.flatFooterActionLinkText}> Reset</Text>
          </TouchableOpacity>
        </View>
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
  udemyStyleMainTitle: { fontSize: 20, fontWeight: '800', color: '#1C1D1F', marginBottom: 24, letterSpacing: -0.3, textAlign: 'center'},
  udemyFormFieldWrapper: { marginBottom: 14 },
  udemyStyleInputFieldField: { height: 50, paddingHorizontal: 14, fontSize: 15, color: '#1C1D1F', backgroundColor: '#FFFFFF', borderRadius: 8 },
  udemyStyleInputFieldFieldUnfocused: { borderWidth: 1, borderColor: '#1C1D1F', borderRadius: 8 },
  // Note: Standardized border widths across focus states to prevent layout shifts when the eye toggle changes state
  udemyStyleInputFieldFieldFocused: { borderColor: '#4f46e5', borderWidth: 2, borderRadius: 8 },

  // STYLE FOR CAREER ADVISOR LOGIN BUTTON
  advisorLoginOutlineButton: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 8,
  },
  advisorLoginOutlineButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // NEW: Styles for the password entry layout adjustments
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

  udemySolidPrimaryButtonNode: { backgroundColor: '#4f46e5', height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 14, borderRadius: 8 },
  udemySolidPrimaryButtonNodeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  flatFooterRedirectGroupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  flatFooterLabelSubtext: { fontSize: 14, color: '#1C1D1F' },
  flatFooterActionLinkText: { fontSize: 14, fontWeight: '700', color: '#4f46e5' },
});