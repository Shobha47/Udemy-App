import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// CONNECTED: Imports clear implementation hook definitions 
import { useCartStore } from '../../store/cartStore';

import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import { apiClient } from '../../api/client';

export default function CheckoutScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const clearCart = useCartStore((state) => state.clearAll);

  // Safely capture parameters parsed from parent cart view configurations
  const { orderTotal = 798 } = route.params || {};
  const [paymentGateway, setPaymentGateway] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  // const handleOrderCompletion = () => {
  //   setIsProcessing(true);
    
  //   setTimeout(() => {
  //     setIsProcessing(false);
  //     // TRANSACTION CLEANUP ACTION: Wipe active cart rows on success
  //     clearCart();
  //     alert('Payment Confirmed! Your courses are now unlocked in your profile.');
  //     navigation.popToTop();
  //   }, 2000);
  // };


  const handleOrderCompletion = async () => {
    try {
      setIsProcessing(true);

      console.log("course id:", route?.params?.courseId, route?.params)
      const courseId = route?.params?.courseId || null;

      // 1. Create order from backend
      const { data } = await apiClient.post(`/payments/checkout/${courseId}`);

      // FREE COURSE FLOW
      if (data.data.type === 'free') {
        clearCart();
        alert('Free course unlocked!');
        navigation.navigate('LearnScreen', { courseId });
        return;
      }

      // 2. Razorpay options
      const options = {
        description: data.data.courseName,
        image: data.data.courseImage,
        currency: data.data.currency,
        key: data.data.razorpayKeyId,
        amount: data.data.amount,
        name: 'Smart Skills India',
        order_id: data.data.razorpayOrderId,
        prefill: {
          email: data.data.studentEmail,
          name: data.data.studentName,
        },
        theme: { color: '#4F46E5' },
      };

      // 3. Open Razorpay
      const paymentData = await RazorpayCheckout.open(options);

      // 4. Verify payment with backend
      await apiClient.post('/payments/verify', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        dbOrderId: data.data.dbOrderId,
      });

      // 5. Success flow
      clearCart();
      alert('Payment successful! Course unlocked.');

      navigation.replace('LearnScreen', {
        courseId,
      });

    } catch (error: any) {
      console.error(error);

      if (error?.description === 'Payment Cancelled') {
        alert('Payment cancelled');
      } else {
        alert('Payment failed. Please try again.');
      }

    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContext, { paddingBottom: 100 + insets.bottom }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* ORDER REVIEW SUB-SECTION */}
        <View style={styles.flatSection}>
          <Text style={styles.sectionTitle}>Summary Statement</Text>
          <View style={styles.invoiceItemRow}>
            <Text style={styles.invoiceLabel}>Subtotal Package Cost</Text>
            <Text style={styles.invoiceValue}>₹{orderTotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.invoiceItemRow}>
            <Text style={styles.invoiceLabel}>Taxes & Fees (GST)</Text>
            <Text style={styles.invoiceValue}>₹0.00</Text>
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.invoiceItemRow}>
            <Text style={styles.grandTotalLabel}>Total Amount Due</Text>
            <Text style={styles.grandTotalValue}>₹{orderTotal.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* PAYMENT GATEWAY OPTION GRID */}
        <View style={styles.flatSection}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          <TouchableOpacity style={[styles.gatewayCard, paymentGateway === 'upi' && styles.gatewayCardActive]} onPress={() => setPaymentGateway('upi')}>
            <Ionicons name="flash-outline" size={20} color={paymentGateway === 'upi' ? '#4F46E5' : '#64748B'} />
            <View style={styles.gatewayMeta}>
              <Text style={styles.gatewayName}>Instant UPI Integration</Text>
              <Text style={styles.gatewayDescription}>Pay via PhonePe, GooglePay, or any secure VPA application.</Text>
            </View>
            <View style={[styles.radioCircle, paymentGateway === 'upi' && styles.radioCircleActive]} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.gatewayCard, paymentGateway === 'card' && styles.gatewayCardActive]} onPress={() => setPaymentGateway('card')}>
            <Ionicons name="card-outline" size={20} color={paymentGateway === 'card' ? '#4F46E5' : '#64748B'} />
            <View style={styles.gatewayMeta}>
              <Text style={styles.gatewayName}>Credit / Debit Cards</Text>
              <Text style={styles.gatewayDescription}>All major domestic and international card types supported.</Text>
            </View>
            <View style={[styles.radioCircle, paymentGateway === 'card' && styles.radioCircleActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.securityTrustRow}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.securityTrustText}>256-Bit SSL Encryption Protected Infrastructure.</Text>
        </View>
      </ScrollView>

      {/* FINAL COMMIT PANEL */}
      <View style={[styles.commitButtonWrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.payCommitButton} disabled={isProcessing} onPress={handleOrderCompletion}>
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.payCommitButtonText}>Complete Secure Order (₹{orderTotal.toLocaleString('en-IN')})</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backButton: { padding: 2 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  scrollContext: { paddingVertical: 12 },
  flatSection: { paddingHorizontal: 16, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 16, letterSpacing: -0.2 },
  invoiceItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  invoiceLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  invoiceValue: { fontSize: 13, color: '#0F172A', fontWeight: '600' },
  dividerLine: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  grandTotalLabel: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  grandTotalValue: { fontSize: 17, color: '#0F172A', fontWeight: '800' },
  gatewayCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, marginBottom: 12 },
  gatewayCardActive: { borderColor: '#4F46E5', backgroundColor: '#F5F3FF' },
  gatewayMeta: { flex: 1, marginLeft: 12, paddingRight: 8 },
  gatewayName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  gatewayDescription: { fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 },
  radioCircle: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' },
  radioCircleActive: { borderColor: '#4F46E5', borderWidth: 5 },
  securityTrustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingHorizontal: 16 },
  securityTrustText: { fontSize: 12, color: '#64748B', marginLeft: 6, fontWeight: '500' },
  commitButtonWrapper: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  payCommitButton: { backgroundColor: '#4F46E5', height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  payCommitButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});