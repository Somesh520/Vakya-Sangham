import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from './AuthContext';

import AdminDashboardScreen from './screens/AdminDashboardScreen';
import UserManagementNavigator, { UserManagementStackParamList } from './UserManagementNavigator';
import SettingsScreen from './screens/SettingsScreen';
import CourseManagementNavigator, { CourseManagementStackParamList } from './CourseManagementNavigator';

export type AdminTabParamList = {
  Dashboard: undefined;
  Users: NavigatorScreenParams<UserManagementStackParamList>;
  Courses: NavigatorScreenParams<CourseManagementStackParamList>;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminTabNavigator = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FFA500',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Users':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Courses':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Users" component={UserManagementNavigator} />

      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <Tab.Screen name="Courses" component={CourseManagementNavigator} />
      )}

      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;
