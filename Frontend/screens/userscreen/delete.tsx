import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Alert, ActivityIndicator,
  TouchableOpacity, SafeAreaView, TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ProfileStackParamList } from '../../AppNavigator'; 
import api from '../../api';
import { useAuth } from '../../AuthContext';

type DeleteScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'DeleteAccount'
>;

const DeleteAccountScreen = () => {
  const navigation = useNavigation<DeleteScreenNavigationProp>();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const handleDelete = async (currentPassword?: string) => {
    setLoading(true);

    if (user?.providerId === 'password' && !currentPassword) {
      Alert.alert('Error', 'Password is required to delete your account.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.delete('/user/info/me', {
        data: { password: currentPassword },
      }); 
      if (response.data?.success) {
        Alert.alert('Success', 'Your account has been successfully deleted.');
        signOut(); 
      } else {
        throw new Error(response.data?.message || 'An unknown error occurred.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Could not delete your account. Please try again.';
      Alert.alert('Error', errorMessage);
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Are you absolutely sure?',
      'This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          onPress: () => {
            if (user?.providerId === 'password') {
              setShowPasswordInput(true);
            } else {
              handleDelete();
            }
          }, 
          style: 'destructive' 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="warning-outline" size={60} color="#FF4B4B" />
        <Text style={styles.title}>Delete Account</Text>

        {showPasswordInput ? (
          <>
            <Text style={styles.warningText}>
              For your security, please enter your password to confirm deletion.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
            />
          </>
        ) : (
          <>
            <Text style={styles.warningText}>
              This is a critical action. If you delete your account, you will lose all your data permanently.
            </Text>
          </>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#FF4B4B" style={{ marginTop: 30 }} />
        ) : (
          <>
            {showPasswordInput ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleDelete(password)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Confirm & Delete</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={confirmDelete}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Delete My Account</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8C7', // ✅ same background as rest
    paddingTop: 20,              // ✅ padding on top
  },
  content: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, marginTop: 20, color: '#212121' },
  warningText: { textAlign: 'center', color: '#555', marginBottom: 20, fontSize: 16, lineHeight: 24 },
  input: {
    width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 15, marginTop: 20, fontSize: 16, backgroundColor: 'white',
  },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF4B4B', paddingVertical: 15, borderRadius: 12,
    marginTop: 30, width: '100%',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
});

export default DeleteAccountScreen;
