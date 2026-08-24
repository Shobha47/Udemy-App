import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen({ navigation }: any) {
  const insets = useSafeAreaInsets(); // NEW: Hook initialized
  
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[
          styles.scrollBody, 
          { paddingBottom: Math.max(insets.bottom, 24) } 
        ]}
         showsVerticalScrollIndicator={false}
      >
        
        {/* Legal Hero Callout */}
        <View style={styles.heroSection}>
          <Text style={styles.brandTitleText}>SmartSkills India</Text>
          <Text style={styles.brandTaglineText}>User Privacy and Data Protection</Text>
          <View style={styles.accentLine} />
        </View>

        <Text style={styles.paragraphDescriptionText}>
          This policy outlines how SmartSkills India collects, uses, discloses, and protects your operational information when you interact with our professional digital ecosystem services.
        </Text>

        {/* Section 1: Introduction */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>1</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Introduction</Text>
            <Text style={styles.featureBodyParagraph}>Welcome to SmartSkills India's Privacy Policy. This documentation sets forth our transparent data handling principles when you access our system layers, apps, or print customization features.</Text>
          </View>
        </View>

        {/* Section 2: Information We Collect */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>2</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Information We Collect</Text>
            <Text style={styles.featureBodyParagraph}>We may collect personal informational vectors such as user names, institutional contact matrices, structural emails, and other relevant details required to cleanly process your customized educational pathways.</Text>
          </View>
        </View>

        {/* Section 3: How We Use Your Information */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>3</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>How We Use Your Information</Text>
            <Text style={styles.featureBodyParagraph}>We use the collected parameters to optimize and refine our instructional delivery services. This encompasses communications, personal telemetry adjustments, content configuration mapping, and dashboard profile optimization checks.</Text>
          </View>
        </View>

        {/* Section 4: Information Sharing */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>4</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Information Sharing</Text>
            <Text style={styles.featureBodyParagraph}>We do not sell, trade, or transfer your personal profile matrices to outside third-party marketplaces. This policy strictly excludes trusted system operation vendors who assist us in managing data infrastructure, provided they maintain complete information confidentiality rules.</Text>
          </View>
        </View>

        {/* Section 5: Security */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>5</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Security Standards</Text>
            <Text style={styles.featureBodyParagraph}>We establish reasonable hardware protection measures to shelter your records. However, because no internet transmission vector can claim absolute invulnerability, we cannot guarantee completely unbreachable security bounds.</Text>
          </View>
        </View>

        {/* Section 6: Changes to This Privacy Policy */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>6</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Changes to This Privacy Policy</Text>
            <Text style={styles.featureBodyParagraph}>We reserve the right to revise our user privacy structures periodically. We will transparently announce structural revisions by processing and rendering updated documentation layers directly onto this specific view.</Text>
          </View>
        </View>

        {/* Premium Solid Footer Callout Block */}
        <View style={styles.summaryFooterBox}>
          <Text style={styles.summaryFooterParagraphText}>
            For inquiries regarding database profile records, erasure requests, or internal compliance data architectures, contact our data protection officer directly.
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

  // scrollBody: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 60 },
  scrollBody: { paddingHorizontal: 24, paddingTop: 32 },
  
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