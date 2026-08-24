import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_ICONS: Record<string, string> = {
  Development: '💻',
  'Data Science': '📊',
  Design: '🎨',
  Marketing: '📢',
  Business: '💼',
  Tally: '📒',
  Accounting: '🧾',
  Finance: '💰',
  'IT & Software': '🖥️',
};

export default function CategoryScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.data;
    },
  });

  // Safely handle structure arrays checking deep fields inside payload response nodes
  const categoriesList = data?.data?.categories || data?.data || [];

  const filteredCategories = categoriesList.filter((category: any) =>
    category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* PREMIUM HEADER SEARCH ENGINE */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
        </View>

        <View style={styles.searchBarWrapper}>
          <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            placeholder="Search all categories..."
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

      {/* RENDER VIEW CONTEXTS BASED ON REMOTE INFRASTRUCTURE STATE */}
      {isLoading ? (
        <View style={styles.centerLoadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Syncing category structural nodes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => (item.id || item.slug).toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            // Match corresponding emoji indicator strings safely or fallback cleanly
            const assignedEmoji = CATEGORY_ICONS[item.name] || '📖';

            return (
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.categoryRowItem}
                onPress={() =>
                  navigation.navigate('CourseList', {
                    category: item.slug,
                    title: item.name,
                  })
                }
              >
                <View style={styles.itemLeftGroup}>
                  <View style={styles.iconCircleBadge}>
                    <Text style={styles.iconEmoji}>{assignedEmoji}</Text>
                  </View>
                  <View style={styles.textMetadataBlock}>
                    <Text style={styles.categoryTitleText}>{item.name}</Text>
                    <Text style={styles.courseCountText}>
                      {item._count?.courses ?? item.courseCount ?? 0} active tracks available
                    </Text>
                  </View>
                </View>
                
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTitle}>No categories found</Text>
              <Text style={styles.emptyDescription}>
                Try adjusting your active query criteria text to lookup standard catalog disciplines.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 12,
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
    marginBottom: 14,
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  categoryRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  iconCircleBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  textMetadataBlock: {
    marginLeft: 14,
    flex: 1,
  },
  categoryTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  courseCountText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  emptyBox: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});