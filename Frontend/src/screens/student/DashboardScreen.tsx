import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { useAuthMock } from '../../navigation/RootNavigator';

type Enrollment = {
  id: string;
  progress?: number;
  course?: {
    id?: string;
    title?: string;
    subtitle?: string;
    image?: string;
    slug?: string;
  };
};

export default function StudentDashboardScreen({ navigation }: any) {
  const { user } = useAuthMock();

  // Added user dependency fallback inside the query key configuration tracker
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['student-dashboard', user?.id],
    queryFn: async () => {
      const response = await apiClient.get('/enrollments/my');
      console.log("StudentDashboardScreen Dynamic Response Logs:", response.data);
      // FIXED: Target the nested enrollments array property specifically to fix the object mismatch
      return response.data?.data?.enrollments || [];
    },
    enabled: Boolean(user?.id),
    refetchOnMount: true,
  });

  // Added user dependency fallback inside the query key configuration tracker
  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      const response = await apiClient.get('/certificates');
      console.log("StudentDashboardScreen Certificates Dynamic Response Logs:", response.data);
      // FIXED: Target the nested enrollments array property specifically to fix the object mismatch
      return response.data?.data?.certificates || [];
    },
    enabled: Boolean(user?.id),
    refetchOnMount: true,
  });

  console.log("certificates :", certificates.length)

  // Safely extract the data payload with a guaranteed array fallback
  const enrollmentsList: Enrollment[] = Array.isArray(data) ? data : [];

  // Fallback loader context container while async auth context rehydrates safely
  if (!user) {
    return (
      <SafeAreaView style={styles.loadingCenterWrapper}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingCenterText}>Authenticating secure platform connection...</Text>
      </SafeAreaView>
    );
  }

  // Aggregate summary calculations with complete safety overrides
  const totalProgress = enrollmentsList.reduce(
    (acc: number, item) => acc + (Number(item.progress) || 0),
    0
  );
  const averageProgress = enrollmentsList.length
    ? Math.round(totalProgress / enrollmentsList.length)
    : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER SECTION */}
      <View style={styles.headerSection}>
        <Text style={styles.sectionLabel}>STUDENT DASHBOARD</Text>
        <Text style={styles.welcomeTitle}>
          Welcome back, {user.name || 'Learner'}!
        </Text>
        <Text style={styles.headerSubtitle}>
          Track your learning progress and continue where you left off.
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#4F46E5" />
        }
      >
        
        {/* STATS HORIZONTAL METRIC SLIDER */}
        <View style={styles.statsSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.statsScrollContainer}
          >
            {/* Stat Item 1 */}
            <View style={[styles.statCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
              <Ionicons name="book-outline" size={20} color="#7C3AED" />
              <Text style={styles.statValue}>{enrollmentsList.length}</Text>
              <Text style={styles.statLabel}>Enrolled Courses</Text>
            </View>

            {/* Stat Item 2 */}
            <View style={[styles.statCard, { backgroundColor: '#ECFEFF', borderColor: '#A5F3FC' }]}>
              <Ionicons name="time-outline" size={20} color="#0891B2" />
              <Text style={styles.statValue}>{enrollmentsList.length * 4}h</Text>
              <Text style={styles.statLabel}>Hours Spent</Text>
            </View>

            {/* Stat Item 3 */}
            <View style={[styles.statCard, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <Ionicons name="trophy-outline" size={20} color="#D97706" />
              <Text style={styles.statValue}>{certificates && certificates.length || 0}</Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </View>

            {/* Stat Item 4 */}
            <View style={[styles.statCard, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
              <Ionicons name="trending-up-outline" size={20} color="#EA580C" />
              <Text style={styles.statValue}>{averageProgress}%</Text>
              <Text style={styles.statLabel}>Avg Progress</Text>
            </View>
          </ScrollView>
        </View>

        {/* FEED SECTION */}
        <View style={styles.feedSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeadingTitle}>My Courses</Text>
            <TouchableOpacity 
              style={styles.browseLinkBtn} 
              onPress={() => navigation.navigate('StudentCourseExplore')}
            >
              <Text style={styles.browseLinkText}>Browse Catalog</Text>
              <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          {/* DYNAMIC VIEW MANAGEMENT LAYER */}
          {isLoading ? (
            <View style={styles.centerSpinnerBox}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.spinnerText}>Syncing your database metrics...</Text>
            </View>
          ) : isError ? (
            <View style={styles.errorContainerBox}>
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
              <Text style={styles.errorTitleText}>Could not load your courses</Text>
              <Text style={styles.errorSubtitleText}>Please check connection or try again shortly.</Text>
            </View>
          ) : enrollmentsList.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="play-outline" size={26} color="#64748B" />
              </View>
              <Text style={styles.emptyTitleText}>No courses yet</Text>
              <Text style={styles.emptySubtitleText}>Enroll in a course track to activate your curriculum matrix.</Text>
              <TouchableOpacity 
                style={styles.exploreActionBtn}
                onPress={() => navigation.navigate('StudentCourseExplore')}
              >
                <Text style={styles.exploreActionBtnText}>Explore Courses</Text>
              </TouchableOpacity>
            </View>
          ) : (
            enrollmentsList.map((enrollment) => (
              <View key={enrollment.id} style={styles.coursePanelRowCard}>
                <Image
                  source={{ 
                    uri: enrollment.course?.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop' 
                  }}
                  style={styles.coursePanelImage}
                />
                <View style={styles.coursePanelContent}>
                  <Text numberOfLines={2} style={styles.coursePanelTitle}>
                    {enrollment.course?.title || 'Untitled Course'}
                  </Text>
                  
                  {enrollment.course?.subtitle && (
                    <Text numberOfLines={1} style={styles.coursePanelSubtitle}>
                      {enrollment.course.subtitle}
                    </Text>
                  )}

                  {/* PROGRESS PROGRESSION SYSTEM METER */}
                  <View style={styles.progressMeterContainer}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressLabelText}>Progress</Text>
                      <Text style={styles.progressValueText}>{enrollment.progress || 0}%</Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${Math.min(100, Math.max(0, enrollment.progress || 0))}%` }
                        ]} 
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.actionLaunchBtn}
                    onPress={() => 
                      navigation.navigate('StudentMyLearningView', { id: enrollment.course?.id })
                    }
                  >
                    <Text style={styles.actionLaunchBtnText}>Continue Learning</Text>
                    <Ionicons name="arrow-forward-outline" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingCenterWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 32 },
  loadingCenterText: { marginTop: 12, fontSize: 13, fontWeight: '500', color: '#64748B', textAlign: 'center' },
  headerSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, backgroundColor: '#FFFFFF' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#4F46E5', letterSpacing: 1.2 },
  welcomeTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 6, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#475569', lineHeight: 18, marginTop: 6 },
  statsSection: { backgroundColor: '#FFFFFF', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  statsScrollContainer: { paddingHorizontal: 20, gap: 12 },
  statCard: { width: 130, padding: 14, borderRadius: 14, borderWidth: 1, justifyContent: 'space-between' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 10 },
  statLabel: { fontSize: 11, color: '#475569', fontWeight: '600', marginTop: 2 },
  feedSection: { paddingHorizontal: 20, paddingVertical: 24, backgroundColor: '#FFFFFF' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeadingTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2 },
  browseLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  browseLinkText: { color: '#4F46E5', fontSize: 13, fontWeight: '700' },
  centerSpinnerBox: { paddingVertical: 60, alignItems: 'center' },
  spinnerText: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 10 },
  errorContainerBox: { paddingVertical: 40, alignItems: 'center', borderWidth: 1, borderColor: '#FEF2F2', backgroundColor: '#FEF2F2', borderRadius: 14 },
  errorTitleText: { fontSize: 14, fontWeight: '700', color: '#EF4444', marginTop: 8 },
  errorSubtitleText: { fontSize: 12, color: '#991B1B', marginTop: 2 },
  emptyStateBox: { alignItems: 'center', paddingVertical: 44, paddingHorizontal: 20, borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16 },
  emptyIconCircle: { width: 54, height: 54, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitleText: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  emptySubtitleText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginTop: 4, maxWidth: '85%' },
  exploreActionBtn: { marginTop: 16, backgroundColor: '#4F46E5', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  exploreActionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  coursePanelRowCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  coursePanelImage: { width: '100%', height: 150, backgroundColor: '#F1F5F9' },
  coursePanelContent: { padding: 16 },
  coursePanelTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', lineHeight: 20 },
  coursePanelSubtitle: { fontSize: 12, color: '#64748B', marginTop: 4 },
  progressMeterContainer: { marginTop: 14, marginBottom: 16 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressLabelText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  progressValueText: { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  progressBarTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 99, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 99 },
  actionLaunchBtn: { backgroundColor: '#4F46E5', height: 42, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionLaunchBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});