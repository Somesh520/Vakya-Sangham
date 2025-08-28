import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import { RootStackParamList } from './types';
import ForgotPasswordScreen from './screens/forget';
const Stack = createStackNavigator<RootStackParamList>();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

export default AuthStack;