import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';

export default function StudentAssignmentExecutionScreen({
  route,
  navigation,
}: any) {
  const { assignmentId, lessonId } = route.params || {};

  const queryClient = useQueryClient();

  const [answerText, setAnswerText] = useState('');

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['student-assignment', assignmentId],

    queryFn: async () => {
      const response = await apiClient.get(
        `/enrollments/assignments/${assignmentId}`
      );

      return response.data.data.assignment;
    },

    enabled: !!assignmentId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(
        `/enrollments/lessons/${lessonId}/assignment/submit`,
        {
          answerText,
          files: [],
        }
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['learning-course'],
      });

      Alert.alert(
        'Success',
        'Assignment submitted successfully.'
      );

      navigation.goBack();
    },

    onError: (error: any) => {
      Alert.alert(
        'Submission Failed',
        error?.response?.data?.message ||
          'Unable to submit assignment.'
      );
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centerSpinnerFrame}>
        <ActivityIndicator
          size="large"
          color="#4F46E5"
        />
        <Text style={styles.spinnerText}>
          Loading assignment workspace...
        </Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorWrapperContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={50}
            color="#EF4444"
          />

          <Text style={styles.errorMainTitle}>
            Assignment Not Found
          </Text>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>
              Return
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const existingSubmission =
    assignment.submissions?.[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="close"
            size={24}
            color="#0F172A"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
          numberOfLines={1}
        >
          Assignment
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.assignmentCard}>
          <Text style={styles.assignmentTitle}>
            {assignment.title}
          </Text>

          <Text style={styles.assignmentDescription}>
            {assignment.description}
          </Text>

          {assignment.instructions ? (
            <>
              <Text style={styles.sectionLabel}>
                Instructions
              </Text>

              <Text style={styles.instructionsText}>
                {assignment.instructions}
              </Text>
            </>
          ) : null}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>
                MAX MARKS
              </Text>

              <Text style={styles.metaValue}>
                {assignment.maxMarks}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>
                DUE DATE
              </Text>

              <Text style={styles.metaValue}>
                {assignment.dueDate
                  ? new Date(
                      assignment.dueDate
                    ).toLocaleDateString()
                  : 'No Limit'}
              </Text>
            </View>
          </View>
        </View>

        {/* Submission */}

        <View style={styles.submissionCard}>
          <Text style={styles.sectionHeading}>
            Your Submission
          </Text>

          <TextInput
            multiline
            value={answerText}
            editable={!existingSubmission}
            onChangeText={setAnswerText}
            placeholder="Write your assignment answer here..."
            style={styles.answerInput}
            textAlignVertical="top"
          />

          {existingSubmission?.feedback && (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackTitle}>
                Instructor Feedback
              </Text>

              <Text style={styles.feedbackText}>
                {existingSubmission.feedback}
              </Text>
            </View>
          )}

          {existingSubmission?.marks !== null &&
            existingSubmission?.marks !==
              undefined && (
              <View style={styles.scoreBox}>
                <Text style={styles.scoreText}>
                  Marks Awarded:
                  {' '}
                  {existingSubmission.marks}/
                  {assignment.maxMarks}
                </Text>
              </View>
            )}
        </View>
      </ScrollView>

      {!existingSubmission && (
        <View style={styles.footer}>
          <TouchableOpacity
            disabled={
              submitMutation.isPending ||
              !answerText.trim()
            }
            style={styles.submitBtn}
            onPress={() =>
              submitMutation.mutate()
            }
          >
            {submitMutation.isPending ? (
              <ActivityIndicator
                color="#FFF"
              />
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={18}
                  color="#FFF"
                />

                <Text
                  style={styles.submitBtnText}
                >
                  Submit Assignment
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  centerSpinnerFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  spinnerText: {
    marginTop: 10,
    color: '#64748B',
  },

  header: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  content: {
    flex: 1,
  },

  assignmentCard: {
    margin: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
  },

  assignmentTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },

  assignmentDescription: {
    marginTop: 10,
    color: '#475569',
    lineHeight: 22,
  },

  sectionLabel: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: '700',
  },

  instructionsText: {
    marginTop: 8,
    lineHeight: 22,
    color: '#475569',
  },

  metaRow: {
    flexDirection: 'row',
    marginTop: 20,
  },

  metaItem: {
    flex: 1,
  },

  metaLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },

  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },

  submissionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  answerInput: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFF',
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  submitBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },

  feedbackBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },

  feedbackTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },

  feedbackText: {
    color: '#475569',
  },

  scoreBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
  },

  scoreText: {
    fontWeight: '700',
    color: '#16A34A',
  },

  errorWrapperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorMainTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },

  backBtn: {
    marginTop: 20,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  backBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
});