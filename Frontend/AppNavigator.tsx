// AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from './screens/StudentHomeScreen';
import CoursesScreen from './screens/coursescreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import AiTutorScreen from './screens/aitutor';

// ✅ IMPORTANT: point to the userscreen version (alias optional)
import UsersEditProfileScreen from './screens/userscreen/EditProfileScreen';
import MyLearningScreen from './screens/userscreen/MylearningScreen';
import SettingsScreen from './screens/SettingsScreen';
import DeleteAccountScreen from './screens/userscreen/delete';
import ChangePasswordScreen from './screens/userscreen/ChangePasswordScreen';

import CoursePlayerScreen from './screens/CoursePlayerScreen';
import DoubtClearingScreen from './screens/Doubtclearing';

// -------------------------
// Course Stack
// -------------------------
export type CourseStackParamList = {
  CourseList: undefined;
  CourseDetail: { courseId: string; courseTitle?: string };
};
const CourseStack = createNativeStackNavigator<CourseStackParamList>();

const CourseNavigator = () => (
  <CourseStack.Navigator screenOptions={{ headerShown: false }}>
    <CourseStack.Screen name="CourseList" component={CoursesScreen} />
    <CourseStack.Screen
      name="CourseDetail"
      component={CourseDetailScreen}
      options={({ route }) => ({
        headerShown: true,
        title: route.params?.courseTitle || 'Course Details',
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    />
  </CourseStack.Navigator>
);

// -------------------------
// Profile Stack
// -------------------------
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  MyLearning: undefined;
  Settings: undefined;
  DeleteAccount: undefined;
  ChangePassword: undefined;
};
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    {/* ✅ Uses the userscreen EditProfile */}
    <ProfileStack.Screen
      name="EditProfile"
      component={UsersEditProfileScreen}
      options={{ headerShown: false }}
    />
    <ProfileStack.Screen
      name="MyLearning"
      component={MyLearningScreen}
      options={{ headerShown: false }}
    />
    <ProfileStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ headerShown: false }}
    />
    <ProfileStack.Screen
      name="DeleteAccount"
      component={DeleteAccountScreen}
      options={{ headerShown: false }}
    />
    <ProfileStack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ headerShown: false }}
    />
  </ProfileStack.Navigator>
);

// -------------------------
// Tabs
// -------------------------
export type AppTabParamList = {
  Home: undefined;
  Courses: undefined;
  DoubtClearing: undefined;
  AiTutor: undefined;
  Profile: undefined;
};
const Tab = createBottomTabNavigator<AppTabParamList>();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#FFA500',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: '#000000ff',
        borderTopWidth: 0,
        height: 90,
        paddingBottom: 5,
        paddingTop: 5,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string = '';
        switch (route.name) {
          case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
          case 'Courses': iconName = focused ? 'book' : 'book-outline'; break;
          case 'DoubtClearing': iconName = focused ? 'chatbubbles' : 'chatbubbles-outline'; break;
          case 'AiTutor': iconName = focused ? 'sparkles' : 'sparkles-outline'; break;
          case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen
      name="Courses"
      component={CourseNavigator}
      listeners={({ navigation }) => ({
        tabPress: e => {
          e.preventDefault(); // always land on CourseList
          navigation.navigate('Courses' as never);
        },
      })}
    />
    <Tab.Screen name="DoubtClearing" component={DoubtClearingScreen} options={{ tabBarLabel: 'Doubts' }} />
    <Tab.Screen name="AiTutor" component={AiTutorScreen} options={{ tabBarLabel: 'AI Tutor' }} />
    <Tab.Screen name="Profile" component={ProfileNavigator} />
  </Tab.Navigator>
);

// -------------------------
// Main App Stack
// -------------------------
export type MainStackParamList = {
  MainTabs: undefined;
  CoursePlayer: { courseId: string };
};
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AppNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="MainTabs" component={AppTabs} />
    <MainStack.Screen
      name="CoursePlayer"
      component={CoursePlayerScreen}
      options={{
        headerShown: true,
        title: 'Course Content',
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#000',
      }}
    />
  </MainStack.Navigator>
);

export default AppNavigator;
