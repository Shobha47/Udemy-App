// src/screens/instructor/InstructorQuizBuilderScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { instructorApi } from '../../api/instructor.api';

interface OptionItem {
  text: string;
  isCorrect: boolean;
}

interface QuestionItem {
  question: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  points: number;
  options: OptionItem[];
}

export default function InstructorQuizBuilderScreen({ route, navigation }: any) {
  const { lessonId } = route.params;
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['lesson-quiz', lessonId],
    queryFn: () => instructorApi.getQuizByLesson(lessonId),
    enabled: !!lessonId,
  });

  useEffect(() => {
    if (response?.data?.quiz) {
      const quiz = response.data.quiz;
      setTitle(quiz.title || '');
      setDescription(quiz.description || '');
      setPassingScore(String(quiz.passingScore || 70));
      if (quiz.questions) {
        setQuestions(quiz.questions.map((q: any) => ({
          question: q.question || '',
          type: q.type || 'SINGLE_CHOICE',
          points: q.points || 1,
          options: q.options?.map((o: any) => ({ text: o.text || '', isCorrect: !!o.isCorrect })) || []
        })));
      }
    }
  }, [response]);

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      question: '',
      type: 'SINGLE_CHOICE',
      points: 1,
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
    }]);
  };

  const handleRemoveQuestion = (qIdx: number) => {
    setQuestions(questions.filter((_, idx) => idx !== qIdx));
  };

  const handleUpdateQuestionText = (text: string, qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].question = text;
    setQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.push({ text: '', isCorrect: false });
    setQuestions(updated);
  };

  const handleUpdateOptionText = (text: string, qIdx: number, oIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx].text = text;
    setQuestions(updated);
  };

  const handleToggleOptionCorrectness = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    const isSingle = updated[qIdx].type === 'SINGLE_CHOICE' || updated[qIdx].type === 'TRUE_FALSE';
    
    if (isSingle) {
      updated[qIdx].options = updated[qIdx].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === oIdx
      }));
    } else {
      updated[qIdx].options[oIdx].isCorrect = !updated[qIdx].options[oIdx].isCorrect;
    }
    setQuestions(updated);
  };

  const saveMutation = useMutation({
    mutationFn: (payload: any) => instructorApi.saveQuiz(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
      Alert.alert('Success', 'Quiz configurations synchronized.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    },
    onError: (err: any) => {
      Alert.alert('Save Failed', err.message || 'Network validation error.');
    }
  });

  const handleCommitQuiz = () => {
    if (!title.trim()) return Alert.alert('Validation Error', 'Quiz Title header is required.');
    for (const [idx, q] of questions.entries()) {
      if (!q.question.trim()) return Alert.alert('Validation Error', `Question #${idx + 1} has no text label.`);
      if (q.options.length < 2) return Alert.alert('Validation Error', `Question #${idx + 1} needs at least 2 choices.`);
      const hasCorrect = q.options.some(o => o.isCorrect);
      if (!hasCorrect) return Alert.alert('Validation Error', `Please flag a correct answer key for Question #${idx + 1}`);
    }

    saveMutation.mutate({
      title,
      description,
      passingScore: Number(passingScore) || 70,
      questions
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centeredWrapper}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={24} color="#0F172A" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Configure Lesson Quiz</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quiz Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Module Assessment Exam" placeholderTextColor="#94A3B8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, { height: 64 }]} multiline value={description} onChangeText={setDescription} placeholder="Instructions for students..." placeholderTextColor="#94A3B8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Passing Score Threshold (%)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={passingScore} onChangeText={setPassingScore} />
        </View>

        <View style={styles.dividerBlock}>
          <View style={styles.rowHeader}>
            <Text style={styles.blockTitle}>Questions Feed Matrix</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddQuestion}>
              <Ionicons name="add" size={14} color="#4F46E5" />
              <Text style={styles.addBtnText}>Add Question</Text>
            </TouchableOpacity>
          </View>

          {questions.map((q, qIdx) => (
            <View key={qIdx} style={styles.questionCard}>
              <View style={styles.rowHeader}>
                <Text style={styles.cardIndexLabel}>Question #{qIdx + 1}</Text>
                <TouchableOpacity onPress={() => handleRemoveQuestion(qIdx)}><Ionicons name="trash-outline" size={16} color="#EF4444" /></TouchableOpacity>
              </View>

              <TextInput style={[styles.input, { marginBottom: 10 }]} placeholder="Type your core question parameter..." placeholderTextColor="#94A3B8" value={q.question} onChangeText={(t) => handleUpdateQuestionText(t, qIdx)} />

              <Text style={[styles.label, { marginBottom: 4 }]}>Answers Layout (Select correct options)</Text>
              {q.options.map((opt, oIdx) => (
                <View key={oIdx} style={styles.optionRow}>
                  <TouchableOpacity onPress={() => handleToggleOptionCorrectness(qIdx, oIdx)}>
                    <Ionicons name={opt.isCorrect ? "checkbox" : "square-outline"} size={20} color={opt.isCorrect ? "#16A34A" : "#CBD5E1"} />
                  </TouchableOpacity>
                  <TextInput style={[styles.input, { flex: 1, height: 38 }]} placeholder={`Option #${oIdx + 1}`} placeholderTextColor="#94A3B8" value={opt.text} onChangeText={(t) => handleUpdateOptionText(t, qIdx, oIdx)} />
                </View>
              ))}

              <TouchableOpacity style={[styles.addBtn, { marginTop: 6 }]} onPress={() => handleAddOption(qIdx)}>
                <Ionicons name="add" size={12} color="#4F46E5" />
                <Text style={[styles.addBtnText, { fontSize: 11 }]}>Append Choice Option</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} disabled={saveMutation.isPending} onPress={handleCommitQuiz}>
          {saveMutation.isPending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Evaluation Quiz</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centeredWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569' },
  input: { height: 44, width: '100%', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontSize: 13, color: '#0F172A' },
  dividerBlock: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16, gap: 12, marginTop: 10 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  blockTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  addBtnText: { color: '#4F46E5', fontSize: 12, fontWeight: '700' },
  questionCard: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, gap: 8, marginBottom: 12 },
  cardIndexLabel: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  saveBtn: { backgroundColor: '#4F46E5', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  
  // Accordion Component Layout Style Extensions
  hybridLessonCardItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  lessonMetaMainRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  inlineActionsContainer: { flexDirection: 'row', gap: 8, marginTop: 8, paddingLeft: 22 },
  shortcutActionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  shortcutAssignmentBadge: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  shortcutActionBadgeText: { fontSize: 11, fontWeight: '700', color: '#4F46E5' },
});