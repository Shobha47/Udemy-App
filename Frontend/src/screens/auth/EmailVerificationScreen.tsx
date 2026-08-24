import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

export default function EmailVerificationScreen({
  route,
  navigation,
}: any) {
  const { email } = route.params;

  const [otp, setOtp] = useState('');

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(
        '/auth/verify-email-otp',
        {
          email,
          otp,
        }
      );

      return response.data;
    },

    onSuccess: () => {
      Alert.alert(
        'Success',
        'Email verified successfully.',
        [
          {
            text: 'Login',
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
      Alert.alert(
        'Verification Failed',
        error?.response?.data?.message ||
          'Invalid OTP'
      );
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(
        '/auth/resend-otp',
        {
          email,
        }
      );

      return response.data;
    },

    onSuccess: (data) => {
      Alert.alert('Success', data.message);
    },

    onError: (error: any) => {
      Alert.alert(
        'Failed',
        error?.response?.data?.message
      );
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Verify Your Email
        </Text>

        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to
        </Text>

        <Text style={styles.email}>
          {email}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => verifyMutation.mutate()}
          disabled={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Verify Email
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => resendMutation.mutate()}
          disabled={resendMutation.isPending}
        >
          <Text style={styles.resend}>
            {resendMutation.isPending
              ? 'Sending...'
              : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',
    marginTop: 12,
    color: '#666',
  },

  email: {
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
    marginBottom: 30,
  },

  // input: {
  //   borderWidth: 1,
  //   borderColor: '#ddd',
  //   height: 54,
  //   borderRadius: 8,
  //   paddingHorizontal: 16,
  //   fontSize: 20,
  //   textAlign: 'center',
  //   letterSpacing: 8,
  // },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    height: 54,
    borderRadius: 8,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 8,
    // FIX: Offsets trailing spacing bounds to keep code text perfectly centered
    paddingLeft: 8, 
    color: '#1E1B4B',
    backgroundColor: '#F8FAFC',
  },

  button: {
    backgroundColor: '#4f46e5',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  resend: {
    textAlign: 'center',
    marginTop: 20,
    color: '#4f46e5',
    fontWeight: '600',
  },
});