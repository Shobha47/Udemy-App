// src/screens/instructor/InstructorCoursesScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';

export default function InstructorCoursesScreen({ navigation }: any) {

  // --- FILTERS & INTERACTIVE STATE ENGINE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // ─── QUERY INFRASTRUCTURE ───
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-courses', searchQuery, page],
    queryFn: async () => {
      const response = await apiClient.get(
        '/courses/instructor/my-courses',
        {
          params: {
            search: searchQuery,
            page,
            limit: 10,
          },
        }
      );

      return response.data.data;
    },
  });
 
  const courses = data?.courses || [];

  // ─── MUTATION ACTION LAYER ───
  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return await apiClient.delete(`/instructor/courses/${courseId}`);
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      Alert.alert('Operation Failed', 'Could not delete course module parameters.');
      console.error(error);
    }
  });

  // Native deletion prompt verification popup window block
  const confirmDeletionPrompt = (courseId: string, courseTitle: string) => {
    Alert.alert(
      'Remove Course Shell',
      `Are you absolutely sure you want to completely drop "${courseTitle}" from active databases?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteMutation.mutate(courseId) 
        }
      ]
    );
  };

  // Modern contextual status helper block to extract UI pill styling properties dynamically
  const getCourseStatusProperties = (course: any) => {
    if (!course.isPublished) return { bg: '#F1F5F9', text: '#475569', label: 'Draft' };
    if (course.isApproved) return { bg: '#ECFDF5', text: '#059669', label: 'Live' };
    return { bg: '#FFF7ED', text: '#D97706', label: 'Pending' };
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── STICKY PREMIUM HEADER CONSOLE ─── */}
      <View style={styles.headerContainer}>
        <View style={styles.headerMetaBox}>
          <Text style={styles.sectionPreLabel}>INSTRUCTOR SYSTEM</Text>
          <Text style={styles.headerMainTitle}>My Courses</Text>
          <Text style={styles.headerSubtitleText}>Manage your catalog publications and authored tracks.</Text>
        </View>

        <TouchableOpacity 
          style={styles.floatingActionBtn}
          onPress={() => navigation.navigate('InstructorCreateCourseView')}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.floatingActionBtnText}>New Course</Text>
        </TouchableOpacity>
      </View>

      {/* ─── STICKY SEARCH & ACTIONS PROFILE CONTROL ─── */}
      <View style={styles.topStickyActionConsole}>
        <View style={styles.searchBarWrapperRow}>
          <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.textInputBarElement}
            placeholder="Search programming tracks, creators..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={(text) => { setSearchQuery(text); setPage(1); }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ─── SCROLL CONTEXT CONTAINER FEED ─── */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.mainScrollContext}>
        
        {isLoading ? (
          <View style={styles.centerSpinnerFrame}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.spinnerText}>Syncing database records...</Text>
          </View>
        ) : isError ? (
          <View style={styles.errorBoxContainer}>
            <Ionicons name="bug-outline" size={32} color="#EF4444" />
            <Text style={styles.errorTextHeading}>Execution Error</Text>
            <Text style={styles.errorTextSub}>Could not synchronize your course list dashboard array matrix.</Text>
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.emptyCatalogPlaceholder}>
            <Ionicons name="folder-open-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Shell Blueprints Registered</Text>
            <Text style={styles.emptyDescription}>Draft an educational course module to activate your analytics tracker pipelines.</Text>
          </View>
        ) : (
          <View style={styles.cardsGridWrapper}>
            {courses.map((course: any) => {
              const statusProps = getCourseStatusProperties(course);
              
              return (
                <View key={course.id} style={styles.premiumCourseRowCard}>
                  
                  {/* Modern Asymmetrical Image Block Container with Floating Status Pill Overlay */}
                  <View style={styles.cardVisualAssetFrame}>
                    <Image 
                      source={{ uri: course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop' }} 
                      style={styles.courseRowCardImage}
                    />
                    <View style={[styles.floatingStatusOverlayBadge, { backgroundColor: statusProps.bg }]}>
                      <Text style={[styles.statusOverlayBadgeText, { color: statusProps.text }]}>
                        {statusProps.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.courseRowCardContent}>
                    {/* Typography Scaling Hierarchy Layout Block */}
                    <View style={styles.cardTextHeaderBlock}>
                      <Text numberOfLines={1} style={styles.courseCardTitleText}>
                        {course.title}
                      </Text>
                      {course.subtitle ? (
                        <Text numberOfLines={1} style={styles.courseCardSubtitleText}>
                          {course.subtitle}
                        </Text>
                      ) : (
                        <Text numberOfLines={1} style={styles.courseCardSubtitleText}>
                          No supplemental tracking blueprint description subtitle parameters provided.
                        </Text>
                      )}
                    </View>

                    {/* Integrated Modern Metrics Metadata Info Ribbon Bar Strip */}
                    <View style={styles.courseCardPricingRowStrip}>
                      <Text style={styles.premiumPricingValueText}>
                        {course.price > 0 ? `₹${course.price.toLocaleString('en-IN')}` : 'Free Course Asset'}
                      </Text>
                      
                      <View style={styles.starRatingRowBlock}>
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text style={styles.starRatingTextValue}>
                          {Number(course.rating || 0).toFixed(1)}
                        </Text>
                        <Text style={styles.inlineMetricDotDivider}>•</Text>
                        <Text style={styles.studentAudienceAggregateText}>
                          {(course.studentCount || 0).toLocaleString()} students enrolled
                        </Text>
                      </View>
                    </View>

                    {/* ─── ACTIONS PANEL TRAY BUTTON GROUP WITH EXPLICIT HIERARCHY ─── */}
                    <View style={styles.actionsPanelTrayButtonGroup}>
                      
                      {/* PRIMARY TASK WORKSPACE CONTROL VIEW BUTTON */}
                      <TouchableOpacity 
                        style={[styles.actionControlSecondaryBtn, styles.actionPrimaryWorkspaceCallToActionButton]}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('InstructorCourseViewDetail', { id: course.id })}
                      >
                        <Ionicons name="apps" size={15} color="#FFFFFF" />
                        <Text style={styles.actionPrimaryWorkspaceCallToActionButtonText}>Open Workspace</Text>
                      </TouchableOpacity>

                      {/* EDIT SETTINGS SHORTCUT TRIGGER BUTTON */}
                      <TouchableOpacity 
                        style={styles.actionControlSecondaryBtn}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('InstructorCourseEditSpecs', { id: course.id })}
                      >
                        <Ionicons name="settings-outline" size={16} color="#334155" />
                      </TouchableOpacity>

                      {/* HARD DELETION REMOVAL ACCENTED BUTTON */}
                      <TouchableOpacity 
                        style={[styles.actionControlSecondaryBtn, styles.actionControlDestructiveBtn]}
                        activeOpacity={0.7}
                        disabled={deleteMutation.isPending}
                        onPress={() => confirmDeletionPrompt(course.id, course.title)}
                      >
                        {deleteMutation.isPending ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        )}
                      </TouchableOpacity>

                    </View>

                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CORE APP CANVAS CONTEXT
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  mainScrollContext: { flex: 1, backgroundColor: '#FFFFFF' },

  // STICKY ACTIONS PROFILE HEADER
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'column',
    gap: 16,
  },
  headerMetaBox: { flex: 0 },
  sectionPreLabel: { fontSize: 11, fontWeight: '700', color: '#4F46E5', letterSpacing: 1.2 },
  headerMainTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginTop: 4, letterSpacing: -0.5 },
  headerSubtitleText: { fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 18 },

  // CONSOLE STICKY ENGINE HEADER PANEL
  topStickyActionConsole: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchBarWrapperRow: { backgroundColor: '#F1F5F9', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 46 },
  textInputBarElement: { flex: 1, color: '#0F172A', fontSize: 14, fontWeight: '500', padding: 0 },
  filterToggleBadge: { paddingHorizontal: 6, height: '100%', justifyContent: 'center', position: 'relative' },
  activeFilterAlertBadgeDot: { position: 'absolute', right: 4, top: 12, width: 6, height: 6, borderRadius: 3, backgroundColor: '#4F46E5' },
  sortingInlineRibbon: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultsCountText: { fontSize: 12, fontWeight: '600', color: '#64748B', width: 110, paddingRight: 4 },
  sortMiniTab: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 4 },
  sortMiniTabActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  sortMiniTabText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  sortMiniTabTextActive: { color: '#FFFFFF' },
  
  // NEW FAB ACTION SPECIFICATIONS
  floatingActionBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  floatingActionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginLeft: 6 },

  // DYNAMIC COMPONENT LOADER WRAPPERS
  centerSpinnerFrame: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  spinnerText: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 10 },
  errorBoxContainer: { margin: 20, padding: 24, borderRadius: 14, backgroundColor: '#FEF2F2', opacity: 1, borderWidth: 1, borderColor: '#FEE2E2', alignItems: 'center' },
  errorTextHeading: { fontSize: 14, fontWeight: '700', color: '#EF4444', marginTop: 8 },
  errorTextSub: { fontSize: 12, color: '#991B1B', textAlign: 'center', marginTop: 2, lineHeight: 16 },
  emptyCatalogPlaceholder: { margin: 20, paddingVertical: 60, paddingHorizontal: 20, borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  emptyDescription: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginTop: 4, maxWidth: '85%' },

  // ─── PREMIUM LOOK CARD UI ELEMENT REMODELS ───
  cardsGridWrapper: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  premiumCourseRowCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardVisualAssetFrame: { width: '100%', height: 145, position: 'relative', backgroundColor: '#F8FAFC' },
  courseRowCardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  floatingStatusOverlayBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusOverlayBadgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  
  courseRowCardContent: { padding: 18, gap: 14 },
  cardTextHeaderBlock: { gap: 4 },
  courseCardTitleText: { fontSize: 17, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3 },
  courseCardSubtitleText: { fontSize: 13, color: '#64748B', lineHeight: 18, fontWeight: '500' },
  
  courseCardPricingRowStrip: { flexDirection: 'column', gap: 4, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  premiumPricingValueText: { fontSize: 18, fontWeight: '800', color: '#0F172A', letterSpacing: -0.2 },
  starRatingRowBlock: { flexDirection: 'row', alignItems: 'center' },
  starRatingTextValue: { fontSize: 12, color: '#1E293B', fontWeight: '700', marginLeft: 4 },
  inlineMetricDotDivider: { marginHorizontal: 6, color: '#CBD5E1' },
  studentAudienceAggregateText: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  // INTERACTIVE REUSABLE BUTTON BOX CONTROLS
  actionsPanelTrayButtonGroup: { flexDirection: 'row', gap: 8, marginTop: 2 },
  actionControlSecondaryBtn: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  actionPrimaryWorkspaceCallToActionButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
    flexDirection: 'row',
    gap: 6,
  },
  actionPrimaryWorkspaceCallToActionButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  actionControlDestructiveBtn: { borderColor: '#FEE2E2', backgroundColor: '#FFF5F5' },
});