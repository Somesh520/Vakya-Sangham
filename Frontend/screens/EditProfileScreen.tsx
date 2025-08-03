import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Image, ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAuth } from '../AuthContext';
import api from '../api';

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
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.uri && asset.type && asset.fileName) {
        setProfileImage({
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
        });
      }
    }
  };

  const handleSelectResume = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });
      
      setResume({
        uri: result.uri,
        type: result.type ?? 'application/pdf',
        fileName: result.name ?? `resume_${Date.now()}.pdf`,
      });

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
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
      formData.append('profileImage', {
        uri: profileImage.uri,
        type: profileImage.type,
        name: profileImage.fileName,
      } as any);
    }

    if (resume) {
      formData.append('resume', {
        uri: resume.uri,
        type: resume.type,
        name: resume.fileName,
      } as any);
    }

    try {
      await api.patch('/user/info/onboarding', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // UPDATED: We will update the user state AFTER the alert is dismissed
      Alert.alert(
        'Success', 
        'Your profile has been saved!',
        [
          { 
            text: 'OK', 
            // This guarantees the screen switches after you press OK
            onPress: () => updateUser({ isOnboarded: true }) 
          }
        ]
      );
      
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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Edit profile</Text>
      
      <View style={styles.profileSection}>
        <Image
          source={
            profileImage
              ? { uri: profileImage.uri }
              : { uri: avatar || 'data:image/jpeg;base64,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' }
          }
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{fullName}</Text>
      </View>

      <View style={styles.progressContainer}>
         <Text style={styles.progressText}>5/5 - Profile Completed Successfully</Text>
         <View style={styles.progressBar} />
      </View>

      <Text style={styles.sectionTitle}>Profile picture</Text>
      <TouchableOpacity style={styles.inputButton} onPress={handleSelectProfilePicture}>
        <Text style={styles.inputButtonText}>
          {profileImage ? profileImage.fileName : 'Add profile picture'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Bio</Text>
      <TextInput
        style={styles.bioInput}
        placeholder="Tell us about yourself..."
        value={bio}
        onChangeText={setBio}
      />

      <Text style={styles.sectionTitle}>Social links</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Add social link"
        value={socialLinks}
        onChangeText={setSocialLinks}
      />

      <Text style={styles.sectionTitle}>Resume</Text>
      <TouchableOpacity style={styles.inputButton} onPress={handleSelectResume}>
        <Text style={styles.inputButtonText}>
          {resume ? resume.fileName : 'Add resume (.pdf)'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Preferred language</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g., English"
        value={preferredLanguage}
        onChangeText={setPreferredLanguage}
      />
      
      <Text style={styles.sectionTitle}>Avatar</Text>
      <View style={styles.avatarGrid}>
        {avatars.map((uri, index) => (
          <TouchableOpacity key={index} onPress={() => setAvatar(uri)}>
            <Image
              source={{ uri }}
              style={[styles.avatar, avatar === uri && styles.avatarSelected]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FDF6E9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#000',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#E0E0E0',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  inputButton: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  inputButtonText: {
    color: '#000',
    fontSize: 14,
  },
  bioInput: {
    backgroundColor: '#FFF',
    height: 100,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlignVertical: 'top',
  },
  textInput: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
    backgroundColor: '#E0E0E0',
  },
  avatarSelected: {
    borderWidth: 3,
    borderColor: '#F4A261',
  },
  saveButton: {
    backgroundColor: '#F4A261',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#E5CBAF',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfileScreen;