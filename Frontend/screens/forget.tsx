// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; // Make sure this path is correct
import api from '../api'; // Make sure this path is correct

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handleSendResetLink = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    // ✅ Step 1: API call se pehle confirmation alert dikhao
    Alert.alert(
      "Confirm Reset", // Alert ka Title
      "Are you sure you want to reset your password?", // Alert ka Message
      [
        // Button #1: Cancel
        {
          text: "Cancel",
          onPress: () => console.log("Password reset cancelled"),
          style: "cancel"
        },
        // Button #2: Yes, Send Link
        { 
          text: "Yes, Send Link", 
          onPress: async () => {
            // ✅ Step 2: User ke 'Yes' bolne par hi API call karo
            setLoading(true);
            try {
              await api.post('/user/auth/forgot-password', { email: email.trim().toLowerCase() });
              
              // ✅ Step 3: API call ke baad success alert dikhao
              Alert.alert(
                'Link Sent!',
                'A password reset link has been sent to your mail.'
              );
              navigation.goBack();
            } catch (error: any) {
              const message = error.response?.data?.message || 'Something went wrong.';
              Alert.alert('Error', message);
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Forgot Password?</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>Enter your email to receive a password reset link.</Text>
      <TextInput
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
      />
      <Button
        mode="contained"
        onPress={handleSendResetLink}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Send Reset Link
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F5F5F5' },
  title: { textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 30, color: '#616161' },
  input: { marginBottom: 20 },
  button: { paddingVertical: 8 },
});

export default ForgotPasswordScreen;