import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Enable LayoutAnimation for Android smooth layout transactions
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PaymentPolicyScreen({ navigation }: any) {
  // Track open state of individual accordion items by ID strings
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    emi: false,
    cod: false,
  });

  const toggleAccordion = (itemKey: string) => {
    // Configure premium-grade swift spring transition curve
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

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
          <Text style={styles.headerTitle}>FAQ</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {/* Legal Hero Callout */}
        <View style={styles.heroSection}>
          <Text style={styles.brandTitleText}>SmartSkills India</Text>
          <Text style={styles.brandTaglineText}>Frequently Asked Questions</Text>
          <View style={styles.accentLine} />
        </View>

        <Text style={styles.paragraphDescriptionText}>
          Find immediate answers regarding transactional billing flows, payment processing structures, and physical product fulfillment distribution parameters.
        </Text>

        {/* ─── FAQ ITEM 1: EMI OPTIONS ─── */}
        <View style={styles.faqAccordionContainer}>
          <TouchableOpacity 
            style={styles.faqHeaderRowButton}
            activeOpacity={0.7}
            onPress={() => toggleAccordion('emi')}
          >
            <View style={styles.bulletIndicator}>
              <Text style={styles.bulletText}>?</Text>
            </View>
            <Text style={styles.featureTitleLabel}>What is an EMI payment option?</Text>
            <Text style={styles.chevronIndicatorText}>
              {expandedItems.emi ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {expandedItems.emi && (
            <View style={styles.faqDropdownContentBlock}>
              <Text style={styles.featureBodyParagraph}>
                The EMI or Equated Monthly Instalment payment option allows you to pay for your orders in easy monthly installments, provided you have a card from a partner bank. For details, including terms and condition, please click here.
              </Text>
            </View>
          )}
        </View>

        {/* ─── FAQ ITEM 2: COD FRAMEWORK ─── */}
        <View style={styles.faqAccordionContainer}>
          <TouchableOpacity 
            style={styles.faqHeaderRowButton}
            activeOpacity={0.7}
            onPress={() => toggleAccordion('cod')}
          >
            <View style={styles.bulletIndicator}>
              <Text style={styles.bulletText}>?</Text>
            </View>
            <Text style={styles.featureTitleLabel}>How does the COD payment option work?</Text>
            <Text style={styles.chevronIndicatorText}>
              {expandedItems.cod ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {expandedItems.cod && (
            <View style={styles.faqDropdownContentBlock}>
              <Text style={styles.featureBodyParagraph}>
                While making your purchase, select the Cash on Delivery payment option; you can then pay in cash when our logistics partner delivers your order to you.
              </Text>
              <View style={styles.nestedListBlock}>
                <Text style={styles.nestedListItemText}>• Available exclusively across authorized postal codes and verified PIN zones.</Text>
                <Text style={styles.nestedListItemText}>• Liquid physical currency must be present at the exact time of delivery handover.</Text>
              </View>
            </View>
          )}
        </View>

        {/* Premium Solid Footer Callout Block */}
        <View style={styles.summaryFooterBox}>
          <Text style={styles.summaryFooterParagraphText}>
            Can't find the answers you need regarding custom institutional publishing runs or financial clearances? Contact our specialized helpdesk support module.
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
  
  // Interactive Flat Accordion Structural Setup
  faqAccordionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
    paddingBottom: 16,
  },
  faqHeaderRowButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
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
  },
  bulletText: { color: '#4F46E5', fontSize: 13, fontWeight: '800' },
  featureTitleLabel: { fontSize: 15, fontWeight: '700', color: '#1C1D1F', flex: 1, marginLeft: 16, paddingRight: 12 },
  chevronIndicatorText: { fontSize: 11, fontWeight: '700', color: '#6A6F73' },
  
  // Collapsible Dropdown Content Boxing Styles
  faqDropdownContentBlock: {
    paddingLeft: 40,
    paddingTop: 12,
  },
  featureBodyParagraph: { fontSize: 13, color: '#6A6F73', lineHeight: 19 },
  
  // Nested List Block
  nestedListBlock: {
    marginTop: 10,
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