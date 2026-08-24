import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { CourseCard } from '../../components/course/CourseCard';
import { Course } from '../../types';
import { apiClient } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import BrowseCategoriesSection from '../../components/home/BrowseCategoriesSection';
import TopInstructorsSection from '../../components/home/TopInstructorsSection';

import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const COURSE_FEATURES = [
  { id: '1', name: 'Most Popular', slug: 'development', icon: '💻' },
  { id: '2', name: 'Best Seller', slug: 'business', icon: '📈' },
  { id: '3', name: 'Free', slug: 'design', icon: '🎨' },
];

const MOCK_TESTIMONIALS = [
  { id: 't-1', quote: 'The interactive system player and curriculum paths landed me a senior engineering role within 6 months.', user: 'Rohan M.', metric: 'Secured ₹24 LPA Package' },
  { id: 't-2', quote: 'Absolute peak educational fidelity. Watching preview tracks before purchasing is a game changer.', user: 'Priya K.', metric: 'Up-skilled to Cloud Lead' }
];

function CourseCardSkeleton() {
  return (
    <View
      style={{
        width: 280,
        marginHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
      }}
    >
      <View
        style={{
          height: 150,
          borderRadius: 12,
          backgroundColor: '#E2E8F0',
          marginBottom: 12,
        }}
      />

      <View
        style={{
          height: 16,
          width: '80%',
          borderRadius: 4,
          backgroundColor: '#E2E8F0',
          marginBottom: 8,
        }}
      />

      <View
        style={{
          height: 12,
          width: '60%',
          borderRadius: 4,
          backgroundColor: '#E2E8F0',
        }}
      />
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // --- QUERIES PIPELINE ---
  const { data, isLoading } = useQuery({
    queryKey: ['courses', searchQuery, selectedCategory],
    queryFn: async () => {
      const response = await apiClient.get('/courses', {
        params: {
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          limit: 3,
        },
      });
      return response.data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', searchQuery, selectedCategory],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.data;
    },
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors', searchQuery, selectedCategory],
    queryFn: async () => {
      const response = await apiClient.get('/public/instructors');
      return response.data;
    },
  });

  const coursesList = data?.data?.courses || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* ─── STICKY HEADER SEARCH BAR ─── */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search programming, design or marketing tracks..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.mainScrollView}>
        
        {/* ─── HERO PUBLICATION BANNER ─── */}
        <View style={styles.heroSection}>
          <View style={styles.heroBanner}>
            <View style={styles.heroDecorationRight} />
            <View style={styles.heroDecorationLeft} />
            
            <View style={styles.zIndexHigh}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>🚀 Mega Launch Premium Access</Text>
              </View>
              <Text style={styles.heroTitle}>Forge Your Path With Senior Creators</Text>
              <Text style={styles.heroSubtitle}>Unlock over 45,000 elite courses vetted by global technology specialists.</Text>
              <TouchableOpacity 
                style={styles.heroButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('CoursesTab')}
              >
                <Text style={styles.heroButtonText}>Explore Tracks</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── VALUE MATRIX TRUST BAR ─── */}
        <View style={styles.trustSection}>
          <View style={styles.trustBar}>
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>🛡️</Text>
              <Text style={styles.trustText}>Verified Pro</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>💎</Text>
              <Text style={styles.trustText}>Full Support</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>📜</Text>
              <Text style={styles.trustText}>ISO Certified</Text>
            </View>
          </View>
        </View>

        {/* ─── HORIZONTAL SUBCATEGORY TAG BAR ─── */}
        <View style={styles.categoryFilterSection}>
          <Text style={styles.sectionHeadingText}>Top Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoryScrollContainer}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.7}
              style={[
                styles.categoryTab,
                selectedCategory === null ? styles.categoryTabActive : styles.categoryTabInactive
              ]}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === null ? styles.textWhite : styles.textSlate700
              ]}>
                 All Courses
              </Text>
            </TouchableOpacity>

            {COURSE_FEATURES.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.slug)}
                  activeOpacity={0.7}
                  style={[
                    styles.categoryTab,
                    isSelected ? styles.categoryTabActive : styles.categoryTabInactive
                  ]}
                >
                  <Text style={[
                    styles.categoryTabText,
                    isSelected ? styles.textWhite : styles.textSlate700
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── CORE FEATURED COURSES FEED ─── */}
        <View style={styles.coursesSection}>
          <View style={styles.courseHeaderRow}>
            <Text style={styles.sectionHeadingText}>
              {selectedCategory ? `Top ${selectedCategory} Architecture` : 'Featured Curriculum'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CoursesTab')} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            // <View style={styles.centerLoadingContainer}>
            //   <ActivityIndicator size="large" color="#4F46E5" />
            //   <Text style={styles.loadingText}>Syncing dynamic matrices...</Text>
            // </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {[1, 2, 3].map((item) => (
                <CourseCardSkeleton key={item} />
              ))}
            </ScrollView>
          ) : coursesList.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateEmoji}>📋</Text>
              <Text style={styles.emptyStateTitle}>No blueprints located</Text>
              <Text style={styles.emptyStateDescription}>Try resetting or widening active query filters.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {coursesList.map((course: Course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onPress={(id) => navigation.navigate('CourseDetail', { id })}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* ─── MODULARIZED SUBSECTIONS PASSING HOOKS ─── */}
        <View >
          <BrowseCategoriesSection categories={categories} navigation={navigation} />
        </View>
        <View >
          <TopInstructorsSection instructors={instructors} navigation={navigation}/>
        </View>

        {/* ─── STUDENT TESTIMONIAL FEED ─── */}
        <View style={styles.testimonialSection}>
          <Text style={styles.sectionHeadingText}>Industrial Insights</Text>
          {MOCK_TESTIMONIALS.map((t) => (
            <View key={t.id} style={styles.testimonialCard}>
              <Text style={styles.testimonialQuote}>"{t.quote}"</Text>
              <View style={styles.testimonialFooter}>
                <Text style={styles.testimonialUser}>{t.user}</Text>
                <View style={styles.testimonialBadge}>
                  <Text style={styles.testimonialBadgeText}>{t.metric}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ─── HOME PLATFORM CTA BANNER ─── */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaBanner}>
            <View style={styles.ctaDecorationCircle} />
            <Text style={styles.ctaTitle}>Become an Instructor</Text>
            <Text style={styles.ctaDescription}>Deploy your expertise globally. Draft courses, manage curriculums, and secure royalty tracking options.</Text>
            <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
              <Text style={styles.ctaButtonText}>Apply For Sandbox Access</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CORE BACKGROUND contexts
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  mainScrollView: { flex: 1, backgroundColor: '#FFFFFF' },

  // STICKY HEADER ACTIONS
  headerContainer: { 
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 20, 
    paddingTop: 12, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  searchBarWrapper: { 
    backgroundColor: '#F1F5F9', 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    height: 46 
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, color: '#0F172A', fontSize: 14, fontWeight: '500', padding: 0 },

  // FLAT SECTION MANAGEMENT CORES WITH EXPLICIT BOUNDING LINES
  heroSection: { paddingVertical: 20, backgroundColor: '#FFFFFF' },
  trustSection: { paddingHorizontal: 20, paddingBottom: 24, backgroundColor: '#FFFFFF' },
  categoryFilterSection: { paddingVertical: 24, borderTopWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  coursesSection: { paddingVertical: 24, borderTopWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  modularSection: { paddingVertical: 12, borderTopWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  testimonialSection: { paddingVertical: 24, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#ffffff' },
  ctaSection: { paddingVertical: 32, backgroundColor: '#FFFFFF' },

  // HERO BANNER MODULES
  heroBanner: { marginHorizontal: 20, backgroundColor: '#1E1B4B', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' },
  heroDecorationRight: { position: 'absolute', right: -40, top: -40, width: 160, height: 160, backgroundColor: 'rgba(79, 70, 229, 0.2)', borderRadius: 80 },
  heroDecorationLeft: { position: 'absolute', left: -40, bottom: -40, width: 128, height: 128, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 64 },
  zIndexHigh: { zIndex: 10 },
  heroBadge: { backgroundColor: 'rgba(79, 70, 229, 0.3)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  heroBadgeText: { color: '#C7D2FE', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', lineHeight: 28, marginBottom: 8, letterSpacing: -0.5 },
  heroSubtitle: { color: 'rgba(199, 210, 254, 0.8)', fontSize: 13, lineHeight: 18, marginBottom: 18 },
  heroButton: { backgroundColor: '#10B981', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  heroButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // VALUE TRUST RIBBON
  trustBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 14 },
  trustItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  trustEmoji: { fontSize: 14, marginRight: 6 },
  trustText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  trustDivider: { width: 1, backgroundColor: '#E2E8F0', height: 14, alignSelf: 'center' },

  // TYPOGRAPHY GRIDS
  sectionHeadingText: { fontSize: 16, fontWeight: '700', color: '#0F172A', paddingHorizontal: 20, marginBottom: 16, letterSpacing: -0.3 },
  courseHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20, marginBottom: 4 },
  viewAllText: { color: '#4F46E5', fontSize: 13, fontWeight: '700' },

  // HORIZONTAL PILLED FILTER TAGS
  categoryScrollContainer: { paddingHorizontal: 20 },
  categoryTab: { marginRight: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  categoryTabActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  categoryTabInactive: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  categoryTabText: { fontSize: 13, fontWeight: '600' },
  textWhite: { color: '#FFFFFF' },
  textSlate700: { color: '#475569' },

  // VERTICAL CONTENT LISTS
  coursesGridList: { paddingHorizontal: 20, gap: 4 },
  courseScrollContainer: { width: 'auto', paddingHorizontal: 0, paddingVertical: 0},

  // DATA FETCHING STATE UI HOOKS
  centerLoadingContainer: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#64748B', fontSize: 13, fontWeight: '500', marginTop: 10 },
  emptyStateBox: { marginHorizontal: 20, padding: 32, borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 14, alignItems: 'center' },
  emptyStateEmoji: { fontSize: 36, marginBottom: 8 },
  emptyStateTitle: { color: '#0F172A', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  emptyStateDescription: { color: '#64748B', fontSize: 13, textAlign: 'center', lineHeight: 18 },

  // TESTIMONIAL DISPLAY FRAMES
  testimonialCard: { backgroundColor: '#fcfcfc', padding: 16, borderRadius: 14, marginHorizontal: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  testimonialQuote: { color: '#334155', fontSize: 13, fontStyle: 'normal', lineHeight: 20, marginBottom: 12 },
  testimonialFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
  testimonialUser: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  testimonialBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  testimonialBadgeText: { color: '#047857', fontSize: 10, fontWeight: '600' },

  // FOOTER CONSOLE PLATFORM PROMOTE CTA
  ctaBanner: { marginHorizontal: 20, backgroundColor: '#4F46E5', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' },
  ctaDecorationCircle: { position: 'absolute', right: -20, bottom: -20, width: 96, height: 96, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 48 },
  ctaTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 6, letterSpacing: -0.3 },
  ctaDescription: { color: '#E0E7FF', fontSize: 13, lineHeight: 18, marginBottom: 16 },
  ctaButton: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  ctaButtonText: { color: '#4F46E5', fontSize: 12, fontWeight: '700' },
});