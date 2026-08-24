import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';

export default function StudentQuizExecutionScreen({ route, navigation }: any) {
  const { quizId, lessonId } = route.params || {};
  const queryClient = useQueryClient();

  // Active runtime state tracking variables
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [scoreReport, setScoreReport] = useState<any>(null);

  // ─── FETCH QUIZ SCHEMA DATA VIA TANSTACK ───
  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ['quiz-portal-execution', quizId],
    queryFn: async () => {
      const response = await apiClient.get(`/enrollments/quizzes/${quizId}`);
      return response.data.data.quiz;
    },
    enabled: !!quizId,
  });

  const questions = useMemo(() => quiz?.questions || [], [quiz]);
  const activeQuestion = questions[currentQuestionIndex];

  // ─── SUBMIT QUIZ EVALUATION MUTATION ───
  const submitQuizMutation = useMutation({
    mutationFn: async (payload: { quizId: string; answers: Record<string, string> }) => {
      const response = await apiClient.post(`/enrollments/quizzes/${quizId}/submit`, {
        answers: payload.answers,
        lessonId, // Passed so backend can update student progress context seamlessly
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setScoreReport(data.attempt);
      setQuizSubmitted(true);
      
      // Invalidate your learning path loop queries to reflect 'Passed' checkmarks instantly
      queryClient.invalidateQueries({ queryKey: ['learning-course'] });
    },
    onError: (error: any) => {
      Alert.alert('Submission Failed', error?.message || 'Could not parse quiz grading matrix profiles.');
    },
  });

  const handleSelectOption = (questionId: string, optionValue: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Basic verification layer validation rule checks
    if (Object.keys(selectedAnswers).length < questions.length) {
      Alert.alert(
        'Incomplete Assessment',
        'You have skipped questions in this profile matrix. Complete all deliverables before compiling grades.',
        [
          { text: 'Review Options' },
          {
            text: 'Submit Anyway',
            style: 'destructive',
            onPress: () => submitQuizMutation.mutate({ quizId, answers: selectedAnswers }),
          },
        ]
      );
      return;
    }

    submitQuizMutation.mutate({ quizId, answers: selectedAnswers });
  };

  if (isLoading) {
    return (
      <View style={styles.centerSpinnerFrame}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.spinnerText}>Assembling quiz architecture matrix rules...</Text>
      </View>
    );
  }

  if (isError || !quiz || questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorWrapperContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" style={{ alignSelf: 'center' }} />
          <Text style={styles.errorMainTitle}>Assessment Portal Failure</Text>
          <Text style={styles.errorSubDescription}>
            Unable to secure specific assessment keys matching evaluation index parameters.
          </Text>
          <TouchableOpacity style={styles.fallbackActionBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.fallbackActionBtnText}>Return to Curriculum</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── POST-SUBMISSION EVALUATION REPORT VIEW CARD ───
  if (quizSubmitted && scoreReport) {
    const isPassed = scoreReport.passed;
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.scoreReportContainer}>
          <View style={styles.scoreReportCardBox}>
            <View style={[styles.statusIconCircle, { backgroundColor: isPassed ? '#DCFCE7' : '#FEE2E2' }]}>
              <Ionicons 
                name={isPassed ? "trophy-outline" : "refresh-circle-outline"} 
                size={40} 
                color={isPassed ? "#16A34A" : "#DC2626"} 
              />
            </View>

            <Text style={styles.scoreReportTitle}>
              {isPassed ? 'Evaluation Criteria Approved' : 'Minimum Standards Not Met'}
            </Text>
            
            <Text style={styles.scoreReportSubtitle}>
              {quiz.title}
            </Text>

            <View style={styles.matrixMetricsBadgeRow}>
              <View style={styles.metricItemColumn}>
                <Text style={styles.metricLabel}>YOUR SCORE</Text>
                <Text style={[styles.metricValue, { color: isPassed ? '#16A34A' : '#DC2626' }]}>
                  {scoreReport.score}%
                </Text>
              </View>
              <View style={styles.metricItemColumn}>
                <Text style={styles.metricLabel}>REQUIRED PASS</Text>
                <Text style={styles.metricValue}>{quiz.passingScore || 70}%</Text>
              </View>
            </View>

            <Text style={styles.evaluationFeedbackParagraph}>
              {isPassed 
                ? 'Excellent work! You have successfully mastered this lesson sequence asset block and compiled satisfactory records.' 
                : 'Review text workspace lecture nodes again closely before starting your subsequent retake loop attempts.'
              }
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.primaryActionDismissBtn, { backgroundColor: isPassed ? '#4F46E5' : '#0F172A' }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryActionDismissBtnText}>
              {isPassed ? 'Proceed to Curriculum' : 'Dismiss & Review Lecture'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── RUNTIME ACTIVE QUIZ PLAYER ENGINE EXECUTION VIEW ───
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* PORTAL HEADER BLOCK BAR */}
      <View style={styles.portalTopHeaderBar}>
        <TouchableOpacity style={styles.headerDismissIconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={styles.portalHeaderMainTitle} numberOfLines={1}>{quiz.title}</Text>
          <Text style={styles.portalHeaderProgressTrackerText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>
        <View style={styles.passingIndicatorMiniBadge}>
          <Text style={styles.passingIndicatorMiniBadgeText}>Target: {quiz.passingScore || 70}%</Text>
        </View>
      </View>

      {/* MATRIX SEGMENTED PROGRESS TRACKBAR STRIP */}
      <View style={styles.topProgressStripTrack}>
        <View 
          style={[
            styles.topProgressStripFill, 
            { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
          ]} 
        />
      </View>

      <ScrollView style={styles.quizWorkspaceScrollContext} showsVerticalScrollIndicator={false}>
        <View style={styles.questionMainBodyBlock}>
          <Text style={styles.questionIndexMetaLabel}>QUESTION {currentQuestionIndex + 1}</Text>
          <Text style={styles.questionStatementHeadingText}>
            {activeQuestion?.question}
          </Text>

          {/* DYNAMIC OPTION CHIPS RADIO CONTEXT INTERFACES */}
          <View style={styles.optionsRadioFlexContainer}>
            {activeQuestion?.options?.map((option: any, oIdx: number) => {
                const isSelected =
                    selectedAnswers[activeQuestion.id] === option.id;

                return (
                    <TouchableOpacity
                    key={option.id}
                    style={[
                        styles.optionInteractiveCardNode,
                        isSelected && styles.optionInteractiveCardNodeActive,
                    ]}
                    onPress={() =>
                        handleSelectOption(
                        activeQuestion.id,
                        option.id
                        )
                    }
                    >
                    <View
                        style={[
                        styles.radioCircleMarker,
                        isSelected && styles.radioCircleMarkerActive,
                        ]}
                    >
                        {isSelected && (
                        <View style={styles.radioCircleFillDot} />
                        )}
                    </View>

                    <Text
                        style={[
                        styles.optionTextBodyString,
                        isSelected &&
                            styles.optionTextBodyStringActive,
                        ]}
                    >
                        {option.text}
                    </Text>
                    </TouchableOpacity>
                );
                })}
          </View>
        </View>
      </ScrollView>

      {/* FOOTER ACTION TRANSACTION ROW SYSTEM */}
      <View style={styles.fixedFooterControlPanelBar}>
        <TouchableOpacity
          disabled={currentQuestionIndex === 0}
          style={[styles.navigationArrowActionBtn, currentQuestionIndex === 0 && styles.navigationArrowActionBtnDisabled]}
          onPress={handlePreviousQuestion}
        >
          <Ionicons name="chevron-back" size={18} color={currentQuestionIndex === 0 ? "#94A3B8" : "#0F172A"} />
          <Text style={[styles.navigationArrowActionBtnText, currentQuestionIndex === 0 && { color: '#94A3B8' }]}>
            Back
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex < questions.length - 1 ? (
          <TouchableOpacity
            style={styles.navigationArrowActionBtn}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navigationArrowActionBtnText}>Next</Text>
            <Ionicons name="chevron-forward" size={18} color="#0F172A" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={submitQuizMutation.isPending}
            style={styles.submitCommitPrimaryBtnNode}
            onPress={handleSubmitQuiz}
          >
            {submitQuizMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
                <Text style={styles.submitCommitPrimaryBtnNodeText}>Submit Answers</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  centerSpinnerFrame: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  spinnerText: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 12 },
  
  // ERROR RENDERING NODES
  errorWrapperContainer: { flex: 1, padding: 32, justifyContent: 'center' },
  errorMainTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 16, textAlign: 'center' },
  errorSubDescription: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  fallbackActionBtn: { backgroundColor: '#4F46E5', height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  fallbackActionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // INTERACTIVE NAVBAR STRIPS
  portalTopHeaderBar: { flexDirection: 'row', alignItems: 'center', height: 60, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerDismissIconBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  portalHeaderMainTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  portalHeaderProgressTrackerText: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  passingIndicatorMiniBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  passingIndicatorMiniBadgeText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  topProgressStripTrack: { width: '100%', height: 3, backgroundColor: '#F1F5F9' },
  topProgressStripFill: { height: '100%', backgroundColor: '#4F46E5' },

  // RUNTIME WORKSPACE MATRIX AREA
  quizWorkspaceScrollContext: { flex: 1, backgroundColor: '#FFFFFF' },
  questionMainBodyBlock: { padding: 20 },
  questionIndexMetaLabel: { fontSize: 11, fontWeight: '700', color: '#4F46E5', letterSpacing: 0.5 },
  questionStatementHeadingText: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 6, lineHeight: 24 },
  optionsRadioFlexContainer: { marginTop: 24, gap: 12 },
  optionInteractiveCardNode: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#FFFFFF' },
  optionInteractiveCardNodeActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  radioCircleMarker: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioCircleMarkerActive: { borderColor: '#4F46E5' },
  radioCircleFillDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4F46E5' },
  optionTextBodyString: { fontSize: 13, fontWeight: '600', color: '#334155', flex: 1, lineHeight: 18 },
  optionTextBodyStringActive: { color: '#4F46E5', fontWeight: '700' },

  // PORTAL FIXED FOOTER NAV PANEL
  fixedFooterControlPanelBar: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', gap: 12, backgroundColor: '#FFFFFF' },
  navigationArrowActionBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#FFFFFF' },
  navigationArrowActionBtnDisabled: { opacity: 0.4, backgroundColor: '#F1F5F9' },
  navigationArrowActionBtnText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  submitCommitPrimaryBtnNode: { flex: 1, backgroundColor: '#10B981', height: 44, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  submitCommitPrimaryBtnNodeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // EVALUATION RECOVERY PANEL VIEWS
  scoreReportContainer: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F8FAFC' },
  scoreReportCardBox: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, padding: 24, alignItems: 'center' },
  statusIconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scoreReportTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  scoreReportSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 4, textAlign: 'center' },
  matrixMetricsBadgeRow: { flexDirection: 'row', gap: 24, marginTop: 24, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', width: '100%', justifyContent: 'center' },
  metricItemColumn: { alignItems: 'center' },
  metricLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5 },
  metricValue: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  evaluationFeedbackParagraph: { fontSize: 13, color: '#475569', textAlign: 'center', marginTop: 20, lineHeight: 20 },
  primaryActionDismissBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20, width: '100%' },
  primaryActionDismissBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});