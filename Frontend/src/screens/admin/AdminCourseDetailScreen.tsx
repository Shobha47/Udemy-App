import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../api/client';

import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width } = Dimensions.get('window');

function AdminVideoPlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize the expo-video player instance using the dynamic source link passed down
  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.play();
  });

  // Track player status metrics natively
  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  // React to video asset variations cleanly
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
            <Text style={[styles.previewPillText, { color: '#059669' }]}>Admin Access</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function AdminCourseDetailScreen({
  route,
  navigation,
}: any) {
  const { id } = route.params;

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

  // Track expanded section IDs for the accordion curriculum layout
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-course-detail', id],
    queryFn: async () => {
      const response = await apiClient.get(
        `/courses/instructor/course/${id}`
      );
      return response.data.data;
    },
  });

  const course = data?.course;
  const curriculum = course?.curriculum || [];

  useEffect(() => {
    if (course) {
      console.log(
        'ADMIN COURSE DETAIL:\n',
        JSON.stringify(course, null, 2)
      );
    }
  }, [course]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  // ✅ FIXED: Completely unified render function handling modal triggers, quizzes, and assignments
  const renderLessonItem = (lesson: any) => {
    const hasQuiz = !!lesson.quiz;
    const hasAssignment = !!lesson.assignment;

    return (
      <View key={lesson.id} style={styles.lessonItemBlock}>
        {/* Main Lesson Row Clickable Trigger */}
        <TouchableOpacity
          style={styles.lessonRow}
          activeOpacity={0.7}
          onPress={() => {
            setActiveWorkspace({
              visible: true,
              type: lesson.type === 'article' ? 'article' : 'video',
              title: lesson.title,
              payload: lesson.videoUrl || lesson.content || 'No module content asset loaded.',
            });
          }}
        >
          <View style={styles.lessonInfoLeft}>
            <Ionicons 
              name={lesson.type === 'article' ? "document-text-outline" : "play-circle"} 
              size={20} 
              color="#4F46E5" 
            />
            <View style={styles.lessonTextContainer}>
              <Text style={styles.lessonTitle} numberOfLines={1}>
                {lesson.title}
              </Text>
              <Text style={styles.lessonMeta}>
                {lesson.type === 'article' ? 'Reading Module' : `${lesson.duration || '0'} mins`}
              </Text>
            </View>
          </View>

          {/* Indicators */}
          <View style={styles.lessonBadgeRow}>
            {!lesson.isPreview && (
              <View style={[styles.statusBadge, styles.premiumBadge]}>
                <Ionicons name="lock-open-outline" size={10} color="#137333" />
                <Text style={styles.premiumBadgeText}>Paid</Text>
              </View>
            )}
            <Ionicons name="eye-outline" size={16} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        {/* Embedded Sub-Resource Trackers */}
        {(hasQuiz || hasAssignment) && (
          <View style={styles.subResourceContainer}>
            {hasQuiz && (
              <TouchableOpacity 
                style={styles.resourceChip}
                activeOpacity={0.6}
                onPress={() => {
                  setActiveWorkspace({
                    visible: true,
                    type: 'quiz',
                    title: lesson.quiz.title,
                    payload: lesson.quiz,
                  });
                }}
              >
                <Ionicons name="help-circle" size={14} color="#D97706" />
                <Text style={styles.resourceChipText}>Quiz Details</Text>
              </TouchableOpacity>
            )}

            {hasAssignment && (
              <TouchableOpacity 
                style={styles.resourceChip}
                activeOpacity={0.6}
                onPress={() => {
                  setActiveWorkspace({
                    visible: true,
                    type: 'assignment',
                    title: lesson.assignment.title,
                    payload: lesson.assignment,
                  });
                }}
              >
                <Ionicons name="clipboard" size={14} color="#0284C7" />
                <Text style={styles.resourceChipText}>Assignment Task</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP RETAINED NAVIGATION BAR */}
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
            Course Portal (Admin)
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* COURSE COVER IMAGE MATRICES */}
        <Image source={{ uri: course?.image }} style={styles.coverImage} />

        {/* METADATA IDENTIFICATION CONTAINER */}
        <View style={styles.metaSection}>
          <View style={styles.badgeRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{course?.level || 'All Levels'}</Text>
            </View>
            <View style={[styles.statusBadge, styles.adminModeBadge]}>
              <Text style={styles.adminModeBadgeText}>Full Access Mode</Text>
            </View>
          </View>

          <Text style={styles.courseTitleText}>{course?.title}</Text>
          <Text style={styles.subtitleText}>{course?.subtitle}</Text>

          {/* METRIC STRIP BAR */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.metricValue}>{Number(course?.rating || 0).toFixed(1)}</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="people" size={14} color="#64748B" />
              <Text style={styles.metricValue}>{(course?.studentCount || 0).toLocaleString()} Admits</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={14} color="#64748B" />
              <Text style={styles.metricValue}>{course?.totalDuration || '0'} hrs</Text>
            </View>
          </View>
        </View>

        {/* SECTION BREAK DIVIDER */}
        <View style={styles.sectionDivider} />

        {/* COURSE DESCRIPTION */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Course Summary</Text>
          <Text style={styles.descriptionText}>
            {course?.description || "No supplemental descriptive summary data declared for this core asset matrix."}
          </Text>
        </View>

        <View style={styles.sectionDivider} />

        {/* COMPLETE MANAGEMENT ACCORDION CURRICULUM */}
        <View style={styles.curriculumSection}>
          <View style={styles.curriculumHeader}>
            <Text style={styles.sectionTitle}>Course Syllabus</Text>
            <Text style={styles.curriculumMetaText}>
              {curriculum.length} Sections • {course?.lessonsCount || 0} Lessons
            </Text>
          </View>

          {curriculum.map((section: any, index: number) => {
            const isExpanded = !!expandedSections[section.id];
            const sectionLessons = section.lessons || [];

            return (
              <View key={section.id || index} style={styles.sectionWrapper}>
                {/* SECTION TRIGGER ACCORDION BLOCK */}
                <TouchableOpacity
                  style={styles.sectionHeaderButton}
                  activeOpacity={0.8}
                  onPress={() => toggleSection(section.id)}
                >
                  <View style={styles.sectionTitleLeft}>
                    <Text style={styles.sectionIndexText}>Section {index + 1}</Text>
                    <Text style={styles.sectionHeadingTitle} numberOfLines={1}>
                      {section.title}
                    </Text>
                  </View>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color="#64748B" 
                  />
                </TouchableOpacity>

                {/* LESSON CONTAINER DRAWER LOOP */}
                {isExpanded && (
                  <View style={styles.lessonsContainer}>
                    {sectionLessons.length === 0 ? (
                      <Text style={styles.emptyLessonsText}>No lessons populated inside this module container.</Text>
                    ) : (
                      sectionLessons.map((lesson: any) => renderLessonItem(lesson))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ADMIN ASSET PREVIEW WORKSPACE MODAL SHEET */}
      <Modal
        visible={activeWorkspace.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveWorkspace(prev => ({ ...prev, visible: false }))}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header Panel */}
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
            {/* {activeWorkspace.type === 'video' && (
              <View style={styles.videoPlaceholderContainer}>
                <View style={styles.videoSimulatedFrame}>
                  <Ionicons name="logo-youtube" size={48} color="#EF4444" />
                  <Text style={styles.videoUriText} numberOfLines={1}>{activeWorkspace.payload}</Text>
                </View>
                <Text style={styles.adminInternalNotice}>
                  [Admin Playback Mode] Native platform video players stream from the resource link above.
                </Text>
              </View>
            )} */}

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
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Ensure these styling specifications match your active framework matrix
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  /* NAVIGATION BAR PACKS */
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
  },
  backButton: {
    marginRight: 14,
    padding: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  /* HERO IMAGERY INTERFACES */
  coverImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#F1F5F9',
  },
  /* CONTENT HOOK MATRIX SPECIFICATIONS */
  metaSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminModeBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  adminModeBadgeText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
  },
  courseTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
  },
  subtitleText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginTop: 6,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 20,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginTop: 8,
  },
  /* SYLLABUS LIST SYSTÈMES */
  curriculumSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  curriculumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  curriculumMetaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  sectionWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  sectionTitleLeft: {
    flex: 1,
    gap: 2,
  },
  sectionIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  sectionHeadingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  lessonsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  lessonItemBlock: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  lessonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  lessonInfoLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonTextContainer: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  lessonMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  lessonBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    color: '#137333',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  emptyLessonsText: {
    padding: 16,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  /* Sub-resource Chip Panels */
  subResourceContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    paddingHorizontal: 16, 
    marginLeft: 32, 
    marginTop: 2 
  },
  resourceChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  resourceChipText: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#475569' 
  },
  
  /* WORKSPACE MODAL DESIGN FRAMEWORK */
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', flex: 1 },
  closeModalButton: { padding: 4 },
  modalScrollBody: { padding: 20, paddingBottom: 40 },
  adminInternalNotice: { fontSize: 12, color: '#64748B', fontStyle: 'italic', textAlign: 'center', marginTop: 12, lineHeight: 16 },
  workspaceSectionLabel: { fontSize: 13, fontWeight: '700', color: '#4F46E5', textTransform: 'uppercase', marginBottom: 14 },
  
  /* Media Render Sub-types */
  videoPlaceholderContainer: { paddingVertical: 10 },
  videoSimulatedFrame: { width: '100%', height: 180, backgroundColor: '#0F172A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 16, gap: 10 },
  videoUriText: { color: '#94A3B8', fontSize: 11, fontFamily: 'monospace', width: '80%', textAlign: 'center' },
  articleBodyContainer: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  articleContentText: { fontSize: 14, color: '#334155', lineHeight: 22 },
  
  /* Quiz Modal View Map Layouts */
  quizFormLayout: { gap: 16 },
  quizQuestionCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 16 },
  questionTextTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  optionsListContainer: { gap: 8 },
  quizOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  correctOptionHighlight: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  optionText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  correctOptionTextHighlight: { color: '#065F46', fontWeight: '700' },
  
  /* Assignment Review Subcomponents */
  assignmentDetailsFrame: { backgroundColor: '#FFFFFF' },
  assignmentStatRow: { backgroundColor: '#F0F9FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 16 },
  assignmentMarksText: { color: '#0369A1', fontSize: 12, fontWeight: '700' },
  assignmentLabelHeading: { fontSize: 13, fontWeight: '700', color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5 },
  assignmentBodyParagraph: { fontSize: 14, color: '#475569', lineHeight: 22, marginTop: 6 },
});