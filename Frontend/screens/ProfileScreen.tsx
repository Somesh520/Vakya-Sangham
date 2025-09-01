import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

// Local imports
import { useAuth } from '../AuthContext';
import api from '../api';
import { AppTabParamList, ProfileStackParamList } from '../AppNavigator';

// --- Type Definitions ---

interface ProfileType {
  fullname: string;
  email: string;
  profileImageURL?: string;
  profileProgress?: { percentage: number };
}

interface MenuItem {
  title: string;
  icon: string;
  screen: keyof ProfileStackParamList;
}

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Profile'>,
  NativeStackNavigationProp<ProfileStackParamList>
>;


// --- Component ---

const ProfileScreen = () => {
<<<<<<< HEAD
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  const { user, signOut } = useAuth(); 
 console.log("Current User Object:", JSON.stringify(user, null, 2));
=======
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, signOut } = useAuth();
>>>>>>> origin/master
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get(`/user/info/profile?ts=${Date.now()}`);
      if (response.data?.success && response.data.data) {
        setProfile(response.data.data);
      } else {
        console.warn('Profile data empty or request failed:', response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching profile:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Error fetching profile:', error.message);
      } else {
        console.error('Unknown error fetching profile:', error);
      }
      Alert.alert('Error', 'Could not load your profile. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: signOut, style: 'destructive' },
    ]);
  };

  const isEmailPasswordUser = user?.providerId === 'password';

  const menuItems: MenuItem[] = [
    { title: 'Edit Profile', icon: 'person-circle-outline', screen: 'EditProfile' },
    { title: 'My Learning', icon: 'book-outline', screen: 'MyLearning' },
    ...(isEmailPasswordUser ? [{ title: 'Settings', icon: 'settings-outline', screen: 'Settings' as const }] : []),
    { title: 'Delete Account', icon: 'trash-outline', screen: 'DeleteAccount' },
  ];

  if (loading && !refreshing) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FFA500" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFA500']} />}
      >
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: profile?.profileImageURL ||
                   'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{profile?.fullname || 'Guest User'}</Text>
          <Text style={styles.userEmail}>{profile?.email || 'No email'}</Text>
        </View>

        {profile?.profileProgress && profile.profileProgress.percentage < 100 && (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Profile Completion</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${profile.profileProgress.percentage}%` }]} />
            </View>
            <Text style={styles.progressText}>{profile.profileProgress.percentage}% Complete</Text>
          </View> // ✅ CORRECTED: This now correctly closes the progressCard View.
        )}

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.menuItem}
<<<<<<< HEAD
              onPress={() => navigation.navigate(item.screen as any)}
            >
              <Ionicons name={item.icon} size={24} color="#4A4135" />
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Ionicons name="chevron-forward-outline" size={22} color="#A19A8F" />
=======
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons name={item.icon} size={24} color={item.screen === 'DeleteAccount' ? '#FF4B4B' : '#555'} />
              <Text style={[styles.menuItemText, item.screen === 'DeleteAccount' && { color: '#FF4B4B' }]}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward-outline" size={22} color="#ccc" />
>>>>>>> origin/master
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF4B4B" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E8C7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5E8C7' },
  profileHeader: { alignItems: 'center', paddingVertical: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FFA500' },
  userName: { fontSize: 24, fontWeight: 'bold', marginTop: 15, color: '#4A4135' },
  userEmail: { fontSize: 16, color: '#A19A8F', marginTop: 5 },
  progressCard: { backgroundColor: '#FCF0DB', marginHorizontal: 20, borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  progressTitle: { fontSize: 16, fontWeight: '600', color: '#4A4135' },
  progressBarContainer: { height: 8, backgroundColor: '#E8DBC6', borderRadius: 4, marginTop: 15, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#FFA500', borderRadius: 4 },
  progressText: { textAlign: 'right', marginTop: 5, color: '#A19A8F', fontSize: 12 },
  menuContainer: { backgroundColor: '#FCF0DB', marginHorizontal: 20, borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E8DBC6' },
  menuItemText: { flex: 1, marginLeft: 20, fontSize: 16, color: '#4A4135' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginBottom: 40, paddingVertical: 15, backgroundColor: '#FCF0DB', borderRadius: 12 },
  logoutButtonText: { marginLeft: 10, fontSize: 16, color: '#FF4B4B', fontWeight: 'bold' },
});

export default ProfileScreen;
