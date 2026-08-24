// src/screens/instructor/InstructorCourseViewDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { instructorApi } from '../../api/instructor.api';

const { width } = Dimensions.get('window');

import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';

function AdminVideoPlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  useEffect(() => {
    if (player) {
      player.play();
    }
  }, [videoUrl]);

  return (
    <View style={isFullscreen ? styles.fullscreenContainer : styles.videoWrapper}>
      <StatusBar hidden={isFullscreen} barStyle="dark-content" />
      
      <View style={isFullscreen ? styles.fullscreenVideoElement : styles.videoPlayerFrame}>
        <VideoView
          player={player}
          style={styles.videoElement}
          allowsFullscreen
          nativeControls
          onFullscreenEnter={async () => {
            setIsFullscreen(true);
            await ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.LANDSCAPE
            );
          }}
          onFullscreenExit={async () => {
            setIsFullscreen(false);
            await ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.PORTRAIT_UP
            );
          }}
        />
      </View>

      {!isFullscreen && (
        <View style={styles.videoInfoBar}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text numberOfLines={1} style={styles.videoTitle}>
              {title || 'Asset Monitor Frame'}
            </Text>
            <Text style={styles.videoSubtitle}>
              Live Stream Monitoring Mode
            </Text>
          </View>

          <View style={[styles.previewPill, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={[styles.previewPillText, { color: '#059669' }]}>Instructor Access</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function StatCard({ icon, label, value, bgColor, iconColor }: any) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={[styles.statIconFrame, { backgroundColor: '#FFFFFF' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statValueText}>{value}</Text>
        <Text style={styles.statLabelText}>{label}</Text>
      </View>
    </View>
  );
}

// ✅ FIXED: Added setActiveWorkspace prop to wire up modal previews for lessons, quizzes, and assignments
function SectionAccordion({ section, index, navigation, setActiveWorkspace }: { section: any; index: number; navigation: any; setActiveWorkspace: any }) {
  const [open, setOpen] = useState(index === 0);
  const sectionDuration = section.lessons?.reduce((acc: number, l: any) => acc + (parseInt(l.duration) || 0), 0) || 0;

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity 
        style={styles.accordionHeader} 
        activeOpacity={0.8} 
        onPress={() => setOpen(!open)}
      >
        <View style={styles.accordionIndexCircle}>
          <Text style={styles.accordionIndexText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={styles.accordionTitle} numberOfLines={1}>{section.title}</Text>
          <Text style={styles.accordionMeta}>
            {section.lessons?.length || 0} lessons{sectionDuration > 0 ? ` · ${sectionDuration} mins` : ''}
          </Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color="#64748B" />
      </TouchableOpacity>

      {open && (
        <View style={styles.accordionBody}>
          {(!section.lessons || section.lessons.length === 0) ? (
            <Text style={styles.emptyAccordionText}>No lectures defined in this section.</Text>
          ) : (
            section.lessons.map((lesson: any, li: number) => {
              const hasQuiz = !!lesson.quiz;
              const hasAssignment = !!lesson.assignment;

              return (
                <View key={lesson.id ?? li} style={styles.hybridLessonCardItem}>
                  
                  {/* ✅ FIXED: Converted layout block into a touchable row equipped with an eye preview icon */}
                  <TouchableOpacity 
                    style={styles.lessonMetaMainRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActiveWorkspace({
                        visible: true,
                        type: lesson.type === 'article' ? 'article' : 'video',
                        title: lesson.title,
                        payload: lesson.videoUrl || lesson.content || 'No asset loaded.',
                      });
                    }}
                  >
                    <Ionicons name={lesson.type === 'article' ? "document-text-outline" : "play-circle-outline"} size={16} color="#4F46E5" style={{ marginRight: 6 }} />
                    <Text style={styles.lessonRowTitle} numberOfLines={1}>{lesson.title}</Text>
                    
                    {lesson.isPreview && (
                      <View style={styles.freeBadgePill}>
                        <Text style={styles.freeBadgeText}>Free</Text>
                      </View>
                    )}

                    <View style={styles.lessonRightActionGroup}>
                      {lesson.duration ? <Text style={styles.lessonRowDuration}>{lesson.duration}m</Text> : null}
                      <Ionicons name="eye-outline" size={16} color="#4F46E5" style={{ marginLeft: 6 }} />
                    </View>
                  </TouchableOpacity>

                  {/* Optional Evaluation Framework Blocks */}
                  <View style={styles.inlineActionsContainer}>
                    <TouchableOpacity 
                      style={styles.shortcutActionBadge}
                      onPress={() => navigation.navigate('InstructorQuizBuilder', { lessonId: lesson.id })}
                    >
                      <Ionicons name="help-circle-outline" size={13} color="#4F46E5" />
                      <Text style={styles.shortcutActionBadgeText}>Configure Quiz</Text>
                    </TouchableOpacity>

                    {hasQuiz && (
                      <TouchableOpacity 
                        style={[styles.shortcutActionBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                        onPress={() => {
                          setActiveWorkspace({
                            visible: true,
                            type: 'quiz',
                            title: lesson.quiz.title || 'Quiz Preview',
                            payload: lesson.quiz,
                          });
                        }}
                      >
                        <Ionicons name="eye-outline" size={13} color="#D97706" />
                        <Text style={[styles.shortcutActionBadgeText, { color: '#D97706' }]}>View Quiz</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                      style={[styles.shortcutActionBadge, styles.shortcutAssignmentBadge]}
                      onPress={() => navigation.navigate('InstructorAssignmentBuilder', { lessonId: lesson.id })}
                    >
                      <Ionicons name="document-text-outline" size={13} color="#0F172A" />
                      <Text style={[styles.shortcutActionBadgeText, { color: '#0F172A' }]}>Task Setup</Text>
                    </TouchableOpacity>

                    {hasAssignment && (
                      <TouchableOpacity 
                        style={[styles.shortcutActionBadge, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}
                        onPress={() => {
                          setActiveWorkspace({
                            visible: true,
                            type: 'assignment',
                            title: lesson.assignment.title || 'Assignment Preview',
                            payload: lesson.assignment,
                          });
                        }}
                      >
                        <Ionicons name="eye-outline" size={13} color="#0284C7" />
                        <Text style={[styles.shortcutActionBadgeText, { color: '#0284C7' }]}>View Task</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

export default function InstructorCourseViewDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const queryClient = useQueryClient();

  // Modal Asset Workspace States
  const [activeWorkspace, setActiveWorkspace] = useState<{
    visible: boolean;
    type: 'video' | 'article' | 'quiz' | 'assignment' | null;
    title: string;
    payload: any;
  }>({
    visible: false,
    type: null,
    title: '',
    payload: null,
  });

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => instructorApi.getCourseById(id),
    enabled: !!id,
  });

  const handleTogglePublish = async () => {
    try {
      await instructorApi.togglePublish(id);
      await queryClient.invalidateQueries({ queryKey: ['course', id] });
      alert('Course status parameter adjusted smoothly.');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to toggle status.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const totalLectures = course?.curriculum?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) ?? 0;
  const totalDuration = course?.curriculum?.reduce((acc: number, s: any) => acc + (s.lessons?.reduce((a: number, l: any) => a + (parseInt(l.duration) || 0), 0) || 0), 0) ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText} numberOfLines={1}>Course Workspace</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* BANNER MEDIA FRAME */}
        <View style={styles.mediaFrame}>
          <Image 
            source={{ uri: course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop' }} 
            style={styles.bannerImg} 
          />
          <View style={styles.overlayFrame} />
          <View style={styles.overlayContentBox}>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
              <View style={styles.statusPill}><Text style={styles.statusPillText}>{course.level}</Text></View>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: !course.isPublished
                      ? '#64748B' // Draft
                      : course.isApproved
                      ? '#10B981' // Live
                      : '#F59E0B', // Pending
                  },
                ]}
              >
                <Text style={styles.statusPillText}>
                  {!course.isPublished
                    ? 'Draft'
                    : course.isApproved
                    ? 'Live'
                    : 'Pending'}
                </Text>
              </View>
            </View>
            <Text style={styles.bannerTitleText} numberOfLines={2}>{course.title}</Text>
          </View>
        </View>

        {/* WORKSPACE OPERATIONS TAB STRIP */}
        <View style={styles.operationsBar}>
          <Text style={styles.priceDisplayValue}>₹{course.price || 0}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.opBtn} onPress={() => navigation.navigate('InstructorCurriculumEdit', { courseId: id })}>
              <Ionicons name="list-outline" size={16} color="#0F172A" />
              <Text style={styles.opBtnText}>Curriculum</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.opBtn, styles.opPrimaryBtn]} onPress={() => navigation.navigate('InstructorCourseEditSpecs', { id: id })}>
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              <Text style={[styles.opBtnText, { color: '#FFFFFF' }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* METRICS ROW SHEET */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsContainer}>
          <StatCard icon="people-outline" label="Enrolled" value={course.enrollments ?? 0} bgColor="#EFF6FF" iconColor="#3B82F6" />
          <StatCard icon="star-outline" label="Rating" value={course.rating ?? '—'} bgColor="#FEF3C7" iconColor="#D97706" />
          <StatCard icon="document-text-outline" label="Lectures" value={totalLectures} bgColor="#F5F3FF" iconColor="#7C3AED" />
          <StatCard icon="time-outline" label="Duration" value={`${totalDuration}m`} bgColor="#ECFEFF" iconColor="#0891B2" />
        </ScrollView>

        {/* CURRICULUM DISPLAY ACCORDIONS */}
        <View style={styles.flatSection}>
          <Text style={styles.sectionTitle}>Curriculum Breakdown</Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            {(!course.curriculum || course.curriculum.length === 0) ? (
              <Text style={styles.fallbackBodyText}>No items added to structural curriculum loops yet.</Text>
            ) : (
              course.curriculum.map((section: any, idx: number) => (
                // ✅ FIXED: Connected query scope variables through the accordion components
                <SectionAccordion 
                  key={section.id ?? idx} 
                  section={section} 
                  index={idx} 
                  navigation={navigation} 
                  setActiveWorkspace={setActiveWorkspace}
                />
              ))
            )}
          </View>
        </View>

        {/* TEXT DATA BLOCKS */}
        <View style={styles.flatSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.fallbackBodyText}>{course.description || 'No formal text parameters provided.'}</Text>
        </View>
      </ScrollView>

      {/* FIXED PLATFORM PUBLISH CONTROLLER SHEET */}
      <View style={styles.fixedStickyFooterSheet}>
        <TouchableOpacity 
          style={[styles.publishActionToggleBtn, course.isPublished ? styles.btnActiveState : styles.btnInactiveState]}
          onPress={handleTogglePublish}
          disabled={course.isPublished}
        >
          <Ionicons name={course.isPublished ? "checkmark-circle-outline" : "cloud-upload-outline"} size={18} color="#FFFFFF" />
          <Text style={styles.publishActionToggleBtnText}>
            {course.isPublished ? 'Submitted / Live Configuration' : 'Publish Course Production'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ADMIN ASSET PREVIEW WORKSPACE MODAL SHEET */}
      <Modal
        visible={activeWorkspace.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveWorkspace(prev => ({ ...prev, visible: false }))}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Ionicons 
                name={
                  activeWorkspace.type === 'video' ? 'play-circle' :
                  activeWorkspace.type === 'quiz' ? 'help-circle' : 'document-text'
                } 
                size={22} 
                color="#4F46E5" 
              />
              <Text style={styles.modalTitle} numberOfLines={1}>
                {activeWorkspace.title}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setActiveWorkspace(prev => ({ ...prev, visible: false }))}
              style={styles.closeModalButton}
            >
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
            {/* Case 1: Video Endpoint Access */}
            {activeWorkspace.type === 'video' && (
              <AdminVideoPlayer 
                videoUrl={activeWorkspace.payload} 
                title={activeWorkspace.title} 
              />
            )}

            {/* Case 2: Article Configuration Content */}
            {activeWorkspace.type === 'article' && (
              <View style={styles.articleBodyContainer}>
                <Text style={styles.articleContentText}>{activeWorkspace.payload}</Text>
              </View>
            )}

            {/* Case 3: Complete Question Map Review Tracker */}
            {activeWorkspace.type === 'quiz' && (
              <View style={styles.quizFormLayout}>
                <Text style={styles.workspaceSectionLabel}>Passing Target: {activeWorkspace.payload?.passingScore}%</Text>
                
                {activeWorkspace.payload?.questions?.map((q: any, qi: number) => (
                  <View key={q.id || qi} style={styles.quizQuestionCard}>
                    <Text style={styles.questionTextTitle}>Q{qi + 1}. {q.question}</Text>
                    
                    <View style={styles.optionsListContainer}>
                      {q.options?.map((opt: any, oi: number) => (
                        <View 
                          key={opt.id || oi} 
                          style={[styles.quizOptionRow, opt.isCorrect && styles.correctOptionHighlight]}
                        >
                          <Ionicons 
                            name={opt.isCorrect ? "checkmark-circle" : "ellipse-outline"} 
                            size={16} 
                            color={opt.isCorrect ? "#10B981" : "#94A3B8"} 
                          />
                          <Text style={[styles.optionText, opt.isCorrect && styles.correctOptionTextHighlight]}>
                            {opt.text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Case 4: Assignment Parameters Review */}
            {activeWorkspace.type === 'assignment' && (
              <View style={styles.assignmentDetailsFrame}>
                <View style={styles.assignmentStatRow}>
                  <Text style={styles.assignmentMarksText}>Total Points: {activeWorkspace.payload?.maxMarks}</Text>
                </View>
                
                <Text style={styles.assignmentLabelHeading}>Description Context</Text>
                <Text style={styles.assignmentBodyParagraph}>{activeWorkspace.payload?.description}</Text>
                
                {activeWorkspace.payload?.instructions && (
                  <>
                    <Text style={[styles.assignmentLabelHeading, { marginTop: 16 }]}>Submission Requirements</Text>
                    <Text style={styles.assignmentBodyParagraph}>{activeWorkspace.payload?.instructions}</Text>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
            
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backButton: { padding: 4 },
  headerTitleText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  mediaFrame: { width: width, height: 200, position: 'relative', backgroundColor: '#000000' },
  bannerImg: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.75 },
  overlayFrame: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  overlayContentBox: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  statusPill: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  statusPillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  bannerTitleText: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginTop: 6, letterSpacing: -0.5 },
  operationsBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center', justifyContent: 'space-between' },
  priceDisplayValue: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  opBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  opPrimaryBtn: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  opBtnText: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  metricsContainer: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  statCard: { width: 150, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIconFrame: { padding: 6, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  statValueText: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  statLabelText: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  flatSection: { paddingHorizontal: 16, paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  fallbackBodyText: { marginTop: 8, fontSize: 13, color: '#475569', lineHeight: 20 },
  accordionContainer: { borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', backgroundColor: '#FFFFFF' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F8FAFC' },
  accordionIndexCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  accordionIndexText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  accordionTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  accordionMeta: { fontSize: 11, color: '#64748B', marginTop: 1 },
  accordionBody: { padding: 4, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  emptyAccordionText: { padding: 12, fontSize: 12, color: '#94A3B8', fontStyle: 'italic' },
  lessonRowItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  lessonRowTitle: { flex: 1, fontSize: 13, color: '#334155' },
  freeBadgePill: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  freeBadgeText: { color: '#16A34A', fontSize: 10, fontWeight: '700' },
  lessonRowDuration: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  fixedStickyFooterSheet: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  publishActionToggleBtn: { height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  btnActiveState: { backgroundColor: '#16A34A' },
  btnInactiveState: { backgroundColor: '#4F46E5' },
  publishActionToggleBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  hybridLessonCardItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  lessonMetaMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  lessonRightActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingLeft: 22,
  },
  shortcutActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shortcutAssignmentBadge: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  shortcutActionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },

  fullscreenContainer: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: '#000000', 
    zIndex: 9999, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  fullscreenVideoElement: { 
    width: '100%', 
    height: '100%' 
  },
  videoWrapper: { 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9', 
    overflow: 'hidden' 
  },
  videoPlayerFrame: { width: '100%', height: (width * 9) / 16, backgroundColor: '#000000' },
  videoElement: { 
    width: '100%', 
    height: '100%' 
  },
  videoInfoBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    backgroundColor: '#FFFFFF' 
  },
  videoTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#0F172A', 
    letterSpacing: -0.1 
  },
  videoSubtitle: { 
    marginTop: 2, 
    fontSize: 12, 
    color: '#64748B', 
    fontWeight: '500' 
  },
  previewPill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EEF2FF', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 99 
  },
  previewPillText: { 
    marginLeft: 4, 
    color: '#4F46E5', 
    fontSize: 12, 
    fontWeight: '700' 
  },

  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', flex: 1 },
  closeModalButton: { padding: 4 },
  modalScrollBody: { padding: 20, paddingBottom: 40 },
  adminInternalNotice: { fontSize: 12, color: '#64748B', fontStyle: 'italic', textAlign: 'center', marginTop: 12, lineHeight: 16 },
  workspaceSectionLabel: { fontSize: 13, fontWeight: '700', color: '#4F46E5', textTransform: 'uppercase', marginBottom: 14 },
  
  videoPlaceholderContainer: { paddingVertical: 10 },
  videoSimulatedFrame: { width: '100%', height: 180, backgroundColor: '#0F172A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 16, gap: 10 },
  videoUriText: { color: '#94A3B8', fontSize: 11, fontFamily: 'monospace', width: '80%', textAlign: 'center' },
  articleBodyContainer: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  articleContentText: { fontSize: 14, color: '#334155', lineHeight: 22 },
  
  quizFormLayout: { gap: 16 },
  quizQuestionCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 16 },
  questionTextTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  optionsListContainer: { gap: 8 },
  quizOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  correctOptionHighlight: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  optionText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  correctOptionTextHighlight: { color: '#065F46', fontWeight: '700' },
  
  assignmentDetailsFrame: { backgroundColor: '#FFFFFF' },
  assignmentStatRow: { backgroundColor: '#F0F9FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 16 },
  assignmentMarksText: { color: '#0369A1', fontSize: 12, fontWeight: '700' },
  assignmentLabelHeading: { fontSize: 13, fontWeight: '700', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5 },
  assignmentBodyParagraph: { fontSize: 14, color: '#475569', lineHeight: 22, marginTop: 6 },
});