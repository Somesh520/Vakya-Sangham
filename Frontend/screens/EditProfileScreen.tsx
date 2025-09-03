import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Text, TextInput, Button, Card, Avatar, ProgressBar, IconButton, ActivityIndicator } from 'react-native-paper';
import { View as MotiView } from 'moti';

interface ImageAsset { uri: string; type: string; fileName: string; }

type Props = { 
  navigation: StackNavigationProp<RootStackParamList, 'EditProfile'>; 
  route: RouteProp<RootStackParamList, 'EditProfile'>; 
};

const EditProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { updateUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState<ImageAsset | null>(null);
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [resume, setResume] = useState<ImageAsset | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState('');
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
        if (userData.avatar) setProfileImage({ uri: userData.avatar, type: 'image/png', fileName: 'avatar.png' });
      } catch {
        Alert.alert('Error', 'Could not fetch profile data.');
      } finally {
        setPageLoading(false);
      }
    };
    fetchUserProfile();
    if (route.params?.preferredLanguage) setPreferredLanguage(route.params.preferredLanguage);
  }, [route.params]);

  const handleSelectProfilePicture = useCallback(async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
    if (!result.didCancel && result.assets?.length) {
      const asset = result.assets[0];
      if (asset.uri && asset.type && asset.fileName) {
        setProfileImage({ uri: asset.uri, type: asset.type, fileName: asset.fileName });
      }
    }
  }, []);

  // ✅ UPDATED: Using the more robust resume selection logic from the dev's file
  const handleSelectResume = useCallback(async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
      });
      
      if (result && result.uri && result.type && result.name) {
        setResume({ uri: result.uri, type: result.type, fileName: result.name });
      } else {
          Alert.alert('Error', 'Could not get file information from the document picker.');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        console.error('Document Picker Error:', err);
        Alert.alert('Error', 'Could not select the file.');
      }
    }
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('socialLinks', socialLinks);
    formData.append('preferredLanguage', preferredLanguage);
    if (profileImage) formData.append('profileImage', { uri: profileImage.uri, type: profileImage.type, name: profileImage.fileName } as any);
    if (resume) formData.append('resume', { uri: resume.uri, type: resume.type, name: resume.fileName } as any);

    try {
      await api.patch('/user/info/onboarding', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Success', 'Profile saved!', [{ text: 'OK', onPress: () => updateUser({ isOnboarded: true }) }]);
    } catch (err: any) {
      Alert.alert('Save Failed', err.response?.data?.message || 'An error occurred while saving.');
    } finally { setLoading(false); }
  }, [bio, socialLinks, preferredLanguage, profileImage, resume, updateUser]);

  if (pageLoading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FFA500" />
      <Text style={styles.loadingText}>Loading Profile...</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Text style={styles.headerTitle}>Edit profile</Text>
      </MotiView>

      <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 100 }}>
        <View style={styles.profileSection}>
          <View style={{ position: 'relative' }}>
             {/* ✅ UPDATED: Avatar placeholder to match theme */}
            <Avatar.Image size={100} source={{ uri: profileImage?.uri || 'https://placehold.co/100x100/E8DBC6/4A4135?text=VS' }} />
            <IconButton icon="camera-plus-outline" style={styles.cameraIcon} iconColor='#FFFFFF' size={24} onPress={handleSelectProfilePicture} />
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>5/5 - Profile Completed!</Text>
           {/* ✅ UPDATED: Progress bar color to match theme */}
          <ProgressBar progress={1} color="#FFA500" style={styles.progressBar} />
        </View>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput label="Bio" value={bio} onChangeText={setBio} mode="outlined" multiline numberOfLines={4} style={styles.input} />
            <TextInput label="Social Link" value={socialLinks} onChangeText={setSocialLinks} mode="outlined" style={styles.input} />
            <TextInput label="Preferred Language" value={preferredLanguage} onChangeText={setPreferredLanguage} mode="outlined" style={styles.input} />
          </Card.Content>
        </Card>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }}>
        <Card style={styles.card}>
          <Card.Content>
            <Button icon="file-pdf-box" mode="outlined" onPress={handleSelectResume} style={styles.uploadButton}>
              {resume?.fileName || 'Upload Resume (.pdf)'}
            </Button>
          </Card.Content>
        </Card>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 }}>
        <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading} style={styles.saveButton} labelStyle={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save and Complete'}
        </Button>
      </MotiView>
    </ScrollView>
  );
};

// ✅ UPDATED: Stylesheet from the dev's file
const styles = StyleSheet.create({
  loadingContainer: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#F5E8C7' },
  loadingText: { marginTop: 10, color: '#4A4135' },
  container: { flex:1, backgroundColor:'#F5E8C7' },
  contentContainer: { padding:10, paddingBottom:40 },
  headerTitle: { fontSize:22, fontWeight:'bold', textAlign:'center', marginVertical:20, color:'#4A4135' },
  profileSection: { alignItems:'center', marginBottom:20 },
  profileName: { fontSize:20, fontWeight:'bold', color:'#4A4135', marginTop:10 },
  cameraIcon: { position:'absolute', bottom:-5, right:-5, backgroundColor:'#FFA500', borderRadius:20 },
  progressContainer: { paddingHorizontal:10, marginBottom:10 },
  progressText: { fontSize:14, color:'#4A4135', marginBottom:5, textAlign:'center' },
  progressBar: { height:8, borderRadius:4, backgroundColor: '#E8DBC6' },
  card: { marginVertical:10, marginHorizontal:10, backgroundColor:'#FCF0DB' },
  input: { marginBottom:15, backgroundColor:'#FFFFFF' },
  uploadButton: { paddingVertical:8, borderColor:'#FFA500' },
  saveButton: { paddingVertical:8, borderRadius:25, margin:20, backgroundColor:'#FFA500' },
  saveButtonText: { color:'#FFFFFF', fontWeight:'bold', fontSize:16 },
});

export default EditProfileScreen;