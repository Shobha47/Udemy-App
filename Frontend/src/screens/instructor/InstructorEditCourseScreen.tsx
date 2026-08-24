// src/screens/instructor/InstructorEditCourseScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { instructorApi } from '../../api/instructor.api';

export default function InstructorEditCourseScreen({ route, navigation }: any) {
  const { id } = route.params;
  const queryClient = useQueryClient();

  // --- FORM STRUCTURAL STATE ---
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [previewVideo, setPreviewVideo] = useState('');
  const [price, setPrice] = useState('');
  const [language, setLanguage] = useState('English');
  const [level, setLevel] = useState('Beginner');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');

  // --- DYNAMIC CONTROL ARRAYS ---
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);

  const [formError, setFormError] = useState('');

  // --- QUERY 1: FETCH ACTIVE RECONSTRUCTION SPECIFICATIONS ---
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => instructorApi.getCourseById(id),
    enabled: !!id,
  });

  // --- QUERY 2: FETCH RESOURCE SELECTION LISTS ---
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: instructorApi.getCategories,
  });

  // Populate structural variables on query completions
  useEffect(() => {
    if (course) {
      setTitle(course.title ?? '');
      setSubtitle(course.subtitle ?? '');
      setDescription(course.description ?? '');
      setImage(course.image ?? '');
      setPreviewVideo(course.previewVideo ?? '');
      setPrice(course.price ? String(course.price) : '0');
      setLanguage(course.language ?? 'English');
      setLevel(course.level ?? 'Beginner');
      setCategoryId(course.categoryId ?? '');
      setSubcategoryId(course.subcategoryId ?? '');

      if (course.whatYouWillLearn && course.whatYouWillLearn.length > 0) {
        setWhatYouWillLearn(course.whatYouWillLearn);
      }
      if (course.requirements && course.requirements.length > 0) {
        setRequirements(course.requirements);
      }
    }
  }, [course]);

  // Handle baseline dynamic structural wipes when parent parameters update
  const handleCategorySelectionUpdate = (selectedId: string) => {
    setCategoryId(selectedId);
    setSubcategoryId(''); // Reset nested references immediately to block mutations
  };

  console.log('categories:', categories);
  console.log('type:', typeof categories);
  console.log('isArray:', Array.isArray(categories));

  const categoriesList = Array.isArray(categories)
  ? categories
  : categories?.data?.categories || [];

  console.log('categoriesList:', categoriesList);

  const activeCategoryObject =
  Array.isArray(categories)
    ? categories.find((cat: any) => cat.id === categoryId)
    : undefined;

  // const activeCategoryObject =
  //   categoriesList.find((cat: any) => cat.id === categoryId);

  const subcategoriesList =
    activeCategoryObject?.subcategories || [];

  // const activeCategoryObject = categories.find((cat: any) => cat.id === categoryId);
  // const subcategoriesList = activeCategoryObject?.subcategories || [];

  // --- DYNAMIC ARRAYS STATE INTERFACES ---
  const handleUpdateLearningOutcome = (text: string, index: number) => {
    setWhatYouWillLearn(prev => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  const handleUpdateRequirement = (text: string, index: number) => {
    setRequirements(prev => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  // --- API PATCH MUTATION INFRASTRUCTURE ---
  const updateMutation = useMutation({
    mutationFn: (payload: any) => instructorApi.updateCourse(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      navigation.goBack();
    },
    onError: (err: any) => {
      alert(err?.message || 'Update request failed.');
    }
  });

  const handleUpdateSubmission = () => {
    if (!title.trim() || !subtitle.trim() || !description.trim() || !categoryId) {
      setFormError('Please verify all required system descriptive parameters.');
      return;
    }

    const cleanLearningList = whatYouWillLearn.filter(item => item.trim() !== '');
    const cleanRequirementsList = requirements.filter(item => item.trim() !== '');

    if (cleanLearningList.length === 0 || cleanRequirementsList.length === 0) {
      setFormError('Please provide at least one active learning topic and prerequisite item.');
      return;
    }
    setFormError('');

    const refinedPayload = {
      title,
      subtitle,
      description,
      image,
      previewVideo,
      price: Number(price) || 0,
      language,
      level,
      categoryId,
      subcategoryId: subcategoryId || undefined,
      whatYouWillLearn: cleanLearningList,
      requirements: cleanRequirementsList
    };

    updateMutation.mutate(refinedPayload);
  };

  if (courseLoading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Edit Metadata Specs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionFormTitle}>Modify Core Parameters</Text>

          {formError ? <Text style={styles.errorBannerText}>{formError}</Text> : null}

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Course Title</Text>
            <TextInput style={styles.textInputFrame} value={title} onChangeText={setTitle} />
          </View>

          {/* Subtitle */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Subtitle Summary</Text>
            <TextInput style={styles.textInputFrame} value={subtitle} onChangeText={setSubtitle} />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description Text Content</Text>
            <TextInput 
              style={[styles.textInputFrame, { height: 120, paddingTop: 12 }]} 
              multiline 
              textAlignVertical="top"
              value={description} 
              onChangeText={setDescription} 
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price Valuation (INR)</Text>
            <TextInput style={styles.textInputFrame} keyboardType="numeric" value={price} onChangeText={setPrice} />
          </View>

          {/* Language Horiz Selector Row */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instruction Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSliderGrid}>
              {['English', 'Hindi', 'Spanish', 'German'].map((lang) => {
                const isSelected = language === lang;
                return (
                  <TouchableOpacity 
                    key={lang} 
                    style={[styles.selectorPill, isSelected && styles.pillActive]}
                    onPress={() => setLanguage(lang)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{lang}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Difficulty Level Horiz Selector Row */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Difficulty Level Target</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSliderGrid}>
              {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((lvl) => {
                const isSelected = level === lvl;
                return (
                  <TouchableOpacity 
                    key={lvl} 
                    style={[styles.selectorPill, isSelected && styles.pillActive]}
                    onPress={() => setLevel(lvl)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{lvl}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Category Horiz Selector Row */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Parent Track Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSliderGrid}>
              {categoriesList.map((cat: any) => {
                const isSelected = categoryId === cat.id;
                return (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={[styles.selectorPill, isSelected && styles.pillActive]}
                    onPress={() => handleCategorySelectionUpdate(cat.id)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Subcategory Horiz Selector Row */}
          {categoryId && subcategoriesList.length > 0 ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subcategory Specification</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSliderGrid}>
                {subcategoriesList.map((sub: any) => {
                  const isSelected = subcategoryId === sub.id;
                  return (
                    <TouchableOpacity 
                      key={sub.id} 
                      style={[styles.selectorPill, isSelected && styles.pillActive]}
                      onPress={() => setSubcategoryId(sub.id)}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{sub.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {/* Thumbnail Image URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Thumbnail Asset Link (URL)</Text>
            <TextInput style={styles.textInputFrame} autoCapitalize="none" keyboardType="url" value={image} onChangeText={setImage} />
          </View>

          {/* Preview Video URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Preview Video Track Link (URL)</Text>
            <TextInput style={styles.textInputFrame} autoCapitalize="none" keyboardType="url" value={previewVideo} onChangeText={setPreviewVideo} />
          </View>

          {/* WHAT YOU WILL LEARN FIELD ARRAY PANEL */}
          <View style={styles.dividerBlockSection}>
            <View style={styles.arrayPanelHeaderRow}>
              <Text style={styles.sectionTitleText}>What Students Will Learn</Text>
              <TouchableOpacity style={styles.appendFieldBtn} onPress={() => setWhatYouWillLearn(prev => [...prev, ''])}>
                <Ionicons name="add" size={16} color="#4F46E5" />
                <Text style={styles.appendFieldBtnText}>Add Row</Text>
              </TouchableOpacity>
            </View>
            {whatYouWillLearn.map((outcome, idx) => (
              <View key={idx} style={styles.arrayItemRow}>
                <TextInput
                  style={[styles.textInputFrame, { flex: 1 }]}
                  placeholder={`Learning Metric Outcome #${idx + 1}`}
                  placeholderTextColor="#94A3B8"
                  value={outcome}
                  onChangeText={(text) => handleUpdateLearningOutcome(text, idx)}
                />
                {whatYouWillLearn.length > 1 && (
                  <TouchableOpacity style={styles.deleteFieldBtn} onPress={() => setWhatYouWillLearn(prev => prev.filter((_, i) => i !== idx))}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* PREREQUISITE REQUIREMENTS FIELD ARRAY PANEL */}
          <View style={styles.dividerBlockSection}>
            <View style={styles.arrayPanelHeaderRow}>
              <Text style={styles.sectionTitleText}>Prerequisite Requirements</Text>
              <TouchableOpacity style={styles.appendFieldBtn} onPress={() => setRequirements(prev => [...prev, ''])}>
                <Ionicons name="add" size={16} color="#4F46E5" />
                <Text style={styles.appendFieldBtnText}>Add Row</Text>
              </TouchableOpacity>
            </View>
            {requirements.map((req, idx) => (
              <View key={idx} style={styles.arrayItemRow}>
                <TextInput
                  style={[styles.textInputFrame, { flex: 1 }]}
                  placeholder={`Prerequisite Standard #${idx + 1}`}
                  placeholderTextColor="#94A3B8"
                  value={req}
                  onChangeText={(text) => handleUpdateRequirement(text, idx)}
                />
                {requirements.length > 1 && (
                  <TouchableOpacity style={styles.deleteFieldBtn} onPress={() => setRequirements(prev => prev.filter((_, i) => i !== idx))}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* FOOTER ACTION STICKY BAR */}
      <View style={styles.footerStickySheet}>
        <TouchableOpacity 
          style={styles.commitSubmitBtn} 
          disabled={updateMutation.isPending}
          onPress={handleUpdateSubmission}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={16} color="#FFFFFF" />
              <Text style={styles.commitSubmitBtnText}>Commit Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { padding: 4 },
  headerTitleText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  formContainer: { padding: 20, gap: 16, paddingBottom: 40 },
  sectionFormTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', letterSpacing: -0.4, marginBottom: 4 },
  errorBannerText: { color: '#EF4444', fontSize: 13, fontWeight: '600', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: 4 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  textInputFrame: { height: 48, width: '100%', borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontSize: 14, color: '#0F172A' },
  horizontalSliderGrid: { gap: 8, paddingVertical: 2 },
  selectorPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  pillActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  pillTextActive: { color: '#FFFFFF' },
  dividerBlockSection: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20, gap: 12, marginTop: 10 },
  arrayPanelHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitleText: { fontSize: 15, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2 },
  appendFieldBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  appendFieldBtnText: { color: '#4F46E5', fontSize: 13, fontWeight: '700' },
  arrayItemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteFieldBtn: { width: 44, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  footerStickySheet: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  commitSubmitBtn: { backgroundColor: '#4F46E5', height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  commitSubmitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});