import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { getFallbackAvatar } from '../../constants/avarat';

export default function InstructorListScreen({ route, navigation }: any) {
  const initialSearch = route?.params?.category || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory] = useState(initialSearch);

  // --- QUERY INFRASTRUCTURE ---
  const { data: serverPayload, isLoading, isError, refetch } = useQuery({
    queryKey: ['instructors', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get('/public/instructors', {
        params: {
          search: searchQuery || undefined,
        },
      });
      return response.data;
    },
  });

  const instructorsList = serverPayload?.data?.instructors || serverPayload?.data || [];

  // --- RENDER CARD METHOD ---
  const renderInstructorItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.instructorFlatCard}
        onPress={() => navigation.navigate('InstructorDetail', { id: item.id })}
      >
        <Image
          source={
            item.avatar
              ? { uri: item.avatar }
              : getFallbackAvatar(item.id)
          }
          style={styles.cardAvatarElement}
        />

        <View style={styles.cardContentColumn}>
          <Text style={styles.cardNameText}>{item.name}</Text>

          <Text numberOfLines={2} style={styles.cardHeadlineText}>
            {item.headline || 'Professional Instructor'}
          </Text>

          <View style={styles.cardRatingRowStrip}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingValueText}>
              {Number(item.averageRating || 0).toFixed(1)}
            </Text>
            <Text style={styles.reviewCountText}>
              ({item.totalReviews || 0} reviews)
            </Text>
          </View>

          <View style={styles.cardMetadataRowStrip}>
            <View style={styles.metaBadgeItem}>
              <Ionicons name="people-outline" size={14} color="#64748B" />
              <Text style={styles.metaBadgeValueText}>
                {item.totalStudents >= 1000
                  ? `${(item.totalStudents / 1000).toFixed(1)}K`
                  : item.totalStudents || 0}{' '}
                Students
              </Text>
            </View>

            <View style={styles.metaBadgeItem}>
              <Ionicons name="book-outline" size={14} color="#64748B" />
              <Text style={styles.metaBadgeValueText}>
                {item.totalCourses || 0} Courses
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── STICKY HEADER SEARCH ENGINE ─── */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedCategory ? selectedCategory : 'All Instructors'}
          </Text>
        </View>

        <View style={styles.searchBarWrapper}>
          <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            placeholder="Search instructors by name or specialty..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
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

      {/* ─── MAIN LIST VIEW CONTROLLER LAYERS ─── */}
      {isLoading ? (
        <View style={styles.centerLoadingFrame}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Syncing instructor directory...</Text>
        </View>
      ) : (
        <FlatList
          data={instructorsList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderInstructorItem}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyBoxFrame}>
              <Text style={styles.emptyEmoji}>👨‍🏫</Text>
              <Text style={styles.emptyTitleText}>No instructors found</Text>
              <Text style={styles.emptyDescriptionText}>
                Try narrowing or clearing your query parameters to search the universal system index.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CORE CANVAS SCHEMES
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // STICKY APP HEADERS
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
    marginBottom: 14,
  },
  backButton: {
    marginRight: 14,
    padding: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  searchBarWrapper: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },

  // PREMIUM LAYOUT FLAT ROW CARDS
  instructorFlatCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardAvatarElement: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardContentColumn: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  cardNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardHeadlineText: {
    marginTop: 3,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  cardRatingRowStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingValueText: {
    marginLeft: 4,
    fontWeight: '700',
    fontSize: 13,
    color: '#0F172A',
  },
  reviewCountText: {
    marginLeft: 4,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  cardMetadataRowStrip: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 16,
  },
  metaBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaBadgeValueText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  // LOADER CONFIGURATIONS
  centerLoadingFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },

  // EMPTY FEED PLATFORM RESPONSES PLUGS
  emptyBoxFrame: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDescriptionText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});