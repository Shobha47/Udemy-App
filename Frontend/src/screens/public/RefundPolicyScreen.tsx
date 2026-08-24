import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RefundPolicyScreen({ navigation }: any) {
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
          <Text style={styles.headerTitle}>Refund Policy</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {/* Legal Hero Callout */}
        <View style={styles.heroSection}>
          <Text style={styles.brandTitleText}>SmartSkills India</Text>
          <Text style={styles.brandTaglineText}>Returns and Capital Reimbursement</Text>
          <View style={styles.accentLine} />
        </View>

        <Text style={styles.paragraphDescriptionText}>
          Thank you for shopping with SmartSkills India. We want to ensure you have a transparent, high-fidelity experience with our educational print configurations and digital assets.
        </Text>

        {/* Section 1: Overview */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>1</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Overview</Text>
            <Text style={styles.featureBodyParagraph}>If you are not entirely satisfied with your transaction or custom structural order, our client service division is standing by to resolve your processing issues immediately.</Text>
          </View>
        </View>

        {/* Section 2: Eligibility for Refund */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>2</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Eligibility for Refund</Text>
            <Text style={styles.featureBodyParagraph}>To successfully qualify for capital balance reimbursement, the following core system conditions must be verified:</Text>
            <View style={styles.nestedListBlock}>
              <Text style={styles.nestedListItemText}>• Refund requests must be logged within 30 days of the original purchase timestamp.</Text>
              <Text style={styles.nestedListItemText}>• The item must be completely unused and preserve its original delivery state.</Text>
              <Text style={styles.nestedListItemText}>• The physical or digital asset must remain enclosed inside its original protective packaging layers.</Text>
            </View>
          </View>
        </View>

        {/* Section 3: Refund Process */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>3</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Refund Process</Text>
            <Text style={styles.featureBodyParagraph}>To request an active reimbursement verification, contact our service team at <Text style={styles.inlineEmailText}>customerservice@smartskillsindia.com</Text> providing your order verification details, transaction ID, and clear logical grounds for the refund request.</Text>
          </View>
        </View>

        {/* Section 4: Refund Timeframe */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>4</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Refund Timeframe</Text>
            <Text style={styles.featureBodyParagraph}>Following secure delivery receipt and auditing verification of your assets, we will notify you of transaction acceptance. Approved returns map automatically back onto the source bank card or gateway engine within 7 to 10 processing days.</Text>
          </View>
        </View>

        {/* Section 5: Non-Refundable Items */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>5</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Non-Refundable Items</Text>
            <Text style={styles.featureBodyParagraph}>Certain platform parameters are non-refundable, including custom institutionally branded print batches, activated code courses, or downloadable digital file structures.</Text>
          </View>
        </View>

        {/* Premium Solid Footer Callout Block */}
        <View style={styles.summaryFooterBox}>
          <Text style={styles.summaryFooterParagraphText}>
            For further queries regarding global checkout parameters, secure billing nodes, or order cancellations, please consult our primary legal infrastructure desk.
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
  inlineEmailText: { color: '#4F46E5', fontWeight: '700' },
  
  // Nested List Block
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