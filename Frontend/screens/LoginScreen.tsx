// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import api from '../api';
import { useAuth } from '../AuthContext';
import { View as MotiView } from 'moti';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';

// ✅ Only Google Sign-In
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    GoogleSignin.configure({
  webClientId: "701020560421-l1a32m1vvhd1u349egj3od9m1sbmfnb2.apps.googleusercontent.com",
  offlineAccess: true,
});

  }, []);

  // ✅ Normal login (email + password)
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
        throw new Error(
          'Login successful, but token or user data was not received.'
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Invalid credentials. Please try again.';
      setError(errorMessage);
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Sign-In (direct backend verify)
const handleGoogleSignIn = async () => {
  try {
    setGoogleLoading(true);

    // Check Google Play Services
    await GoogleSignin.hasPlayServices();

    // Sign in and get ID token
    const userInfo: any = await GoogleSignin.signIn();
    const idToken = userInfo.idToken;

    if (!idToken) {
      throw new Error("No ID token received from Google");
    }

    // Send token to your backend (note the name: `token`)
    const response = await api.post("/user/auth/google", { token: idToken });

    const { token, user } = response.data;

    // Save token/user in app state
    await signIn(token, user);

    console.log("Google login successful:", user);

  } catch (err: any) {
    console.log("Google Sign-In Error:", err);

    // User cancelled
    if (err.code === statusCodes.SIGN_IN_CANCELLED) return;

    Alert.alert("Google Sign-In Failed", err.message || "Try again");
  } finally {
    setGoogleLoading(false);
  }
};

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <MotiView
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

      <MotiView
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

      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 200 }}>
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading || googleLoading}
          style={styles.button}
          labelStyle={styles.buttonText}>
          Login
        </Button>

        <Button
          mode="outlined"
          onPress={handleGoogleSignIn}
          loading={googleLoading}
          disabled={loading || googleLoading}
          style={styles.googleButton}
          icon="google"
          labelStyle={styles.googleButtonText}>
          Sign in with Google
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('CreateAccount')}
          disabled={loading || googleLoading}
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
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    color: '#616161',
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
  googleButton: {
    marginTop: 15,
    paddingVertical: 8,
    borderColor: '#E0E0E0',
  },
  googleButtonText: {
    fontSize: 16,
    color: '#424242',
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
