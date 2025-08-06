// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from './AuthContext'; 
import { RootStackParamList } from './types'; 

// Screens and Navigators
// ✅ पाथ को ठीक किया गया (../screens/)
import StudentHomeScreen from './screens/StudentHomeScreen';
import TeacherHomeScreen from './screens/TeacherHomeScreen';
import AdminNavigator from './AdminNavigator'; 
import LoginScreen from './screens/LoginScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  const getInitialRouteName = (): keyof RootStackParamList => {
    switch (user.role) {
      case 'student':
        return 'StudentHome';
      case 'teacher':
        return 'TeacherHome';
      case 'admin':
        return 'AdminHome'; 
      default:
        return 'StudentHome'; 
    }
  };

  return (
    <Stack.Navigator 
      initialRouteName={getInitialRouteName()} 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <Stack.Screen name="AdminHome" component={AdminNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;