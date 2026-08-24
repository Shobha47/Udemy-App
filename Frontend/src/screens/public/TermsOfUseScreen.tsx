import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfUseScreen({ navigation }: any) {
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
          <Text style={styles.headerTitle}>Terms of Use</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {/* Legal Hero Callout */}
        <View style={styles.heroSection}>
          <Text style={styles.brandTitleText}>SmartSkills India</Text>
          <Text style={styles.brandTaglineText}>Terms and Conditions of Use</Text>
          <View style={styles.accentLine} />
        </View>

        <Text style={styles.paragraphDescriptionText}>
          Please read these terms carefully before accessing or using our platform infrastructure. By interacting with our digital ecosystem, you acknowledge your baseline acceptance of these global governance policies.
        </Text>

        {/* Section 1: Acceptance of Terms */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>1</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Acceptance of Terms</Text>
            <Text style={styles.featureBodyParagraph}>By accessing or using SmartSkills India's website, you agree to comply with and be bound by these Terms of Use. If you do not agree with these terms, please do not use our website.</Text>
          </View>
        </View>

        {/* Section 2: Use License */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>2</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Use License</Text>
            <Text style={styles.featureBodyParagraph}>Permission is granted to temporarily download one copy of the materials on SmartSkills India's website for personal, non-commercial transitory viewing only. Under this license, you may not:</Text>
            <View style={styles.nestedListBlock}>
              <Text style={styles.nestedListItemText}>• Modify or copy the platform materials</Text>
              <Text style={styles.nestedListItemText}>• Use the materials for any commercial purpose or public display</Text>
              <Text style={styles.nestedListItemText}>• Attempt to decompile or reverse engineer any software codebase</Text>
              <Text style={styles.nestedListItemText}>• Remove any copyright or other proprietary notations</Text>
              <Text style={styles.nestedListItemText}>• Transfer materials to another person or "mirror" the assets</Text>
            </View>
          </View>
        </View>

        {/* Section 3: Disclaimer */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>3</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Disclaimer</Text>
            <Text style={styles.featureBodyParagraph}>The materials on SmartSkills India's website are provided on an 'as is' basis. SmartSkills India makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</Text>
          </View>
        </View>

        {/* Section 4: Limitations */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>4</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Limitations of Liability</Text>
            <Text style={styles.featureBodyParagraph}>In no event shall SmartSkills India or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the platform assets.</Text>
          </View>
        </View>

        {/* Section 5: Revisions and Errata */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>5</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Revisions and Errata</Text>
            <Text style={styles.featureBodyParagraph}>The materials appearing on SmartSkills India's website may include technical, typographical, or photographic errors. SmartSkills India does not warrant that any of the materials on its website are accurate, complete, or current.</Text>
          </View>
        </View>

        {/* Section 6: Governing Law */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>6</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Governing Law</Text>
            <Text style={styles.featureBodyParagraph}>These terms and conditions are governed by and construed in accordance with local jurisdictional laws, and you irrevocably submit to the exclusive jurisdiction of the state courts in that specific location.</Text>
          </View>
        </View>

        {/* Premium Solid Footer Callout Block */}
        <View style={styles.summaryFooterBox}>
          <Text style={styles.summaryFooterParagraphText}>
            For further inquiries regarding our structural terms, platform parameters, or data compliance issues, reach out to our legal support desk at any time.
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