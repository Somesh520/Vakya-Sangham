// src/screens/EditProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, Alert, ScrollView, TouchableOpacity,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAuth } from '../AuthContext';
import api from '../api';

// --- Import components from React Native Paper ---
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  ProgressBar,
  IconButton,
  Icon,
  ActivityIndicator,
} from 'react-native-paper';

import { View as MotiView } from 'moti';

interface ImageAsset {
  uri: string;
  type: string;
  fileName: string;
}
type EditProfileScreenRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;
type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'EditProfile'>;
  route: EditProfileScreenRouteProp;
};

const EditProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user, updateUser } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState<ImageAsset | null>(null);
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [resume, setResume] = useState<ImageAsset | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // --- All your logic for fetching and saving data remains the same ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      try { 
        const response = await api.get('user/info/onboarding');
        const userData = response.data.data;
        setFullName(userData.name || 'Vakya Sangham');
        setBio(userData.bio || '');
        setSocialLinks(userData.socialLinks || '');
        setPreferredLanguage(userData.preferredLanguage || '');
        setAvatar(userData.avatar || '');
      } catch (error) {
        Alert.alert('Error', 'Could not fetch profile data.');
      } finally {
        setPageLoading(false);
      }
    };
    fetchUserProfile();
    if (route.params?.preferredLanguage) {
      setPreferredLanguage(route.params.preferredLanguage);
    }
  }, [route.params]);

  const avatars: string[] = [
    'https://placehold.co/100x100/FEF3E8/333?text=A1',
    'https://placehold.co/100x100/FEF3E8/333?text=A2',
    'https://placehold.co/100x100/FEF3E8/333?text=A3',
    'https://placehold.co/100x100/FEF3E8/333?text=A4',
    'https://placehold.co/100x100/FEF3E8/333?text=A5',
    'https://placehold.co/100x100/FEF3E8/333?text=A6',
  ];

  const handleSelectProfilePicture = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.uri && asset.type && asset.fileName) {
        setProfileImage({ uri: asset.uri, type: asset.type, fileName: asset.fileName });
        setAvatar(''); // Clear selected avatar if a profile picture is uploaded
      }
    }
  };

  const handleSelectResume = async () => {
    try {
      const result = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.pdf] });
      setResume({ uri: result.uri, type: result.type ?? 'application/pdf', fileName: result.name ?? `resume_${Date.now()}.pdf` });
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'An unknown error occurred while picking document');
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('socialLinks', socialLinks);
    formData.append('preferredLanguage', preferredLanguage);
    formData.append('avatar', avatar);
    if (profileImage) {
      formData.append('profileImage', { uri: profileImage.uri, type: profileImage.type, name: profileImage.fileName } as any);
    }
    if (resume) {
      formData.append('resume', { uri: resume.uri, type: resume.type, name: resume.fileName } as any);
    }
    try {
      await api.patch('/user/info/onboarding', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Success', 'Your profile has been saved!', [{ text: 'OK', onPress: () => updateUser({ isOnboarded: true }) }]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred while saving.';
      Alert.alert('Save Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F4A261" />
        <Text style={{marginTop: 10}}>Loading Profile...</Text>
      </View>
    );
  }

  const getProfileImageUri = () => {
      if (profileImage) return profileImage.uri;
      if (avatar) return avatar;
      return 'https://placehold.co/100x100/E0E0E0/333?text=VS'; // Default placeholder
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Text style={styles.headerTitle}>Edit profile</Text>
      </MotiView>

      <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 100 }}>
        <View style={styles.profileSection}>
          <View>
            <Avatar.Image size={100} source={{ uri: getProfileImageUri() }} />
            <IconButton
              icon="camera-plus-outline"
              style={styles.cameraIcon}
              size={24}
              onPress={handleSelectProfilePicture}
              mode="contained"
            />
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>5/5 - Profile Completed!</Text>
          <ProgressBar progress={1.0} color="#F4A261" style={styles.progressBar} />
        </View>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput label="Bio" value={bio} onChangeText={setBio} mode="outlined" multiline numberOfLines={4} style={styles.input} left={<TextInput.Icon icon="account-details-outline" />} />
            <TextInput label="Social Link (e.g., LinkedIn)" value={socialLinks} onChangeText={setSocialLinks} mode="outlined" style={styles.input} left={<TextInput.Icon icon="link-variant" />} />
             <TextInput label="Preferred Language" value={preferredLanguage} onChangeText={setPreferredLanguage} mode="outlined" style={styles.input} left={<TextInput.Icon icon="translate" />} />
          </Card.Content>
        </Card>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }}>
        <Card style={styles.card}>
          <Card.Content>
             <Button icon="file-pdf-box" mode="outlined" onPress={handleSelectResume} style={styles.uploadButton}>
                {resume ? resume.fileName : 'Upload Resume (.pdf)'}
             </Button>
          </Card.Content>
        </Card>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 }}>
        <Card style={styles.card}>
            <Card.Title title="Choose an Avatar" subtitle="Or upload a profile picture" />
            <Card.Content>
                <View style={styles.avatarGrid}>
                    {avatars.map((uri) => (
                    <TouchableOpacity key={uri} onPress={() => {setAvatar(uri); setProfileImage(null);}}>
                        <Avatar.Image size={70} source={{ uri }} style={styles.avatar} />
                        {avatar === uri && (
                            <View style={styles.avatarSelectedOverlay}>
                                <Icon source="check-decagram" size={30} color="#FFFFFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                    ))}
                </View>
            </Card.Content>
        </Card>
      </MotiView>
      
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 500 }}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          labelStyle={styles.saveButtonText}
          buttonColor={styles.saveButton.backgroundColor}
        >
          {loading ? 'Saving...' : 'Save and Complete'}
        </Button>
      </MotiView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF6E9' },
  container: { flex: 1, backgroundColor: '#FDF6E9' },
  contentContainer: { padding: 10, paddingBottom: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#333' },
  profileSection: { alignItems: 'center', marginBottom: 20 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 10 },
  cameraIcon: { position: 'absolute', bottom: 0, right: -10, backgroundColor: '#F4A261', },
  progressContainer: { paddingHorizontal: 10, marginBottom: 10 },
  progressText: { fontSize: 14, color: '#333', marginBottom: 5, textAlign: 'center' },
  progressBar: { height: 6, borderRadius: 3 },
  card: { marginVertical: 10, marginHorizontal:10, backgroundColor: '#FFFFFF' },
  input: { marginBottom: 15, backgroundColor: '#FFFFFF' },
  uploadButton: { paddingVertical: 8, borderColor: '#F4A261' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  avatar: { backgroundColor: '#E0E0E0' },
  avatarSelectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
  },
  saveButton: { paddingVertical: 8, borderRadius: 25, margin: 20, backgroundColor: '#F4A261' },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default EditProfileScreen;