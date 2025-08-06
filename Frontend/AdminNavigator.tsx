// File: navigation/AdminTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// स्क्रीन और नेविगेटर इम्पोर्ट करें
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import UserManagementNavigator from './UserManagementNavigator';
import SettingsScreen from './screens/SettingsScreen'; // ✅ सुनिश्चित करें कि यह फाइल मौजूद है

// Tab Navigator के लिए टाइप डेफिनिशन
export type AdminTabParamList = {
  Dashboard: undefined;
  Users: undefined; // यह पूरे UserManagementNavigator को दिखाएगा
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FFA500',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'ellipse-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Tab 1: Dashboard */}
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      
      {/* Tab 2: Users (यह पूरा UserManagementNavigator स्टैक लोड करेगा) */}
      <Tab.Screen name="Users" component={UserManagementNavigator} />

      {/* Tab 3: Settings */}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;