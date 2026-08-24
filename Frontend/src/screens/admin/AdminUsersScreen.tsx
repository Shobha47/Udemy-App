import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { apiClient } from '../../api/client';

export default function AdminUsersScreen({ navigation }: any) {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/dashboard');
      return res.data.data;
    },
  });

  // Pull universal database listings safely
  const rawUsersList = data?.recentUsers || [];

  // Filter list based on real-time text input state changes
  const filteredUsers = rawUsersList.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'SUPERADMIN':
      case 'ADMIN':
        return '#7C3AED'; // Indigo Violet
      case 'INSTRUCTOR':
        return '#2563EB'; // Brand Blue
      default:
        return '#16A34A'; // Emerald Success Green
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'SUPERADMIN':
      case 'ADMIN':
        return 'Admin';
      case 'INSTRUCTOR':
        return 'Instructor';
      default:
        return 'Student';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* HEADER BAR */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Users Management</Text>
          <Text style={styles.subtitle}>
            Manage students, instructors, and system admins
          </Text>
        </View>
      </View>

      {/* STATS MATRIX SLATE ROW GROUPS */}
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.ctaDecorationCircle1} />
            <Text style={styles.statValue}>{rawUsersList.length}</Text>
            <Text style={styles.statLabel}>Total Directory</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.ctaDecorationCircle1} />
            <Text style={styles.statValue}>
              {rawUsersList.filter((u: any) => u.role?.toUpperCase() === 'STUDENT').length}
            </Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
        </View>

        <View style={[styles.statsRow, { marginTop: 12 }]}>
          <View style={styles.statCard}>
            <View style={styles.ctaDecorationCircle1} />
            <Text style={styles.statValue}>
              {rawUsersList.filter((u: any) => u.role?.toUpperCase() === 'INSTRUCTOR').length}
            </Text>
            <Text style={styles.statLabel}>Instructors</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.ctaDecorationCircle1} />
            <Text style={styles.statValue}>
              {rawUsersList.filter((u: any) => ['SUPERADMIN', 'ADMIN'].includes(u.role?.toUpperCase())).length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
        </View>
      </View>

      {/* FLAT SEARCH BOX EMBED ENGINE */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search directories by profile name..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* MAIN USERS FLAT LIST FEED */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.avatarPlaceholderPill}>
              <Text style={styles.avatarTextLabel}>
                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>

              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: getRoleColor(item.role) + '15' },
                ]}
              >
                <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                  {getRoleLabel(item.role)}
                </Text>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.7}>
              <Ionicons name="ellipsis-vertical" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Accounts Found</Text>
            <Text style={styles.emptyDesc}>
              No profile instances matched your filter terms index parameters.
            </Text>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#475569',
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4F46E5',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  searchBox: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
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
    paddingTop: 10,
    paddingBottom: 60,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholderPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    marginTop: 1,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyDesc: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaDecorationCircle1: {
    position: 'absolute',
    left: -20,
    top: -20,
    width: 72,
    height: 72,
    backgroundColor: 'rgba(79, 70, 229, 0.04)',
    borderRadius: 36,
  },
});