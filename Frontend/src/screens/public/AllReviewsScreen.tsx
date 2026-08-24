import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CourseReviewsScreen({ route, navigation }: any) {
  const { courseId } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}`);
      return res.data?.data?.course;
    },
  });

  const course = data;

  const reviews = course?.reviews || [];

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}  edges={['top']}>
      {/* HEADER */}
      {/* Premium Flat Header */}
            <View style={styles.headerContainer}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Reviews</Text>
              </View>
            </View>

      {/* SUMMARY CARD */}
      <View style={styles.summaryCard}>
        <Text style={styles.ratingBig}>
          {Number(course?.rating || 0).toFixed(1)}
        </Text>

        <View style={{ marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons key={i} name="star" size={16} color="#F59E0B" />
            ))}
          </View>

          <Text style={styles.summaryText}>
            {course?.reviewCount || 0} total reviews
          </Text>
        </View>
      </View>

      {/* REVIEWS LIST */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* TOP */}
            <View style={styles.topRow}>
              <View style={styles.userRow}>
                <Image
                  source={{
                    uri:
                      item.avatar ||
                      `https://api.dicebear.com/7.x/personas/png?seed=${item.author}`,
                  }}
                  style={styles.avatar}
                />

                <View>
                  <Text style={styles.name}>{item.author}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
              </View>

              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>

            {/* CONTENT */}
            <Text style={styles.content}>{item.content}</Text>

            {/* HELPFUL */}
            {item.helpful > 0 && (
              <View style={styles.helpfulRow}>
                <Ionicons name="thumbs-up-outline" size={14} color="#64748B" />
                <Text style={styles.helpfulText}>
                  {item.helpful} people found helpful
                </Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubble-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>No reviews yet</Text>
          </View>
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

  // Udemy Header Navigation Matrix
  headerContainer: { 
    paddingHorizontal: 24, 
    height: 60,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16, paddingVertical: 4 },
  backIcon: { fontSize: 24, fontWeight: '300', color: '#1C1D1F' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1C1D1F' },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },

  ratingBig: {
    fontSize: 40,
    fontWeight: '800',
    color: '#0F172A',
  },

  summaryText: {
    fontSize: 13,
    color: '#64748B',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  date: {
    fontSize: 12,
    color: '#64748B',
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },

  content: {
    marginTop: 10,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },

  helpfulRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  helpfulText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#64748B',
  },

  empty: {
    marginTop: 50,
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94A3B8',
  },
});