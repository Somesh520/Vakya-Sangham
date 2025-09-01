import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CreateAccountScreen from './CreateAccountScreen';
import DateOfBirthScreen from './DateOfBirthScreen';
import AboutYouScreen from './AboutYouScreen';
import GetStartedScreen from './GetStartedScreen';
import SkillLevelScreen from './SkillLevelScreen';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import LanguageSelectionScreen from './LanguageSelectionScreen';
import AIChatScreen from './AIChatScreen';
import NotesScreen from './NotesScreen';

const Stack = createStackNavigator();

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="CreateAccount"
      screenOptions={{
        headerTitle: () => null,
        headerTransparent: true,
        headerLeftContainerStyle: { paddingLeft: 15 },
      }}
    >
      <Stack.Screen 
        name="CreateAccount" 
        component={CreateAccountScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen name="DateOfBirth" component={DateOfBirthScreen} />
      <Stack.Screen name="AboutYou" component={AboutYouScreen} />
      <Stack.Screen name="GetStarted" component={GetStartedScreen} />
      <Stack.Screen name="SkillLevel" component={SkillLevelScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ headerShown: false }} 
      />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} options={{ headerShown: false }}/>
      <Stack.Screen 
        name="AIChat" 
        component={AIChatScreen}
        options={{ headerShown: false }} 
      />
      <Stack.Screen name="Notes" component={NotesScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;