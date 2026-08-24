import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../../api/client';
import { setSecureItem } from '../../api/client'; 
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InstructorSignUpScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [expertise, setExpertise] = useState('');
  const [bio, setBio] = useState('');
  
  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);
  const [isFocusedExp, setIsFocusedExp] = useState(false);
  const [isFocusedBio, setIsFocusedBio] = useState(false);
  
  // NEW: State to track password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Instructor application execution pipeline
  const instructorMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/register/instructor', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        headline: expertise.trim() || undefined,
        bio: bio.trim() || undefined
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
        const errorsFormatted = serverError.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
        Alert.alert('Joi Validation Rejection', errorsFormatted);
      } else {
        Alert.alert('Application Blocked', serverError?.message || 'Database transaction error.');
      }
    }
  });

  const executeInstructorRegistrationSubmissionPipeline = () => {
    if (!name || !email || !password || !expertise) {
      Alert.alert('Validation Error', 'Name, Email, Password, and Area of Expertise fields are mandatory structural parameters.');
      return;
    }
    instructorMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navbarHeader}>
        <TouchableOpacity style={styles.closeButtonAction} onPress={() => navigation.goBack()}>
          <Text style={styles.closeActionIconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitleTextText}>Instructor Portal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.innerLayoutBodyFrame} showsVerticalScrollIndicator={false}>
        <Text style={styles.udemyStyleMainTitle}>Apply to teach on platform</Text>
        <Text style={styles.instructorSubtextHeaderLabel}>Share your specialized expertise node with structured global academic track networks.</Text>

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
            editable={!instructorMutation.isPending}
          />
        </View>

        <View style={styles.udemyFormFieldWrapper}>
          <TextInput 
            style={[
              styles.udemyStyleInputFieldField, 
              isFocusedEmail ? styles.udemyStyleInputFieldFieldFocused : styles.udemyStyleInputFieldFieldUnfocused
            ]} 
            placeholder="Professional Email Node" 
            placeholderTextColor="#6A6F73"
            value={email} 
            onChangeText={setEmail} 
            onFocus={() => setIsFocusedEmail(true)}
            onBlur={() => setIsFocusedEmail(false)}
            autoCapitalize="none" 
            keyboardType="email-address" 
            editable={!instructorMutation.isPending}
          />
        </View>

        {/* MODIFIED: Password field with built-in eye toggle */}
        <View 
          style={[
            styles.passwordContainerRow, 
            isFocusedPass ? styles.udemyStyleInputFieldFieldFocused : styles.udemyStyleInputFieldFieldUnfocused
          ]}
        >
          <TextInput 
            style={styles.passwordInputField} 
            placeholder="Password (Min 8 Characters)" 
            placeholderTextColor="#6A6F73"
            value={password} 
            onChangeText={setPassword} 
            onFocus={() => setIsFocusedPass(true)}
            onBlur={() => setIsFocusedPass(false)}
            // NEW: Connected to showPassword state toggles
            secureTextEntry={!showPassword}
            editable={!instructorMutation.isPending}
          />
          <TouchableOpacity 
            style={styles.eyeIconButton} 
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.udemyFormFieldWrapper}>
          <TextInput 
            style={[
              styles.udemyStyleInputFieldField, 
              isFocusedExp ? styles.udemyStyleInputFieldFieldFocused : styles.udemyStyleInputFieldFieldUnfocused
            ]} 
            placeholder="Primary Area of Expertise / Headline" 
            placeholderTextColor="#6A6F73"
            value={expertise} 
            onChangeText={setExpertise} 
            onFocus={() => setIsFocusedExp(true)}
            onBlur={() => setIsFocusedExp(false)}
            editable={!instructorMutation.isPending}
          />
        </View>

        <View style={styles.udemyFormFieldWrapper}>
          <TextInput 
            style={[
              styles.udemyStyleInputFieldField, 
              isFocusedBio ? styles.udemyStyleInputFieldFieldFocused : styles.udemyStyleInputFieldFieldUnfocused,
              { height: 90, paddingTop: 12 }
            ]} 
            placeholder="Brief Professional Biography..." 
            placeholderTextColor="#6A6F73"
            value={bio} 
            onChangeText={setBio} 
            onFocus={() => setIsFocusedBio(true)}
            onBlur={() => setIsFocusedBio(false)}
            multiline
            numberOfLines={4}
            editable={!instructorMutation.isPending}
          />
        </View>

        <TouchableOpacity 
          style={[styles.udemySolidPrimaryButtonNode, instructorMutation.isPending && { opacity: 0.7 }]} 
          onPress={executeInstructorRegistrationSubmissionPipeline}
          disabled={instructorMutation.isPending}
        >
          {instructorMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.udemySolidPrimaryButtonNodeText}>Submit Instructor Application</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  navbarHeader: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 8 },
  closeButtonAction: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeActionIconText: { fontSize: 20, color: '#1C1D1F', fontWeight: '300' },
  navbarTitleTextText: { fontSize: 15, fontWeight: '700', color: '#1C1D1F' },
  innerLayoutBodyFrame: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 60 },
  udemyStyleMainTitle: { fontSize: 20, fontWeight: '800', color: '#1C1D1F', letterSpacing: -0.3, marginBottom: 4 },
  instructorSubtextHeaderLabel: { fontSize: 13, color: '#6A6F73', lineHeight: 18, marginBottom: 28 },
  udemyFormFieldWrapper: { marginBottom: 14 },
  udemyStyleInputFieldField: { height: 50, paddingHorizontal: 14, fontSize: 15, color: '#1C1D1F', backgroundColor: '#FFFFFF', borderRadius: 8 },
  udemyStyleInputFieldFieldUnfocused: { borderWidth: 1, borderColor: '#1C1D1F', borderRadius: 8 },
  udemyStyleInputFieldFieldFocused: { borderColor: '#4f46e5', borderWidth: 2, borderRadius: 8 },
  
  // NEW: Row containment layout styles for eye element alignment
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