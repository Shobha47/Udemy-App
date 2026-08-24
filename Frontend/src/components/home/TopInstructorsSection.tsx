import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { getFallbackAvatar } from '../../constants/avarat';

interface TopInstructorsSectionProps {
  instructors: any;
  navigation: any;
}

export default function TopInstructorsSection({ instructors, navigation }: TopInstructorsSectionProps) {
  const instructorsList = instructors?.data?.instructors || [];

  if (instructorsList.length === 0) return null;

  return (
    <View style={styles.instructorSpotlightSection}>
      <View style={styles.courseHeaderRow}>
        <Text style={styles.sectionHeadingText}>Top Instructors</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('InstructorList')}
          activeOpacity={0.6}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.instructorScrollContainer}
        decelerationRate="fast"
      >
        {instructorsList.map((inst: any) => (
          <TouchableOpacity 
            key={inst.id}  
            onPress={() => navigation.navigate('InstructorDetail', { id: inst.id })} 
            style={styles.instructorCard} 
            activeOpacity={0.85}
          >
            <Image
              source={
                inst.avatar
                  ? { uri: inst.avatar }
                  : getFallbackAvatar(inst.id)
              }
              style={styles.instructorAvatar}
            />
            <View style={styles.instructorInfoWrapper}>
              <Text style={styles.instructorName} numberOfLines={1}>{inst.name}</Text>
              <Text style={styles.instructorRole} numberOfLines={1}>{inst.headline || 'Instructor'}</Text>
              
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{inst.totalStudents?.toLocaleString()}+ Students</Text>
                <Text style={styles.bulletSeparator}>•</Text>
                <Text style={styles.metaText}>{inst.totalCourses} {inst.totalCourses === 1 ? 'Track' : 'Tracks'}</Text>
              </View>

              <View style={styles.ratingRow}>
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.ratingValue}>{Number(inst.averageRating || 0).toFixed(1)}</Text>
                <Text style={styles.reviewsText}>({inst.totalReviews?.toLocaleString()} reviews)</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  instructorSpotlightSection: { 
    backgroundColor: '#ffffff', // Crisp, modern layout off-white canvas
    paddingVertical: 24 
  },
  courseHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'baseline', 
    paddingHorizontal: 16, 
    marginBottom: 16 
  },
  sectionHeadingText: { 
    fontSize: 19, 
    fontWeight: '700', 
    color: '#0F172A', // Elite high-end slate dark blue instead of muddy dark grey
    letterSpacing: -0.4 
  },
  viewAllText: { 
    color: '#4F46E5', 
    fontSize: 14, 
    fontWeight: '600',
    letterSpacing: -0.1
  },
  instructorScrollContainer: { 
    paddingHorizontal: 16,
    paddingBottom: 12 // Secure clearing gap to guarantee shadow isn't chopped by scroll container bounds
  },
  instructorCard: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1,
    borderColor: '#F1F5F9', // Ultra subtle hairline boundary line
    padding: 14, 
    borderRadius: 20, 
    marginRight: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: 315,
    // Modern smooth elevation depth profile 
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  instructorAvatar: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#F1F5F9', 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  instructorInfoWrapper: { 
    flex: 1, 
    paddingLeft: 14,
    justifyContent: 'center'
  },
  instructorName: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#0F172A',
    letterSpacing: -0.2
  },
  instructorRole: { 
    fontSize: 12, 
    color: '#64748B', 
    marginTop: 1,
    fontWeight: '400'
  },
  metaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    marginTop: 6,
  },
  metaText: { 
    fontSize: 11, 
    color: '#64748B', 
    fontWeight: '500' 
  },
  bulletSeparator: {
    fontSize: 11,
    color: '#CBD5E1',
    marginHorizontal: 5
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  starIcon: {
    color: '#EAB308', // Clean, clear aesthetic bright gold
    fontSize: 13,
    marginRight: 4,
    ...Platform.select({
      ios: { bottom: 0.5 },
      android: { bottom: 0 }
    })
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 4
  },
  reviewsText: { 
    color: '#94A3B8', 
    fontWeight: '400', 
    fontSize: 11 
  },
});