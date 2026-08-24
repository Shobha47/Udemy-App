import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function InstructorAllCoursesScreen({
  route,
  navigation,
}: any) {
  // Pull parameters sent forward from primary detail route orchestrator
  const { instructorName, courses } = route.params;

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
      <Image source={{ uri: item.image }} style={styles.courseImageFlat} />

      <View style={styles.courseContentFlat}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{item.level || 'All Levels'}</Text>
        </View>

        <Text numberOfLines={2} style={styles.courseTitle}>
          {item.title}
        </Text>

        <View style={styles.courseFooter}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>All Courses</Text>
            <Text style={styles.headerSubtitle}>by {instructorName}</Text>
          </View>
        </View>
      </View>

      {/* COMPACT CLEAN SCROLL INTERFACE AREA */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCourse}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 1,
  },
  listContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
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