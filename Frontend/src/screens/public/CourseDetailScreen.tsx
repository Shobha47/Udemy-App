import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, StyleSheet, Image, StatusBar } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Lesson } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFallbackAvatar } from '../../constants/avarat';

import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';

const { width } = Dimensions.get('window');

export default function CourseDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false); 

  // const videoRef = useRef<Video>(null);

  const insets = useSafeAreaInsets(); // Dynamic pixels based on hardware profiles

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isLearnExpanded, setIsLearnExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const { data, isLoading } = useQuery({
    queryKey: ['courseDetail', id],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/${id}`);
      return response.data;
    },
  });

  const course = data?.data?.course;
  console.log("GET COURES DATA IN COURSE DETAIL SCREEN:", course?.reviews);
  //   useEffect(() => {
  //   if (player) {
  //     player.play();
  //   }
  // }, [activeLesson]);

  useEffect(() => {
    if (course?.curriculum && course.curriculum.length > 0) {
      setExpandedSections({
        [course.curriculum[0].id]: true
      });
    }
  }, [course]);

    const targetStream =
    activeLesson?.videoUrl ||
    course?.previewVideo ||
    'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';

  const player = useVideoPlayer(targetStream, (player) => {
    player.loop = false;
    player.play();
  });

  const { isPlaying } = useEvent(
    player,
    'playingChange',
    {
      isPlaying: player.playing,
    }
  );

  useEffect(() => {
    if (player) {
      player.play();
    }
  }, [targetStream]);

  if (isLoading || !course) {
    return (
      <View style={styles.centerSpinner}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.spinnerText}>Assembling curriculum matrix...</Text>
      </View>
    );
  }

  // const targetStream = activeLesson?.videoUrl || course.previewVideo || 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';
  const curriculumTree = course.curriculum || [];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const descriptionParagraphs = course.description ? course.description.split('\n').filter((p: string) => p.trim() !== '') : [];
  const dynamicDescToShow = isDescExpanded ? descriptionParagraphs : descriptionParagraphs.slice(0, 1);
  const rawLearningItems = course.whatYouWillLearn || [];
  const learningItemsToShow = isLearnExpanded ? rawLearningItems : rawLearningItems.slice(0, 2);
  const rawRequirements = course.requirements || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar hidden={isFullscreen} barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER SECTION */}
      {!isFullscreen && (
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
          </View>
        </View>
      )}

      {/* VIDEO SECTION */}
      <View style={isFullscreen ? styles.fullscreenContainer : styles.videoWrapper}>
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
                {activeLesson?.title || 'Course Preview'}
              </Text>
              <Text style={styles.videoSubtitle}>
                {course.totalLectures || 0} Lectures • {course.totalHours || 0}h
              </Text>
            </View>

            <View style={styles.previewPill}>
              <Ionicons name="play-circle" size={14} color="#4F46E5" />
              <Text style={styles.previewPillText}>Preview</Text>
            </View>
          </View>
        )}
      </View>

      {/* CONTENT SCROLL */}
      {!isFullscreen && (
        <>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 72 + insets.bottom }}>
            {/* Meta Specifications Block */}
            <View style={styles.metaContainer}>
              {course.level && (
                <View style={styles.levelIndicatorBadge}>
                  <Text style={styles.levelIndicatorText}>{course.level}</Text>
                </View>
              )}
              
              <Text style={styles.titleText}>{course.title}</Text>
              <Text style={styles.subtitleText}>{course.subtitle || 'Advanced Masterclass'}</Text>

              <View style={styles.metricsStripRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}> {Number(course.rating || 0).toFixed(1)}</Text>
                <Text style={styles.metricBullet}>•</Text>
                <Text style={styles.metricLabelText}>{course.reviewCount || 0} reviews</Text>
                <Text style={styles.metricBullet}>•</Text>
                <Text style={styles.metricLabelText}>{(course.studentCount || 0).toLocaleString()} enrolled</Text>
              </View>

              <View style={styles.metadataMetaRow}>
                <Text style={styles.metaTimeText}>Language: <Text style={{ fontWeight: '600', color: '#0F172A' }}>{course.language || 'English'}</Text></Text>
                {course.updatedAt && (
                  <Text style={styles.metaTimeText}>Last updated: {new Date(course.updatedAt).toLocaleDateString()}</Text>
                )}
              </View>
            </View>

            {/* Description Section */}
            {descriptionParagraphs.length > 0 && (
              <View style={styles.collapsibleContainerSection}>
                <Text style={styles.sectionBlockHeading}>Description</Text>
                {dynamicDescToShow.map((para: string, idx: number) => (
                  <Text key={idx} style={styles.bodyDescriptionContentText}>
                    {para}
                  </Text>
                ))}
                {descriptionParagraphs.length > 1 && (
                  <TouchableOpacity style={styles.seeMoreInlineButton} onPress={() => setIsDescExpanded(!isDescExpanded)} activeOpacity={0.7}>
                    <Text style={styles.seeMoreInlineButtonText}>
                      {isDescExpanded ? 'See less ▲' : 'See more ▼'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* What You Will Learn Layout */}
            {rawLearningItems.length > 0 && (
              <View style={styles.collapsibleContainerSection}>
                <Text style={styles.sectionBlockHeading}>What you'll learn</Text>
                <View style={styles.learningGridItemsBlock}>
                  {learningItemsToShow.map((item: string, idx: number) => (
                    <View key={idx} style={styles.learningBulletRowItem}>
                      <Ionicons name="checkmark-sharp" size={16} color="#10B981" style={{ marginRight: 8, marginTop: 1 }} />
                      <Text style={styles.learningBulletValueText}>{item}</Text>
                    </View>
                  ))}
                </View>
                {rawLearningItems.length > 2 && (
                  <TouchableOpacity style={styles.seeMoreInlineButton} onPress={() => setIsLearnExpanded(!isLearnExpanded)} activeOpacity={0.7}>
                    <Text style={styles.seeMoreInlineButtonText}>
                      {isLearnExpanded ? 'See less ▲' : 'See more ▼'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Curriculum Accordion Breakdown */}
            <View style={styles.curriculumBlock}>
              <Text style={styles.curriculumSectionHeading}>Course Content</Text>
              <View style={styles.curriculumSummaryPillStrip}>
                <Text style={styles.summaryPillText}>{curriculumTree.length} sections</Text>
                <Text style={styles.summaryPillText}>•</Text>
                <Text style={styles.summaryPillText}>{course.totalLectures || 0} lectures</Text>
                <Text style={styles.summaryPillText}>•</Text>
                <Text style={styles.summaryPillText}>{course.totalHours || 0}h total length</Text>
              </View>

              {curriculumTree.length === 0 ? (
                <Text style={styles.emptyCurriculumText}>No lessons configured for this course track yet.</Text>
              ) : (
                curriculumTree.map((section: any, sIdx: number) => {
                  const isSectionOpen = !!expandedSections[section.id];
                  return (
                    <View key={section.id} style={styles.sectionAccordionCard}>
                      <TouchableOpacity 
                        style={styles.sectionAccordionHeader} 
                        onPress={() => toggleSection(section.id)}
                        activeOpacity={0.8}
                      >
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.sectionTitleText} numberOfLines={2}>
                            Section {sIdx + 1}: {section.title}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.sectionLecturesCount}>
                            {section.lessons?.length || 0} Lects
                          </Text>
                          <Ionicons name={isSectionOpen ? "chevron-up" : "chevron-down"} size={14} color="#64748B" />
                        </View>
                      </TouchableOpacity>

                      {isSectionOpen && (
                        <View style={styles.lessonsListPadding}>
                          {section.lessons?.map((lesson: Lesson) => {
                            const isPlaying = activeLesson?.id === lesson.id;
                            const isLock = !lesson.isPreview;
                            
                            return (
                              <TouchableOpacity
                                key={lesson.id}
                                disabled={isLock}
                                onPress={() => setActiveLesson(lesson)}
                                activeOpacity={0.7}
                                style={[
                                  styles.lessonRowButton,
                                  isPlaying ? styles.lessonRowActive : styles.lessonRowInactive,
                                  isLock && styles.lessonRowLocked
                                ]}
                              >
                                <View style={styles.lessonMetaLeft}>
                                  <Ionicons 
                                    name={isLock ? "lock-closed-outline" : "play-circle-outline"} 
                                    size={16} 
                                    color={isPlaying ? "#4F46E5" : isLock ? "#94A3B8" : "#475569"} 
                                    style={{ marginRight: 8 }} 
                                  />
                                  <Text 
                                    style={[
                                      styles.lessonTitleLabel, 
                                      isPlaying ? styles.lessonTitleTextActive : styles.lessonTitleTextInactive,
                                      isLock && styles.lessonTitleTextLocked
                                    ]} 
                                    numberOfLines={1}
                                  >
                                    {lesson.title}
                                  </Text>
                                </View>
                                <View style={styles.lessonMetaRight}>
                                  {!isLock && lesson.isPreview && !isPlaying && (
                                    <View style={styles.previewBadgePill}>
                                      <Text style={styles.previewBadgeText}>Preview</Text>
                                    </View>
                                  )}
                                  <Text style={styles.lessonDurationLabel}>{lesson.duration || 'Video'}</Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>

            {/* Bounded Inclusion Features Box */}
            <View style={styles.inclusionMatrixBlockContainer}>
              <Text style={styles.sectionBlockHeading}>This course includes:</Text>
              <View style={styles.inclusionFeatureGrid}>
                {course.hasLifetimeAccess && (
                  <View style={styles.inclusionFeatureRow}><Ionicons name="infinite-outline" size={16} color="#475569" /><Text style={styles.inclusionFeatureItemText}>Full lifetime access</Text></View>
                )}
                {course.hasMobileAccess && (
                  <View style={styles.inclusionFeatureRow}><Ionicons name="phone-portrait-outline" size={16} color="#475569" /><Text style={styles.inclusionFeatureItemText}>Access on mobile and TV</Text></View>
                )}
                {course.hasCertificate && (
                  <View style={styles.inclusionFeatureRow}><Ionicons name="trophy-outline" size={16} color="#475569" /><Text style={styles.inclusionFeatureItemText}>Certificate of completion</Text></View>
                )}
                {course.totalArticles > 0 && (
                  <View style={styles.inclusionFeatureRow}><Ionicons name="document-text-outline" size={16} color="#475569" /><Text style={styles.inclusionFeatureItemText}>{course.totalArticles} structural articles</Text></View>
                )}
              </View>
            </View>

            {/* Requirements Section */}
            {rawRequirements.length > 0 && (
              <View style={styles.collapsibleContainerSection}>
                <Text style={styles.sectionBlockHeading}>Requirements</Text>
                <View style={styles.requirementsContentListingBlock}>
                  {rawRequirements.map((req: string, idx: number) => (
                    <View key={idx} style={styles.requirementRowItem}>
                      <Text style={styles.requirementBulletPoint}>•</Text>
                      <Text style={styles.requirementBulletPointItemText}>{req}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Instructor Section */}
            {course.instructor && (
              <View style={styles.instructorProfileContainerCard}>
                <Text style={styles.sectionBlockHeading}>Instructor</Text>
                <View style={styles.instructorMetaIdentityRow}>
                  <Image
                    source={
                      course?.instructor?.avatar
                        ? { uri: course.instructor.avatar }
                        : getFallbackAvatar(course?.instructor?.id)
                    }
                    style={styles.instructorAvatarImageFrame}
                  />
                  <View style={styles.instructorIdentityTextBox}>
                    <Text style={styles.instructorProfileNameText}>{course?.instructor.name}</Text>
                    <Text style={styles.instructorHeadlineSubtext}>{course?.instructor.headline || "Instructor"}</Text>
                  </View>
                </View>
                <Text style={styles.instructorBioParagraphDescription}>{course.instructor.bio || "No biography overview provided."}</Text>
              </View>
            )}

            {/* Reviews Section */}
            {/* REVIEWS SECTION */}
<View style={styles.reviewsContainer}>
  <Text style={styles.sectionBlockHeading}>
    Student Reviews
  </Text>

  {/* Rating Summary */}
  <View style={styles.ratingSummaryCard}>
    <Text style={styles.ratingBigNumber}>
      {Number(course.rating || 0).toFixed(1)}
    </Text>

    <View style={styles.ratingSummaryRight}>
      <View style={styles.ratingStarsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name="star"
            size={16}
            color="#F59E0B"
          />
        ))}
      </View>

      <Text style={styles.ratingSummaryText}>
        Based on {course.reviewCount || 0} reviews
      </Text>
    </View>
  </View>

  {/* Review Cards */}
  {course.reviews?.length > 0 ? (
    course.reviews.slice(0, 5).map((review: any, idx: number) => (
      <View
        key={review.id}
        style={styles.reviewCard}
      >
        <View style={styles.reviewTopRow}>
          <View style={styles.reviewUserInfo}>
            <Image
              source={{
                uri:
                  review.avatar ||
                  `https://api.dicebear.com/7.x/personas/png?seed=${review.author}`,
              }}
              style={styles.reviewAvatar}
            />

            <View>
              <Text style={styles.reviewUserName}>
                {review.author}
              </Text>

              <Text style={styles.reviewDate}>
                {review.date}
              </Text>
            </View>
          </View>

          <View style={styles.reviewRatingBadge}>
            <Ionicons
              name="star"
              size={12}
              color="#F59E0B"
            />
            <Text style={styles.reviewRatingText}>
              {review.rating}
            </Text>
          </View>
        </View>

        <Text style={styles.reviewContent}>
          {review.content}
        </Text>

        {review.helpful > 0 && (
          <View style={styles.helpfulContainer}>
            <Ionicons
              name="thumbs-up-outline"
              size={14}
              color="#64748B"
            />
            <Text style={styles.helpfulText}>
              {review.helpful} people found this helpful
            </Text>
          </View>
        )}
      </View>
    ))
  ) : (
    <View style={styles.noReviewsCard}>
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={40}
        color="#CBD5E1"
      />
      <Text style={styles.noReviewsText}>
        No reviews yet
      </Text>
    </View>
  )}

  {course.reviewCount > 0 && (
    <TouchableOpacity
      style={styles.viewAllReviewsButton}
      onPress={() =>
        navigation.navigate('CourseReviews', {
          courseId: course.id,
        })
      }
    >
      <Text style={styles.viewAllReviewsText}>
        View All Reviews ({course.reviewCount})
      </Text>

      <Ionicons
        name="arrow-forward"
        size={16}
        color="#4F46E5"
      />
    </TouchableOpacity>
  )}
</View>
          </ScrollView>

          {/* STICKY LOWER OPERATIONS FOOTER BAR */}
          <View style={[
          styles.stickyFooterActionSheet, 
            { paddingBottom: Math.max(insets.bottom, 12), height: 72 + insets.bottom }
          ]}>
            <View style={styles.footerPricingWrapper}>
              {course.originalPrice && (
                <Text style={styles.originalPriceStrikethroughText}>₹{course.originalPrice.toLocaleString('en-IN')}</Text>
              )}
              <Text style={styles.footerPriceValueText}>₹{course.price.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.footerActionActionButtonsRowGroup}>
              <TouchableOpacity style={styles.secondaryCartActionButton} onPress={() => alert('Item added to cart.')} activeOpacity={0.7}>
                <Text style={styles.secondaryCartActionButtonText}>Add to Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerPrimaryActionButton} onPress={() => alert('Order checkout route initialized.')} activeOpacity={0.8}>
                <Text style={styles.footerPrimaryActionButtonText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CONTAINER SPACING METRICS
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  fullscreenContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000', zIndex: 9999, justifyContent: 'center', alignItems: 'center' },
  fullscreenVideoElement: { width: '100%', height: '100%' },
  centerSpinner: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  spinnerText: { marginTop: 12, fontSize: 13, fontWeight: '600', color: '#64748B' },
  scrollContainer: { flex: 1 },
  
  // HEADER SPECS
  headerContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTopRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 14, padding: 2 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2 },
  
  // VIDEO PLAYER FRAMES
  videoWrapper: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', overflow: 'hidden' },
  videoPlayerFrame: { width: '100%', height: (width * 9) / 16, backgroundColor: '#000000' },
  videoElement: { width: '100%', height: '100%' },
  videoInfoBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFFFFF' },
  videoTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', letterSpacing: -0.1 },
  videoSubtitle: { marginTop: 2, fontSize: 12, color: '#64748B', fontWeight: '500' },
  previewPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  previewPillText: { marginLeft: 4, color: '#4F46E5', fontSize: 12, fontWeight: '700' },
  
  // MAIN META DATA LAYOUT CONTAINERS
  metaContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  levelIndicatorBadge: { backgroundColor: '#FEF3C7', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 10 },
  levelIndicatorText: { color: '#D97706', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  titleText: { fontSize: 22, fontWeight: '800', color: '#0F172A', lineHeight: 28, marginBottom: 6, letterSpacing: -0.5 },
  subtitleText: { fontSize: 14, color: '#475569', lineHeight: 20, fontWeight: '500', marginBottom: 14 },
  metricsStripRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  metricBullet: { color: '#CBD5E1', marginHorizontal: 8, fontSize: 12 },
  metricLabelText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  metadataMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  metaTimeText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  // STRUCTURAL CONTAINER ZONES
  collapsibleContainerSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionBlockHeading: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 8, letterSpacing: -0.2 },
  bodyDescriptionContentText: { marginTop: 4, fontSize: 14, color: '#475569', lineHeight: 22 },
  seeMoreInlineButton: { marginTop: 10, alignSelf: 'flex-start' },
  seeMoreInlineButtonText: { color: '#4F46E5', fontSize: 13, fontWeight: '700' },
  
  // OUTCOME FEATURES GRIDS
  learningGridItemsBlock: { marginTop: 4 },
  learningBulletRowItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  learningBulletValueText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },
  
  // CURRICULUM INTERACTIVE DECK BLOCKS
  curriculumBlock: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  curriculumSectionHeading: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4, letterSpacing: -0.2 },
  curriculumSummaryPillStrip: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  summaryPillText: { fontSize: 12, color: '#64748B', marginRight: 6, fontWeight: '500' },
  emptyCurriculumText: { fontSize: 13, color: '#94A3B8', fontWeight: '500', fontStyle: 'italic', marginVertical: 10 },
  sectionAccordionCard: { marginBottom: 10, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  sectionAccordionHeader: { backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleText: { fontWeight: '700', color: '#1E293B', fontSize: 13, lineHeight: 18 },
  sectionLecturesCount: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  lessonsListPadding: { padding: 8, backgroundColor: '#FFFFFF', gap: 6 },
  lessonRowButton: { padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1 },
  lessonRowActive: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  lessonRowInactive: { backgroundColor: '#FFFFFF', borderColor: '#F1F5F9' },
  lessonRowLocked: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', opacity: 0.7 },
  lessonMetaLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  lessonTitleLabel: { fontSize: 13, fontWeight: '500', flex: 1 },
  lessonTitleTextActive: { color: '#4F46E5', fontWeight: '700' },
  lessonTitleTextInactive: { color: '#334155' },
  lessonTitleTextLocked: { color: '#94A3B8' },
  lessonMetaRight: { flexDirection: 'row', alignItems: 'center' },
  previewBadgePill: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  previewBadgeText: { color: '#16A34A', fontSize: 10, fontWeight: '700' },
  lessonDurationLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  
  // CORE SPEC MATRIX BLOCK BOXES
  inclusionMatrixBlockContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  inclusionFeatureGrid: { marginTop: 6, gap: 10 },
  inclusionFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inclusionFeatureItemText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  requirementsContentListingBlock: { marginTop: 4, gap: 8 },
  requirementRowItem: { flexDirection: 'row', alignItems: 'flex-start' },
  requirementBulletPoint: { fontSize: 14, color: '#475569', width: 14 },
  requirementBulletPointItemText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },
  
  // INSTRUCTOR PROFILE LAYER BLOCKS
  instructorProfileContainerCard: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  instructorMetaIdentityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 12 },
  instructorAvatarImageFrame: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  instructorIdentityTextBox: { marginLeft: 12, flex: 1 },
  instructorProfileNameText: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  instructorHeadlineSubtext: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
  instructorBioParagraphDescription: { fontSize: 14, color: '#475569', lineHeight: 22 },
  
  // REVIEWS INTERACTIVE FEEDS BLOCKS
  reviewsSystemFeedbackSectionWrapper: { padding: 20, paddingBottom: 120 },
  individualReviewCardFrame: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  reviewHeaderIdentityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewerProfileNameText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  starsRowInline: { flexDirection: 'row', alignItems: 'center' },
  reviewStarsValueSpan: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  reviewBodyCommentParagraph: { fontSize: 14, color: '#475569', lineHeight: 20 },
  emptyFeedbacksPlaceholderText: { fontSize: 13, color: '#94A3B8', marginTop: 4, fontStyle: 'italic' },

  reviewsContainer: {
  padding: 20,
  paddingBottom: 120,
},

ratingSummaryCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F8FAFC',
  borderRadius: 16,
  padding: 18,
  marginBottom: 20,
},

ratingBigNumber: {
  fontSize: 40,
  fontWeight: '800',
  color: '#0F172A',
},

ratingSummaryRight: {
  marginLeft: 18,
},

ratingStarsRow: {
  flexDirection: 'row',
  marginBottom: 6,
},

ratingSummaryText: {
  color: '#64748B',
  fontSize: 13,
},

reviewCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 16,
  marginBottom: 14,

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.05,
  shadowRadius: 8,

  elevation: 2,

  borderWidth: 1,
  borderColor: '#F1F5F9',
},

reviewTopRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

reviewUserInfo: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},

reviewAvatar: {
  width: 48,
  height: 48,
  borderRadius: 24,
  marginRight: 12,
},

reviewUserName: {
  fontSize: 15,
  fontWeight: '700',
  color: '#0F172A',
},

reviewDate: {
  fontSize: 12,
  color: '#64748B',
  marginTop: 2,
},

reviewRatingBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FEF3C7',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
},

reviewRatingText: {
  marginLeft: 4,
  fontWeight: '700',
  color: '#92400E',
},

reviewContent: {
  marginTop: 12,
  fontSize: 14,
  color: '#475569',
  lineHeight: 22,
},

helpfulContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 12,
},

helpfulText: {
  marginLeft: 6,
  fontSize: 12,
  color: '#64748B',
},

viewAllReviewsButton: {
  marginTop: 8,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
},

viewAllReviewsText: {
  color: '#4F46E5',
  fontWeight: '700',
  marginRight: 6,
},

noReviewsCard: {
  alignItems: 'center',
  paddingVertical: 30,
},

noReviewsText: {
  marginTop: 10,
  color: '#94A3B8',
  fontSize: 14,
},
  
  // LOWER ATTACHED FIXED SHEET HOOK
  stickyFooterActionSheet: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#0F172A', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 12 },
  footerPricingWrapper: { flexDirection: 'column' },
  originalPriceStrikethroughText: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through', fontWeight: '500', marginBottom: 1 },
  footerPriceValueText: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  footerActionActionButtonsRowGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  secondaryCartActionButton: { paddingHorizontal: 16, height: 46, borderRadius: 10, borderWidth: 1, borderColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  secondaryCartActionButtonText: { color: '#4F46E5', fontSize: 14, fontWeight: '700' },
  footerPrimaryActionButton: { backgroundColor: '#4F46E5', paddingHorizontal: 22, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  footerPrimaryActionButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});