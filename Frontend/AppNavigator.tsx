// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// ✅ Corrected path to go up one level
import { useAuth } from './AuthContext'; 
// ✅ Corrected path to import from the new types file in the same folder
import { RootStackParamList } from './types'; 

// ✅ Corrected paths to go up one level to find the 'screens' folder
import StudentHomeScreen from './screens/StudentHomeScreen';
import TeacherHomeScreen from './screens/TeacherHomeScreen';
import AdminHomeScreen from './screens/AdminHomeScreen';
import LoginScreen from './screens/LoginScreen'; // Safety fallback
import EditProfileScreen from './screens/EditProfileScreen'; 

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    // Fallback in case user data is somehow lost
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  // This function correctly decides which screen to show first based on user role
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
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      {/* <Stack.Screen name="EditProfile" component={EditProfileScreen} /> */}
    </Stack.Navigator>
  );
};

export default AppNavigator;