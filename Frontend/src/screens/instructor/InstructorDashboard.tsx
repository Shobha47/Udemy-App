import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  Dimensions,
  RefreshControl,
  StatusBar
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient, getSecureItem } from '../../api/client';
import { Course } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function InstructorDashboardScreen({ navigation }: any) {
  // Pull authenticated instructor data context out of memory storage safely
  const [instructorName, setInstructorName] = React.useState('Instructor');

  React.useEffect(() => {
    const fetchLocalUserInfo = async () => {
      const userInfoRaw = await getSecureItem('userInfo');
      if (userInfoRaw) {
        const parsed = JSON.parse(userInfoRaw);
        if (parsed?.name) setInstructorName(parsed.name);
      }
    };
    fetchLocalUserInfo();
  }, []);

  // Syncs precisely with instructorApi.getMyCourses endpoint mapping logic
  const { data, isLoading, isError, refetch } =
    useQuery({
      queryKey: ['instructor-dashboard'],
      queryFn: async () => {
        const response = await apiClient.get(
          '/courses/instructor/my-courses'
        );

        console.log("Response:", response)
        return response.data.data;
      },
    });

  const courses = data?.courses || [];

  console.log("courses in Instructor Dashbaord:", courses)
  console.log("courses in Instructor Dashbaord Length:", courses.length)

  // Comprehensive aggregate runtime calculations mirror backend metrics
  const totalStudents = courses.reduce((acc: any, course: Course) => acc + (Number(course.studentCount) || 0), 0);
  const totalRevenue = courses.reduce((acc: any, course: Course) => acc + (Number(course.price || 0) * (Number(course.studentCount) || 0)), 0);
  const ratedCourses = courses.filter((course: Course) => Number(course.rating || 0) > 0);
  const averageRating = ratedCourses.length
    ? (ratedCourses.reduce((acc: any, course: Course) => acc + Number(course.rating || 0), 0) / ratedCourses.length).toFixed(1)
    : '0.0';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerPreTitle}>INSTRUCTOR DASHBOARD</Text>
          <Text style={styles.headerTitle}>Overview</Text>
        </View>
        <TouchableOpacity 
          style={styles.createButtonAction}
          onPress={() => navigation.navigate('InstructorCreateCourseView')}
        >
          <Text style={styles.createButtonActionText}>+ New Course</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollBody}
        refreshControl={
          <RefreshControl refreshing={isLoading && courses.length > 0} onRefresh={refetch} tintColor="#4F46E5" />
        }
      >
        {/* Total Earnings Premium Banner Card */}
        <View style={styles.heroMetricCard}>
          <Text style={styles.heroLabel}>TOTAL EST. MARKETPLACE REVENUE</Text>
          <View style={styles.heroMainRow}>
            <Text style={styles.heroValue}>
              {isLoading ? '₹• • •' : `₹${totalRevenue.toLocaleString('en-IN')}`}
            </Text>
            <View style={styles.analyticsBadge}>
              <Text style={styles.analyticsBadgeText}>Live Insights</Text>
            </View>
          </View>
          <View style={styles.heroProgressBarContainer}>
            <View style={styles.heroProgressBarActive} />
          </View>
          <Text style={styles.heroFootnote}>Hi {instructorName}, track your standard author revenue and curriculum traction metrics across published tracks.</Text>
        </View>

        {/* Triple Section Metrics Column Matrix Grid */}
        <View style={styles.miniStatsContainer}>
          <View style={styles.miniStatBox}>
            <Text style={styles.miniStatLabel}>Total Courses</Text>
            <Text style={styles.miniStatValue}>{isLoading ? '...' : courses.length}</Text>
          </View>
          
          <View style={[styles.miniStatBox, styles.miniStatBoxBorder]}>
            <Text style={styles.miniStatLabel}>Total Students</Text>
            <Text style={styles.miniStatValue}>{isLoading ? '...' : totalStudents.toLocaleString()}</Text>
          </View>

          <View style={styles.miniStatBox}>
            <Text style={styles.miniStatLabel}>Average Rating</Text>
            <Text style={[styles.miniStatValue, { color: '#F59E0B' }]}>★ {isLoading ? '...' : averageRating}</Text>
          </View>
        </View>

        {/* Premium List Component Section */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listSectionTitle}>My Authored Courses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('InstructorCourses')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color="#4F46E5" style={{ marginVertical: 30 }} />
          ) : isError ? (
            <View style={styles.emptyStateBox}>
              <Text style={styles.errorTextLabel}>Could not load catalog streams</Text>
              <Text style={styles.errorSubtextLabel}>Ensure local interface services endpoints or wireless nodes are functional.</Text>
            </View>
          ) : courses.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <View style={styles.emptyIconCircle}><Text style={{ fontSize: 24 }}>📹</Text></View>
              <Text style={styles.emptyStateTitle}>No courses authored yet</Text>
              <Text style={styles.emptyStateSubtext}>Construct your structural knowledge catalog blue print shell to begin marketplace compilation value tracks.</Text>
              <TouchableOpacity 
                style={styles.emptyStateActionButton}
                onPress={() => navigation.navigate('InstructorCreateCourseView')}
              >
                <Text style={styles.emptyStateActionButtonText}>Create First Course</Text>
              </TouchableOpacity>
            </View>
          ) : (
            courses.slice(0, 5).map((course: Course) => (
              <TouchableOpacity 
                key={course.id} 
                style={styles.courseRow}
                onPress={() => navigation.navigate('InstructorCourseViewDetail', { id: course.id })}
              >
                <View style={styles.courseImageFrame}>
                  {course.image ? (
                    <Image source={{ uri: course.image }} style={styles.courseImage} />
                  ) : (
                    <View style={styles.courseImageFallback} />
                  )}
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
                  <Text style={styles.courseStudentsCount}>{course.studentCount || 0} students enrolled</Text>
                </View>
                <View style={[styles.statusIndicator, course.isPublished ? styles.statusPublished : styles.statusDraft]}>
                  <Text style={[styles.statusText, course.isPublished ? styles.textPublished : styles.textDraft]}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  
  // Header Component Styling
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerPreTitle: { fontSize: 10, fontWeight: '800', color: '#6A6F73', letterSpacing: 1.5 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1C1D1F', marginTop: 2 },
  createButtonAction: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6
  },
  createButtonActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  
  scrollBody: { paddingBottom: 50 },

  // Premium Dark Revenue Matrix Board Styling
  heroMetricCard: {
    margin: 24,
    backgroundColor: '#1C1D1F',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#1C1D1F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6
  },
  heroLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  heroValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  analyticsBadge: { backgroundColor: 'rgba(164, 53, 240, 0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#A434F46E55F0' },
  analyticsBadgeText: { color: '#D69EFE', fontSize: 11, fontWeight: '700' },
  heroProgressBarContainer: { height: 4, backgroundColor: '#334155', borderRadius: 2, marginTop: 16, marginBottom: 12, overflow: 'hidden' },
  heroProgressBarActive: { height: '100%', width: '100%', backgroundColor: '#4F46E5' },
  heroFootnote: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },

  // Triple Layout Secondary Statistics ribbon components
  miniStatsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 28,
    backgroundColor: '#F7F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D7DC',
    paddingVertical: 14
  },
  miniStatBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  miniStatBoxBorder: { borderLeftWidth: 1, borderLeftColor: '#D1D7DC', borderRightWidth: 1, borderRightColor: '#D1D7DC' },
  miniStatLabel: { fontSize: 11, fontWeight: '600', color: '#6A6F73', marginBottom: 4 },
  miniStatValue: { fontSize: 16, fontWeight: '800', color: '#1C1D1F' },

  // Premium Catalog Feeds List Layout Styling
  listSection: { marginHorizontal: 24, marginTop: 4, marginBottom: 16 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 },
  listSectionTitle: { fontSize: 16, fontWeight: '800', color: '#1C1D1F' },
  viewAllText: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
  
  courseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F7F9FA' },
  courseImageFrame: { width: 56, height: 38, borderRadius: 4, overflow: 'hidden', backgroundColor: '#F7F9FA', borderWidth: 1, borderColor: '#D1D7DC' },
  courseImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  courseImageFallback: { flex: 1, backgroundColor: '#D1D7DC' },
  courseInfo: { flex: 1, paddingHorizontal: 14 },
  courseTitle: { fontSize: 14, fontWeight: '700', color: '#1C1D1F' },
  courseStudentsCount: { fontSize: 12, color: '#6A6F73', marginTop: 3 },
  statusIndicator: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusPublished: { backgroundColor: '#E6F4EA' },
  statusDraft: { backgroundColor: '#FFF4E5' },
  statusText: { fontSize: 10, fontWeight: '700' },
  textPublished: { color: '#137333' },
  textDraft: { color: '#B06000' },

  // Empty Data Fallback Blocks Styling
  emptyStateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#F7F9FA', borderWidth: 1, borderColor: '#D1D7DC', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyStateTitle: { fontSize: 16, fontWeight: '800', color: '#1C1D1F', marginBottom: 4 },
  emptyStateSubtext: { fontSize: 13, color: '#6A6F73', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  emptyStateActionButton: { backgroundColor: '#1C1D1F', marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 6 },
  emptyStateActionButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  errorTextLabel: { fontSize: 14, fontWeight: '700', color: '#1C1D1F' },
  errorSubtextLabel: { fontSize: 12, color: '#6A6F73', marginTop: 4, textAlign: 'center' }
});