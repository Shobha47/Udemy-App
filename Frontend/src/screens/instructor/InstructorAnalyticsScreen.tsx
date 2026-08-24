// src/screens/instructor/InstructorAnalyticsScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { instructorApi } from '../../api/instructor.api';

interface InstructorCourse {
  id: string;
  title: string;
  isPublished?: boolean;
  isApproved?: boolean;
  studentCount?: number;
  reviewCount?: number;
  rating?: number;
}

export default function InstructorAnalyticsScreen() {
  // ─── QUERY DATA LAYERS ───
  const { data: courses = [], isLoading, isError } = useQuery<InstructorCourse[]>({
    queryKey: ['instructor-courses-analytics'],
    queryFn: instructorApi.getMyCourses,
  });

  // ─── MATHEMATICAL AGGREGATIONS ───
  const stats = useMemo(() => {
    const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
    const totalReviews = courses.reduce((sum, c) => sum + (c.reviewCount || 0), 0);
    const avgRating = courses.length > 0
      ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
      : '0.0';

    return { totalStudents, totalReviews, avgRating };
  }, [courses]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER META CONSOLE */}
      <View style={styles.headerContainer}>
        <Text style={styles.sectionPreLabel}>INSTRUCTOR CONSOLE</Text>
        <Text style={styles.headerMainTitle}>Performance Matrix</Text>
        <Text style={styles.headerSubtitleText}>Track dynamic distribution aggregates across student footprints.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewContext}>
        
        {/* HORIZONTAL ANALYTICS METRIC SLIDER STRIP */}
        <View style={styles.statsSliderContainer}>
          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScrollGap}> */}
            
            {/* Metric Card 1 */}
            <View style={[styles.metricCard, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <Ionicons name="book-outline" size={20} color="#D97706" />
              <Text style={styles.metricValue}>{isLoading ? '...' : courses.length}</Text>
              <Text style={styles.metricLabel}>Total Publications</Text>
            </View>

            {/* Metric Card 2 */}
            <View style={[styles.metricCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
              <Ionicons name="people-outline" size={20} color="#7C3AED" />
              <Text style={styles.metricValue}>{isLoading ? '...' : stats.totalStudents.toLocaleString('en-IN')}</Text>
              <Text style={styles.metricLabel}>Total Students</Text>
            </View>

            {/* Metric Card 3 */}
            <View style={[styles.metricCard, { backgroundColor: '#ECFEFF', borderColor: '#A5F3FC' }]}>
              <Ionicons name="bar-chart-outline" size={20} color="#0891B2" />
              <Text style={styles.metricValue}>{isLoading ? '...' : stats.totalReviews.toLocaleString('en-IN')}</Text>
              <Text style={styles.metricLabel}>Platform Reviews</Text>
            </View>

            {/* Metric Card 4 */}
            <View style={[styles.metricCard, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
              <Ionicons name="star-outline" size={20} color="#EA580C" />
              <Text style={styles.metricValue}>{isLoading ? '...' : stats.avgRating}</Text>
              <Text style={styles.metricLabel}>Global Rating</Text>
            </View>

          {/* </ScrollView> */}
        </View>

        {/* WORKSPACE BREAKDOWN ROWS */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownSectionHeadingTitle}>Course Breakdown</Text>

          {isLoading ? (
            <View style={styles.spinnerBlockContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.spinnerText}>Compiling performance metrics...</Text>
            </View>
          ) : isError ? (
            <View style={styles.errorBoxContainer}>
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
              <Text style={styles.errorText}>Could not load analytics profile nodes.</Text>
            </View>
          ) : courses.length === 0 ? (
            <Text style={styles.emptyStateFallbackText}>Publish a course module blueprint to initialize dynamic system indicators.</Text>
          ) : (
            courses.map((course) => (
              <View key={course.id} style={styles.breakdownItemFlatBlock}>
                
                {/* Upper Identity Column */}
                <View style={styles.breakdownMetaHeader}>
                  <Text style={styles.breakdownCourseTitle} numberOfLines={2}>{course.title}</Text>
                  <View style={styles.badgeInlineRow}>
                    <View style={[styles.badgeTagPill, course.isPublished ? styles.pillLive : styles.pillDraft]}>
                      <Text style={[styles.badgeTagText, course.isPublished ? styles.textLive : styles.textDraft]}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Text>
                    </View>
                    <View style={[styles.badgeTagPill, course.isApproved ? styles.pillApproved : styles.pillPending]}>
                      <Text style={[styles.badgeTagText, course.isApproved ? styles.textApproved : styles.textPending]}>
                        {course.isApproved ? 'Approved' : 'Pending Verification'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Sub-Metrics Layout Strip Matrix */}
                <View style={styles.innerMetricsGridStrip}>
                  <View style={styles.innerMetricBox}>
                    <Text style={styles.innerMetricBoxLabel}>Students</Text>
                    <Text style={styles.innerMetricBoxValue}>{course.studentCount || 0}</Text>
                  </View>
                  <View style={styles.innerMetricBoxVerticalDivider} />
                  <View style={styles.innerMetricBox}>
                    <Text style={styles.innerMetricBoxLabel}>Reviews</Text>
                    <Text style={styles.innerMetricBoxValue}>{course.reviewCount || 0}</Text>
                  </View>
                  <View style={styles.innerMetricBoxVerticalDivider} />
                  <View style={styles.innerMetricBox}>
                    <Text style={styles.innerMetricBoxLabel}>Rating</Text>
                    <Text style={[styles.innerMetricBoxValue, { color: '#D97706' }]}>★ {Number(course.rating || 0).toFixed(1)}</Text>
                  </View>
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
  // CORE CANVAS SYSTEM SETUP
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollViewContext: { flex: 1, backgroundColor: '#FFFFFF' },

  // STICKY HEADINGS PROFILE CONSOLE
  headerContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, backgroundColor: '#FFFFFF' },
  sectionPreLabel: { fontSize: 11, fontWeight: '700', color: '#4F46E5', letterSpacing: 1.2 },
  headerMainTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginTop: 4, letterSpacing: -0.5 },
  headerSubtitleText: { fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 18 },

  // METRIC SLIDER TRACK PANELS
  statsSliderContainer: { backgroundColor: '#FFFFFF', paddingBottom: 20, borderBottomWidth: 1, margin: 20, borderBottomColor: '#F1F5F9', display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'space-around'},
//   statsScrollGap: { paddingHorizontal: 20, gap: 12 },
  metricCard: { width: '100%', marginVertical: 10, padding: 14, borderRadius: 14, borderWidth: 1, justifyContent: 'space-between' },
  metricValue: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 12 },
  metricLabel: { fontSize: 11, color: '#475569', fontWeight: '600', marginTop: 1 },

  // BREAKDOWN BLOCKS SECTIONS
  breakdownSection: { paddingHorizontal: 20, paddingVertical: 24, backgroundColor: '#FFFFFF' },
  breakdownSectionHeadingTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2, marginBottom: 16 },
  breakdownItemFlatBlock: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, marginBottom: 16 },
  breakdownMetaHeader: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  breakdownCourseTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  badgeInlineRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  badgeTagPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeTagText: { fontSize: 10, fontWeight: '700' },
  
  // COLOR BADGES STYLES
  pillLive: { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
  textLive: { color: '#16A34A' },
  pillDraft: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  textDraft: { color: '#475569' },
  pillApproved: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  textApproved: { color: '#2563EB' },
  pillPending: { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' },
  textPending: { color: '#EA580C' },

  // INNER GRID BLOCKS STRIP CORES
  innerMetricsGridStrip: { flexDirection: 'row', paddingTop: 12, alignItems: 'center' },
  innerMetricBox: { flex: 1, alignItems: 'center' },
  innerMetricBoxLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  innerMetricBoxValue: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  innerMetricBoxVerticalDivider: { width: 1, height: '70%', backgroundColor: '#E2E8F0' },

  // LOADING HANDLER PLATFORM VIEWS
  spinnerBlockContainer: { paddingVertical: 60, alignItems: 'center' },
  spinnerText: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 10 },
  errorContainerBox: { paddingVertical: 32, alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 12 },
  errorText: { fontSize: 13, fontWeight: '600', color: '#EF4444', marginTop: 6 },
  emptyStateFallbackText: { fontSize: 13, color: '#64748B', fontStyle: 'italic', lineHeight: 20 },

  errorBoxContainer: { margin: 20, padding: 24, borderRadius: 14, backgroundColor: '#FEF2F2', opacity: 1, borderWidth: 1, borderColor: '#FEE2E2', alignItems: 'center' },
});