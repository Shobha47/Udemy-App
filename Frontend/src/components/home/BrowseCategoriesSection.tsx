import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BrowseCategoriesSectionProps {
  categories: any;
  navigation: any;
}

// Helper to assign high-end context-aware icons dynamically based on category slug
const getCategoryIcon = (slug: string): keyof typeof Ionicons.glyphMap => {
  const normalizeSlug = slug?.toLowerCase() || '';
  if (normalizeSlug.includes('code') || normalizeSlug.includes('dev') || normalizeSlug.includes('tech')) return 'code-slash-outline';
  if (normalizeSlug.includes('design') || normalizeSlug.includes('art') || normalizeSlug.includes('creative')) return 'brush-outline';
  if (normalizeSlug.includes('biz') || normalizeSlug.includes('business') || normalizeSlug.includes('finance')) return 'stats-chart-outline';
  if (normalizeSlug.includes('market')) return 'megaphone-outline';
  if (normalizeSlug.includes('photo') || normalizeSlug.includes('video')) return 'camera-outline';
  if (normalizeSlug.includes('music')) return 'musical-notes-outline';
  if (normalizeSlug.includes('health') || normalizeSlug.includes('fit')) return 'heart-outline';
  return 'grid-outline'; // Elite abstract default
};

export default function BrowseCategoriesSection({ categories, navigation }: BrowseCategoriesSectionProps) {
  const categoriesList = categories?.data?.categories || [];

  if (categoriesList.length === 0) return null;

  return (
    <View style={styles.categoriesSection}>
      <View style={styles.courseHeaderRow}>
        <Text style={styles.sectionHeadingText}>Browse Categories</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CategoriesTab')}
          activeOpacity={0.6}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
      >
        {categoriesList.map((category: any) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('CourseList', {
                category: category.slug,
                title: category.name,
              })
            }
          >
            <View style={styles.categoryIconContainer}>
              <Ionicons 
                name={getCategoryIcon(category.slug)} 
                size={22} 
                color="#4F46E5" 
              />
            </View>
            <Text style={styles.categoryName} numberOfLines={1}>{category.name}</Text>
            <Text style={styles.categoryCount}>{category._count?.courses || 0} Courses</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesSection: { 
    backgroundColor: '#ffffff', // Shared light canvas space
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
    color: '#0F172A', 
    letterSpacing: -0.4 
  },
  viewAllText: { 
    color: '#4F46E5', 
    fontSize: 14, 
    fontWeight: '600',
    letterSpacing: -0.1
  },
  scrollContainer: { 
    paddingHorizontal: 16,
    paddingBottom: 12 // Keeps drop shadows from getting clipped inside horizontal scroll frameworks
  },
  categoryCard: { 
    width: 145, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 16, 
    marginRight: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9', // Crisp micro edge accent line
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryIconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, // Premium circular shape frames structural layout better
    backgroundColor: '#EEF2FF', // Ultra soft primary indigo tint base
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12,
  },
  categoryName: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#0F172A', 
    textAlign: 'center',
    letterSpacing: -0.1,
    paddingHorizontal: 2
  },
  categoryCount: { 
    marginTop: 4, 
    fontSize: 12, 
    color: '#64748B', 
    fontWeight: '500' 
  },
});