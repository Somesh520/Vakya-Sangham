// src/screens/OTPVerificationScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import api from '../api';
import { useAuth } from '../AuthContext';

type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'OTPVerification'>;
  route: OTPVerificationRouteProp;
};

const OTPVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const { signIn } = useAuth();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1); // only last digit
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('').trim();
    if (enteredOtp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/user/auth/verify-otp', {
        email: email.toLowerCase(),
        otp: enteredOtp,
      });

      const { token, user } = response.data;
      if (token && user) {
        await signIn(token, user, user.providerId ?? 'password');
      } else {
        throw new Error('Token or user data not received from server.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid or expired OTP.';
      setError(errorMessage);
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await api.post('/user/auth/resend-otp', { email: email.toLowerCase() });
      Alert.alert('Success', 'OTP resent successfully.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to resend OTP.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Account</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to <Text style={styles.emailText}>{email}</Text>
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            value={digit || ''} // ensure visible
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace') {
                handleBackspace(index);
              }
            }}
            keyboardType="numeric"
            maxLength={1}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
          />
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOtp} style={styles.linkButton}>
        <Text style={styles.linkText}>Didn't receive the code? Resend</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5E8C7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#A7727D',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    backgroundColor: '#FFF',
    color: '#333', // ✅ text color added
  },
  button: {
    backgroundColor: '#A7727D',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#A7727D',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default OTPVerificationScreen;
