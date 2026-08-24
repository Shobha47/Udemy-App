import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Smooth status/notch management

export default function AboutUsScreen({ navigation }: any) {
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
          <Text style={styles.headerTitle}>About Us</Text>
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

        <Text style={styles.sectionHeadingTitleText}>Why Choose Smart Skills India?</Text>

        {/* Feature Row 1 */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>✓</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Tailored Brilliance</Text>
            <Text style={styles.featureBodyParagraph}>Our core capability lies in crafting customized educational resources that fit your specific curriculum criteria and institutional goals perfectly.</Text>
          </View>
        </View>

        {/* Feature Row 2 */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>✓</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Excellence in Every Page</Text>
            <Text style={styles.featureBodyParagraph}>Immerse your learners in top-notch quality. Our rigorous standards ensure every print asset surpasses standard marketplace benchmarks.</Text>
          </View>
        </View>

        {/* Feature Row 3 */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>✓</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Brand Harmony</Text>
            <Text style={styles.featureBodyParagraph}>Watch your brand take center stage on every asset. It transitions standard reading items into an executive institutional journey.</Text>
          </View>
        </View>

        {/* Feature Row 4 */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>✓</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Flexibility Redefined</Text>
            <Text style={styles.featureBodyParagraph}>Embrace the efficiency of on-demand printing workflows. Order materials matching your exact real-time numbers, completely eliminating excess overhead wastes.</Text>
          </View>
        </View>

        {/* Feature Row 5 */}
        <View style={styles.featureRowItem}>
          <View style={styles.bulletIndicator}>
            <Text style={styles.bulletText}>✓</Text>
          </View>
          <View style={styles.featureTextBox}>
            <Text style={styles.featureTitleLabel}>Dedicated Support Systems</Text>
            <Text style={styles.featureBodyParagraph}>Our corporate team guides you across every stage of generation. From digital content composition adjustments down to physical distribution logistics.</Text>
          </View>
        </View>

        {/* Premium Solid Footer Callout Block */}
        <View style={styles.summaryFooterBox}>
          <Text style={styles.summaryFooterParagraphText}>
            SmartSkills India serves as your strategic partner in crafting high-impact educational frameworks that balance aesthetic appeal with deep pedagogical effectiveness. Join us in curating custom-tailored environments that elevate your institutional vision.
          </Text>
          <View style={styles.solidCtaButton}>
            <Text style={styles.solidCtaButtonText}>Attractiveness Meets Effectiveness</Text>
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
  accentLine: { width: 40, height: 4, backgroundColor: '#4F46E5' }, // Udemy Signature Accent Line

  paragraphDescriptionText: { fontSize: 14, color: '#1C1D1F', lineHeight: 22, marginBottom: 32 },
  sectionHeadingTitleText: { fontSize: 18, fontWeight: '800', color: '#1C1D1F', marginBottom: 24, letterSpacing: -0.3 },
  
  // Flat Udemy-Style Feature Layout list
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
  bulletText: { color: '#4F46E5', fontSize: 12, fontWeight: '700' },
  footerCheckText: { color: '#4F46E5', fontSize: 14, fontWeight: '700' },
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