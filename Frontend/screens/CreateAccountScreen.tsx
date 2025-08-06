// src/screens/CreateAccountScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import api from '../api';
import { View as MotiView } from 'moti'; // For animations

// --- Import components from React Native Paper ---
import {
  TextInput,
  Button,
  Text,
  HelperText,
} from 'react-native-paper';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'CreateAccount'>;
};

const CreateAccountScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Your validation and signup logic remains unchanged ---
  const validateForm = () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('All fields are required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      await api.post('/user/auth/signup', {
        fullname: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password,
      });
      Alert.alert(
        'Account Created',
        'Please check your email for the verification OTP.',
        [{ text: 'OK', onPress: () => navigation.navigate('OTPVerification', { email: email.trim().toLowerCase() }) }]
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An unknown error occurred.';
      setError(errorMessage);
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <Text variant="headlineLarge" style={styles.title}>Create Your Account</Text>
      </MotiView>
      
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 100 }}
      >
        <TextInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="account-outline" />}
        />
        <TextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="email-outline" />}
        />
        <TextInput
          label="10-Digit Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="phone-outline" />}
        />
        <TextInput
          label="Password (min. 8 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="lock-outline" />}
        />

        <HelperText type="error" visible={!!error} style={styles.errorText}>
          {error}
        </HelperText>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 200 }}
      >
        <Button
          mode="contained"
          onPress={handleSignUp}
          disabled={loading}
          loading={loading}
          style={styles.button}
          labelStyle={styles.buttonText}
          // Here we use your specific color for the button
          buttonColor={styles.button.backgroundColor}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
          style={styles.linkButton}
          // Here we use your specific color for the link text
          textColor={styles.linkText.color}
        >
          Already have an account? Login
        </Button>
      </MotiView>
    </ScrollView>
  );
};

// Styles have been adjusted slightly for Paper components
// while keeping your color scheme
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5E8C7', // Your color
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    marginBottom: 12, // Adjusted spacing
  },
  button: {
    paddingVertical: 8,
    marginTop: 10,
    backgroundColor: '#ff0033ff', // Your color
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 15,
  },
  linkText: {
    color: '#A7727D', // Your color
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default CreateAccountScreen;