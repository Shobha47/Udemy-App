import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../../api/client';
import { setSecureItem } from '../../api/client'; 
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudentSignUpScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);
  
  // NEW: State to track password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Student creation API tracking configuration
  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/register/student', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
      });
      return response.data;
    },
    onSuccess: async (resData) => {
      // navigation.navigate('EmailVerification', {
      //   email: resData.data.email,
      // });

      // FIX: Defensive coding strategy ensuring value fallback tracking matches your wrapper schema format
      const targetedEmail = resData?.data?.email || resData?.email || email.toLowerCase().trim();
      
      if (!targetedEmail) {
        Alert.alert('Data Sync Error', 'Account registration completed but email target reference resolution dropped.');
        return;
      }

      navigation.navigate('EmailVerification', {
        email: targetedEmail,
      });
    },
    onError: (error: any) => {
      const serverError = error?.response?.data;
      if (serverError?.statusCode === 422 && serverError.errors) {
        const validationMessages = serverError.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
        Alert.alert('Validation Error', validationMessages);
      } else {
        Alert.alert('Registration Failed', serverError?.message || 'Network interface failed.');
      }
    }
  });

  const executeRegistrationSubmissionPipeline = () => {
    if (!name || !email || !password) {
      Alert.alert('Verification Warning', 'All fields are mandatory requirements for secure registration.');
      return;
    }
    registerMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navbarHeader}>
        <TouchableOpacity style={styles.closeButtonAction} onPress={() => navigation.goBack()}>
          <Text style={styles.closeActionIconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitleTextText}>Student Sign Up</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.innerLayoutBodyFrame}>
        <Text style={styles.udemyStyleMainTitle}>Create your Student account</Text>
        <Text style={styles.studentSubtextHeaderLabel}>Share your specialized expertise node with structured global academic track networks.</Text>
        
        <View style={styles.udemyFormFieldWrapper}>
          <TextInput 
            style={[
              styles.udemyStyleInputFieldField, 
              isFocusedName ? styles.udemyStyleInputFieldFieldFocused : styles.udemyStyleInputFieldFieldUnfocused
            ]} 
            placeholder="Full Name" 
            placeholderTextColor="#6A6F73"
            value={name} 
            onChangeText={setName}
            onFocus={() => setIsFocusedName(true)}
            onBlur={() => setIsFocusedName(false)}
            editable={!registerMutation.isPending}
          />
        </View>

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
            editable={!registerMutation.isPending}
          />
        </View>

        {/* MODIFIED: Password row architecture with visibility action triggers */}
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
            // NEW: Linked visibility logic state
            secureTextEntry={!showPassword} 
            editable={!registerMutation.isPending}
          />
          <TouchableOpacity 
            style={styles.eyeIconButton} 
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.udemySolidPrimaryButtonNode, registerMutation.isPending && { opacity: 0.7 }]} 
          onPress={executeRegistrationSubmissionPipeline}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.udemySolidPrimaryButtonNodeText}>Register Student Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  studentSubtextHeaderLabel: { fontSize: 13, color: '#6A6F73', lineHeight: 18, marginBottom: 28 },
  navbarHeader: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 8 },
  closeButtonAction: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeActionIconText: { fontSize: 20, color: '#1C1D1F', fontWeight: '300' },
  navbarTitleTextText: { fontSize: 15, fontWeight: '700', color: '#1C1D1F' },
  innerLayoutBodyFrame: { paddingHorizontal: 24, paddingTop: 32 },
  udemyStyleMainTitle: { fontSize: 20, fontWeight: '800', color: '#1C1D1F', marginBottom: 4, letterSpacing: -0.3 },
  udemyFormFieldWrapper: { marginBottom: 14 },
  udemyStyleInputFieldField: { height: 50, paddingHorizontal: 14, fontSize: 15, color: '#1C1D1F', backgroundColor: '#FFFFFF', borderRadius: 8 },
  udemyStyleInputFieldFieldUnfocused: { borderWidth: 1, borderColor: '#1C1D1F', borderRadius: 8 },
  udemyStyleInputFieldFieldFocused: { borderColor: '#4f46e5', borderWidth: 2, borderRadius: 8 },
  
  // NEW: Shared visual interface layout properties for consistency 
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
});