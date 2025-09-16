import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  TextInput,
} from 'react-native';

// External Libraries
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import { ActivityIndicator, Avatar, ProgressBar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

// Internal
import { useAuth } from '../../AuthContext';
import api from '../../api';

// ---- Theme (matches the rest of your app) ----
const COLORS = {
  pageBg: '#F5E8C7',      // app background
  text: '#121212',        // main text
  subText: '#6B7280',     // gray text
  cardBg: '#FFFFFF',      // cards / inputs
  border: '#E2E8F0',
  primary: '#1E88E5',     // buttons
  accent: '#FFA500',      // progress / highlights
};

// ---- Small Reusable Fields ----
const InputField = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: any;
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={22} color={COLORS.subText} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.subText}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

const PickerField = ({
  label,
  icon,
  selectedValue,
  onValueChange,
  items,
}: {
  label: string;
  icon: string;
  selectedValue: any;
  onValueChange: (value: any) => void;
  items: { label: string; value: string }[];
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={22} color={COLORS.subText} style={styles.inputIcon} />
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        dropdownIconColor={COLORS.primary}
      >
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  </View>
);

// ---- Screen ----
const EditProfileScreen: React.FC<any> = ({ navigation }) => {
  const { user: authUser, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [formData, setFormData] = useState({
    dateOfBirth: null as Date | null,
    education: '',
    state: '',
    district: '',
    goal: '',
    contentPreference: '',
    timeAvailability: '',
    level: '',
    bio: '',
    socialLinks: '',
    preferredLanguage: '',
    interest: '',
    hasTakenOnlineCourses: 'false',
  });

  const [profileImage, setProfileImage] = useState<Asset | null>(null);
  const [resume, setResume] = useState<DocumentPickerResponse | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('0/13');

  // completion progress
  useEffect(() => {
    const fields = Object.values(formData);
    const completedFields = fields.filter((f) =>
      typeof f === 'string' ? f.trim() !== '' : f !== null
    ).length;
    setProgress(completedFields / fields.length);
    setProgressText(`${completedFields}/${fields.length} Completed`);
  }, [formData]);

  // load profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user/info/me');
        const u = res.data?.data;

        if (u) {
          setFormData({
            dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth) : null,
            education: u.education || '',
            state: u.state || '',
            district: u.district || '',
            goal: u.goal || '',
            contentPreference: u.contentPreference || '',
            timeAvailability: u.timeAvailability || '',
            level: u.level || '',
            bio: u.bio || '',
            socialLinks: (u.socialLinks || []).join(', '),
            preferredLanguage: u.preferredLanguage || '',
            interest: u.interest || '',
            hasTakenOnlineCourses: u.hasTakenOnlineCourses ? 'true' : 'false',
          });

          if (u.profileImageURL) {
            setProfileImage({
              uri: u.profileImageURL,
              type: 'image/jpeg',
              fileName: 'profile.jpg',
            } as Asset);
          }
        }
      } catch (err) {
        Alert.alert('Error', 'Could not load your profile data.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('dateOfBirth', selectedDate);
    }
  };

  const handlePickImage = useCallback(async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.assets && result.assets[0]) setProfileImage(result.assets[0]);
  }, []);

  const handlePickResume = useCallback(async () => {
    try {
      const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.pdf] });
      setResume(res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) Alert.alert('Error', 'Failed to pick resume.');
    }
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'dateOfBirth' && value) {
        data.append(key, (value as Date).toISOString());
      } else if (key === 'socialLinks' && typeof value === 'string') {
        value
          .split(',')
          .map((link) => link.trim())
          .filter(Boolean)
          .forEach((link) => data.append('socialLinks[]', link));
      } else if (key === 'hasTakenOnlineCourses') {
        data.append(key, value === 'true');
      } else if (value) {
        data.append(key, value as string);
      }
    });

    if (profileImage && !profileImage.uri?.startsWith('http')) {
      data.append('profileImage', {
        uri: profileImage.uri,
        type: profileImage.type,
        name: profileImage.fileName,
      } as any);
    }
    if (resume) {
      data.append('resume', { uri: resume.uri, type: resume.type, name: resume.name } as any);
    }

    try {
      await api.patch('/user/info/onboarding', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }, [formData, profileImage, resume, navigation, refreshUser]);

  if (isFetching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const profileImageUri =
    profileImage?.uri ||
    `https://ui-avatars.com/api/?name=${(authUser?.fullname || 'User').replace(
      ' ',
      '+'
    )}&background=FFF0DB&color=4A4135&size=128`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header card */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePickImage}>
            <Avatar.Image size={120} source={{ uri: profileImageUri }} />
          </TouchableOpacity>
          <Text style={styles.userName}>{authUser?.fullname}</Text>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{progressText}</Text>
            <ProgressBar progress={progress} color={COLORS.accent} style={styles.progressBar} />
          </View>
        </View>

        {/* Personal info */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={22} color={COLORS.subText} style={styles.inputIcon} />
            <Text style={styles.datePickerText}>
              {formData.dateOfBirth
                ? format(formData.dateOfBirth, 'dd MMMM yyyy')
                : 'Select Date of Birth'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.dateOfBirth || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <InputField
            label="State"
            icon="map-outline"
            placeholder="e.g. Andhra Pradesh"
            value={formData.state}
            onChangeText={(v) => handleInputChange('state', v)}
          />
          <InputField
            label="District"
            icon="location-outline"
            placeholder="e.g. Chittoor"
            value={formData.district}
            onChangeText={(v) => handleInputChange('district', v)}
          />
        </View>

        {/* Education / About */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Professional & Educational</Text>

          <PickerField
            label="Education"
            icon="school-outline"
            selectedValue={formData.education}
            onValueChange={(v) => handleInputChange('education', v)}
            items={[
              { label: 'Select Education', value: '' },
              { label: 'High School', value: 'High school' },
              { label: 'College', value: 'College' },
            ]}
          />

          <InputField
            label="Bio"
            icon="document-text-outline"
            placeholder="Tell us about yourself"
            value={formData.bio}
            onChangeText={(v) => handleInputChange('bio', v)}
            multiline
          />

          <InputField
            label="Social Links (comma separated)"
            icon="link-outline"
            placeholder="your-linkedin, your-github"
            value={formData.socialLinks}
            onChangeText={(v) => handleInputChange('socialLinks', v)}
          />

          <TouchableOpacity style={styles.uploadButton} onPress={handlePickResume}>
            <Ionicons name="document-attach-outline" size={22} color={COLORS.primary} />
            <Text style={styles.uploadButtonText}>
              {resume?.name || 'Upload Resume (PDF)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Learning prefs */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Learning Preferences</Text>

          <PickerField
            label="Your Goal"
            icon="flag-outline"
            selectedValue={formData.goal}
            onValueChange={(v) => handleInputChange('goal', v)}
            items={[
              { label: 'Select Goal', value: '' },
              { label: 'Learn a new skill', value: 'Learn a new skill' },
              { label: 'Advance my career', value: 'Advance my career' },
            ]}
          />

          <PickerField
            label="Learning Level"
            icon="bar-chart-outline"
            selectedValue={formData.level}
            onValueChange={(v) => handleInputChange('level', v)}
            items={[
              { label: 'Select Level', value: '' },
              { label: 'Beginner', value: 'Beginner' },
              { label: 'Intermediate', value: 'Intermediate' },
              { label: 'Advanced', value: 'Advanced' },
            ]}
          />

          <InputField
            label="Interests"
            icon="heart-outline"
            placeholder="e.g. Coding, Marketing"
            value={formData.interest}
            onChangeText={(v) => handleInputChange('interest', v)}
          />

          <PickerField
            label="Taken Online Courses Before?"
            icon="help-circle-outline"
            selectedValue={formData.hasTakenOnlineCourses}
            onValueChange={(v) => handleInputChange('hasTakenOnlineCourses', v)}
            items={[
              { label: 'No', value: 'false' },
              { label: 'Yes', value: 'true' },
            ]}
          />
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
    paddingTop: 50, // padding on top like other screens
  },
  contentContainer: { paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  userName: { fontSize: 24, fontWeight: 'bold', marginTop: 12, color: COLORS.text },
  progressContainer: { width: '100%', marginTop: 16 },
  progressText: { textAlign: 'center', marginBottom: 8, color: COLORS.subText },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: '#E8DBC6' },

  formSection: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: COLORS.text },

  fieldContainer: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: { paddingLeft: 14 },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: 14,
  },
  multilineInput: { height: 110, textAlignVertical: 'top', paddingTop: 14 },
  picker: { flex: 1, height: 50, color: COLORS.text },
  datePickerText: { flex: 1, fontSize: 16, color: COLORS.text, paddingVertical: 14, marginLeft: 10 },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3FE',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
  },
  uploadButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default EditProfileScreen;
