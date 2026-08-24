// src/screens/student/StudentProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { instructorApi } from '../../api/instructor.api'; // Uses the shared /auth/me profile getter
import { useAuthMock } from '../../navigation/RootNavigator';

export default function StudentProfileScreen({ navigation }: any) {
  const { logout } = useAuthMock();

  // Fetch verified profile parameters directly from the unified context API payload
  const { data: user, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: instructorApi.getProfile,
    refetchOnMount: true,
  });

  // Safely evaluate JSON social links from schema model
  const socialLinks = typeof user?.socialLinks === 'string' 
    ? JSON.parse(user.socialLinks) 
    : user?.socialLinks || {};

  const handleOpenURL = (url: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => alert('Could not open target resource path link.'));
  };

  if (isLoading || !user) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER BAR */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitleText}>My Profile</Text>
        <TouchableOpacity 
          style={styles.editBtnHeader}
          onPress={() => navigation.navigate('StudentEditProfile')}
        >
          <Ionicons name="create-outline" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* HERO BLOCK */}
        <View style={styles.heroSection}>
          <Image
            source={{ 
              uri: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=4F46E5&color=fff&size=200` 
            }}
            style={styles.avatarImage}
          />
          <Text style={styles.studentNameText}>{user.name}</Text>
          <Text style={styles.studentEmailText}>{user.email}</Text>
          
          <View style={styles.roleBadgeFrame}>
            <View style={styles.pulseDotIndicator} />
            <Text style={styles.roleBadgeText}>STUDENT MEMBER</Text>
          </View>

          {user.headline ? (
            <Text style={styles.headlineText}>{user.headline}</Text>
          ) : null}
        </View>

        {/* WEBSITE & SOCIAL LINKS GRID STRIP */}
        {(user.website || socialLinks.twitter || socialLinks.linkedin || socialLinks.youtube) ? (
          <View style={styles.socialSectionBordered}>
            <Text style={styles.sectionTitle}>Digital Portfolio Channels</Text>
            <View style={styles.socialRowGroup}>
              {user.website && (
                <TouchableOpacity style={styles.socialPillBtn} onPress={() => handleOpenURL(user.website)}>
                  <Ionicons name="globe-outline" size={14} color="#0F172A" />
                  <Text style={styles.socialPillText}>Portfolio</Text>
                </TouchableOpacity>
              )}
              {socialLinks.linkedin && (
                <TouchableOpacity style={[styles.socialPillBtn, { backgroundColor: '#EFF6FF' }]} onPress={() => handleOpenURL(socialLinks.linkedin)}>
                  <Ionicons name="logo-linkedin" size={14} color="#1D4ED8" />
                  <Text style={[styles.socialPillText, { color: '#1D4ED8' }]}>LinkedIn</Text>
                </TouchableOpacity>
              )}
              {socialLinks.twitter && (
                <TouchableOpacity style={[styles.socialPillBtn, { backgroundColor: '#F8FAFC' }]} onPress={() => handleOpenURL(socialLinks.twitter)}>
                  <Ionicons name="logo-twitter" size={14} color="#0F172A" />
                  <Text style={styles.socialPillText}>Twitter</Text>
                </TouchableOpacity>
              )}
              {socialLinks.youtube && (
                <TouchableOpacity style={[styles.socialPillBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleOpenURL(socialLinks.youtube)}>
                  <Ionicons name="logo-youtube" size={14} color="#DC2626" />
                  <Text style={[styles.socialPillText, { color: '#DC2626' }]}>YouTube</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : null}

        {/* BIO DETAILS BLOCK */}
        <View style={styles.flatSectionBordered}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.biographyParagraphText}>
            {user.bio || "No bio summary recorded yet. Complete profile settings to introduce yourself to instructors and the community."}
          </Text>
        </View>

        {/* LOGOUT MUTATION ACTION */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <TouchableOpacity style={styles.systemLogoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.systemLogoutBtnText}>Sign Out From Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitleText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  editBtnHeader: { padding: 4 },
  heroSection: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, backgroundColor: '#FFFFFF' },
  avatarImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F1F5F9' },
  studentNameText: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginTop: 14, letterSpacing: -0.5 },
  studentEmailText: { fontSize: 13, color: '#64748B', marginTop: 2 },
  roleBadgeFrame: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginTop: 12 },
  pulseDotIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4F46E5', marginRight: 6 },
  roleBadgeText: { color: '#0F172A', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  headlineText: { marginTop: 14, textAlign: 'center', fontSize: 14, color: '#475569', lineHeight: 20, fontWeight: '500' },
  socialSectionBordered: { paddingHorizontal: 20, paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.3 },
  socialRowGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  socialPillBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  socialPillText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  flatSectionBordered: { paddingHorizontal: 20, paddingVertical: 24, borderBottomWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  biographyParagraphText: { marginTop: 8, fontSize: 14, color: '#475569', lineHeight: 22 },
  systemLogoutBtn: { height: 48, width: '100%', borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  systemLogoutBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },
});