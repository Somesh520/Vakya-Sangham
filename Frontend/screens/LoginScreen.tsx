// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; // Adjust path if necessary
import api from '../api';
import { useAuth } from '../AuthContext';
import { View as MotiView } from 'moti'; // Import Moti for animations

// --- Import components from React Native Paper ---
import {
  TextInput,
  Button,
  Text,
  HelperText,
  useTheme,
} from 'react-native-paper';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const { colors } = useTheme(); // Access the theme colors

  // --- Your handleLogin function remains unchanged ---
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/user/auth/login', {
        email: email.trim().toLowerCase(),
        password: password,
      });
      const { token, user } = response.data;
      if (token && user) {
        await signIn(token, user);
      } else {
        throw new Error('Login successful, but token or user data was not received.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(errorMessage);
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <MotiView // Animation for the title
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}>
        <Text variant="displaySmall" style={styles.title}>
          Welcome Back!
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Login to your account
        </Text>
      </MotiView>

      {/* --- Using Paper.TextInput for a modern look with icons --- */}
      <MotiView // Animation for the inputs
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 100 }}>
        <TextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          left={<TextInput.Icon icon="email-outline" />}
          error={!!error}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          mode="outlined"
          left={<TextInput.Icon icon="lock-outline" />}
          error={!!error}
        />
        
        <HelperText type="error" visible={!!error} style={styles.errorText}>
          {error}
        </HelperText>
      </MotiView>

      {/* --- Using Paper.Button which has a built-in loading indicator --- */}
      <MotiView // Animation for the buttons
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 200 }}>
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          labelStyle={styles.buttonText}>
          Login
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('CreateAccount')}
          disabled={loading}
          style={styles.linkButton}>
          Don't have an account? Sign Up
        </Button>
      </MotiView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5', // A light, neutral background
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    paddingVertical: 8,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;