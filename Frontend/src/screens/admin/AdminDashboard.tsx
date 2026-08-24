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

import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Course, UserMinimal } from '../../types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }: any) {
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/dashboard');
      return response.data.data;
    },
    refetchOnMount: true,
  });

  const stats = data?.stats;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerPreTitle}>MANAGEMENT CONSOLE</Text>
          <Text style={styles.headerTitle}>Overview</Text>
        </View>
        <View style={styles.badgeContainer}>
          <View style={styles.pulseDot} />
          <Text style={styles.adminBadgeText}>SUPERADMIN</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollBody}
        refreshControl={
          <RefreshControl refreshing={isLoading && !!data} onRefresh={refetch} tintColor="#4F46E5" />
        }
      >
        {/* Total Revenue & High-Level Display */}
        <View style={styles.ctaBanner}>
          <View style={styles.ctaDecorationCircle} />
          <Text style={styles.heroLabel}>PLATFORM ENROLLMENTS VALUE</Text>
          <View style={styles.heroMainRow}>
            <Text style={styles.heroValue}>
              {isLoading ? '• • •' : (stats?.totalEnrollments || 0).toLocaleString()}
            </Text>
            <View style={styles.growthBadge}>
              <Text style={styles.growthText}>+18% Today</Text>
            </View>
          </View>
          <View style={styles.heroProgressBarContainer}>
            <View style={styles.heroProgressBarActive} />
          </View>
          <Text style={styles.heroFootnote}>System operating smoothly across all infrastructure vectors.</Text>
        </View>

        {/* Triple Secondary Stats Row */}
        <View style={styles.miniStatsContainer}>
          <View style={styles.miniStatBox}>
            <Text style={styles.miniStatLabel}>Total Users</Text>
            <Text style={styles.miniStatValue}>
              {isLoading ? '...' : (stats?.totalUsers || 0).toLocaleString()}
            </Text>
          </View>
          
          <View style={[styles.miniStatBox, styles.miniStatBoxBorder]}>
            <Text style={styles.miniStatLabel}>Total Courses</Text>
            <Text style={styles.miniStatValue}>
              {isLoading ? '...' : (stats?.totalCourses || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.miniStatBox}>
            <Text style={styles.miniStatLabel}>Pending Review</Text>
            <Text style={[styles.miniStatValue, { color: '#E07A5F' }]}>
              {isLoading ? '...' : stats?.pendingCourses || 0}
            </Text>
          </View>
        </View>

        {/* Quick Functional Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Actions Operations</Text>
        <View style={styles.actionGrid}>
  {[
    {
      label: 'Manage Users',
      desc: 'Audit user directories',
      icon: 'people-outline',
      route: 'AdminUsers',
    },
    {
      label: 'Courses Matrix',
      desc: 'Global collections',
      icon: 'book-outline',
      route: 'AdminCourses',
    },
    {
      label: 'Pending Approvals',
      desc: 'Verify authored syllabi',
      icon: 'time-outline',
      route: 'AdminApprovalsTab',
    },
    {
      label: 'Category Managemant',
      desc: 'Operational parameters',
      icon: 'settings-outline',
      route: 'AdminCategoryCreate',
    },
  ].map((item, idx) => (
    <TouchableOpacity
      key={idx}
      style={styles.actionCard}
      onPress={() => navigation.navigate(item.route)}
    >
      <View style={styles.actionIconWrapper}>
        <Ionicons
          name={item.icon as any}
          size={24}
          color="#4F46E5"
        />
      </View>

      <Text style={styles.actionLabel}>
        {item.label}
      </Text>

      <Text style={styles.actionDesc}>
        {item.desc}
      </Text>
    </TouchableOpacity>
  ))}
</View>

        {/* Recent Active User Directory Segment */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listSectionTitle}>Recent User Signups</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminUsers')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color="#4F46E5" style={{ marginVertical: 20 }} />
          ) : (
            data?.recentUsers?.slice(0, 4).map((user: UserMinimal) => (
              <View key={user.id} style={styles.userRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>{user.role.toLowerCase()}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Course Production Catalog Segment */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listSectionTitle}>Recent Catalog Submissions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminCourses')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color="#4F46E5" style={{ marginVertical: 20 }} />
          ) : (
            data?.recentCourses?.slice(0, 4).map((course: Course) => (
              <View key={course.id} style={styles.courseRow}>
                <View style={styles.courseImageFrame}>
                  {course.image ? (
                    <Image source={{ uri: course.image }} style={styles.courseImage} />
                  ) : (
                    <View style={styles.courseImageFallback} />
                  )}
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
                  <Text style={styles.courseInstructor}>By {course.instructor?.name || 'Instructor'}</Text>
                </View>
                <View style={[styles.statusIndicator, course.isApproved ? styles.statusApproved : styles.statusPending]}>
                  <Text style={[styles.statusText, course.isApproved ? styles.textApproved : styles.textPending]}>
                    {course.isApproved ? 'Active' : 'Pending'}
                  </Text>
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
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1D1F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 8 },
  adminBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  
  scrollBody: { paddingBottom: 50 },

  // Premium Card Styling
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
  heroLabel: { color: '#ffffff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  heroValue: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', letterSpacing: -0.5 },
  growthBadge: { backgroundColor: 'rgba(39, 255, 183, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  growthText: { color: '#34D399', fontSize: 12, fontWeight: '700' },
  heroProgressBarContainer: { height: 4, backgroundColor: '#334155', borderRadius: 2, marginTop: 16, marginBottom: 12, overflow: 'hidden' },
  heroProgressBarActive: { height: '100%', width: '75%', backgroundColor: '#bdbdbd' },
  heroFootnote: { color: '#c8c8c9', fontSize: 11, lineHeight: 16 },

  ctaBanner: { marginHorizontal: 16, marginTop: 16, marginBottom: 24, backgroundColor: '#4F46E5', borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' },
  ctaDecorationCircle: { position: 'absolute', right: -20, bottom: -20, width: 96, height: 96, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 48 },

  // Mini Section Analytics Box Styling
  miniStatsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D7DC',
    paddingVertical: 14
  },
  miniStatBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  miniStatBoxBorder: { borderLeftWidth: 1, borderLeftColor: '#D1D7DC', borderRightWidth: 1, borderRightColor: '#D1D7DC' },
  miniStatLabel: { fontSize: 11, fontWeight: '600', color: '#6A6F73', marginBottom: 4 },
  miniStatValue: { fontSize: 18, fontWeight: '800', color: '#364563' },

  // Operational Action Grid Panel Styling
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1C1D1F', marginHorizontal: 24, marginBottom: 14 },
  // actionGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 18, justifyContent: 'space-between', marginBottom: 20 },
  // actionCard: {
  //   width: (width - 52) / 2,
  //   backgroundColor: '#FFFFFF',
  //   borderWidth: 1,
  //   borderColor: '#D1D7DC',
  //   borderRadius: 20,
  //   padding: 18,
  //   marginBottom: 12,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.02,
  //   shadowRadius: 4,
  //   elevation: 1
  // },
  // actionIcon: { fontSize: 22, marginBottom: 12 },
  // actionLabel: { fontSize: 14, fontWeight: '800', color: '#1C1D1F' },
  // actionDesc: { fontSize: 11, color: '#6A6F73', marginTop: 4, lineHeight: 14 },

  // Premium List Feeds Layout Component Styling
  listSection: { marginHorizontal: 24, marginTop: 12, marginBottom: 16 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 },
  listSectionTitle: { fontSize: 15, fontWeight: '800', color: '#1C1D1F' },
  viewAllText: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
  
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F7F9FA' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F7F9FA', borderWidth: 1, borderColor: '#D1D7DC', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#1C1D1F', fontSize: 14, fontWeight: '700' },
  userInfo: { flex: 1, marginLeft: 14 },
  userName: { fontSize: 14, fontWeight: '700', color: '#1C1D1F' },
  userEmail: { fontSize: 12, color: '#6A6F73', marginTop: 2 },
  roleTag: { backgroundColor: '#F7F9FA', borderWidth: 1, borderColor: '#D1D7DC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  roleTagText: { fontSize: 9, fontWeight: '700', color: '#1C1D1F', textTransform: 'uppercase' },

  courseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F7F9FA' },
  courseImageFrame: { width: 54, height: 38, borderRadius: 4, overflow: 'hidden', backgroundColor: '#F7F9FA', borderWidth: 1, borderColor: '#D1D7DC' },
  courseImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  courseImageFallback: { flex: 1, backgroundColor: '#D1D7DC' },
  courseInfo: { flex: 1, paddingHorizontal: 14 },
  courseTitle: { fontSize: 14, fontWeight: '700', color: '#1C1D1F' },
  courseInstructor: { fontSize: 12, color: '#6A6F73', marginTop: 2 },
  statusIndicator: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusApproved: { backgroundColor: '#E6F4EA' },
  statusPending: { backgroundColor: '#FFF4E5' },
  statusText: { fontSize: 10, fontWeight: '700' },
  textApproved: { color: '#137333' },
  textPending: { color: '#B06000' },

  actionGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  paddingHorizontal: 18,
  marginBottom: 20
},

actionCard: {
  width: '48%',
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  padding: 18,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: '#E2E8F0',
},

actionIconWrapper: {
  width: 52,
  height: 52,
  borderRadius: 16,
  backgroundColor: '#EEF2FF',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 14,
},

actionLabel: {
  fontSize: 15,
  fontWeight: '800',
  color: '#0F172A',
},

actionDesc: {
  marginTop: 6,
  fontSize: 12,
  lineHeight: 18,
  color: '#64748B',
},
});