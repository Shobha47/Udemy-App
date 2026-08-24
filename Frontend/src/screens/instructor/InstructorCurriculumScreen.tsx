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
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { instructorApi } from '../../api/instructor.api';

// interface LessonField {
//   id?: string;
//   title: string;
//   videoUrl: string;
//   duration: string;
//   isPreview: boolean;
// }

interface LessonField {
  id?: string;

  title: string;

  videoUrl?: string;

  content?: string;

  duration?: string;

  isPreview: boolean;

  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];

  assignment?: {
    title: string;
    instructions: string;
  };
}

interface SectionField {
  id?: string;
  title: string;
  lessons: LessonField[];
}

export default function InstructorCurriculumScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const queryClient = useQueryClient();
  
  // Flat local layout state engine handling nested structures atomically
  const [sections, setSections] = useState<SectionField[]>([]);

  // ─── DATA RESOLUTION FETCH PIPELINE ───
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => instructorApi.getCourseById(courseId),
    enabled: !!courseId,
  });

  // Rehydrate data matrix when server records return
  useEffect(() => {
    if (course) {
      console.log('========== COURSE DATA ==========');
      console.log(JSON.stringify(course, null, 2));

      if (course.curriculum && course.curriculum.length > 0) {
        course.curriculum.forEach((sec: any) => {
          sec.lessons.forEach((les: any) => {
            console.log(
              'LESSON RAW:',
              JSON.stringify(les, null, 2)
            );
          });
        });

        setSections(
          course.curriculum.map((sec: any) => ({
            id: sec.id,
            title: sec.title || '',
            // lessons: (sec.lessons || []).map((les: any) => ({
            //   id: les.id,
            //   title: les.title || '',
            //   videoUrl: les.videoUrl || '',
            //   duration: les.duration ? String(les.duration) : '',
            //   isPreview: les.isPreview || false,
            // })),
            lessons: (sec.lessons || []).map((les: any) => ({
              id: les.id,
              type: les.type || 'video',
              title: les.title || '',
              videoUrl: les.videoUrl || '',
              content: les.content || '',
              quiz: les.quiz,
              assignment: les.assignment,
              duration: les.duration ? String(les.duration) : '',
              isPreview: les.isPreview || false,
            })),
          }))
        );
      } else {
        // Fallback default state shell matching web behavior
        handleAddSection();
      }
    }
  }, [course]);

  // useEffect(() => {
  //   if (course) {

  //     console.log('========== COURSE DATA ==========');
  //     console.log(JSON.stringify(course, null, 2));

  //     if (course.curriculum && course.curriculum.length > 0) {

  //       console.log('========== CURRICULUM ==========');
  //       console.log(JSON.stringify(course.curriculum, null, 2));

  //       course.curriculum.forEach((sec: any, sIdx: number) => {
  //         console.log(`SECTION ${sIdx + 1}`);
  //         console.log('ID:', sec.id);
  //         console.log('TITLE:', sec.title);

  //         (sec.lessons || []).forEach((les: any, lIdx: number) => {
  //           console.log(
  //             'RAW LESSON:',
  //             JSON.stringify(les, null, 2)
  //           );
  //           console.log(
  //             `SECTION ${sIdx + 1} LESSON ${lIdx + 1}`
  //           );
  //           console.log('LESSON ID:', les.id);
  //           console.log('TITLE:', les.title);
  //           console.log('VIDEO URL:', les.videoUrl);
  //           console.log('DURATION:', les.duration);
  //         });
  //       });

  //       setSections(
  //         course.curriculum.map((sec: any) => ({
  //           id: sec.id,
  //           title: sec.title || '',
  //           lessons: (sec.lessons || []).map((les: any) => ({
  //             id: les.id,
  //             type: les.type || 'video',
  //             title: les.title || '',
  //             videoUrl: les.videoUrl || '',
  //             content: les.content || '',
  //             quiz: les.quiz,
  //             assignment: les.assignment,
  //             duration: les.duration ? String(les.duration) : '',
  //             isPreview: les.isPreview || false,
  //           })),
  //         }))
  //       );
  //     } else {
  //       handleAddSection();
  //     }
  //   }
  // }, [course]);

  // ─── STATE ARRAYS MANIPULATION MUTATORS ───
  // const handleAddSection = () => {
  //   setSections(prev => [
  //     ...prev,
  //     {
  //       title: '',
  //       lessons: [{ title: '', videoUrl: '', duration: '', isPreview: false }],
  //     },
  //   ]);
  // };

  const createEmptyLesson = (): LessonField => ({
    title: '',
    videoUrl: '',
    content: '',
    duration: '',
    isPreview: false,
  });

  // const handleAddSection = () => {
  //   setSections(prev => [
  //     ...prev,
  //     {
  //       title: '',
  //       lessons: [
  //         {
  //           type: 'video',
  //           title: '',
  //           videoUrl: '',
  //           duration: '',
  //           isPreview: false,
  //         },
  //       ],
  //     },
  //   ]);
  // };

  const handleAddSection = () => {
    setSections(prev => [
      ...prev,
      {
        title: '',
        lessons: [createEmptyLesson()],
      },
    ]);
  };

  const handleAddLesson = (sIdx: number) => {
    // setSections(prev => {
    //   const updated = [...prev];
    //   updated[sIdx].lessons.push(createEmptyLesson());
    //   return updated;
    // });

    setSections(prev =>
      prev.map((section, idx) =>
        idx === sIdx
          ? {
              ...section,
              lessons: [...section.lessons, createEmptyLesson()],
            }
          : section
      )
    );
  };

  const handleRemoveSection = (sIdx: number) => {
    setSections(prev => prev.filter((_, idx) => idx !== sIdx));
  };

  const handleRemoveLesson = (sIdx: number, lIdx: number) => {
    setSections(prev =>
      prev.map((section, idx) =>
        idx === sIdx
          ? {
              ...section,
              lessons: section.lessons.filter(
                (_, lessonIdx) => lessonIdx !== lIdx
              ),
            }
          : section
      )
    );
  };

  const handleUpdateSectionTitle = (text: string, sIdx: number) => {
    // setSections(prev => {
    //   const updated = [...prev];
    //   updated[sIdx].title = text;
    //   return updated;
    // });

     setSections(prev =>
      prev.map((section, idx) =>
        idx === sIdx
          ? { ...section, title: text }
          : section
      )
    );
  };

  // const handleAddLesson = (sIdx: number) => {
  //   setSections(prev => {
  //     const updated = [...prev];
  //     // updated[sIdx].lessons.push({ title: '', videoUrl: '', duration: '', isPreview: false });
  //     updated[sIdx].lessons.push({
  //       type: 'video',
  //       title: '',
  //       videoUrl: '',
  //       duration: '',
  //       isPreview: false,
  //     });
  //     return updated;
  //   });
  // };

  // const handleRemoveLesson = (sIdx: number, lIdx: number) => {
  //   setSections(prev => {
  //     const updated = [...prev];
  //     updated[sIdx].lessons = updated[sIdx].lessons.filter((_, idx) => idx !== lIdx);
  //     return updated;
  //   });
  // };
  const handleUpdateLessonField = (
    field: keyof LessonField,
    value: any,
    sIdx: number,
    lIdx: number
  ) => {
  
    setSections(prev =>
      prev.map((section, sectionIdx) =>
        sectionIdx === sIdx
          ? {
              ...section,
              lessons: section.lessons.map((lesson, lessonIdx) =>
                lessonIdx === lIdx
                  ? {
                      ...lesson,
                      [field]: value,
                    }
                  : lesson
              ),
            }
          : section
      )
    );
  };

  // const handleUpdateLessonField = (field: keyof LessonField, value: any, sIdx: number, lIdx: number) => {
  //   setSections(prev => {
  //     const updated = [...prev];
  //     updated[sIdx].lessons[lIdx] = {
  //       ...updated[sIdx].lessons[lIdx],
  //       [field]: value,
  //     };
  //     return updated;
  //   });
  // };

  // ─── BACKEND COMMIT PIPELINE MUTATION ───
  const curriculumMutation = useMutation({
    mutationFn: async (payload: SectionField[]) => {
      for (const section of payload) {
        let activeSectionId = section.id;

        // Sync Section Layer
        if (section.id) {
          await instructorApi.updateSection(courseId, section.id, { title: section.title });
        } else {
          const newSec = await instructorApi.createSection(courseId, { title: section.title });
          activeSectionId = newSec.id;
        }

        // Sync Nested Lesson Layer
        for (const lesson of section.lessons) {
          const lessonPayload = {
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            isPreview: lesson.isPreview,
            content: lesson.content,
            quiz: lesson.quiz,
            assignment: lesson.assignment,
          };

          if (lesson.id) {
            await instructorApi.updateLesson(courseId, activeSectionId!, lesson.id, lessonPayload);
          } else {
            await instructorApi.createLesson(courseId, activeSectionId!, lessonPayload);
          }
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      navigation.navigate('InstructorCourses');
    },
    onError: (err: any) => {
      Alert.alert('Save Failed', err?.message || 'Failed to update curriculum nodes.');
    },
  });

  const handleCommitSubmission = () => {
    // Basic array structural checks prior to execution calls
    if (sections.length === 0) {
      Alert.alert('Form Error', 'Please include at least one curriculum topic section.');
      return;
    }

    for (const sec of sections) {
      if (!sec.title.trim()) {
        Alert.alert('Validation Error', 'All defined section blocks require a valid title header.');
        return;
      }
      if (sec.lessons.length === 0) {
        Alert.alert('Validation Error', `Section "${sec.title}" requires at least one active lecture node.`);
        return;
      }
      for (const les of sec.lessons) {

        // if (!les.title.trim() || !les.videoUrl.trim()) {
        //   Alert.alert('Validation Error', 'Please complete title and streaming source path allocations.');
        //   return;
        // }

        if (!les.title.trim()) {
          Alert.alert('Validation Error', 'Lesson title is required.');
          return;
        }

        if (!les.videoUrl?.trim()) {
          Alert.alert('Validation Error', 'Video URL is required.');
          return;
        }
      }
    }

    curriculumMutation.mutate(sections);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER OPERATIONS BAR */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Curriculum Builder</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollFormCanvas}>
        <View style={styles.introMetaBlock}>
          <Text style={styles.introPreLabel}>SYLLABUS ARCHITECTURE</Text>
          <Text style={styles.introMainTitle}>Build Course Structure</Text>
          <Text style={styles.introSubParagraph}>Deploy modular structural learning blocks using sections and unified source streaming files.</Text>
        </View>

        {/* REUSABLE CARDS ITERATOR GRID */}
        <View style={styles.sectionsContainer}>
          {sections.map((section, sIdx) => (
            <View key={section.id ?? sIdx} style={styles.sectionCardFrame}>
              
              {/* SECTION CONTROLS HEADER BAR */}
              <View style={styles.sectionHeaderBar}>
                <View style={styles.sectionTitleWrapper}>
                  <View style={styles.indexIndicatorBadge}>
                    <Text style={styles.indexIndicatorText}>{sIdx + 1}</Text>
                  </View>
                  <Text style={styles.sectionPanelLabel}>Module Block</Text>
                </View>
                <TouchableOpacity 
                  style={styles.actionIconButtonDestructive}
                  onPress={() => handleRemoveSection(sIdx)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* SECTION INPUT FIELD */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.innerFieldLabel}>Section Header Title</Text>
                <TextInput
                  style={styles.inputFrameText}
                  placeholder="e.g., Environment setup & configuration parameters"
                  placeholderTextColor="#94A3B8"
                  value={section.title}
                  onChangeText={(text) => handleUpdateSectionTitle(text, sIdx)}
                />
              </View>

              {/* NESTED CHILD LECTURES CONTAINER MAPPING STRIP */}
              <View style={styles.lessonsNestWrapper}>
                <Text style={styles.nestDividerHeading}>Lectures Feed Matrix</Text>

                {section.lessons.map((lesson, lIdx) => (
                  <View key={lesson.id ?? lIdx} style={styles.lessonItemRowBlock}>
                    <View style={styles.lessonItemHeaderRow}>
                      <View style={styles.lessonTitleMarker}>
                        <Ionicons name="play-circle-outline" size={16} color="#4F46E5" />
                        <Text style={styles.lessonMarkText}>Lesson {lIdx + 1}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveLesson(sIdx, lIdx)}>
                        <Ionicons name="close" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>

                    {/* Lesson Title Input */}
                    <TextInput
                      style={[styles.inputFrameText, styles.lessonInputSpacer]}
                      placeholder="Lecture Display Title"
                      placeholderTextColor="#94A3B8"
                      value={lesson.title}
                      onChangeText={(text) => handleUpdateLessonField('title', text, sIdx, lIdx)}
                    />

                    {/* Video URL Input */}
                    <TextInput
                      style={[styles.inputFrameText, styles.lessonInputSpacer]}
                      placeholder="Streaming Source Endpoint (URL)"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      value={lesson.videoUrl}
                      onChangeText={(text) => handleUpdateLessonField('videoUrl', text, sIdx, lIdx)}
                    />

                    <TextInput
                      style={[
                        styles.inputFrameText,
                        styles.lessonInputSpacer,
                        { height: 120, textAlignVertical: 'top' },
                      ]}
                      multiline
                      placeholder="Lesson Content"
                      value={lesson.content}
                      onChangeText={(text) =>
                        handleUpdateLessonField('content', text, sIdx, lIdx)
                      }
                    />

                    {/* Bottom Meta Inline Controls Flexbox Container Grid */}
                    <View style={styles.lessonMetaFlexibleActionRow}>
                      <TextInput
                        style={[styles.inputFrameText, styles.miniDurationFrame]}
                        placeholder="Mins (e.g. 12)"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={lesson.duration}
                        onChangeText={(text) => handleUpdateLessonField('duration', text, sIdx, lIdx)}
                      />
                      
                      <View style={styles.switchInlineWrapper}>
                        <Text style={styles.switchInlineLabel}>Free Preview</Text>
                        <Switch
                          value={lesson.isPreview}
                          trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                          thumbColor={lesson.isPreview ? '#4F46E5' : '#94A3B8'}
                          onValueChange={(val) => handleUpdateLessonField('isPreview', val, sIdx, lIdx)}
                        />
                      </View>
                    </View>
                  </View>
                ))}

                {/* ADD NESTED ITEM TRIGGER ACTION BUTTON */}
                <TouchableOpacity 
                  style={styles.addLessonRowActionBtn}
                  onPress={() => handleAddLesson(sIdx)}
                >
                  <Ionicons name="add" size={16} color="#4F46E5" />
                  <Text style={styles.addLessonRowActionBtnText}>Add Lesson Node</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* DYNAMIC PARENT STRUCTURAL MATRIX CONTROLLER ROW ADD */}
          <TouchableOpacity style={styles.addSectionDashedBtn} onPress={handleAddSection}>
            <Ionicons name="add" size={20} color="#0F172A" />
            <Text style={styles.addSectionDashedBtnText}>Add New Syllabus Section</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FIXED FOOTER COMMIT RUNNER PANEL PANEL */}
      <View style={styles.footerStickyPanelWrapper}>
        <TouchableOpacity 
          style={styles.primaryPayloadCommitBtn}
          disabled={curriculumMutation.isPending}
          onPress={handleCommitSubmission}
        >
          {curriculumMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
              <Text style={styles.primaryPayloadCommitBtnText}>Save Total Curriculum</Text>
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
  scrollFormCanvas: { flex: 1 },
  introMetaBlock: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  introPreLabel: { fontSize: 11, fontWeight: '700', color: '#4F46E5', letterSpacing: 1.2 },
  introMainTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 4, letterSpacing: -0.5 },
  introSubParagraph: { fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 18 },
  sectionsContainer: { padding: 20, gap: 24 },
  sectionCardFrame: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16 },
  sectionHeaderBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12, marginBottom: 16 },
  sectionTitleWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  indexIndicatorBadge: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  indexIndicatorText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  sectionPanelLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  actionIconButtonDestructive: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FEE2E2' },
  inputFieldGroup: { gap: 6, marginBottom: 16 },
  innerFieldLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  inputFrameText: { height: 44, width: '100%', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontSize: 13, color: '#0F172A' },
  lessonsNestWrapper: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16, gap: 12 },
  nestDividerHeading: { fontSize: 13, fontWeight: '700', color: '#0F172A', letterSpacing: -0.1, marginBottom: 4 },
  lessonItemRowBlock: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, marginBottom: 4 },
  lessonItemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  lessonTitleMarker: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lessonMarkText: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  lessonInputSpacer: { marginBottom: 10 },
  lessonMetaFlexibleActionRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  miniDurationFrame: { flex: 1, height: 38 },
  switchInlineWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchInlineLabel: { fontSize: 12, color: '#475569', fontWeight: '500' },
  addLessonRowActionBtn: { height: 40, width: '100%', borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4, marginTop: 4, backgroundColor: '#FDFDFD' },
  addLessonRowActionBtnText: { color: '#4F46E5', fontSize: 12, fontWeight: '700' },
  addSectionDashedBtn: { height: 52, width: '100%', borderRadius: 14, borderStyle: 'dashed', borderWidth: 1, borderColor: '#0F172A', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, marginTop: 4, backgroundColor: '#FFFFFF' },
  addSectionDashedBtnText: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  footerStickyPanelWrapper: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  primaryPayloadCommitBtn: { backgroundColor: '#4F46E5', height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  primaryPayloadCommitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});