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
import { useMutation, useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { instructorApi } from '../../api/instructor.api';

export default function InstructorCreateCourseScreen({ navigation }: any) {
  // --- CORE STATE FIELDS ---
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

  // --- DYNAMIC FIELD ARRAYS ---
  const [whatYouWillLearn, setWhatYouWillLearn] = useState(['']);
  const [requirements, setRequirements] = useState(['']);

  const [formError, setFormError] = useState('');

  // --- QUERIES & DATA FETCHING ---
  // const { data: categories = [] } = useQuery({
  //   queryKey: ['categories'],
  //   queryFn: instructorApi.getCategories,
  // });

  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: instructorApi.getCategories,
  });

  const categories = Array.isArray(data) ? data : [];

  // Automatically handle subcategory filtering block when parent changes
  useEffect(() => {
    setSubcategoryId('');
  }, [categoryId]);

  console.log('categories:', categories);
  console.log('isArray:', Array.isArray(categories));

  const activeCategory = categories.find(
    (cat: any) => cat.id === categoryId
  );

  const subcategories = activeCategory?.subcategories ?? [];

  // const activeCategory = categories.find((cat: any) => cat.id === categoryId);
  // const subcategories = activeCategory?.subcategories || [];

  // --- DYNAMIC ARRAY HANDLERS ---
  const updateLearnField = (text: string, index: number) => {
    setWhatYouWillLearn(prev => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  const updateRequirementField = (text: string, index: number) => {
    setRequirements(prev => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  // --- API MUTATION ENGINE ---
  const createMutation = useMutation({
    mutationFn: instructorApi.createCourse,
    onSuccess: () => {
      navigation.navigate('AppTabs'); 
    },
    onError: (err: any) => {
      alert(err?.message || 'Error occurred while creating.');
    }
  });

  const handleFormSubmission = () => {
    if (!title.trim() || !subtitle.trim() || !description.trim() || !categoryId) {
      setFormError('Please complete all basic configuration parameters.');
      return;
    }

    // Clean up empty dynamic fields before payload construction
    const cleanLearningList = whatYouWillLearn.filter(item => item.trim() !== '');
    const cleanRequirementsList = requirements.filter(item => item.trim() !== '');

    if (cleanLearningList.length === 0 || cleanRequirementsList.length === 0) {
      setFormError('Please add at least one learning outcome and prerequisite requirement.');
      return;
    }
    setFormError('');

    const structuredPayload = {
      title,
      subtitle,
      description,
      image: image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop', 
      previewVideo: previewVideo || 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      price: Number(price) || 0,
      language,
      level,
      categoryId,
      subcategoryId: subcategoryId || undefined,
      whatYouWillLearn: cleanLearningList, 
      requirements: cleanRequirementsList
    };

    createMutation.mutate(structuredPayload);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER ROW */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Create Shell Blueprint</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.formContextScroll}>
        <View style={styles.formWrapper}>
          <Text style={styles.formBlockHeading}>Basic Specifications</Text>

          {formError ? <Text style={styles.errorBannerText}>{formError}</Text> : null}

          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Course Title</Text>
            <TextInput 
              style={styles.textInputFrame} 
              placeholder="The Complete React & Next.js Bootcamp" 
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Subtitle Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Subtitle Description</Text>
            <TextInput 
              style={styles.textInputFrame} 
              placeholder="Master React, Next.js, TypeScript and Full Stack Architecture" 
              placeholderTextColor="#94A3B8"
              value={subtitle}
              onChangeText={setSubtitle}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Detailed Description Matrix</Text>
            <TextInput 
              style={[styles.textInputFrame, { height: 100, paddingTop: 12 }]} 
              placeholder="Write a compelling course description summary..." 
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Price Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Target Valuation Price (INR)</Text>
            <TextInput 
              style={styles.textInputFrame} 
              placeholder="₹ Amount" 
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* LANGUAGE PICKER ROW */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instruction Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRowSelector}>
              {['English', 'Hindi', 'Spanish', 'German'].map((lang) => {
                const isActive = language === lang;
                return (
                  <TouchableOpacity 
                    key={lang} 
                    style={[styles.categorySelectorPill, isActive && styles.pillActive]}
                    onPress={() => setLanguage(lang)}
                  >
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{lang}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* LEVEL PICKER ROW */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Difficulty Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRowSelector}>
              {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((lvl) => {
                const isActive = level === lvl;
                return (
                  <TouchableOpacity 
                    key={lvl} 
                    style={[styles.categorySelectorPill, isActive && styles.pillActive]}
                    onPress={() => setLevel(lvl)}
                  >
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{lvl}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* CATEGORY PICKER */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Parent Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRowSelector}>
              {categories.map((cat: any) => {
                const isActive = categoryId === cat.id;
                return (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={[styles.categorySelectorPill, isActive && styles.pillActive]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* SUBCATEGORY PICKER */}
          {categoryId && subcategories.length > 0 ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subcategory</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRowSelector}>
                {subcategories.map((sub: any) => {
                  const isActive = subcategoryId === sub.id;
                  return (
                    <TouchableOpacity 
                      key={sub.id} 
                      style={[styles.categorySelectorPill, isActive && styles.pillActive]}
                      onPress={() => setSubcategoryId(sub.id)}
                    >
                      <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{sub.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {/* Media Links — Image Thumbnail */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Image Thumbnail Asset (URL Link)</Text>
            <TextInput 
              style={styles.textInputFrame} 
              placeholder="https://resource-endpoint.com/image.png" 
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="url"
              value={image}
              onChangeText={setImage}
            />
          </View>

          {/* Media Links — Preview Video */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Preview Video Track (URL Link)</Text>
            <TextInput 
              style={styles.textInputFrame} 
              placeholder="https://resource-endpoint.com/preview.mp4" 
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="url"
              value={previewVideo}
              onChangeText={setPreviewVideo}
            />
          </View>

          {/* DYNAMIC FIELD ARRAY: WHAT YOU WILL LEARN */}
          <View style={styles.dividerBlock}>
            <View style={styles.dynamicHeaderRow}>
              <Text style={styles.formBlockHeading}>What Students Will Learn</Text>
              <TouchableOpacity 
                style={styles.appendArrayBtn}
                onPress={() => setWhatYouWillLearn(prev => [...prev, ''])}
              >
                <Ionicons name="add" size={16} color="#4F46E5" />
                <Text style={styles.appendArrayBtnText}>Add Field</Text>
              </TouchableOpacity>
            </View>
            {whatYouWillLearn.map((outcome, idx) => (
              <View key={idx} style={styles.dynamicRow}>
                <TextInput
                  style={[styles.textInputFrame, { flex: 1 }]}
                  placeholder={`Learning Outcome #${idx + 1}`}
                  placeholderTextColor="#94A3B8"
                  value={outcome}
                  onChangeText={(text) => updateLearnField(text, idx)}
                />
                {whatYouWillLearn.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeArrayBtn}
                    onPress={() => setWhatYouWillLearn(prev => prev.filter((_, i) => i !== idx))}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* DYNAMIC FIELD ARRAY: REQUIREMENTS */}
          <View style={styles.dividerBlock}>
            <View style={styles.dynamicHeaderRow}>
              <Text style={styles.formBlockHeading}>Course Requirements</Text>
              <TouchableOpacity 
                style={styles.appendArrayBtn}
                onPress={() => setRequirements(prev => [...prev, ''])}
              >
                <Ionicons name="add" size={16} color="#4F46E5" />
                <Text style={styles.appendArrayBtnText}>Add Field</Text>
              </TouchableOpacity>
            </View>
            {requirements.map((req, idx) => (
              <View key={idx} style={styles.dynamicRow}>
                <TextInput
                  style={[styles.textInputFrame, { flex: 1 }]}
                  placeholder={`Prerequisite Requirement #${idx + 1}`}
                  placeholderTextColor="#94A3B8"
                  value={req}
                  onChangeText={(text) => updateRequirementField(text, idx)}
                />
                {requirements.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeArrayBtn}
                    onPress={() => setRequirements(prev => prev.filter((_, i) => i !== idx))}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* COMMIT ACTION FOOTER BAR */}
      <View style={styles.footerStickySheet}>
        <TouchableOpacity 
          style={styles.commitSubmitBtn} 
          disabled={createMutation.isPending}
          onPress={handleFormSubmission}
        >
          {createMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkbox-outline" size={16} color="#FFFFFF" />
              <Text style={styles.commitSubmitBtnText}>Assemble Course Module</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { padding: 4 },
  headerTitleText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  formContextScroll: { flex: 1 },
  formWrapper: { padding: 20, gap: 16 },
  formBlockHeading: { fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2 },
  errorBannerText: { color: '#EF4444', fontSize: 13, fontWeight: '600', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: 4 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  textInputFrame: { height: 48, width: '100%', borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', paddingHorizontal: 14, fontSize: 14, color: '#0F172A' },
  categoryRowSelector: { gap: 8, paddingVertical: 2 },
  categorySelectorPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  pillActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  pillTextActive: { color: '#FFFFFF' },
  dividerBlock: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20, gap: 12, marginTop: 10 },
  dynamicHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  appendArrayBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  appendArrayBtnText: { color: '#4F46E5', fontSize: 13, fontWeight: '700' },
  dynamicRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  removeArrayBtn: { width: 44, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  footerStickySheet: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  commitSubmitBtn: { backgroundColor: '#0F172A', height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  commitSubmitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});