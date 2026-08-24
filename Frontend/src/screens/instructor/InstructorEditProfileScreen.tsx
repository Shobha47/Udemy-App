// src/screens/instructor/InstructorEditProfileScreen.tsx
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { instructorApi } from '../../api/instructor.api';

export default function InstructorEditProfileScreen({ navigation }: any) {
  const queryClient = useQueryClient();

  // --- MODEL PROFILE FIELDS STATE ENGINE ---
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  
  // Isolated inner social mapping values strings
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['instructor-profile'],
    queryFn: instructorApi.getProfile,
  });

  // Hydrate data fields sequentially on component load pipeline
  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setAvatar(user.avatar ?? '');
      setHeadline(user.headline ?? '');
      setBio(user.bio ?? '');
      setWebsite(user.website ?? '');

      const parsedSocials = typeof user.socialLinks === 'string' 
        ? JSON.parse(user.socialLinks) 
        : user.socialLinks || {};
        
      setTwitter(parsedSocials.twitter ?? '');
      setLinkedin(parsedSocials.linkedin ?? '');
      setYoutube(parsedSocials.youtube ?? '');
    }
  }, [user]);

  // --- CONSOLE UPDATE MUTATION LAYER ---
  const updateProfileMutation = useMutation({
    mutationFn: instructorApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-profile'] });
      Alert.alert('Success', 'Profile specifications updated seamlessly.');
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert('Update Failure', err?.message || 'Failed to sync modifications.');
    }
  });

  const handleUpdateSubmissionCommit = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Profile user name cannot be left blank.');
      return;
    }

    const compiledPayload = {
      name,
      avatar,
      headline,
      bio,
      website,
      socialLinks: {
        twitter,
        linkedin,
        youtube
      }
    };

    updateProfileMutation.mutate(compiledPayload);
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

      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Edit Profile Parameters</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContextContainer}>
          <Text style={styles.formGroupSectionHeading}>Identity Metadata</Text>

          {/* Name Field Input */}
          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Public Display Name</Text>
            <TextInput style={styles.textInputNode} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor="#94A3B8" />
          </View>

          {/* Avatar Field Input */}
          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Avatar Asset Link (URL string)</Text>
            <TextInput style={styles.textInputNode} value={avatar} onChangeText={setAvatar} autoCapitalize="none" keyboardType="url" placeholder="https://..." placeholderTextColor="#94A3B8" />
          </View>

          {/* Headline Field Input */}
          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Instructor Professional Headline</Text>
            <TextInput style={styles.textInputNode} value={headline} onChangeText={setHeadline} placeholder="e.g., Senior Systems Architecture Guild Artisan" placeholderTextColor="#94A3B8" />
          </View>

          {/* Biography Field Input */}
          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Detailed Biography</Text>
            <TextInput 
              style={[styles.textInputNode, { height: 100, paddingTop: 12 }]} 
              multiline 
              textAlignVertical="top"
              value={bio} 
              onChangeText={setBio} 
              placeholder="Provide a historical record of accomplishments..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Separator Block */}
          <Text style={[styles.formGroupSectionHeading, { marginTop: 14 }]}>Web & Networking Matrices</Text>

          {/* Personal Website */}
          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Personal Website Address (URL)</Text>
            <TextInput style={styles.textInputNode} value={website} onChangeText={setWebsite} autoCapitalize="none" keyboardType="url" placeholder="https://yourdomain.com" placeholderTextColor="#94A3B8" />
          </View>

          {/* LinkedIn Channel link */}
          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>LinkedIn Channel Destination</Text>
            <TextInput style={styles.textInputNode} value={linkedin} onChangeText={setLinkedin} autoCapitalize="none" keyboardType="url" placeholder="https://linkedin.com/in/username" placeholderTextColor="#94A3B8" />
          </View>

          {/* Twitter Link */}
          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>Twitter Profile Handle Platform Link</Text>
            <TextInput style={styles.textInputNode} value={twitter} onChangeText={setTwitter} autoCapitalize="none" keyboardType="url" placeholder="https://twitter.com/username" placeholderTextColor="#94A3B8" />
          </View>

          {/* YouTube Link */}
          <View style={styles.inputFieldGroup}>
            <Text style={styles.fieldLabelText}>YouTube Educator Destination Channel</Text>
            <TextInput style={styles.textInputNode} value={youtube} onChangeText={setYoutube} autoCapitalize="none" keyboardType="url" placeholder="https://youtube.com/c/channelname" placeholderTextColor="#94A3B8" />
          </View>

        </View>
      </ScrollView>

      {/* ATTACHED STICKY LOWER FORM BUTTON ACTION SHEET CONTAINER */}
      <View style={styles.footerActionContainerSheet}>
        <TouchableOpacity 
          style={styles.actionSheetSubmitBtn}
          disabled={updateProfileMutation.isPending}
          onPress={handleUpdateSubmissionCommit}
        >
          {updateProfileMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
              <Text style={styles.actionSheetSubmitBtnText}>Synchronize Workspace Profile</Text>
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
  formContextContainer: { padding: 20, gap: 16, paddingBottom: 40 },
  formGroupSectionHeading: { fontSize: 16, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
  inputFieldGroup: { gap: 6 },
  fieldLabelText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  textInputNode: { height: 46, width: '100%', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontSize: 13, color: '#0F172A' },
  footerActionContainerSheet: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  actionSheetSubmitBtn: { backgroundColor: '#4F46E5', height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionSheetSubmitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});