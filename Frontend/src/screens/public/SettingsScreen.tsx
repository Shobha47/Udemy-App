import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthMock } from '../../navigation/RootNavigator'; // Adjust import path structure based on file tree
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuthMock();

  return (
    <SafeAreaView style={styles.safeArea}  edges={['top']}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {user ? (
          /* Logged In Template State Workspace view */
          <View>
            <View style={styles.profileHeroCard}>
              <View style={styles.avatarPlaceholderPill}>
                <Text style={styles.avatarTextLabel}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.profileNameText}>{user.name}</Text>
              <Text style={styles.profileEmailText}>{user.email}</Text>
              <View style={[styles.roleBadgeFrame, user.role === 'admin' ? styles.badgeAdmin : user.role === 'instructor' ? styles.badgeInstructor : styles.badgeStudent]}>
                <Text style={styles.roleBadgeText}>{user.role.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.settingsActionSectionGroup}>
              <Text style={styles.sectionHeaderLabel}>Account Actions</Text>
              <TouchableOpacity style={styles.actionItemRowButton}>
                <Text style={styles.actionItemButtonTextText}>Edit Profile Parameters</Text>
                <Text style={styles.actionItemChevronMarker}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItemRowButton}>
                <Text style={styles.actionItemButtonTextText}>My Academic History Matrix</Text>
                <Text style={styles.actionItemChevronMarker}>›</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutSystemActionActionButton} 
            onPress={async () => {
              await logout();
            }}>
              <Text style={styles.logoutSystemActionActionButtonText}>Sign Out Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          
        <View>
          <View style={styles.ctaBanner}>
            <View style={styles.ctaDecorationCircle1} />
            <View style={styles.ctaDecorationCircle} />
            <Text style={styles.ctaTitle}>Become a Creative Instructor</Text>
            <Text style={styles.ctaDescription}>Deploy your expertise globally. Draft courses, manage curriculums, and secure royalty tracking.</Text>
          </View>

          
            <View style={styles.anonymousWrapperCardBox}>
              <View style={styles.anonymousGraphicMarker}><Text style={{fontSize: 44}}>🔒</Text></View>
              <Text style={styles.anonymousTitleHeader}>Unlock Full Access Track</Text>
              <Text style={styles.anonymousSubParagraph}>Create a professional portfolio profile node or login to save your dashboard courses, check certificate status codes, and converse with certified instructors.</Text>
              
              <View style={styles.authControlActionsButtonGroup}>
                <TouchableOpacity style={styles.primaryAuthButtonNode} onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.primaryAuthButtonNodeText}>Login to Workspace</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.secondaryAuthButtonNode} onPress={() => navigation.navigate('AuthGate')}>
                  <Text style={styles.secondaryAuthButtonNodeText}>Create New Account Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ─── PUBLIC ACCESSIBLE LEGAL POLICIES SECTION ─── */}
        <View style={[styles.settingsActionSectionGroup, { marginTop: 12 }]}>
          <Text style={styles.sectionHeaderLabel}>Legal & Documentation</Text>
          
          <TouchableOpacity 
            style={styles.actionItemRowButton} 
            onPress={() => navigation.navigate('CompanyInfo')}
          >
            <Text style={styles.actionItemButtonTextText}>Company Info</Text>
            <Text style={styles.actionItemChevronMarker}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItemRowButton} 
            onPress={() => navigation.navigate('AboutUs')}
          >
            <Text style={styles.actionItemButtonTextText}>About Smart Skills India</Text>
            <Text style={styles.actionItemChevronMarker}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItemRowButton} onPress={() => navigation.navigate('TermsOfUse')}>
            <Text style={styles.actionItemButtonTextText}>Terms Of Use</Text>
            <Text style={styles.actionItemChevronMarker}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItemRowButton} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.actionItemButtonTextText}>Privacy Policy</Text>
            <Text style={styles.actionItemChevronMarker}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItemRowButton} onPress={() => navigation.navigate('RefundReturnPolicy')}>
            <Text style={styles.actionItemButtonTextText}>Refund Return Policy</Text>
            <Text style={styles.actionItemChevronMarker}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItemRowButton} onPress={() => navigation.navigate('CancellationPolicy')}>
            <Text style={styles.actionItemButtonTextText}>Cancellation Policy</Text>
            <Text style={styles.actionItemChevronMarker}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItemRowButton} onPress={() => navigation.navigate('PaymentPolicy')}>
            <Text style={styles.actionItemButtonTextText}>Payments</Text>
            <Text style={styles.actionItemChevronMarker}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { height: 56, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  scrollBody: { padding: 16 },
  profileHeroCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  avatarPlaceholderPill: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarTextLabel: { fontSize: 24, fontWeight: '800', color: '#4F46E5' },
  profileNameText: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  profileEmailText: { fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 12 },
  roleBadgeFrame: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeAdmin: { backgroundColor: '#FEE2E2' },
  badgeInstructor: { backgroundColor: '#E0F2FE' },
  badgeStudent: { backgroundColor: '#D1FAE5' },
  roleBadgeText: { fontSize: 10, fontWeight: '800', color: '#1E293B' },
  settingsActionSectionGroup: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', marginBottom: 24 },
  sectionHeaderLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  actionItemRowButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionItemButtonTextText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  actionItemChevronMarker: { fontSize: 18, color: '#94A3B8' },
  logoutSystemActionActionButton: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#FCA5A5', paddingVertical: 14, alignItems: 'center' },
  logoutSystemActionActionButtonText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  anonymousWrapperCardBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 },
  anonymousGraphicMarker: { marginBottom: 16 },
  anonymousTitleHeader: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  anonymousSubParagraph: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  authControlActionsButtonGroup: { width: '100%' },
  primaryAuthButtonNode: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  primaryAuthButtonNodeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryAuthButtonNode: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryAuthButtonNodeText: { color: '#475569', fontSize: 14, fontWeight: '700' },
  ctaBanner: { backgroundColor: '#4F46E5', borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' },
  ctaDecorationCircle1: { position: 'absolute', left: -20, top: -20, width: 96, height: 96, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 48 },
  ctaDecorationCircle: { position: 'absolute', right: -20, bottom: -20, width: 96, height: 96, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 48 },
  ctaTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
  ctaDescription: { color: '#E0E7FF', fontSize: 12, maxWidth: '85%', lineHeight: 18, marginBottom: 16 },
  ctaButton: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  ctaButtonText: { color: '#4F46E5', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  courseHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { marginRight: 16 },
  backIcon: { fontSize: 24, fontWeight: '300', color: '#1C1D1F' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1C1D1F', letterSpacing: -0.5 },
});