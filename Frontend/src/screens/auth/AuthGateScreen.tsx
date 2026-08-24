import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthGateScreen({ navigation }: any) {
  const insets = useSafeAreaInsets(); // Dynamic pixels based on hardware profiles
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navbarHeader}>
        <TouchableOpacity style={styles.closeButtonAction} onPress={() => navigation.goBack()}>
          <Text style={styles.closeActionIconText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitleTextText}>Sign Up Options</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.innerLayoutBodyFrame}>
        <Text style={styles.udemyStyleMainTitle}>Discover your path</Text>
        <Text style={styles.udemyStyleDescription}>Join millions of users learning advanced engineering frameworks, design principles, and business matrices worldwide.</Text>

        {/* Option Item Block 1: Student */}
        <TouchableOpacity style={styles.premiumTrackCardRowButton} onPress={() => navigation.navigate('StudentSignUp')}>
          <View style={styles.avatarIconGraphicBadge}><Text style={{fontSize: 22}}>🎓</Text></View>
          <View style={{flex: 1, marginLeft: 16}}>
            <Text style={styles.premiumTrackTitleText}>Register as a Student</Text>
            <Text style={styles.premiumTrackDescriptionParagraph}>Enroll into video lectures, unlock validation frameworks, and achieve certifications.</Text>
          </View>
          <Text style={styles.arrowIconMarkerText}>›</Text>
        </TouchableOpacity>

        {/* Option Item Block 2: Instructor */}
        <TouchableOpacity style={styles.premiumTrackCardRowButton} onPress={() => navigation.navigate('InstructorSignUp')}>
          <View style={styles.avatarIconGraphicBadge}><Text style={{fontSize: 22}}>🏢</Text></View>
          <View style={{flex: 1, marginLeft: 16}}>
            <Text style={styles.premiumTrackTitleText}>Become an Instructor</Text>
            <Text style={styles.premiumTrackDescriptionParagraph}>Publish your dynamic curriculum models, record lectures, and track marketplace revenue metrics.</Text>
          </View>
          <Text style={styles.arrowIconMarkerText}>›</Text>
        </TouchableOpacity>

        {/* Option Item Block 3: Career Advisor */}
        <TouchableOpacity 
          style={styles.premiumTrackCardRowButton} 
          onPress={() => navigation.navigate('AdvisorSignUp')}
        >
          <View style={styles.avatarIconGraphicBadge}>
            <Text style={{ fontSize: 22 }}>💼</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.premiumTrackTitleText}>Register as Career Advisor</Text>
            <Text style={styles.premiumTrackDescriptionParagraph}>
              Provide career guidance, map regional institutions, and manage student counseling schedules.
            </Text>
          </View>
          <Text style={styles.arrowIconMarkerText}>›</Text>
        </TouchableOpacity>

        {/* Flat Bottom Toggle Redirect Footer */}
        <View
          style={[
          styles.flatFooterRedirectGroupRow, 
            { paddingBottom: Math.max(insets.bottom, 12), height: 72 + insets.bottom }
          ]}
        >
          <Text style={styles.flatFooterLabelSubtext}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.flatFooterActionLinkText}> Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  navbarHeader: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 8 },
  closeButtonAction: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeActionIconText: { fontSize: 16, color: '#1C1D1F', fontWeight: '300' },
  navbarTitleTextText: { fontSize: 15, fontWeight: '700', color: '#1C1D1F' },
  innerLayoutBodyFrame: { paddingHorizontal: 24, paddingTop: 32, flex: 1 },
  udemyStyleMainTitle: { fontSize: 24, fontWeight: '800', color: '#1C1D1F', letterSpacing: -0.5, marginBottom: 10 },
  udemyStyleDescription: { fontSize: 14, color: '#6A6F73', lineHeight: 22, marginBottom: 36 },
  premiumTrackCardRowButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderStyle: 'solid', borderWidth: 1, borderColor: '#D1D7DC', marginBottom: 14, backgroundColor: '#FFFFFF', borderRadius: 20},
  avatarIconGraphicBadge: { width: 44, height: 44, backgroundColor: '#F7F9FA', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  premiumTrackTitleText: { fontSize: 15, fontWeight: '700', color: '#1C1D1F' },
  premiumTrackDescriptionParagraph: { fontSize: 12, color: '#6A6F73', marginTop: 4, lineHeight: 16, paddingRight: 6 },
  arrowIconMarkerText: { fontSize: 22, color: '#1C1D1F', fontWeight: '300' },
  flatFooterRedirectGroupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', marginBottom: 24 },
  flatFooterLabelSubtext: { fontSize: 14, color: '#1C1D1F' },
  flatFooterActionLinkText: { fontSize: 14, fontWeight: '700', color: '#4f46e5' },
});