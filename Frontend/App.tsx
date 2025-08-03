// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// ✅ Import the new providers
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

import { AuthProvider, useAuth } from './AuthContext';
import AppNavigator from './AppNavigator'; 
import CreateAccountScreen from './screens/CreateAccountScreen';
import LoginScreen from './screens/LoginScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import DateOfBirthScreen from './screens/DateOfBirthScreen';
import AboutYouScreen from './screens/AboutYouScreen'; 
import GetStartedScreen from './screens/GetStartedScreen';
import SkillLevelScreen from './screens/SkillLevelScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

// This stack is for users who are not logged in
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
  </Stack.Navigator>
);

// This stack is for users who are logged in but not onboarded
const OnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DateOfBirth" component={DateOfBirthScreen} />
    <Stack.Screen name="AboutYou" component={AboutYouScreen} />
    <Stack.Screen name="GetStarted" component={GetStartedScreen} /> 
    <Stack.Screen name="SkillLevel" component={SkillLevelScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);

// This component decides which stack to show
const RootNavigator = () => {
  const { userToken, user } = useAuth();

  const getActiveStack = () => {
    if (!userToken || !user) {
      return <AuthStack />;
    }
    if (!user.isOnboarded) {
      return <OnboardingStack />;
    }
  
    return <AppNavigator />; 
  };

  return (
    <NavigationContainer>
      {getActiveStack()}
    </NavigationContainer>
  );
};

// ✅ The main App component is now wrapped with the required providers
const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;