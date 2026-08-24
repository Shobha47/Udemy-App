// src/screens/admin/AdminPendingCoursesScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { Course } from '../../types';

type PendingCourse = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  price: number;
  level: string;
  language: string;
  isPublished: boolean;
  isApproved: boolean;
  createdAt: string;
  instructor: { id: string; name: string; avatar?: string; headline?: string };
  category: { name: string };
};

export default function AdminPendingCoursesScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);

  // ─── QUERY DATA LAYER ───
  const { data: serverPayload, isLoading, refetch } = useQuery({
    queryKey: ['admin-pending-courses'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/courses/pending');
      return response.data?.data?.courses || response.data?.data || [];
    },
  });

  const courses: PendingCourse[] = Array.isArray(serverPayload) ? serverPayload : [];

  // ─── MUTATIONS FOR APPROVAL / REJECTION ───
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      setActionId(id);
      const res = await apiClient.patch(`/admin/courses/approve/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-courses'] });
      Alert.alert('Success', 'Course module approved successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Approval failed.');
    },
    onSettled: () => setActionId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      setActionId(id);
      const res = await apiClient.patch(`/admin/courses/reject/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] });
      Alert.alert('Rejected', 'Course module rejected.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Rejection failed.');
    },
    onSettled: () => setActionId(null),
  });

  // ─── LOCAL FILTER CALCULATIONS ───
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.title?.toLowerCase().includes(q) ||
        c.instructor?.name?.toLowerCase().includes(q) ||
        c.category?.name?.toLowerCase().includes(q);
      const matchLevel = !levelFilter || c.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [courses, search, levelFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    
    return {
      awaiting: courses.length,
      beginner: courses.filter((c) => c.level === 'Beginner').length,
      free: courses.filter((c) => c.price === 0).length,
      thisWeek: courses.filter((c) => new Date(c.createdAt).getTime() > oneWeekAgo).length,
    };
  }, [courses]);

  if (isLoading) {
    return (
      <View style={styles.centerLoadingFrame}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Syncing submission queues...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* STICKY HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Text style={styles.headerTitleText}>Pending Approvals</Text>
          <Text style={styles.headerSubtitleText}>Review instructor submissions and verify curriculum health</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContextCanvas}>
        
        {/* STATS HORIZONTAL SLIDER */}
        <View style={styles.statsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScrollGap}>
            <View style={[styles.statCard, { borderColor: '#FED7AA' }]}>
              <Text style={styles.statLabelText}>Awaiting Review</Text>
              <Text style={[styles.statValueText, { color: '#EA580C' }]}>{stats.awaiting}</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#E2E8F0' }]}>
              <Text style={styles.statLabelText}>Beginner Level</Text>
              <Text style={[styles.statValueText, { color: '#0F172A' }]}>{stats.beginner}</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#BFDBFE' }]}>
              <Text style={styles.statLabelText}>Free Catalog</Text>
              <Text style={[styles.statValueText, { color: '#2563EB' }]}>{stats.free}</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#C7D2FE' }]}>
              <Text style={styles.statLabelText}>This Week</Text>
              <Text style={[styles.statValueText, { color: '#4F46E5' }]}>{stats.thisWeek}</Text>
            </View>
          </ScrollView>
        </View>

        {/* TOOLBAR SEARCH & FILTERS */}
        <View style={styles.toolbarContainer}>
          <View style={styles.searchBarWrapper}>
            <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search by title, instructor, category..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            style={styles.filterSelectorBtn}
            onPress={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterSelectorBtnText}>
              {levelFilter ? `Level: ${levelFilter}` : 'All Levels'}
            </Text>
            <Ionicons name={isLevelDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* INLINE DROPDOWN SELECTION COMPONENT */}
        {isLevelDropdownOpen && (
          <View style={styles.dropdownCanvasCard}>
            {['', 'Beginner', 'Intermediate', 'Advanced', 'AllLevels'].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.dropdownItemRow, levelFilter === lvl && styles.dropdownItemRowActive]}
                onPress={() => { setLevelFilter(lvl); setIsLevelDropdownOpen(false); }}
              >
                <Text style={[styles.dropdownItemRowText, levelFilter === lvl && styles.dropdownItemRowTextActive]}>
                  {lvl === '' ? 'All Levels' : lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* FEED INVENTORY LISTING */}
        <View style={styles.feedSectionZone}>
          {filteredCourses.length === 0 ? (
            <View style={styles.emptyStateBoxFrame}>
              <Ionicons name="checkmark-done-circle" size={48} color="#10B981" />
              <Text style={styles.emptyBoxHeading}>All caught up!</Text>
              <Text style={styles.emptyBoxSub}>No pending instructor submissions require review at this time.</Text>
            </View>
          ) : (
            filteredCourses.map((course: any) => {
              const isProcessing = actionId === course.id;

              return (
                <View key={course.id} style={styles.courseFlatReviewCard}>
                  
                  {/* Visual Metadata Segment */}
                  <View style={styles.cardHeaderSegmentRow}>
                    <View style={styles.cardThumbnailWrapperFrame}>
                      {course.image ? (
                        <Image source={{ uri: course.image }} style={styles.cardThumbnailNode} />
                      ) : (
                        <View style={styles.cardThumbnailFallbackNode}>
                          <Ionicons name="book-outline" size={20} color="#94A3B8" />
                        </View>
                      )}
                    </View>
                    <View style={styles.cardMetaTextColumn}>
                      <Text numberOfLines={2} style={styles.courseCardTitleText}>{course.title}</Text>
                      <Text numberOfLines={1} style={styles.courseCardSubtitleText}>{course.subtitle || 'No subtitle summary attached.'}</Text>
                    </View>
                  </View>

                  {/* Attributes Ribbon Badges */}
                  <View style={styles.attributesBadgeRowGrid}>
                    <View style={styles.attrBadgePill}>
                      <Ionicons name="school-outline" size={12} color="#64748B" />
                      <Text style={styles.attrBadgeText} numberOfLines={1}>{course.instructor?.name}</Text>
                    </View>
                    <View style={styles.attrBadgePill}>
                      <Text style={styles.attrBadgeText}>{course.level}</Text>
                    </View>
                    <View style={styles.attrBadgePill}>
                      <Ionicons name="globe-outline" size={11} color="#64748B" />
                      <Text style={styles.attrBadgeText}>{course.language}</Text>
                    </View>
                    <View style={[styles.attrBadgePill, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.attrBadgeText, { color: '#15803D', fontWeight: '700' }]}>
                        {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardHorizontalLineDivider} />

                  {/* Operational Action Buttons Strip */}
                  <View style={styles.cardActionsRowStrip}>
                    <TouchableOpacity
                      style={styles.reviewNavigationBtn}
                      onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
                    >
                      <Text style={styles.reviewNavigationBtnText}>Inspect Details</Text>
                      <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
                    </TouchableOpacity>

                    <View style={styles.validationButtonsGroup}>
                      <TouchableOpacity
                        disabled={isProcessing}
                        style={[styles.actionRejectBtn, isProcessing && { opacity: 0.5 }]}
                        onPress={() => rejectMutation.mutate(course.id)}
                      >
                        {isProcessing ? <ActivityIndicator size="small" color="#EF4444" /> : (
                          <>
                            <Ionicons name="close-outline" size={14} color="#EF4444" />
                            <Text style={styles.actionRejectBtnText}>Reject</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        disabled={isProcessing}
                        style={[styles.actionApproveBtn, isProcessing && { opacity: 0.5 }]}
                        onPress={() => approveMutation.mutate(course.id)}
                      >
                        {isProcessing ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
                          <>
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            <Text style={styles.actionApproveBtnText}>Approve</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CORE GEOMETRY CANVAS SYSTEM
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContextCanvas: { flex: 1, backgroundColor: '#FFFFFF' },
  centerLoadingFrame: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { color: '#64748B', fontSize: 13, fontWeight: '500', marginTop: 10 },

  // STICKY CORE APPLICATION BAR HEADERS
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

  // HORIZONTAL METRIC RIBBON CONTROLS
  statsSection: { backgroundColor: '#FFFFFF', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  statsScrollGap: { paddingHorizontal: 20, gap: 12 },
  statCard: { width: 130, padding: 14, borderRadius: 14, borderWidth: 1, backgroundColor: '#FFFFFF' },
  statLabelText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  statValueText: { fontSize: 24, fontWeight: '900', marginTop: 6 },

  // TOOLBAR MIX CONTROL DECK INTERFACES
  toolbarContainer: { paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', gap: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchBarWrapper: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 42 },
  searchInput: { flex: 1, color: '#0F172A', fontSize: 14, fontWeight: '500', padding: 0 },
  filterSelectorBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, height: 42, backgroundColor: '#FFFFFF' },
  filterSelectorBtnText: { fontSize: 13, fontWeight: '600', color: '#0F172A' },

  // DROP INLINE SYSTEM MENUS OVERLAYS
  dropdownCanvasCard: { marginHorizontal: 20, marginTop: 4, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 6, gap: 2 },
  dropdownItemRow: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  dropdownItemRowActive: { backgroundColor: '#EEF2FF' },
  dropdownItemRowText: { fontSize: 13, fontWeight: '500', color: '#475569' },
  dropdownItemRowTextActive: { color: '#4F46E5', fontWeight: '700' },

  // REVIEW FEED CONTEXT LAYOUT CORES
  feedSectionZone: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: '#FFFFFF' },
  courseFlatReviewCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeaderSegmentRow: { flexDirection: 'row', alignItems: 'center' },
  cardThumbnailWrapperFrame: { width: 88, height: 56, borderRadius: 8, overflow: 'hidden', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  cardThumbnailNode: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardThumbnailFallbackNode: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardMetaTextColumn: { flex: 1, marginLeft: 14, gap: 2 },
  courseCardTitleText: { fontSize: 14, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  courseCardSubtitleText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  // METADATA CHIPS INNER COMPASS
  attributesBadgeRowGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  attrBadgePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  attrBadgeText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  cardHorizontalLineDivider: { height: 1, backgroundColor: '#F1F5F9', width: '100%', marginVertical: 14 },
  
  // OPERATION ALIGNMENT STRIPS CONTROLLERS
  cardActionsRowStrip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewNavigationBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  reviewNavigationBtnText: { color: '#4F46E5', fontSize: 13, fontWeight: '700' },
  validationButtonsGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionRejectBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 36, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' },
  actionRejectBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  actionApproveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 36, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#0F172A' },
  actionApproveBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // EMPTY PLACEHOLDER PANELS
  emptyStateBoxFrame: { paddingVertical: 64, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  emptyBoxHeading: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  emptyBoxSub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginTop: 4 },
});