import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';

export default function AdminCategoryManagementScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategorySlug, setSubcategorySlug] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.data.data.categories;
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post('/categories', { name: categoryName, slug: categorySlug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setCategoryName('');
      setCategorySlug('');
      Alert.alert('Success', 'Category created cleanly.');
    },
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post('/categories/subcategory', {
        name: subcategoryName,
        slug: subcategorySlug,
        categoryId: selectedCategory,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setSubcategoryName('');
      setSubcategorySlug('');
      Alert.alert('Success', 'Subcategory created cleanly.');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Category Management</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContextContainer}>
          
          {/* SECTION 1: CREATE CATEGORY */}
          <Text style={styles.formGroupSectionHeading}>Create Category</Text>
          
          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Category Name</Text>
            <TextInput style={styles.textInputNode} value={categoryName} onChangeText={setCategoryName} placeholder="e.g., Development" placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Slug URL node</Text>
            <TextInput style={styles.textInputNode} value={categorySlug} onChangeText={setCategorySlug} autoCapitalize="none" placeholder="e.g., development" placeholderTextColor="#94A3B8" />
          </View>

          <TouchableOpacity 
            style={[styles.actionSubmitBtn, { marginBottom: 20 }]}
            disabled={createCategoryMutation.isPending}
            onPress={() => createCategoryMutation.mutate()}
          >
            {createCategoryMutation.isPending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.actionSubmitBtnText}>Add New Category</Text>}
          </TouchableOpacity>

          {/* SECTION 2: CREATE SUBCATEGORY */}
          <Text style={styles.formGroupSectionHeading}>Create Subcategory</Text>

          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Parent Category Context</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={{ color: '#0F172A' }} dropdownIconColor="#64748B">
                <Picker.Item label="Select Parent Category..." value="" />
                {categories.map((cat: any) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Subcategory Name</Text>
            <TextInput style={styles.textInputNode} value={subcategoryName} onChangeText={setSubcategoryName} placeholder="e.g., React Native" placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Subcategory Slug</Text>
            <TextInput style={styles.textInputNode} value={subcategorySlug} onChangeText={setSubcategorySlug} autoCapitalize="none" placeholder="e.g., react-native" placeholderTextColor="#94A3B8" />
          </View>

          <TouchableOpacity 
            style={[styles.actionSubmitBtn, { marginBottom: 20 }]}
            disabled={createSubcategoryMutation.isPending}
            onPress={() => createSubcategoryMutation.mutate()}
          >
            {createSubcategoryMutation.isPending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.actionSubmitBtnText}>Add New Subcategory</Text>}
          </TouchableOpacity>

          {/* SECTION 3: SYSTEM BLUEPRINTS ACTIVE LISTING */}
          <Text style={styles.formGroupSectionHeading}>System Directories ({categories.length})</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#4F46E5" style={{ marginTop: 12 }} />
          ) : (
            categories.map((category: any) => (
              <View key={category.id} style={styles.directoryItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.directoryNameText}>{category.name} <Text style={styles.directoryMetaCount}>({category._count?.courses || 0} tracks)</Text></Text>
                  <View style={styles.subBadgesRowGroup}>
                    {category.subcategories?.map((sub: any) => (
                      <View key={sub.id} style={styles.subBadgeNode}>
                        <Text style={styles.subBadgeNodeText}>{sub.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.inlineDeleteBtn}
                  onPress={() => Alert.alert('Delete Category', `Confirm removal of ${category.name}?`, [
                    { text: 'Cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteCategoryMutation.mutate(category.id) }
                  ])}
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                </TouchableOpacity>
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
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { padding: 4 },
  headerTitleText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  formContextContainer: { padding: 20, gap: 16 },
  formGroupSectionHeading: { fontSize: 15, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8, marginBottom: 4 },
  inputFieldGroup: { gap: 6, marginBottom: 4 },
  fieldLabelText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  textInputNode: { height: 46, width: '100%', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontSize: 13, color: '#0F172A' },
  pickerContainer: { height: 46, width: '100%', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', justifyContent: 'center' },
  actionSubmitBtn: { backgroundColor: '#4F46E5', height: 46, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
  actionSubmitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  
  directoryItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  directoryNameText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  directoryMetaCount: { fontSize: 12, fontWeight: '500', color: '#64748B' },
  subBadgesRowGroup: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  subBadgeNode: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4, marginRight: 6, borderWidth: 1, borderColor: '#E0E7FF' },
  subBadgeNodeText: { color: '#4338CA', fontSize: 11, fontWeight: '600' },
  inlineDeleteBtn: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8, marginLeft: 8 },
});