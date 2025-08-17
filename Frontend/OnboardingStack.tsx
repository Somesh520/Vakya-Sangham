import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

import DateOfBirthScreen from './screens/DateOfBirthScreen';
import AboutYouScreen from './screens/AboutYouScreen'; 
import GetStartedScreen from './screens/GetStartedScreen';
import SkillLevelScreen from './screens/SkillLevelScreen';
import EditProfileScreen from './screens/EditProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();

const OnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DateOfBirth" component={DateOfBirthScreen} />
    <Stack.Screen name="AboutYou" component={AboutYouScreen} />
    <Stack.Screen name="GetStarted" component={GetStartedScreen} /> 
    <Stack.Screen name="SkillLevel" component={SkillLevelScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);

export default OnboardingStack;