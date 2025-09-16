import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>(); // simple typing; works fine

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  if (!user) {
    return <SafeAreaView style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile card */}
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri:
                user.profileImageURL ||
                `https://ui-avatars.com/api/?name=${(user.fullname || 'Student').replace(
                  ' ',
                  '+'
                )}&background=FFA500&color=FFF&size=128`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.fullname}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* ✅ NEW: Change Password button */}
        <TouchableOpacity
          style={styles.changePwdButton}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Ionicons name="key-outline" size={22} color="#FFFFFF" />
          <Text style={styles.changePwdText}>Change Password</Text>
        </TouchableOpacity>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={'#FFFFFF'} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E8C7',paddingTop:40 },
  scrollContainer: { paddingBottom: 20 },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginTop: 20,
  },
  avatar: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#FFA500',
  },
  userName: { fontSize: 24, fontWeight: 'bold', marginTop: 16, color: '#121212' },
  userEmail: { fontSize: 16, color: 'gray', marginTop: 6 },

 
  changePwdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 1.5,
  },
  changePwdText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
logoutButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
  marginLeft: 10,   // ✅ correct
}
});

export default SettingsScreen;
