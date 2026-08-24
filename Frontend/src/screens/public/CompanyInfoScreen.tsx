import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompanyInfoScreen({ navigation }: any) {
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
          <Text style={styles.headerTitle}>Company Info</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {/* Brand Hero Callout */}
        <View style={styles.heroSection}>
          <Text style={styles.brandTitleText}>Smart Skills India</Text>
          <Text style={styles.brandTaglineText}>Where Learning Meets Innovation</Text>
          <View style={styles.accentLine} />
        </View>

        <Text style={styles.paragraphDescriptionText}>
          Embark on a journey of educational excellence with Smart Skills India, your go-to source for captivating and customized print materials for schools and institutions. We seamlessly weave your institution's identity into every book and study material, creating an immersive, high-fidelity branded learning experience.
        </Text>

        <Text style={styles.sectionHeadingTitleText}>Corporate Touchpoints</Text>

        {/* Corporate Detail Row 1: Address */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>📍</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Registered Office Address</Text>
            <Text style={styles.featureBodyParagraph}>
              33/A 2nd Floor, Gami Industrial Park,{'\n'}
              Pawne Center, TTC Industrial Area,{'\n'}
              Navi Mumbai, Maharashtra, India
            </Text>
          </View>
        </View>

        {/* Corporate Detail Row 2: Phone */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>📞</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Corporate Hotlines</Text>
            <Text style={styles.featureBodyParagraph}>
              +91 98677 45266{'\n'}
              +91 77381 84456
            </Text>
            <Text style={styles.helperTimingText}>Available Monday – Saturday: 10:00 AM to 6:30 PM IST</Text>
          </View>
        </View>

        {/* Corporate Detail Row 3: Email */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>✉️</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Electronic Mail Node</Text>
            <Text style={styles.emailHighlight}>
              info@smartskillsindia.com
            </Text>
          </View>
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
  sectionHeadingTitleText: { fontSize: 18, fontWeight: '800', color: '#1C1D1F', marginBottom: 24, letterSpacing: -0.3 },
  
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
    width: 32, 
    height: 32, 
    borderRadius: 6, 
    backgroundColor: '#F7F9FA', 
    borderWidth: 1,
    borderColor: '#D1D7DC',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 2 
  },
  bulletText: { fontSize: 16 },
  featureTextBox: { flex: 1, marginLeft: 16 },
  featureTitleLabel: { fontSize: 15, fontWeight: '700', color: '#1C1D1F' },
  featureBodyParagraph: { fontSize: 14, color: '#6A6F73', lineHeight: 22, marginTop: 6, fontWeight: '500' },
  emailHighlight: { color: '#4F46E5', fontWeight: '700' },
  helperTimingText: { fontSize: 11, color: '#94A3B8', marginTop: 6, fontWeight: '600' },
  
  // Premium Footer Summary Content
  summaryFooterBox: { 
    marginTop: 16, 
    backgroundColor: '#F7F9FA', 
    padding: 20, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D7DC'
  },
  summaryFooterParagraphText: { fontSize: 13, color: '#6A6F73', lineHeight: 20, marginBottom: 16 },
  solidCtaButton: {
    backgroundColor: '#1C1D1F',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4
  },
  solidCtaButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3
  }
});