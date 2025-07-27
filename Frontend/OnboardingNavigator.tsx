import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CreateAccountScreen from './CreateAccountScreen';
import DateOfBirthScreen from './DateOfBirthScreen';
import AboutYouScreen from './AboutYouScreen';
import GetStartedScreen from './GetStartedScreen';
import SkillLevelScreen from './SkillLevelScreen';
import ProfileScreen from './ProfileScreen';
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
    </Stack.Navigator>
  );
};
export default OnboardingNavigator;