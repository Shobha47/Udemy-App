import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { advisorApiClient } from '../../api/advisorClient';

// Constants
const DOCUMENT_TYPES = [
  { label: 'Aadhaar Card', value: 'AADHAAR_CARD' },
  { label: 'PAN Card', value: 'PAN_CARD' },
  { label: 'Highest Qualification Degree', value: 'QUALIFICATION_DEGREE' },
  { label: 'Experience Certificate', value: 'EXPERIENCE_CERTIFICATE' },
  { label: 'Cancelled Cheque / Passbook', value: 'BANK_PROOF' },
];

type StepType = 'PHONE_OTP' | 'PROFILE_FORM' | 'DOCUMENTS_UPLOAD';

interface UploadedDoc {
  type: string;
  fileName: string;
  fileUri: string;
}

export default function AdvisorSignUpScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<StepType>('PHONE_OTP');

  // Step 1 State: OTP
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [registrationToken, setRegistrationToken] = useState('');

  // Step 2 State: Profile Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [experienceYears, setExperienceYears] = useState('0');
  const [qualification, setQualification] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 State: Bank Details
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIFSC, setBankIFSC] = useState('');
  const [bankName, setBankName] = useState('');

  // Cascading Dropdown Selectors
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);
  const [selectedSector, setSelectedSector] = useState<{ id: string; name: string } | null>(null);
  const [selectedInstitute, setSelectedInstitute] = useState<{ id: string; name: string } | null>(null);

  // Active Picker Modals
  const [activeModal, setActiveModal] = useState<'DISTRICT' | 'SECTOR' | 'INSTITUTE' | 'GENDER' | 'DOC_TYPE' | null>(null);

  // Step 3 State: Documents
  const [currentDocType, setCurrentDocType] = useState(DOCUMENT_TYPES[0].value);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);

  // ==========================================
  // API QUERIES (Cascading Dropdowns)
  // ==========================================
  const { data: districtsData, isLoading: isLoadingDistricts } = useQuery({
    queryKey: ['advisorDistricts'],
    queryFn: async () => {
      const res = await advisorApiClient.get('/districts');
      return res.data?.items || res.data || [];
    },
  });

  const { data: sectorsData, isLoading: isLoadingSectors } = useQuery({
    queryKey: ['advisorSectors', selectedDistrict?.id],
    queryFn: async () => {
      if (!selectedDistrict?.id) return [];
      const res = await advisorApiClient.get(`/sectors?districtId=${selectedDistrict.id}`);
      return res.data?.items || res.data || [];
    },
    enabled: !!selectedDistrict?.id,
  });

  const { data: institutesData, isLoading: isLoadingInstitutes } = useQuery({
    queryKey: ['advisorInstitutes', selectedSector?.id],
    queryFn: async () => {
      if (!selectedSector?.id) return [];
      const res = await advisorApiClient.get(`/institutes?sectorId=${selectedSector.id}`);
      return res.data?.items || res.data || [];
    },
    enabled: !!selectedSector?.id,
  });

  // ==========================================
  // MUTATIONS
  // ==========================================
  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await advisorApiClient.post('/auth/send-otp', { phone });
      return res.data;
    },
    onSuccess: () => {
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Verification code sent to your mobile number.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send OTP.');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await advisorApiClient.post('/auth/verify-otp', { phone, code: otpCode });
      return res.data;
    },
    onSuccess: (resData) => {
      const token = resData?.data?.registrationToken || resData?.registrationToken;
      setRegistrationToken(token);

      if (resData?.data?.resumeStep === 'DOCUMENTS_UPLOAD') {
        setStep('DOCUMENTS_UPLOAD');
      } else {
        setStep('PROFILE_FORM');
      }
    },
    onError: (err: any) => {
      Alert.alert('Verification Failed', err?.response?.data?.message || 'Invalid OTP code.');
    },
  });

  const profileRegisterMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await advisorApiClient.post('/auth/register-profile', payload, {
        headers: { Authorization: `Bearer ${registrationToken}` },
      });
      return res.data;
    },
    onSuccess: () => {
      setStep('DOCUMENTS_UPLOAD');
    },
    onError: (err: any) => {
      Alert.alert('Registration Error', err?.response?.data?.message || 'Failed to save profile details.');
    },
  });

  const submitDocumentsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await advisorApiClient.post('/auth/upload-documents', payload, {
        headers: { Authorization: `Bearer ${registrationToken}` },
      });
      return res.data;
    },
    onSuccess: () => {
      Alert.alert('Registration Submitted', 'Your career advisor application has been submitted and is under verification.', [
        { text: 'Log In Now', onPress: () => navigation.navigate('Login') },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Document Submission Error', err?.response?.data?.message || 'Failed to complete registration.');
    },
  });

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleSendOtp = () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    sendOtpMutation.mutate();
  };

  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit verification code.');
      return;
    }
    verifyOtpMutation.mutate();
  };

  const handleProfileSubmit = () => {
    if (!name || !email || !dob || !qualification || !address || !password) {
      Alert.alert('Missing Fields', 'Please complete all required personal information fields.');
      return;
    }
    if (!selectedInstitute) {
      Alert.alert('Missing Institute', 'Please assign a district, sector, and institute.');
      return;
    }
    if (!bankAccountHolder || !bankAccountNumber || !bankIFSC || !bankName) {
      Alert.alert('Missing Payout Details', 'Please complete your bank account details for receiving payouts.');
      return;
    }

    const payload = {
      name,
      email: email.toLowerCase().trim(),
      phone,
      dob,
      gender,
      experienceYears: Number(experienceYears || 0),
      qualification,
      address,
      instituteId: selectedInstitute.id,
      bankAccountHolder,
      bankAccountNumber,
      bankIFSC: bankIFSC.toUpperCase().trim(),
      bankName,
      password,
    };

    profileRegisterMutation.mutate(payload);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const picked = result.assets[0];
        const filtered = documents.filter((d) => d.type !== currentDocType);
        setDocuments([...filtered, { type: currentDocType, fileName: picked.name, fileUri: picked.uri }]);
      }
    } catch (err) {
      Alert.alert('File Pick Error', 'Unable to select document.');
    }
  };

  const handleRemoveDocument = (docType: string) => {
    setDocuments(documents.filter((d) => d.type !== docType));
  };

  const handleFinalSubmit = () => {
    if (documents.length === 0) {
      Alert.alert('Missing Verification Documents', 'Please attach at least one document before submitting.');
      return;
    }
    submitDocumentsMutation.mutate({ documents });
  };

  // Helper step progress bar width
  const progressWidth = step === 'PHONE_OTP' ? '33%' : step === 'PROFILE_FORM' ? '66%' : '100%';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* HEADER */}
      <View style={styles.navbarHeader}>
        <TouchableOpacity style={styles.closeButtonAction} onPress={() => navigation.goBack()}>
          <Text style={styles.closeActionIconText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitleTextText}>Advisor Registration</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* STEP PROGRESS INDICATOR */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelsRow}>
              <Text style={[styles.stepLabelText, step === 'PHONE_OTP' && styles.stepLabelTextActive]}>1. OTP</Text>
              <Text style={[styles.stepLabelText, step === 'PROFILE_FORM' && styles.stepLabelTextActive]}>2. Profile</Text>
              <Text style={[styles.stepLabelText, step === 'DOCUMENTS_UPLOAD' && styles.stepLabelTextActive]}>3. Documents</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: progressWidth }]} />
            </View>
          </View>

          {/* STEP 1: PHONE OTP VERIFICATION */}
          {step === 'PHONE_OTP' && (
            <View style={styles.stepContainer}>
              <Text style={styles.sectionTitleText}>Mobile Verification</Text>
              <Text style={styles.sectionSubtext}>Verify your mobile phone number via OTP to begin career advisor onboarding.</Text>

              <Text style={styles.inputFieldLabel}>Mobile Phone Number</Text>
              <View style={styles.inlineRowInputGroup}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#6A6F73"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                  editable={!otpSent}
                />
                <TouchableOpacity
                  style={[styles.inlineActionButton, otpSent && styles.inlineActionButtonOutline]}
                  onPress={handleSendOtp}
                  disabled={sendOtpMutation.isPending}
                >
                  {sendOtpMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.inlineActionButtonText, otpSent && styles.inlineActionButtonOutlineText]}>
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {otpSent && (
                <View style={styles.otpInputGroupWrapper}>
                  <Text style={styles.inputFieldLabel}>6-Digit Verification Code</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#6A6F73"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={setOtpCode}
                  />

                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={handleVerifyOtp}
                    disabled={verifyOtpMutation.isPending}
                  >
                    {verifyOtpMutation.isPending ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryActionButtonText}>Verify Code & Continue</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* STEP 2: PROFILE & INSTITUTION FORM */}
          {step === 'PROFILE_FORM' && (
            <View style={styles.stepContainer}>
              {/* INSTITUTIONAL JURISDICTION CASCADING DROPDOWNS */}
              <View style={styles.cardBoxWrapper}>
                <Text style={styles.cardBoxHeaderTitle}>Institutional Assignment</Text>

                {/* District Selector */}
                <Text style={styles.inputFieldLabel}>District</Text>
                <TouchableOpacity style={styles.selectorDropdownButton} onPress={() => setActiveModal('DISTRICT')}>
                  <Text style={styles.selectorDropdownButtonText}>
                    {selectedDistrict ? selectedDistrict.name : 'Select District'}
                  </Text>
                  <Text style={styles.dropdownChevronText}>▼</Text>
                </TouchableOpacity>

                {/* Sector Selector */}
                <Text style={styles.inputFieldLabel}>Sector</Text>
                <TouchableOpacity
                  style={[styles.selectorDropdownButton, !selectedDistrict && styles.disabledSelector]}
                  onPress={() => selectedDistrict && setActiveModal('SECTOR')}
                  disabled={!selectedDistrict}
                >
                  <Text style={styles.selectorDropdownButtonText}>
                    {!selectedDistrict
                      ? 'Select District First'
                      : selectedSector
                      ? selectedSector.name
                      : 'Select Sector'}
                  </Text>
                  <Text style={styles.dropdownChevronText}>▼</Text>
                </TouchableOpacity>

                {/* Institute Selector */}
                <Text style={styles.inputFieldLabel}>Institute</Text>
                <TouchableOpacity
                  style={[styles.selectorDropdownButton, !selectedSector && styles.disabledSelector]}
                  onPress={() => selectedSector && setActiveModal('INSTITUTE')}
                  disabled={!selectedSector}
                >
                  <Text style={styles.selectorDropdownButtonText}>
                    {!selectedSector
                      ? 'Select Sector First'
                      : selectedInstitute
                      ? selectedInstitute.name
                      : 'Select Institute'}
                  </Text>
                  <Text style={styles.dropdownChevronText}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* PERSONAL DETAILS */}
              <Text style={styles.sectionTitleText}>Personal Details</Text>

              <Text style={styles.inputFieldLabel}>Full Name</Text>
              <TextInput style={styles.textInput} placeholder="John Doe" placeholderTextColor="#6A6F73" value={name} onChangeText={setName} />

              <Text style={styles.inputFieldLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="john@example.com"
                placeholderTextColor="#6A6F73"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <View style={styles.rowTwoInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputFieldLabel}>Date of Birth</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#6A6F73"
                    value={dob}
                    onChangeText={setDob}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputFieldLabel}>Gender</Text>
                  <TouchableOpacity style={styles.selectorDropdownButton} onPress={() => setActiveModal('GENDER')}>
                    <Text style={styles.selectorDropdownButtonText}>{gender}</Text>
                    <Text style={styles.dropdownChevronText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rowTwoInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputFieldLabel}>Experience (Yrs)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 5"
                    placeholderTextColor="#6A6F73"
                    keyboardType="numeric"
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputFieldLabel}>Qualification</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. M.Sc / B.Ed"
                    placeholderTextColor="#6A6F73"
                    value={qualification}
                    onChangeText={setQualification}
                  />
                </View>
              </View>

              <Text style={styles.inputFieldLabel}>Residential Address</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Complete address"
                placeholderTextColor="#6A6F73"
                multiline
                value={address}
                onChangeText={setAddress}
              />

              {/* BANK DETAILS */}
              <View style={[styles.cardBoxWrapper, { marginTop: 16 }]}>
                <Text style={styles.cardBoxHeaderTitle}>Bank Details (For Payouts)</Text>

                <Text style={styles.inputFieldLabel}>Account Holder Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="John Doe"
                  placeholderTextColor="#6A6F73"
                  value={bankAccountHolder}
                  onChangeText={setBankAccountHolder}
                />

                <Text style={styles.inputFieldLabel}>Account Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="1234567890"
                  placeholderTextColor="#6A6F73"
                  keyboardType="numeric"
                  value={bankAccountNumber}
                  onChangeText={setBankAccountNumber}
                />

                <View style={styles.rowTwoInputs}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.inputFieldLabel}>IFSC Code</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="SBIN0001234"
                      placeholderTextColor="#6A6F73"
                      autoCapitalize="characters"
                      maxLength={11}
                      value={bankIFSC}
                      onChangeText={setBankIFSC}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputFieldLabel}>Bank Name</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="State Bank of India"
                      placeholderTextColor="#6A6F73"
                      value={bankName}
                      onChangeText={setBankName}
                    />
                  </View>
                </View>
              </View>

              {/* SECURITY */}
              <Text style={styles.inputFieldLabel}>Account Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#6A6F73"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={handleProfileSubmit}
                disabled={profileRegisterMutation.isPending}
              >
                {profileRegisterMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryActionButtonText}>Save Profile & Proceed to Documents</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: DOCUMENT UPLOAD */}
          {step === 'DOCUMENTS_UPLOAD' && (
            <View style={styles.stepContainer}>
              <Text style={styles.sectionTitleText}>Verification Documents</Text>
              <Text style={styles.sectionSubtext}>Attach official documents to verify your credentials.</Text>

              <Text style={styles.inputFieldLabel}>Select Document Type</Text>
              <TouchableOpacity style={styles.selectorDropdownButton} onPress={() => setActiveModal('DOC_TYPE')}>
                <Text style={styles.selectorDropdownButtonText}>
                  {DOCUMENT_TYPES.find((d) => d.value === currentDocType)?.label || currentDocType}
                </Text>
                <Text style={styles.dropdownChevronText}>▼</Text>
              </TouchableOpacity>

              {/* FILE PICKER CARD */}
              <TouchableOpacity style={styles.uploadDropZoneCard} onPress={handlePickDocument}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📄</Text>
                <Text style={styles.uploadZoneTitleText}>Tap to pick file from device</Text>
                <Text style={styles.uploadZoneSubtext}>Supports PDF, PNG, JPG (Max 5MB)</Text>
              </TouchableOpacity>

              {/* ATTACHED DOCUMENTS LIST */}
              <Text style={[styles.sectionTitleText, { fontSize: 15, marginTop: 24 }]}>
                Attached Documents ({documents.length})
              </Text>

              {documents.length === 0 ? (
                <View style={styles.emptyDocBox}>
                  <Text style={styles.emptyDocText}>No documents attached yet.</Text>
                </View>
              ) : (
                documents.map((doc) => {
                  const docLabel = DOCUMENT_TYPES.find((d) => d.value === doc.type)?.label || doc.type;
                  return (
                    <View key={doc.type} style={styles.docItemCardRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.docItemTitleText}>{docLabel}</Text>
                        <Text style={styles.docItemFilenameText} numberOfLines={1}>
                          {doc.fileName}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveDocument(doc.type)}>
                        <Text style={styles.removeDocActionText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}

              <TouchableOpacity
                style={[styles.primaryActionButton, { marginTop: 24 }]}
                onPress={handleFinalSubmit}
                disabled={submitDocumentsMutation.isPending || documents.length === 0}
              >
                {submitDocumentsMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryActionButtonText}>Submit Application</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* FOOTER LINK */}
          <View style={styles.footerRedirectRow}>
            <Text style={styles.footerRedirectSubtext}>Already registered?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerRedirectActionText}> Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SELECTOR MODAL DIALOG */}
      <Modal visible={activeModal !== null} transparent animationType="slide">
        <View style={styles.modalBackdropOverlay}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitleText}>Select Option</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              {activeModal === 'DISTRICT' &&
                districtsData?.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.modalOptionRow}
                    onPress={() => {
                      setSelectedDistrict(item);
                      setSelectedSector(null);
                      setSelectedInstitute(null);
                      setActiveModal(null);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}

              {activeModal === 'SECTOR' &&
                sectorsData?.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.modalOptionRow}
                    onPress={() => {
                      setSelectedSector(item);
                      setSelectedInstitute(null);
                      setActiveModal(null);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}

              {activeModal === 'INSTITUTE' &&
                institutesData?.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.modalOptionRow}
                    onPress={() => {
                      setSelectedInstitute(item);
                      setActiveModal(null);
                    }}
                  >
                    <Text style={styles.modalOptionText}>
                      {item.name} {item.code ? `(${item.code})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}

              {activeModal === 'GENDER' &&
                ['MALE', 'FEMALE', 'OTHER'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={styles.modalOptionRow}
                    onPress={() => {
                      setGender(g as any);
                      setActiveModal(null);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{g}</Text>
                  </TouchableOpacity>
                ))}

              {activeModal === 'DOC_TYPE' &&
                DOCUMENT_TYPES.map((dt) => (
                  <TouchableOpacity
                    key={dt.value}
                    style={styles.modalOptionRow}
                    onPress={() => {
                      setCurrentDocType(dt.value);
                      setActiveModal(null);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{dt.label}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  navbarHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 8,
  },
  closeButtonAction: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeActionIconText: { fontSize: 16, color: '#1C1D1F', fontWeight: '300' },
  navbarTitleTextText: { fontSize: 15, fontWeight: '700', color: '#1C1D1F' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  progressSection: { marginBottom: 24 },
  progressLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stepLabelText: { fontSize: 12, fontWeight: '600', color: '#6A6F73' },
  stepLabelTextActive: { color: '#4F46E5', fontWeight: '800' },
  progressBarTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4F46E5' },

  stepContainer: { flex: 1 },
  sectionTitleText: { fontSize: 18, fontWeight: '800', color: '#1C1D1F', marginBottom: 4 },
  sectionSubtext: { fontSize: 13, color: '#6A6F73', marginBottom: 20, lineHeight: 18 },

  inputFieldLabel: { fontSize: 13, fontWeight: '700', color: '#1C1D1F', marginTop: 12, marginBottom: 6 },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D7DC',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1C1D1F',
    backgroundColor: '#FFFFFF',
  },

  inlineRowInputGroup: { flexDirection: 'row', alignItems: 'center' },
  inlineActionButton: {
    backgroundColor: '#4F46E5',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  inlineActionButtonOutline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#4F46E5' },
  inlineActionButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  inlineActionButtonOutlineText: { color: '#4F46E5' },

  otpInputGroupWrapper: { marginTop: 16 },

  primaryActionButton: {
    backgroundColor: '#4F46E5',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  primaryActionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  cardBoxWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardBoxHeaderTitle: { fontSize: 13, fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: 8 },

  selectorDropdownButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D7DC',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  disabledSelector: { backgroundColor: '#F1F5F9', opacity: 0.6 },
  selectorDropdownButtonText: { fontSize: 14, color: '#1C1D1F' },
  dropdownChevronText: { fontSize: 10, color: '#6A6F73' },

  rowTwoInputs: { flexDirection: 'row', alignItems: 'center' },

  uploadDropZoneCard: {
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    marginTop: 12,
  },
  uploadZoneTitleText: { fontSize: 14, fontWeight: '700', color: '#1C1D1F' },
  uploadZoneSubtext: { fontSize: 11, color: '#6A6F73', marginTop: 4 },

  emptyDocBox: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', marginTop: 8 },
  emptyDocText: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },

  docItemCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  docItemTitleText: { fontSize: 13, fontWeight: '700', color: '#1C1D1F' },
  docItemFilenameText: { fontSize: 11, color: '#6A6F73', marginTop: 2 },
  removeDocActionText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  footerRedirectRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerRedirectSubtext: { fontSize: 14, color: '#1C1D1F' },
  footerRedirectActionText: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },

  modalBackdropOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheetContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalHeaderTitleText: { fontSize: 16, fontWeight: '700', color: '#1C1D1F' },
  modalCloseText: { fontSize: 18, color: '#1C1D1F' },
  modalOptionRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionText: { fontSize: 14, color: '#1C1D1F' },
});