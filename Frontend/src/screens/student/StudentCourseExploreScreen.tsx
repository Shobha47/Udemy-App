import React, { useState, useMemo } from 'react';
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
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { useAuthMock } from '../../navigation/RootNavigator';
import { Course } from '../../types';

const { height } = Dimensions.get('window');
const PER_PAGE = 5;

export default function StudentCourseExploreScreen({ navigation }: any) {
  const { user } = useAuthMock();

  // --- FILTERS & INTERACTIVE STATE ENGINE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('sort-rating');
  const [page, setPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // --- TANSTACK REMOTE RECONSTRUCTION QUERY ---
  // const { data: serverPayload, isLoading, isError } = useQuery({
  //   queryKey: ['explore-courses-matrix'],
  //   queryFn: async () => {
  //     const response = await apiClient.get('/courses');
  //     // Gracefully handles both response formats used down-stack
  //     return response.data?.data?.courses || response.data?.data || [];
  //   },
  // });

  const { data, isLoading } = useQuery({
    queryKey: [
      'courses',
      page,
      searchQuery,
      selectedLevels,
      selectedCategories,
      sortBy,
    ],
    queryFn: async () => {
      const response = await apiClient.get('/courses', {
        params: {
          page,
          limit: 10,
          search: searchQuery || undefined,
          level: selectedLevels[0] || undefined,
          category: selectedCategories[0] || undefined,
        },
      });

      return response.data;
    },
  });

  const coursesList = data?.data?.courses || [];
  const totalPages = data?.meta?.totalPages || 1;

  // const coursesList = Array.isArray(serverPayload) ? serverPayload : [];

  // --- HELPER DYNAMIC STATE TOGGLES ---
  const toggleFilterValue = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    setPage(1); // Force return to page 1 to protect calculation blocks
  };

  const clearAllFilters = () => {
    setSelectedRating(null);
    setSelectedDurations([]);
    setSelectedLevels([]);
    setSelectedCategories([]);
    setPage(1);
  };

  // --- ENHANCED CORE USEMEMO MATHEMATICS ---
  // const filteredCourses = useMemo(() => {
  //   let result = [...coursesList];

  //   // Search Query Filtering
  //   if (searchQuery.trim()) {
  //     result = result.filter((c) =>
  //       c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   }

  //   // Rating Metrics Filtering
  //   if (selectedRating) {
  //     result = result.filter((c) => (c.rating || 0) >= selectedRating);
  //   }

  //   // Difficulty Levels Filtering
  //   if (selectedLevels.length) {
  //     result = result.filter((c) => selectedLevels.includes(c.level));
  //   }

  //   // Category Identification Filtering
  //   if (selectedCategories.length) {
  //     result = result.filter((c) => selectedCategories.includes(c.category?.name || c.category));
  //   }

  //   // Duration Bracket Calculations
  //   if (selectedDurations.length) {
  //     result = result.filter((c) => {
  //       const hours = Number(c.totalHours) || 0;
  //       if (selectedDurations.includes('short') && hours <= 2) return true;
  //       if (selectedDurations.includes('medium') && hours >= 3 && hours <= 6) return true;
  //       if (selectedDurations.includes('long') && hours >= 7 && hours <= 16) return true;
  //       if (selectedDurations.includes('extra') && hours >= 17) return true;
  //       return false;
  //     });
  //   }

  //   // Core Ordering Systems Sort Matrices
  //   if (sortBy === 'sort-rating') {
  //     result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  //   }
  //   if (sortBy === 'sort-price-low') {
  //     result.sort((a, b) => (a.price || 0) - (b.price || 0));
  //   }
  //   if (sortBy === 'sort-price-high') {
  //     result.sort((a, b) => (b.price || 0) - (a.price || 0));
  //   }
  //   if (sortBy === 'sort-newest') {
  //     result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  //   }

  //   return result;
  // }, [coursesList, searchQuery, selectedRating, selectedDurations, selectedLevels, selectedCategories, sortBy]);

  // Client Side Paging Sub-arrays
  // const totalPages = Math.ceil(filteredCourses.length / PER_PAGE) || 1;
  // const paginatedCourses = filteredCourses.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const hasActiveFilters = selectedRating !== null || selectedDurations.length > 0 || selectedLevels.length > 0 || selectedCategories.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
          <TouchableOpacity style={styles.filterToggleBadge} onPress={() => setIsFilterModalOpen(true)}>
            <Ionicons name="options-outline" size={18} color={hasActiveFilters ? "#4F46E5" : "#0F172A"} />
            {hasActiveFilters && <View style={styles.activeFilterAlertBadgeDot} />}
          </TouchableOpacity>
        </View>

        {/* QUICK ACTION SORT TRACKER */}
        <View style={styles.sortingInlineRibbon}>
          <Text style={styles.resultsCountText}>{coursesList.length} Curriculums Found</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {[
              { id: 'sort-rating', label: 'Top Rated' },
              { id: 'sort-price-low', label: 'Price: Low' },
              { id: 'sort-price-high', label: 'Price: High' },
              { id: 'sort-newest', label: 'Popularity' },
            ].map((sortOption) => {
              const isSelected = sortBy === sortOption.id;
              return (
                <TouchableOpacity
                  key={sortOption.id}
                  style={[styles.sortMiniTab, isSelected && styles.sortMiniTabActive]}
                  onPress={() => setSortBy(sortOption.id)}
                >
                  <Text style={[styles.sortMiniTabText, isSelected && styles.sortMiniTabTextActive]}>{sortOption.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ─── MAIN FEED VERTICAL FEED ─── */}
      {isLoading ? (
        <View style={styles.centerSpinnerWrapper}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.spinnerSubtext}>Compiling active catalogs...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.mainFeedScrollViewContext}>
          {coursesList.length === 0 ? (
            <View style={styles.emptyStateBoxFrame}>
              <Ionicons name="search" size={40} color="#CBD5E1" />
              <Text style={styles.emptyBoxHeading}>No blue-tracks located</Text>
              <Text style={styles.emptyBoxSub}>Try widening query keywords or wiping currently specified search modifiers.</Text>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.clearFiltersEmbeddedBtn} onPress={clearAllFilters}>
                  <Text style={styles.clearFiltersEmbeddedBtnText}>Wipe Filter Constraints</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={{ paddingVertical: 14 }}>
              {coursesList.map((course: Course) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseFlatCardItem}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('StudentCourseDetail', { id: course.id })}
                >
                  {/* <Image source={{ uri: course.image }} style={styles.courseCardThumbnailImage} /> */}
                  <Image
                    source={
                      course.image
                        ? { uri: course.image }
                        : require('../../assets/course-placeholder.png')
                    }
                    style={styles.courseCardThumbnailImage}
                  />
                  <View style={styles.courseCardMetaColumn}>
                    <View style={styles.badgeLevelRow}>
                      <Text style={styles.badgeLevelText}>{course.level || 'All Levels'}</Text>
                    </View>
                    <Text numberOfLines={2} style={styles.courseCardTitleText}>{course.title}</Text>
                    <Text style={styles.courseCardInstructorSubText}>By {course.instructor?.name || 'Expert Instructor'}</Text>
                    
                    <View style={styles.courseCardMetricsStripRow}>
                      <Text style={styles.cardRatingValue}>★ {Number(course.rating || 0).toFixed(1)}</Text>
                      <Text style={styles.cardMetaLabelDot}>•</Text>
                      <Text style={styles.cardMetaDurationLabel}>{course.totalHours || 0} hrs total</Text>
                    </View>

                    <Text style={styles.cardPricingTextValue}>₹{(course.price || 0).toLocaleString('en-IN')}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* ─── CLIENT PAGINATION FOOTER STRIP ─── */}
              {totalPages > 1 && (
                <View style={styles.paginationStripControlRow}>
                  <TouchableOpacity
                    disabled={page === 1}
                    style={[styles.pagerBtn, page === 1 && styles.pagerBtnDisabled]}
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <Ionicons name="arrow-back" size={16} color={page === 1 ? "#94A3B8" : "#0F172A"} />
                  </TouchableOpacity>
                  
                  <Text style={styles.pagerIndexIndicatorText}>Page {page} of {totalPages}</Text>

                  <TouchableOpacity
                    disabled={page === totalPages}
                    style={[styles.pagerBtn, page === totalPages && styles.pagerBtnDisabled]}
                    onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <Ionicons name="arrow-forward" size={16} color={page === totalPages ? "#94A3B8" : "#0F172A"} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* ─── BOTTOM SELECTION DRAWER SCREEN MODAL (MODIFIERS) ─── */}
      <Modal visible={isFilterModalOpen} animationType="slide" transparent>
        <View style={styles.modalBlurOverlayShadow}>
          <View style={styles.bottomSheetModalCanvas}>
            
            {/* Modal Heading Control Row */}
            <View style={styles.modalHeaderControlRow}>
              <Text style={styles.modalMainHeaderTitleText}>Filter Framework</Text>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              
              {/* Category Filter Group Box */}
              <View style={styles.modalFilterBlockContainer}>
                <Text style={styles.modalGroupBlockLabel}>Parent Discipline Category</Text>
                <View style={styles.filterPillWrapperRowGrid}>
                  {['Development', 'Business', 'Design', 'Marketing'].map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.filterSelectionPillBadge, isSelected && styles.filterSelectionPillBadgeActive]}
                        onPress={() => toggleFilterValue(selectedCategories, cat, setSelectedCategories)}
                      >
                        <Text style={[styles.filterPillBadgeText, isSelected && styles.filterPillBadgeTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Levels Filter Group Box */}
              <View style={styles.modalFilterBlockContainer}>
                <Text style={styles.modalGroupBlockLabel}>Difficulty Level Target</Text>
                <View style={styles.filterPillWrapperRowGrid}>
                  {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((lvl) => {
                    const isSelected = selectedLevels.includes(lvl);
                    return (
                      <TouchableOpacity
                        key={lvl}
                        style={[styles.filterSelectionPillBadge, isSelected && styles.filterSelectionPillBadgeActive]}
                        onPress={() => toggleFilterValue(selectedLevels, lvl, setSelectedLevels)}
                      >
                        <Text style={[styles.filterPillBadgeText, isSelected && styles.filterPillBadgeTextActive]}>{lvl}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Durations Filter Group Box */}
              <View style={styles.modalFilterBlockContainer}>
                <Text style={styles.modalGroupBlockLabel}>Course Video Duration</Text>
                <View style={styles.filterPillWrapperRowGrid}>
                  {[
                    { id: 'short', label: 'Short (0-2 hrs)' },
                    { id: 'medium', label: 'Medium (3-6 hrs)' },
                    { id: 'long', label: 'Long (7-16 hrs)' },
                    { id: 'extra', label: 'In-Depth (17+ hrs)' },
                  ].map((dur) => {
                    const isSelected = selectedDurations.includes(dur.id);
                    return (
                      <TouchableOpacity
                        key={dur.id}
                        style={[styles.filterSelectionPillBadge, isSelected && styles.filterSelectionPillBadgeActive]}
                        onPress={() => toggleFilterValue(selectedDurations, dur.id, setSelectedDurations)}
                      >
                        <Text style={[styles.filterPillBadgeText, isSelected && styles.filterPillBadgeTextActive]}>{dur.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Rating Star Selection Bar Matrix */}
              <View style={styles.modalFilterBlockContainer}>
                <Text style={styles.modalGroupBlockLabel}>Minimum Star Rating</Text>
                <View style={styles.filterPillWrapperRowGrid}>
                  {[4.5, 4.0, 3.5, 3.0].map((starValue) => {
                    const isSelected = selectedRating === starValue;
                    return (
                      <TouchableOpacity
                        key={starValue}
                        style={[styles.filterSelectionPillBadge, isSelected && styles.filterSelectionPillBadgeActive]}
                        onPress={() => setSelectedRating(isSelected ? null : starValue)}
                      >
                        <Text style={[styles.filterPillBadgeText, isSelected && styles.filterPillBadgeTextActive]}>★ {starValue} & Up</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

            </ScrollView>

            {/* Bottom Final Clear Operations Deck Strip */}
            <View style={styles.modalLowerDeckActionSheetRow}>
              <TouchableOpacity style={styles.resetSecondaryActionBtn} onPress={clearAllFilters}>
                <Text style={styles.resetSecondaryActionBtnText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commitPrimarySubmitActionBtn} onPress={() => setIsFilterModalOpen(false)}>
                <Text style={styles.commitPrimarySubmitActionBtnText}>Apply Constraints</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CORE STYLE BLOCKS CONTEXT
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  mainFeedScrollViewContext: { flex: 1, backgroundColor: '#FFFFFF' },
  centerSpinnerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  spinnerSubtext: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 10 },

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

  // CONSOLE FLAT CONTENT LIST ROWS
  courseFlatCardItem: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  courseCardThumbnailImage: { width: 100, height: 100, borderRadius: 10, backgroundColor: '#F1F5F9', resizeMode: 'cover' },
  courseCardMetaColumn: { flex: 1, marginLeft: 14, gap: 2 },
  badgeLevelRow: { backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 2 },
  badgeLevelText: { fontSize: 9, fontWeight: '700', color: '#4F46E5', textTransform: 'uppercase' },
  courseCardTitleText: { fontSize: 14, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  courseCardInstructorSubText: { fontSize: 12, color: '#64748B', marginTop: 1 },
  courseCardMetricsStripRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardRatingValue: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
  cardMetaLabelDot: { fontSize: 12, color: '#94A3B8', marginHorizontal: 6 },
  cardMetaDurationLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  cardPricingTextValue: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 4 },

  // MOBILE PAGINATION CORE STRIPS
  paginationStripControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 10 },
  pagerBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  pagerBtnDisabled: { opacity: 0.4, backgroundColor: '#F1F5F9' },
  pagerIndexIndicatorText: { fontSize: 13, fontWeight: '600', color: '#334155' },

  // EMPTY FEED PLATFORM RESPONSES PLUGS
  emptyStateBoxFrame: { paddingVertical: 64, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center' },
  emptyBoxHeading: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  emptyBoxSub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginTop: 4 },
  clearFiltersEmbeddedBtn: { marginTop: 16, backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  clearFiltersEmbeddedBtnText: { color: '#0F172A', fontSize: 12, fontWeight: '700' },

  // MODAL SLIDEOUT MODIFIER OVERLAYS LAYOUTS
  modalBlurOverlayShadow: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  bottomSheetModalCanvas: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: height * 0.75, paddingHorizontal: 16, paddingTop: 16 },
  modalHeaderControlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 14 },
  modalMainHeaderTitleText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  modalFilterBlockContainer: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalGroupBlockLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 10 },
  filterPillWrapperRowGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterSelectionPillBadge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  filterSelectionPillBadgeActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  filterPillBadgeText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  filterPillBadgeTextActive: { color: '#FFFFFF' },
  modalLowerDeckActionSheetRow: { flexDirection: 'row', gap: 12, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  resetSecondaryActionBtn: { flex: 1, height: 46, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  resetSecondaryActionBtnText: { color: '#475569', fontSize: 13, fontWeight: '700' },
  commitPrimarySubmitActionBtn: { flex: 2, height: 46, backgroundColor: '#4F46E5', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  commitPrimarySubmitActionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});