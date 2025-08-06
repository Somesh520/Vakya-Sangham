import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import ManageUsersScreen from './screens/ManageUsersScreen';
import UserDetailsScreen from './screens/UserDetailsScreen';
import EditProfileScreen from './screens/EditUserInfo'; // ✅ 1. इसे इम्पोर्ट करें

export type UserManagementStackParamList = {
  ManageUsers: undefined;
  UserDetails: { userId: string };
  EditProfile: { userId: string };
};

const Stack = createStackNavigator<UserManagementStackParamList>();

const UserManagementNavigator = () => {
  return (
    <Stack.Navigator
        screenOptions={{
            headerShown: false,
        }}
    >
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

export default UserManagementNavigator;