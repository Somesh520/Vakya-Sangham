// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import api from '../api';
import { useAuth } from '../AuthContext';
import { View as MotiView } from 'moti';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Naya state password ko show/hide karne ke liye
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { signIn } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "701020560421-l1a32m1vvhd1u349egj3od9m1sbmfnb2.apps.googleusercontent.com",
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
      const response = await api.post('/user/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user: backendUser } = response.data;
      
      if (token && backendUser) {
        const userForContext = {
            ...backendUser,
            _id: backendUser.id 
        };
        await signIn(token, userForContext, 'password');
        console.log("Regular login successful");
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

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      
      if (!idToken) {
        Alert.alert("Google Sign-In Failed", "No ID token returned.");
        return;
      }

      const response = await api.post('/user/auth/google', { token: idToken });
      const { token: jwtToken, user: backendUser } = response.data;

      if (jwtToken && backendUser) {
        const userForContext = {
            ...backendUser,
            _id: backendUser.id
        };
        await signIn(jwtToken, userForContext, 'google.com');
        console.log("Google login successful");
      } else {
        throw new Error("Backend did not return token/user");
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      Alert.alert("Google Sign-In Error", error.message || "Something went wrong");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500 }}>
        <Text variant="displaySmall" style={styles.title}>Welcome Back!</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Login to your account</Text>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500, delay: 100 }}>
        <TextInput
          label="Email Address"
          value={email}
          onChangeText={(text) => { setEmail(text); setError(null); }}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          left={<TextInput.Icon icon="email-outline" />}
          error={!!error}
        />
        
        {/* ✅ Password field ko update kiya gaya hai */}
        <TextInput
          label="Password"
          value={password}
          onChangeText={(text) => { setPassword(text); setError(null); }}
          style={styles.input}
          secureTextEntry={!isPasswordVisible} // State se control ho raha hai
          mode="outlined"
          left={<TextInput.Icon icon="lock-outline" />}
          // Icon ko show/hide karne ke liye right prop add kiya gaya hai
          right={
            <TextInput.Icon 
              icon={isPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />
          }
          error={!!error}
        />
        
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPasswordButton}
          labelStyle={styles.forgotPasswordLabel}
          disabled={loading || googleLoading}
        >
          Forgot Password?
        </Button>
        
        <HelperText type="error" visible={!!error} style={styles.errorText}>{error}</HelperText>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500, delay: 200 }}>
        <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading || googleLoading} style={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <Text style={styles.divider}>OR</Text>
        <Button mode="outlined" onPress={handleGoogleSignIn} loading={googleLoading} disabled={loading || googleLoading} style={styles.googleButton} icon="google" labelStyle={styles.googleButtonText}>
          {googleLoading ? "Signing in..." : "Sign in with Google"}
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('CreateAccount')} disabled={loading || googleLoading} style={styles.linkButton}>
          Don't have an account? Sign Up
        </Button>
      </MotiView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F5F5F5' },
  title: { fontWeight: 'bold', textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 40, color: '#616161' },
  input: { marginBottom: 12 },
  button: { paddingVertical: 8, marginTop: 10 },
  googleButton: { marginTop: 15, paddingVertical: 8, borderColor: '#E0E0E0' },
  googleButtonText: { fontSize: 16, color: '#424242' },
  divider: { textAlign: 'center', marginVertical: 20, color: '#9E9EE0', fontSize: 14 },
  linkButton: { marginTop: 15 },
  errorText: { fontSize: 14, textAlign: 'center' },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 10,
  },
  forgotPasswordLabel: {
    fontSize: 14,
  },
});

export default LoginScreen;