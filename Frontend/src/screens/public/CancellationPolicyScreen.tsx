import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CancellationPolicyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}  edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Premium Flat Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cancellation Policy</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {/* Legal Hero Callout */}
        <View style={styles.heroSection}>
          <Text style={styles.brandTitleText}>SmartSkills India</Text>
          <Text style={styles.brandTaglineText}>Order Revocation & Commitment Terms</Text>
          <View style={styles.accentLine} />
        </View>

        <Text style={styles.paragraphDescriptionText}>
          This documentation outlines the structural conditions, fees, and operational framework governing order cancellations across all custom manufacturing, publishing, and digital service setups.
        </Text>

        {/* Section 1: Standard Order Revocation Rule */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>1</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Order Cancellation Clause</Text>
            <Text style={styles.featureBodyParagraph}>
              If any order placed by Customer and accepted by SmartSkills India (SSI) is canceled, the Customer must pay reasonable cancellation charges.
            </Text>
          </View>
        </View>

        {/* Section 2: Charge Allocations & Non-Recoverable Commitments */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>2</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Non-Recoverable Resource Commitments</Text>
            <Text style={styles.featureBodyParagraph}>
              Cancellation charges will strictly incorporate all non-recoverable costs and commitments incurred by SSI. This includes, but is not limited to:
            </Text>
            <View style={styles.nestedListBlock}>
              <Text style={styles.nestedListItemText}>• Custom typography composition and template design work</Text>
              <Text style={styles.nestedListItemText}>• Secure raw materials, paper stock, and printing plates allocated explicitly to your order</Text>
              <Text style={styles.nestedListItemText}>• Dedicated labor, binding scheduling, and manufacturing blocks assigned inside our production units</Text>
            </View>
          </View>
        </View>

        {/* Section 3: Notice Timeline Parameters */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>3</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Notice Effective Window</Text>
            <Text style={styles.featureBodyParagraph}>
              Accumulating liabilities are explicitly calculated from the precise time of initial order placement up until the exact calendar date of written notice of cancellation received by SSI management.
            </Text>
          </View>
        </View>

        {/* Premium Solid Footer Callout Block */}
        <View style={styles.summaryFooterBox}>
          <Text style={styles.summaryFooterParagraphText}>
            To file a formal contract cancellation or request an audit of your order pipeline liabilities, reach out to our accounts department.
          </Text>
          <TouchableOpacity 
            style={styles.solidCtaButton}
            activeOpacity={0.8}
            onPress={() => alert('Mail terminal initialized for info@smartskillsindia.com')}
          >
            <Text style={styles.solidCtaButtonText}>Contact Us: info@smartskillsindia.com</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  
  // Udemy Header Navigation Matrix
  headerContainer: { 
    paddingHorizontal: 24, 
    height: 60,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16, paddingVertical: 4 },
  backIcon: { fontSize: 24, fontWeight: '300', color: '#1C1D1F' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1C1D1F' },

  scrollBody: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 60 },
  
  // Hero Section
  heroSection: { marginBottom: 20 },
  brandTitleText: { fontSize: 26, fontWeight: '800', color: '#1C1D1F', letterSpacing: -0.5 },
  brandTaglineText: { fontSize: 13, fontWeight: '600', color: '#6A6F73', marginTop: 4, marginBottom: 12 },
  accentLine: { width: 40, height: 4, backgroundColor: '#4F46E5' }, 

  paragraphDescriptionText: { fontSize: 14, color: '#1C1D1F', lineHeight: 22, marginBottom: 32 },
  
  // Flat Udemy-Style List Setup
  featureRowItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  bulletIndicator: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: '#F7F9FA', 
    borderWidth: 1,
    borderColor: '#4F46E5',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 2 
  },
  bulletText: { color: '#4F46E5', fontSize: 11, fontWeight: '800' },
  featureTextBox: { flex: 1, marginLeft: 16 },
  featureTitleLabel: { fontSize: 15, fontWeight: '700', color: '#1C1D1F' },
  featureBodyParagraph: { fontSize: 13, color: '#6A6F73', lineHeight: 19, marginTop: 4 },
  
  // Nested Use License Bullet Parameters Styles
  nestedListBlock: {
    marginTop: 8,
    backgroundColor: '#F7F9FA',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6
  },
  nestedListItemText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '500'
  },

  // Premium Footer Summary Content
  summaryFooterBox: { 
    marginTop: 16, 
    backgroundColor: '#F7F9FA', 
    padding: 20, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D7DC'
  },
  summaryFooterParagraphText: { fontSize: 13, color: '#6A6F73', lineHeight: 20, marginBottom: 16 },
  solidCtaButton: {
    backgroundColor: '#4F46E5',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  solidCtaButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3
  }
});