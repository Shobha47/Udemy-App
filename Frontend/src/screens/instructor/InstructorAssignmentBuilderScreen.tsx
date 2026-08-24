// src/screens/instructor/InstructorAssignmentBuilderScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { instructorApi } from '../../api/instructor.api';

export default function InstructorAssignmentBuilderScreen({ route, navigation }: any) {
  const { lessonId } = route.params;
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');

  const { data: response, isLoading } = useQuery({
    queryKey: ['lesson-assignment', lessonId],
    queryFn: () => instructorApi.getAssignmentByLesson(lessonId),
    enabled: !!lessonId,
  });

  useEffect(() => {
    if (response?.data?.assignment) {
      const assign = response.data.assignment;
      setTitle(assign.title || '');
      setDescription(assign.description || '');
      setInstructions(assign.instructions || '');
      setMaxMarks(String(assign.maxMarks || 100));
    }
  }, [response]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) => instructorApi.saveAssignment(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
      Alert.alert('Success', 'Assignment criteria established.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to update assignment node.');
    }
  });

  const handleCommitAssignment = () => {
    if (!title.trim()) return Alert.alert('Validation Error', 'Assignment Title is required.');
    if (!description.trim()) return Alert.alert('Validation Error', 'Please supply a fundamental description context.');

    saveMutation.mutate({
      title,
      description,
      instructions,
      maxMarks: Number(maxMarks) || 100,
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
        <Text style={styles.headerTitle}>Configure Assignment Task</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Assignment Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Build a secure REST API architecture" placeholderTextColor="#94A3B8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Problem Statement / Description</Text>
          <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top', paddingTop: 10 }]} multiline value={description} onChangeText={setDescription} placeholder="Detail the core functional milestone criteria for your students..." placeholderTextColor="#94A3B8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Submission Guidelines & Instructions</Text>
          <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 10 }]} multiline value={instructions} onChangeText={setInstructions} placeholder="e.g. Please upload zipped source files or Git repository link snapshots..." placeholderTextColor="#94A3B8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Maximum Attainable Marks (Score cap)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={maxMarks} onChangeText={setMaxMarks} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#0F172A' }]} disabled={saveMutation.isPending} onPress={handleCommitAssignment}>
          {saveMutation.isPending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Compile Assignment Rules</Text>}
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