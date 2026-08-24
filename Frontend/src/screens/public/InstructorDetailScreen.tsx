import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../api/client';
import { getFallbackAvatar } from '../../constants/avarat';

export default function InstructorDetailScreen({
  route,
  navigation,
}: any) {
  const { id } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-detail', id],
    queryFn: async () => {
      const response = await apiClient.get(
        `/public/instructor/${id}`
      );
      return response.data.data;
    },
  });

  const instructor = data?.instructor;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator
          size="large"
          color="#4F46E5"
        />
      </SafeAreaView>
    );
  }

  const courses = instructor?.courses || [];
  // const courses = instructor?.courses || [];
  const previewCourses = courses.slice(0, 1);

  const renderCourse = ({ item }: any) => (
    <TouchableOpacity
      style={styles.courseCardFlat}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('CourseDetail', {
          id: item.id,
        })
      }
    >
      <Image
        source={{ uri: item.image }}
        style={styles.courseImageFlat}
      />

      <View style={styles.courseContentFlat}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{item.level || 'All Levels'}</Text>
        </View>

        <Text
          numberOfLines={2}
          style={styles.courseTitle}
        >
          {item.title}
        </Text>

        <View style={styles.courseFooter}>
          <View style={styles.ratingRow}>
            <Ionicons
              name="star"
              size={14}
              color="#F59E0B"
            />
            <Text style={styles.rating}>
              {Number(item.rating || 0).toFixed(1)}
            </Text>
          </View>

          <View style={styles.studentMetaRow}>
            <Ionicons name="people-outline" size={14} color="#64748B" />
            <Text style={styles.students}>
              {(item.studentCount || 0).toLocaleString()} students
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER (UNTOUCHED BASED ON CORE LAYOUT CONTRACT) */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Instructor
          </Text>
        </View>
      </View>

      <FlatList
        data={previewCourses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCourse}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <>
            {/* HERO PROFILE SECTION */}
            <View style={styles.heroSection}>
              <Image
                source={
                  instructor?.avatar
                    ? { uri: instructor?.avatar }
                    : getFallbackAvatar(instructor?.id)
                }
                style={styles.avatar}
              />

              <Text style={styles.name}>
                {instructor?.name}
              </Text>

              <Text style={styles.headline}>
                {instructor?.headline || 'Professional Instructor'}
              </Text>

              <View style={styles.reviewBadgeContainer}>
                <Ionicons
                  name="star"
                  size={14}
                  color="#D97706"
                />
                <Text style={styles.reviewText}>
                  {Number(instructor?.averageRating || 0).toFixed(1)}
                </Text>
                <Text style={styles.reviewCount}>
                  ({(instructor?.totalReviews || 0).toLocaleString()} reviews)
                </Text>
              </View>
            </View>

            {/* FLAT STRIP STATISTICS COMPONENT */}
            <View style={styles.statsSectionBordered}>
              <View style={styles.statsCardFlat}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {instructor?.totalStudents >= 1000
                      ? `${(instructor.totalStudents / 1000).toFixed(1)}K`
                      : instructor?.totalStudents || 0}
                  </Text>
                  <Text style={styles.statLabel}>Students</Text>
                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {instructor?.totalCourses || 0}
                  </Text>
                  <Text style={styles.statLabel}>Courses</Text>
                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {instructor?.totalReviews >= 1000
                      ? `${(instructor.totalReviews / 1000).toFixed(1)}K`
                      : instructor?.totalReviews || 0}
                  </Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
              </View>
            </View>

            {/* FLAT DETAILED PROFILE BLOCK */}
            <View style={styles.aboutSectionBordered}>
              <Text style={styles.sectionTitle}>
                About Instructor
              </Text>
              <Text style={styles.aboutText}>
                {instructor?.bio || instructor?.headline || "No biographical data available for this user track."}
              </Text>
            </View>

            {/* PRE-LIST HEADER SECTION */}
            <View style={styles.coursesHeaderSection}>
              <Text style={styles.sectionTitle}>
                Courses by {instructor?.name}
              </Text>
              <Text style={styles.courseCount}>
                {courses.length} {courses.length === 1 ? 'Course' : 'Courses'} Available
              </Text>
            </View>
          </>
        }

        // FOOTER WITH "VIEW ALL" CALL TO ACTION BUTTON
        ListFooterComponent={
          courses.length > 1 ? (
            <TouchableOpacity
              style={styles.viewAllButton}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('InstructorAllCourses', {
                  instructorName: instructor?.name,
                  courses: courses, // Passing localized clean data over to downstream array handler
                })
              }
            >
              <Text style={styles.viewAllButtonText}>
                View All {courses.length} Courses
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
            </TouchableOpacity>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 20,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 6,
  },
  viewAllButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  /* HEADER BLOCK SCHEMES */
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 14,
    padding: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },

  /* FLAT PANEL STRUCTURAL SEPARATORS */
  heroSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  statsSectionBordered: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  aboutSectionBordered: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  coursesHeaderSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },

  /* INTERACTIVE RIBBON METRICS DISPLAY */
  statsCardFlat: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },

  /* PROFILE IDENTITY METADATA BLOCKS */
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headline: {
    marginTop: 6,
    textAlign: 'center',
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  reviewBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
  },
  reviewText: {
    marginLeft: 5,
    fontWeight: '700',
    fontSize: 13,
    color: '#D97706',
  },
  reviewCount: {
    marginLeft: 4,
    color: '#B45309',
    fontSize: 12,
    fontWeight: '500',
  },

  /* CORE CONTENT TEXT SCALES */
  styleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  aboutText: {
    marginTop: 8,
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
  },
  courseCount: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 13,
  },

  /* FLAT COMPACT FEED CARDS */
  courseCardFlat: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  courseImageFlat: {
    width: '100%',
    height: 160,
    backgroundColor: '#F1F5F9',
  },
  courseContentFlat: {
    padding: 16,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  levelBadgeText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  courseFooter: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontWeight: '700',
    fontSize: 13,
    color: '#0F172A',
  },
  studentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  students: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
});