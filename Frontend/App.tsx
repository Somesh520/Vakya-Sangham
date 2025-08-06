// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// ✅ Import the new providers
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// ✅ सुनिश्चित करें कि सभी पाथ सही हैं
import { AuthProvider, useAuth } from './AuthContext';
import AdminTabNavigator from './AdminNavigator';
import AppNavigator from './AppNavigator';

// स्क्रीन इम्पोर्ट्स...
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

// AuthStack और OnboardingStack में कोई बदलाव नहीं...
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
  </Stack.Navigator>
);

const OnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DateOfBirth" component={DateOfBirthScreen} />
    <Stack.Screen name="AboutYou" component={AboutYouScreen} />
    <Stack.Screen name="GetStarted" component={GetStartedScreen} /> 
    <Stack.Screen name="SkillLevel" component={SkillLevelScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);

// ✅ यह कंपोनेंट अब सिर्फ नेविगेटर चुनेगा, NavigationContainer को रेंडर नहीं करेगा
const RootNavigator = () => {
  const { userToken, user, isLoading } = useAuth(); // ✅ isLoading को भी context से लें

  // जब तक context डेटा लोड कर रहा है, लोडिंग स्क्रीन दिखाएं
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  if (!userToken || !user) {
    return <AuthStack />;
  }

  if (!user.isOnboarded) {
    return <OnboardingStack />;
  }

  return user.role === 'admin' ? <AdminTabNavigator /> : <AppNavigator />;
};

const App = () => {
  return (
    // ✅ सही क्रम: Providers सबसे बाहर
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          {/* ✅ NavigationContainer AuthProvider के अंदर */}
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default App;