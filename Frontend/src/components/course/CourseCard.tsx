import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Course, CourseBadge } from '../../types';

import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface CourseCardProps {
  course: Course;
  onPress: (id: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&w=600&q=80';

  // Resolves contextual colors based on structural badge values
  const getBadgeStyle = (badge: CourseBadge) => {
    switch (badge) {
      case 'Bestseller': return styles.badgeBestseller;
      case 'Hot': return styles.badgeHot;
      case 'TopRated': return styles.badgeTopRated;
      case 'New': return styles.badgeNew;
      default: return styles.badgeDefault;
    }
  };

  const getBadgeTextStyle = (badge: CourseBadge) => {
    switch (badge) {
      case 'Bestseller': return styles.badgeTextBestseller;
      case 'Hot': return styles.badgeTextHot;
      case 'TopRated': return styles.badgeTextTopRated;
      case 'New': return styles.badgeTextNew;
      default: return styles.badgeTextDefault;
    }
  };

  const hasDiscount = course.originalPrice && course.originalPrice > course.price;
  const discountPercent = hasDiscount 
    ? Math.round(((course.originalPrice! - course.price) / course.originalPrice!) * 100)
    : 0;

  return (
    <TouchableOpacity onPress={() => onPress(course.id)} activeOpacity={0.9} style={styles.cardContainer}>
      {/* Thumbnail Block */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: course.image || fallbackImage }} style={styles.cardImage} resizeMode="cover" />
        
        {course.badge && (
          <View style={[styles.floatingBadge, getBadgeStyle(course.badge)]}>
            <Text style={[styles.floatingBadgeText, getBadgeTextStyle(course.badge)]}>{course.badge}</Text>
          </View>
        )}

        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{course.level}</Text>
        </View>
      </View>

      {/* Content Meta Details Block */}
      <View style={styles.detailsContainer}>
        <Text style={styles.categoryText} numberOfLines={1}>
          {course.category?.name || 'General Development'}
        </Text>
        
        <Text style={styles.titleText} numberOfLines={2}>
          {course.title}
        </Text>

        {course.subtitle && (
          <Text style={styles.subtitleText} numberOfLines={1}>
            {course.subtitle}
          </Text>
        )}

        <Text style={styles.instructorText}>
          By <Text style={styles.instructorName}>{course.instructor?.name || 'Academic Pioneer'}</Text>
        </Text>

        {/* Dynamic Metric Display Divider Strip */}
        <View style={styles.statsRow}>
          <View style={styles.ratingWrapper}>
            <Text style={styles.ratingText}>★ {course.rating > 0 ? course.rating.toFixed(1) : '0.0'}</Text>
            <Text style={styles.reviewCountText}>({course.reviewCount.toLocaleString()})</Text>
          </View>
          <View style={styles.metaMetricsWrapper}>
            <Text style={styles.metaMetricText}>⏱ {course.totalHours > 0 ? `${course.totalHours.toFixed(1)}h` : 'Self-Paced'}</Text>
            <Text style={styles.metaMetricDivider}>|</Text>
            <Text style={styles.metaMetricText}>👥 {course.studentCount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Pricing Layout Matrix Strip */}
        <View style={styles.pricingRow}>
          <View style={styles.priceFlex}>
            {course.price === 0 ? (
              <Text style={styles.priceFreeText}>Free</Text>
            ) : (
              <>
                <Text style={styles.priceAmountText}>₹{course.price.toLocaleString('en-IN')}</Text>
                {hasDiscount && (
                  <Text style={styles.originalPriceText}>₹{course.originalPrice!.toLocaleString('en-IN')}</Text>
                )}
              </>
            )}
          </View>

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    width: width - 40,
    marginHorizontal: 20,
  },
  imageWrapper: {
    position: 'relative',
    height: 180,
    // borderRadius: 12,
    overflow: 'hidden',
    // marginBottom: 12,
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  floatingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  floatingBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeBestseller: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
  badgeTextBestseller: { color: '#92400E' },
  badgeHot: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' },
  badgeTextHot: { color: '#991B1B' },
  badgeTopRated: { backgroundColor: '#D1FAE5', borderWidth: 1, borderColor: '#A7F3D0' },
  badgeTextTopRated: { color: '#065F46' },
  badgeNew: { backgroundColor: '#E0E7FF', borderWidth: 1, borderColor: '#C7D2FE' },
  badgeTextNew: { color: '#3730A3' },
  badgeDefault: { backgroundColor: '#F1F5F9' },
  badgeTextDefault: { color: '#334155' },
  levelBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  detailsContainer: {
    padding: 16,
    // paddingVertical: 16,
  },
  categoryText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  instructorText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 12,
  },
  instructorName: {
    color: '#334155',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 8,
    marginBottom: 12,
  },
  ratingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F59E0B',
    marginRight: 4,
  },
  reviewCountText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metaMetricsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaMetricText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metaMetricDivider: {
    color: '#CBD5E1',
    marginHorizontal: 8,
    fontSize: 11,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceFlex: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceFreeText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
    textTransform: 'uppercase',
  },
  priceAmountText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  originalPriceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  discountBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  discountBadgeText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '700',
  },
});