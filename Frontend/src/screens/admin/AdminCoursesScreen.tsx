// src/screens/admin/AdminCoursesScreen.tsx
import React, { useMemo } from 'react';
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

interface AdminCourse {
  id: string;
  title: string;
  image?: string;
  isApproved?: boolean;
  isDraft?: boolean;
  isPublished?: boolean;
  instructor?: {
    name?: string;
  };
}

interface AdminDashboardData {
  stats?: {
    totalCourses?: number;
  };
  recentCourses?: AdminCourse[];
}

export default function AdminCoursesScreen({ navigation }: any) {
  
  // ─── QUERY 1: CORE CONSOLE DASHBOARD ───
  const { 
    data: dashboard, 
    isLoading: isDashboardLoading, 
    refetch: refetchDashboard,
    isError: isDashboardError
  } = useQuery<AdminDashboardData>({
    queryKey: ['admin-dashboard-courses'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard');
      return res.data?.data || res.data;
    },
  });

  // ─── QUERY 2: PENDING APPROVAL STREAMS ───
  const { 
    data: pendingCourses = [], 
    isLoading: isPendingLoading,
    refetch: refetchPending,
    isError: isPendingError
  } = useQuery<AdminCourse[]>({
    queryKey: ['admin-pending-courses-list'],
    queryFn: async () => {
      // Linked securely to your api pipeline structure fallback wrapper
      const res = await apiClient.get('/admin/courses/pending');
      return res.data?.data?.courses || res.data?.data || [];
    },
  });

  // ─── DATA MERGING & DEDUPLICATION MATRICES ───
  const coursesList = useMemo(() => {
    const recent = dashboard?.recentCourses || [];
    const uniqueMap = new Map<string, AdminCourse>();

    [...pendingCourses, ...recent].forEach((course) => {
      if (course?.id) {
        uniqueMap.set(course.id, course);
      }
    });

    return Array.from(uniqueMap.values());
  }, [dashboard, pendingCourses]);

  const handleRefreshPipeline = async () => {
    await Promise.all([refetchDashboard(), refetchPending()]);
  };

  const isGlobalLoading = isDashboardLoading || isPendingLoading;
  const isGlobalError = isDashboardError || isPendingError;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* STICKY HEADER ACTIONS */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Text style={styles.headerTitleText}>Course Management</Text>
          <Text style={styles.headerSubtitleText}>Global publishing and validation parameters</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollContextCanvas}
        refreshControl={
          <RefreshControl refreshing={isGlobalLoading && coursesList.length > 0} onRefresh={handleRefreshPipeline} tintColor="#4F46E5" />
        }
      >
        {/* HORIZONTAL STATS GRID OVERVIEW PANEL */}
        <View style={styles.statsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScrollGap}>
            
            {/* Stat Item 1 */}
            <View style={[styles.statCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
              <Ionicons name="book-outline" size={18} color="#7C3AED" />
              <Text style={styles.statValueText}>{dashboard?.stats?.totalCourses || coursesList.length}</Text>
              <Text style={styles.statLabelText}>Total Catalog</Text>
            </View>

            {/* Stat Item 2 */}
            <View style={[styles.statCard, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
              <Ionicons name="time-outline" size={18} color="#EA580C" />
              <Text style={styles.statValueText}>{pendingCourses.length}</Text>
              <Text style={styles.statLabelText}>Pending Verification</Text>
            </View>

            {/* Stat Item 3 */}
            <View style={[styles.statCard, { backgroundColor: '#ECFEFF', borderColor: '#A5F3FC' }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#0891B2" />
              <Text style={styles.statValueText}>{coursesList.filter((c) => c.isApproved).length}</Text>
              <Text style={styles.statLabelText}>Approved Live</Text>
            </View>

            {/* Stat Item 4 */}
            <View style={[styles.statCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
              <Ionicons name="close-circle-outline" size={18} color="#475569" />
              <Text style={styles.statValueText}>{coursesList.filter((c) => c.isDraft).length}</Text>
              <Text style={styles.statLabelText}>Draft Shells</Text>
            </View>

          </ScrollView>
        </View>

        {/* FEED ZONE */}
        <View style={styles.feedSectionZone}>
          <Text style={styles.sectionFeedHeadingTitleText}>Catalog Inventory Feed</Text>

          {isGlobalLoading && coursesList.length === 0 ? (
            <View style={styles.centerSpinnerWrapperBox}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.spinnerProgressLabelText}>Syncing infrastructure catalogs...</Text>
            </View>
          ) : isGlobalError ? (
            <View style={styles.errorBoxWrapperContainer}>
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
              <Text style={styles.errorBoxHeadingText}>Synchronization Failure</Text>
              <Text style={styles.errorBoxSubtext}>Could not securely map active production databases streams.</Text>
            </View>
          ) : coursesList.length === 0 ? (
            <View style={styles.emptyStateContainerPlaceholder}>
              <Ionicons name="folder-open-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyHeadingText}>No course items found</Text>
              <Text style={styles.emptySubtextText}>Registered authored items will populate this directory dashboard context feed layout automatically.</Text>
            </View>
          ) : (
            coursesList.map((course) => (
              <View key={course.id} style={styles.flatRowCardItem}>
                
                {/* Media Image Frame layout mapping */}
                <View style={styles.cardImageContainerFrame}>
                  {course.image ? (
                    <Image source={{ uri: course.image }} style={styles.cardImageNode} />
                  ) : (
                    <View style={styles.cardImageFallbackNode}>
                      <Ionicons name="image-outline" size={18} color="#94A3B8" />
                    </View>
                  )}
                </View>

                {/* Meta descriptions attributes block column group layout */}
                <View style={styles.cardMainMetaColumn}>
                  <Text numberOfLines={2} style={styles.courseCardTitleText}>{course.title}</Text>
                  <Text numberOfLines={1} style={styles.courseCardInstructorText}>
                    By {course.instructor?.name || 'Unknown instructor'}
                  </Text>

                  {/* Badges Info Strip */}
                  <View style={styles.badgeGroupRowGrid}>
                    <View style={[styles.statusBadgePill, course.isPublished ? styles.pillPublishedState : styles.pillDraftState]}>
                      <Text style={[styles.statusBadgePillText, course.isPublished ? styles.textPublishedState : styles.textDraftState]}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadgePill, course.isApproved ? styles.pillApprovedState : styles.pillPendingState]}>
                      <Text style={[styles.statusBadgePillText, course.isApproved ? styles.textApprovedState : styles.textPendingState]}>
                        {course.isApproved ? 'Approved' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Operations Action Dot Link Trigger Block */}
                <TouchableOpacity 
                  style={styles.cardActionItemBtn}
                  onPress={() => navigation.navigate('AdminCourseDetail', { id: course.id })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                </TouchableOpacity>

              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CORE LAYOUT SCALES CANVAS SETUP
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContextCanvas: { flex: 1, backgroundColor: '#FFFFFF' },

  // STICKY CORE HEADER APP LAYOUTS
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 12, 
    paddingBottom: 16, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  backButton: { padding: 4 },
  headerTitleText: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitleText: { fontSize: 13, color: '#475569', marginTop: 2, lineHeight: 18 },

  // METRICS STRIPS HORIZONTAL CONTAINER SCROLLS
  statsSection: { backgroundColor: '#FFFFFF', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', },
  statsScrollGap: { paddingHorizontal: 20, gap: 12 ,  display: 'flex', flexDirection: "column",  alignItems: 'center', justifyContent: 'center', width: '100%' },
  statCard: { width: '100%', flexDirection: 'column', padding: 14, borderRadius: 14, borderWidth: 1, justifyContent: 'space-between' },
  statValueText: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginTop: 12 },
  statLabelText: { fontSize: 11, color: '#475569', fontWeight: '600', marginTop: 1 },

  // INVENTORY ITEMS FEED LIST CORES
  feedSectionZone: { paddingHorizontal: 20, paddingVertical: 24, backgroundColor: '#FFFFFF' },
  sectionFeedHeadingTitleText: { fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2, marginBottom: 16 },
  flatRowCardItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9', 
    backgroundColor: '#FFFFFF' 
  },
  cardImageContainerFrame: { width: 76, height: 52, borderRadius: 8, overflow: 'hidden', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',},
  cardImageNode: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImageFallbackNode: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardMainMetaColumn: { flex: 1, marginLeft: 14, paddingRight: 8, gap: 2 },
  courseCardTitleText: { fontSize: 14, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  courseCardInstructorText: { fontSize: 12, color: '#64748B', marginTop: 1 },
  badgeGroupRowGrid: { flexDirection: 'row', gap: 6, marginTop: 6 },
  statusBadgePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  statusBadgePillText: { fontSize: 10, fontWeight: '700' },
  cardActionItemBtn: { padding: 4 },

  // PILLS INNER BRAND COLORS CONFIGURATIONS
  pillPublishedState: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  textPublishedState: { color: '#475569' },
  pillDraftState: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  textDraftState: { color: '#94A3B8' },
  pillApprovedState: { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
  textApprovedState: { color: '#16A34A' },
  pillPendingState: { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' },
  textPendingState: { color: '#EA580C' },

  // STATE LOADER CONTROLLERS OVERLAYS PANELS
  centerSpinnerWrapperBox: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  spinnerProgressLabelText: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 10 },
  errorBoxWrapperContainer: { paddingVertical: 40, alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 14, borderWidth: 1, borderColor: '#FEE2E2' },
  errorBoxHeadingText: { fontSize: 14, fontWeight: '700', color: '#EF4444', marginTop: 8 },
  errorBoxSubtext: { fontSize: 12, color: '#991B1B', marginTop: 2 },
  emptyStateContainerPlaceholder: { paddingVertical: 64, alignItems: 'center', justifyContent: 'center' },
  emptyHeadingText: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  emptySubtextText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginTop: 4, paddingHorizontal: 16 },
});