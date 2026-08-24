import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { useAuthMock } from '../../navigation/RootNavigator';

import * as ScreenOrientation from 'expo-screen-orientation';

import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';

const { width } = Dimensions.get('window');

export default function StudentMyLearningScreen({ route, navigation }: any) {
  const { id } = route.params || {};
  console.log("StudentMyLearningScreen Id", id)
  const queryClient = useQueryClient();
  const { user } = useAuthMock();

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [certificate, setCertificate] = useState<any>(null);

  // Active Layout Tab Toggle: 'curriculum' or 'notes'
  const [activeTab, setActiveTab] = useState<
    'curriculum' | 'notes' | 'reviews'
  >('curriculum');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // const videoRef = useRef<Video>(null);

  // ─── TANSTACK DATA RECONSTRUCTION QUERY ───
  const { data: enrollment, isLoading } = useQuery({
    queryKey: ['learning-course', user.id, id],
    queryFn: async () => {
      // Adjusted endpoint structure path to hit the client api mappings safely
      console.log("StudentMyLearningScreen User Id", user.id)
      console.log("StudentMyLearningScreen Id New", id)
      const response = await apiClient.get(`/enrollments/learn/${id}`);
      console.log("StudentMyLearningScreen Dynamic Response Logs:", response);
      return response.data.data.enrollment;
    },
    enabled: !!id,
  });

  console.log("StudentMyLearningScreen Dynamic Response Logs:", enrollment)

  const course = enrollment?.course;
  const sections = useMemo(() => course?.sections || [], [course?.sections]);

  // Flatten nested lessons while attaching parent metadata attributes safely
  const lessons = useMemo(() => {
    return sections.flatMap((section: any) =>
      (section.lessons || []).map((lesson: any) => ({
        ...lesson,
        sectionTitle: section.title,
      }))
    );
  }, [sections]);

  const { data: reviewsData } = useQuery({
    queryKey: ['course-reviews', course?.id],
    queryFn: async () => {
      const response = await apiClient.get(
        `/reviews/course/${course.id}`
      );

      return response.data.data.reviews;
    },
    enabled: !!course?.id,
  });

  const reviews = reviewsData || [];

  const selectedLessonId = activeLessonId || lessons[0]?.id || null;
  const activeIndex = Math.max(0, lessons.findIndex((l: any) => l.id === selectedLessonId));
  const activeLesson = lessons[activeIndex];

  const createReviewMutation = useMutation({
    mutationFn: async ({
      rating,
      content,
    }: {
      rating: number;
      content: string;
    }) => {
      return apiClient.post(
        `/reviews/course/${course.id}`,
        {
          rating,
          content,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-reviews', course?.id],
      });
    },
  });

  const videoSource =
    activeLesson?.videoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.pause();
  });

  const { isPlaying } = useEvent(
    player,
    'playingChange',
    {
      isPlaying: player.playing,
    }
  );

  useEffect(() => {
    if (videoSource) {
      player.replace(videoSource);
      player.play();
    }
  }, [videoSource]);

  const progress = Math.round(enrollment?.progress || 0);
  // const completedLessonCount = Math.round((progress / 100) * lessons.length);

  const completedLessonCount = lessons.filter(
    (lesson: any) =>
      lesson.progress?.some((p: any) => p.completed)
  ).length;

  // ─── PROGRESS OPERATION MUTATION LAYER ───
  const progressMutation = useMutation({
    mutationFn: async (nextProgress: number) => {
      if (!course?.id) throw new Error('Course matrix parsing error');
      const response = await apiClient.patch(`/enrollments/${course.id}/progress`, { progress: nextProgress });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [id] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard', user?.id] });
    },
  });

  // const completeLessonMutation = useMutation({
  //   mutationFn: async () => {
  //     return apiClient.patch(
  //       `/enrollments/lesson/${activeLesson.id}/complete`
  //     );
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ['learning-course', user.id, id],
  //     });
  //   },
  // });


  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      return apiClient.patch(
        `/enrollments/lesson/${activeLesson.id}/complete`
      );
    },

    onSuccess: (response) => {
      const data = response.data.data;

      if (data.certificate) {
        setCertificate(data.certificate);
      }

      queryClient.invalidateQueries({
        queryKey: ['learning-course', user.id, id],
      });
    },
  });

  const handleGoToLessonNode = (index: number) => {
    const lesson = lessons[index];

    if (lesson) {
      setActiveLessonId(lesson.id);
    }
  };

  const handleMarkLessonComplete = () => {
    if (!course || lessons.length === 0) return;

    const computedNextProgress = Math.max(
      progress,
      Math.round(((activeIndex + 1) / lessons.length) * 100)
    );
    progressMutation.mutate(computedNextProgress);
  };

  if (isLoading) {
    return (
      <View style={styles.centerSpinnerFrame}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.spinnerText}>Assembling curriculum player streams...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorWrapperContainer}>
          <TouchableOpacity style={styles.fallbackHeaderBackBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#4F46E5" />
            <Text style={styles.fallbackHeaderBackBtnText}>Back to Library</Text>
          </TouchableOpacity>
          <View style={styles.emptyStateContainerBox}>
            <Ionicons name="alert-circle-outline" size={44} color="#64748B" />
            <Text style={styles.errorMainTitle}>Blue-track Not Located</Text>
            <Text style={styles.errorSubDescription}>This curriculum sequence is unavailable in your active learning files library loop.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* ─── STICKY MEDIA STREAM FRAME ─── */}
      <View style={styles.videoPlayerWrapperFrame}>
        {activeLesson?.videoUrl ? (
          <View style={styles.videoPlayerWrapperFrame}>
            <VideoView
              player={player}
              style={styles.nativeVideoPlayerNode}
              nativeControls
              allowsFullscreen
              allowsPictureInPicture
            />
          </View>
        ) : (
          <View style={styles.fallbackMediaWindow}>
            <Ionicons name="videocam-off-outline" size={40} color="#94A3B8" />
            <Text style={styles.fallbackMediaHeading}>No Video Track Attached</Text>
            <Text style={styles.fallbackMediaSub}>Review the textual lecture note assets below.</Text>
          </View>
        )}
      </View>

      {/* ─── SEGMENTED INTERACTIVE WORKSPACE TABS ─── */}
      <View style={styles.segmentedWorkspaceTabsRow}>
        <TouchableOpacity 
          style={[styles.workspaceTabItemBtn, activeTab === 'curriculum' && styles.workspaceTabItemBtnActive]} 
          onPress={() => setActiveTab('curriculum')}
        >
          <Text style={[styles.workspaceTabItemBtnText, activeTab === 'curriculum' && styles.workspaceTabItemBtnTextActive]}>Curriculum</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.workspaceTabItemBtn, activeTab === 'notes' && styles.workspaceTabItemBtnActive]} 
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.workspaceTabItemBtnText, activeTab === 'notes' && styles.workspaceTabItemBtnTextActive]}>Lecture</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.workspaceTabItemBtn,
            activeTab === 'reviews' && styles.workspaceTabItemBtnActive
          ]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text
            style={[
              styles.workspaceTabItemBtnText,
              activeTab === 'reviews' && styles.workspaceTabItemBtnTextActive
            ]}
          >
            Reviews
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── PRIMARY WORKSPACE RENDER BOX ─── */}
      {activeTab === 'curriculum' ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.workspaceBodyScrollContext}>
          <View style={styles.courseIdentityCardBlock}>
            <Text style={styles.courseMetaBadgeLabelText}>ACTIVE SYLLABUS HUB</Text>
            <Text style={styles.courseMainTitleLabelText}>{course.title}</Text>
            
            <View style={styles.progressMeterWrapperRow}>
              <View style={styles.progressBarTrackLine}>
                <View style={[styles.progressBarFillLine, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressStringPercentageLabel}>{progress}% Complete</Text>
            </View>
          </View>

          {/* SECTION & ACCORDION LECTURE TREE */}
          <View style={styles.sectionsListBlock}>
            {sections.map((section: any, sIdx: number) => (
              <View key={section.id} style={styles.sectionBlockZone}>
                <View style={styles.sectionHeaderBannerBlock}>
                  <Text style={styles.sectionBannerPreText}>SECTION {sIdx + 1}</Text>
                  <Text style={styles.sectionBannerTitleText}>{section.title}</Text>
                </View>

                {(section.lessons || []).map((lesson: any) => {
                  const absoluteLessonIndex = lessons.findIndex((item: any) => item.id === lesson.id);
                  const isCurrentActive = activeLesson?.id === lesson.id;
                  const isSectionComplete = absoluteLessonIndex < completedLessonCount;

                  const isCompleted = isSectionComplete && lesson.progress?.some((p: any) => p.completed);

                  return (
                    // <TouchableOpacity
                    //   key={lesson.id}
                    //   activeOpacity={0.85}
                    //   style={[styles.lessonRowBtnNode, isCurrentActive && styles.lessonRowBtnNodeActive]}
                    //   onPress={() => {
                    //     setActiveLessonId(lesson.id);
                    //   }}
                    // >
                    //   <Ionicons 
                    //     name={lesson.type === 'article' ? "document-text-outline" : "play-circle-outline"} 
                    //     size={16} 
                    //     color={isCurrentActive ? "#4F46E5" : "#64748B"} 
                    //     style={{ marginTop: 2 }}
                    //   />
                    //   <View style={{ flex: 1, marginLeft: 10, paddingRight: 8 }}>
                    //     <Text style={[styles.lessonRowTitleText, isCurrentActive && styles.lessonRowTitleTextActive]}>
                    //       {lesson.title}
                    //     </Text>
                    //     <Text style={styles.lessonRowDurationText}>
                    //       {lesson.duration || 'Self paced lecture'}
                    //     </Text>
                    //   </View>
                    //   {/* {isSectionComplete && (
                    //     <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    //   )} */}
                    //   {isCompleted && (
                    //     <Ionicons
                    //       name="checkmark-circle"
                    //       size={18}
                    //       color="#10B981"
                    //     />
                    //   )}
                    // </TouchableOpacity>

                    <TouchableOpacity
                      key={lesson.id}
                      activeOpacity={0.85}
                      style={[styles.lessonRowBtnNode, isCurrentActive && styles.lessonRowBtnNodeActive]}
                      onPress={() => {
                        setActiveLessonId(lesson.id);
                      }}
                    >
                      <Ionicons 
                        name={lesson.type === 'article' ? "document-text-outline" : "play-circle-outline"} 
                        size={16} 
                        color={isCurrentActive ? "#4F46E5" : "#64748B"} 
                        style={{ marginTop: 2 }}
                      />
                      <View style={{ flex: 1, marginLeft: 10, paddingRight: 8 }}>
                        <Text style={[styles.lessonRowTitleText, isCurrentActive && styles.lessonRowTitleTextActive]}>
                          {lesson.title}
                        </Text>
                        
                        {/* Dynamic Indicators inside the List Row */}
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, alignItems: 'center' }}>
                          <Text style={styles.lessonRowDurationText}>
                            {lesson.duration || 'Self paced lecture'}
                          </Text>
                          
                          {/* Quiz presence and status dot */}
                          {lesson.quiz && (
                            <View style={styles.microIndicatorTag}>
                              <Ionicons 
                                name="help-circle" 
                                size={11} 
                                color={lesson.quiz.attempts?.length > 0 ? "#10B981" : "#64748B"} 
                              />
                              <Text style={[styles.microIndicatorText, lesson.quiz.attempts?.length > 0 && { color: '#10B981' }]}>
                                Quiz {lesson.quiz.attempts?.some((a: any) => a.passed) ? '(Passed)' : ''}
                              </Text>
                            </View>
                          )}

                          {/* Assignment presence and status dot */}
                          {lesson.assignment && (
                            <View style={styles.microIndicatorTag}>
                              <Ionicons 
                                name="document-attach" 
                                size={11} 
                                color={lesson.assignment.submissions?.length > 0 ? "#10B981" : "#64748B"} 
                              />
                              <Text style={[styles.microIndicatorText, lesson.assignment.submissions?.length > 0 && { color: '#10B981' }]}>
                                Task
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      
                      {isCompleted && (
                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      ) 
      : activeTab === 'notes'
      ?  (
        // <ScrollView showsVerticalScrollIndicator={false} style={styles.workspaceBodyScrollContext}>
        //   <View style={styles.notesTextWorkspacePaddingBox}>
        //     <Text style={styles.notesSectionPreLabel}>{activeLesson?.sectionTitle || 'Current Section'}</Text>
        //     <Text style={styles.notesLessonHeadingTitleText}>{activeLesson?.title || 'Untitled Lecture Document'}</Text>
            
        //     <View style={styles.flatNotesCardContainerBox}>
        //       <Text style={styles.notesCardTitleHeaderLabel}>Lecture Syllabus Document</Text>
        //       <Text style={styles.notesParagraphTextBody}>
        //         {activeLesson?.content || "Use this focused, premium lesson workspace to review curriculum paths, watch streaming production code tracks, and complete metrics progression cycles sequentially."}
        //       </Text>
        //     </View>

        //     {/* LOWER STEP CONTROLLER ARRAYS PANEL */}
        //     <View style={styles.stepControllersRowFlexboxGroup}>
        //       <TouchableOpacity
        //         disabled={activeIndex === 0}
        //         style={[styles.stepBtn, activeIndex === 0 && styles.stepBtnDisabled]}
        //         onPress={() => handleGoToLessonNode(activeIndex - 1)}
        //       >
        //         <Ionicons name="chevron-back" size={16} color={activeIndex === 0 ? "#94A3B8" : "#0F172A"} />
        //         <Text style={[styles.stepBtnText, activeIndex === 0 && { color: '#94A3B8' }]}>Previous</Text>
        //       </TouchableOpacity>

        //       <TouchableOpacity
        //         disabled={activeIndex >= lessons.length - 1}
        //         style={[styles.stepBtn, activeIndex >= lessons.length - 1 && styles.stepBtnDisabled]}
        //         onPress={() => handleGoToLessonNode(activeIndex + 1)}
        //       >
        //         <Text style={[styles.stepBtnText, activeIndex >= lessons.length - 1 && { color: '#94A3B8' }]}>Next</Text>
        //         <Ionicons name="chevron-forward" size={16} color={activeIndex >= lessons.length - 1 ? "#94A3B8" : "#0F172A"} />
        //       </TouchableOpacity>
        //     </View>
        //   </View>
        // </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.workspaceBodyScrollContext}>
          <View style={styles.notesTextWorkspacePaddingBox}>
            <Text style={styles.notesSectionPreLabel}>{activeLesson?.sectionTitle || 'Current Section'}</Text>
            <Text style={styles.notesLessonHeadingTitleText}>{activeLesson?.title || 'Untitled Lecture Document'}</Text>
            
            <View style={styles.flatNotesCardContainerBox}>
              <Text style={styles.notesCardTitleHeaderLabel}>Lecture Syllabus Document</Text>
              <Text style={styles.notesParagraphTextBody}>
                {activeLesson?.content || "Use this focused, premium lesson workspace to review curriculum paths, watch streaming production code tracks, and complete metrics progression cycles sequentially."}
              </Text>
            </View>

            {/* ─── NEW: ACTIVE LESSON EVALUATION MATRIX BLOCKS ─── */}
            {(activeLesson?.quiz || activeLesson?.assignment) && (
              <View style={styles.evaluationMatrixContainer}>
                <Text style={styles.evaluationMatrixHeading}>Lesson Evaluation Criteria</Text>
                
                <View style={{ gap: 12, marginTop: 8 }}>
                  {/* QUIZ PORTAL CARD */}
                  {activeLesson?.quiz && (
                    <View style={styles.deliverableInteractiveCard}>
                      <View style={styles.deliverableIconWrapper}>
                        <Ionicons name="help-circle" size={20} color="#4F46E5" />
                      </View>
                      <View style={{ flex: 1, paddingHorizontal: 12 }}>
                        <Text style={styles.deliverableCardTitle}>{activeLesson.quiz.title || 'Lesson Assessment Quiz'}</Text>
                        <Text style={styles.deliverableCardMeta}>
                          Passing Mark: {activeLesson.quiz.passingScore || 70}%
                        </Text>
                      </View>
                      
                      {/* Status Toggle Checker */}
                      {activeLesson.quiz.attempts?.some((a: any) => a.passed) ? (
                        <View style={styles.statusCompletedBadge}>
                          <Ionicons name="checkmark" size={12} color="#10B981" />
                          <Text style={styles.statusCompletedBadgeText}>Passed</Text>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          style={styles.launchPortalActionBtn}
                          onPress={() => navigation.navigate('StudentQuizExecutionPortal', { quizId: activeLesson.quiz.id, lessonId: activeLesson.id })}
                        >
                          <Text style={styles.launchPortalActionBtnText}>Start Quiz</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

            {activeLesson?.assignment && (
              <View style={styles.deliverableInteractiveCard}>
                <View style={[styles.deliverableIconWrapper, { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }]}>
                  <Ionicons name="document-text" size={20} color="#0F172A" />
                </View>
                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                  <Text style={styles.deliverableCardTitle}>{activeLesson.assignment.title || 'Practical Task Assignment'}</Text>
                  <Text style={styles.deliverableCardMeta}>
                    Max Marks attainable: {activeLesson.assignment.maxMarks || 100}
                  </Text>
                </View>
                
                {/* Status Toggle Checker */}
                {activeLesson.assignment.submissions?.length > 0 ? (
                  <View style={[styles.statusCompletedBadge, styles.statusSubmittedBadge]}>
                    <Ionicons name="cloud-done" size={12} color="#3B82F6" />
                    <Text style={[styles.statusCompletedBadgeText, { color: '#3B82F6' }]}>Submitted</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.launchPortalActionBtn, { backgroundColor: '#0F172A' }]}
                    onPress={() => navigation.navigate('StudentAssignmentScreen', { assignmentId: activeLesson.assignment.id, lessonId: activeLesson.id })}
                  >
                    <Text style={styles.launchPortalActionBtnText}>View Task</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* LOWER STEP CONTROLLER ARRAYS PANEL */}
      <View style={styles.stepControllersRowFlexboxGroup}>
        <TouchableOpacity
          disabled={activeIndex === 0}
          style={[styles.stepBtn, activeIndex === 0 && styles.stepBtnDisabled]}
          onPress={() => handleGoToLessonNode(activeIndex - 1)}
        >
          <Ionicons name="chevron-back" size={16} color={activeIndex === 0 ? "#94A3B8" : "#0F172A"} />
          <Text style={[styles.stepBtnText, activeIndex === 0 && { color: '#94A3B8' }]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={activeIndex >= lessons.length - 1}
          style={[styles.stepBtn, activeIndex >= lessons.length - 1 && styles.stepBtnDisabled]}
          onPress={() => handleGoToLessonNode(activeIndex + 1)}
        >
          <Text style={[styles.stepBtnText, activeIndex >= lessons.length - 1 && { color: '#94A3B8' }]}>Next</Text>
          <Ionicons name="chevron-forward" size={16} color={activeIndex >= lessons.length - 1 ? "#94A3B8" : "#0F172A"} />
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
      )
     : (
       <ScrollView
        style={styles.workspaceBodyScrollContext}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 20 }}>

          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 16
          }}>
            Course Reviews
          </Text>

          {/* Rating */}
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 12
            }}
          >
            {[1,2,3,4,5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
              >
                <Ionicons
                  name={
                    star <= rating
                      ? 'star'
                      : 'star-outline'
                  }
                  size={28}
                  color="#F59E0B"
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Write your review..."
            multiline
            value={reviewText}
            onChangeText={setReviewText}
            style={{
              borderWidth: 1,
              borderColor: '#E2E8F0',
              borderRadius: 10,
              minHeight: 100,
              padding: 12,
              textAlignVertical: 'top'
            }}
          />

          <TouchableOpacity
            style={{
              backgroundColor: '#4F46E5',
              marginTop: 12,
              padding: 14,
              borderRadius: 10,
              alignItems: 'center'
            }}
            onPress={() =>
              createReviewMutation.mutate({
                rating,
                content: reviewText,
              })
            }
          >
            <Text
              style={{
                color: '#FFF',
                fontWeight: '700'
              }}
            >
              Submit Review
            </Text>
          </TouchableOpacity>

          {/* Existing Reviews */}
          <View style={{ marginTop: 24 }}>
            {reviewsData?.map((review: any) => (
              <View
                key={review.id}
                style={{
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12
                }}
              >
                <Text
                  style={{
                    fontWeight: '700'
                  }}
                >
                  {review.author?.name}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 4
                  }}
                >
                  {[...Array(review.rating)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={14}
                      color="#F59E0B"
                    />
                  ))}
                </View>

                <Text
                  style={{
                    marginTop: 8,
                    color: '#475569'
                  }}
                >
                  {review.content}
                </Text>

                <Text
                  style={{
                    marginTop: 8,
                    color: '#94A3B8',
                    fontSize: 12
                  }}
                >
                  {review.date}
                </Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>)}

      {/* ─── LOWER FIXED TRANSACTION COMMIT BUTTON SHEET ─── */}
      <View style={styles.stickyLowerCommitActionSheetPanel}>
        <TouchableOpacity 
          style={styles.completeCommitPrimaryBtn}
          // disabled={progressMutation.isPending}
          // onPress={handleMarkLessonComplete}

          disabled={completeLessonMutation.isPending}
          onPress={() => completeLessonMutation.mutate()}
        >
          {/* {progressMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-done-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.completeCommitPrimaryBtnText}>Mark Lesson Complete</Text>
            </>
          )} */}

          {completeLessonMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.completeCommitPrimaryBtnText}>
                Mark Lesson Complete
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {(enrollment?.progress === 100 || certificate) && (
        <TouchableOpacity
          style={{
            backgroundColor: '#10B981',
            marginHorizontal: 16,
            marginBottom: 12,
            height: 50,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
          onPress={() =>
            navigation.navigate('CertificateScreen', {
              // certificateId:
              //   certificate?.id,

              certificate: {
                ...certificate,
                studentName: user?.name,
                courseTitle: course?.title,
                completedAt: new Date().toLocaleDateString(),
              },
            })
          }
        >
          <Ionicons
            name="ribbon-outline"
            size={20}
            color="#FFF"
          />

          <Text
            style={{
              color: '#FFF',
              fontWeight: '700',
              marginLeft: 8,
            }}
          >
            View Certificate
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CORE APP SPACING MATRIX BASES
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  centerSpinnerFrame: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  spinnerText: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 12 },
  errorWrapperContainer: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  fallbackHeaderBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  fallbackHeaderBackBtnText: { color: '#4F46E5', fontSize: 14, fontWeight: '700' },
  emptyStateContainerBox: { paddingVertical: 64, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16 },
  errorMainTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  errorSubDescription: { fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 24, marginTop: 4, lineHeight: 18 },

  // STICKY TOP MEDIA PLAYER WINDOW OBJECTS
  videoPlayerWrapperFrame: { width: '100%', backgroundColor: '#000000', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  nativeVideoPlayerNode: { width: '100%', height: (width * 9) / 16 },
  fallbackMediaWindow: { width: '100%', height: (width * 9) / 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A' },
  fallbackMediaHeading: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginTop: 10 },
  fallbackMediaSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  // FLAT CONTROL HORIZONTAL WORKSPACE SWITCH TAG STRIPS
  segmentedWorkspaceTabsRow: { flexDirection: 'row', height: 48, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  workspaceTabItemBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  workspaceTabItemBtnActive: { borderBottomColor: '#4F46E5' },
  workspaceTabItemBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  workspaceTabItemBtnTextActive: { color: '#4F46E5', fontWeight: '700' },

  // MAIN RUNTIME LAYOUT HOOK CANVASES
  workspaceBodyScrollContext: { flex: 1, backgroundColor: '#FFFFFF' },
  courseIdentityCardBlock: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  courseMetaBadgeLabelText: { fontSize: 10, fontWeight: '700', color: '#4F46E5', letterSpacing: 1 },
  courseMainTitleLabelText: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 4, lineHeight: 22 },
  progressMeterWrapperRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 },
  progressBarTrackLine: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 99, overflow: 'hidden' },
  progressBarFillLine: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 99 },
  progressStringPercentageLabel: { fontSize: 12, fontWeight: '700', color: '#0F172A', width: 90, textAlign: 'right' },

  // TREE STRUCTURE CARDS MAPPINGS IMAGES
  sectionsListBlock: { paddingBottom: 40 },
  sectionBlockZone: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionHeaderBannerBlock: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#F8FAFC' },
  sectionBannerPreText: { fontSize: 9, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  sectionBannerTitleText: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  lessonRowBtnNode: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', backgroundColor: '#FFFFFF' },
  lessonRowBtnNodeActive: { backgroundColor: '#EEF2FF' },
  lessonRowTitleText: { fontSize: 13, fontWeight: '600', color: '#334155', lineHeight: 18 },
  lessonRowTitleTextActive: { color: '#4F46E5', fontWeight: '700' },
  lessonRowDurationText: { fontSize: 11, color: '#94A3B8', fontWeight: '500', marginTop: 3 },

  // TEXT WORKSPACE NOTES DISPLAY FRAMES
  notesTextWorkspacePaddingBox: { padding: 20, paddingBottom: 40 },
  notesSectionPreLabel: { fontSize: 11, fontWeight: '600', color: '#4F46E5' },
  notesLessonHeadingTitleText: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginTop: 4, letterSpacing: -0.5, lineHeight: 28 },
  flatNotesCardContainerBox: { marginTop: 20, padding: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12 },
  notesCardTitleHeaderLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  notesParagraphTextBody: { fontSize: 14, color: '#475569', lineHeight: 22, marginTop: 8 },

  // BOTTOM NAVIGATION SWITCH STEP BUTTON GROUPS
  stepControllersRowFlexboxGroup: { flexDirection: 'row', gap: 12, marginTop: 24 },
  stepBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#FFFFFF' },
  stepBtnDisabled: { opacity: 0.4, backgroundColor: '#F1F5F9' },
  stepBtnText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },

  // FIXED ACTION FLUID FOOTER
  stickyLowerCommitActionSheetPanel: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  completeCommitPrimaryBtn: { backgroundColor: '#4F46E5', height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  completeCommitPrimaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Append these design layout classes to the bottom of your stylesheet:
  microIndicatorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  microIndicatorText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  evaluationMatrixContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  evaluationMatrixHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  deliverableInteractiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  deliverableIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliverableCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  deliverableCardMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  launchPortalActionBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  launchPortalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statusCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusCompletedBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  statusSubmittedBadge: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
});