
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; // ✅ पाथ सही करें
import api from '../api';
import { useAuth } from '../AuthContext'; // ✅ पाथ सही करें
import { View as MotiView } from 'moti';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';

// ✅ Google Sign-In के लिए इम्पोर्ट्स
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

  // ✅ Google Sign-In को कॉन्फ़िगर करें
  useEffect(() => {
    GoogleSignin.configure({
      // ❗ बहुत ज़रूरी: यहाँ अपनी Web Client ID डालें जो आपने Google Cloud Console से बनाई थी
      webClientId: '276801846363-8sm834529hakg3b769j1oteacg7akdpk.apps.googleusercontent.com', 
      offlineAccess: true,
    });
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/user/auth/login', { // ✅ API पाथ सही किया गया
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

  // ✅ Google साइन-इन को हैंडल करने का फंक्शन
// LoginScreen.tsx में


const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
     const userInfo: any = await GoogleSignin.signIn();
      const idToken = userInfo.idToken;
console.log("hello");
      if (idToken) {
        const response = await api.post('/user/auth/google', { idToken });
        if (response.data.success) {
          const { token, user } = response.data;
          await signIn(token, user);
        } else {
          throw new Error(response.data.message);
        }
      } else {
        throw new Error('Could not get idToken from Google.');
      }
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Google Sign-In Failed', 'Please check your configuration and try again.');
        console.error(error);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

// अब अपने Google बटन के onPress को इस नए फंक्शन पर पॉइंट करें:
// <Button onPress={handleGoogleSignIn_TEST} ... />

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
          labelStyle={styles.googleButtonText}
        >
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