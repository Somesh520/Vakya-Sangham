import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from './screens/StudentHomeScreen';
import CoursesScreen from './screens/coursescreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import AiTutorScreen from './screens/aitutor';
import EditProfileScreen from './screens/userscreen/EditProfileScreen'; 
import MyLearningScreen from './screens/userscreen/MylearningScreen';
import SettingsScreen from './screens/userscreen/SettingsScreen';
// ✅ 1. Import the real DoubtClearingScreen
import DoubtClearingScreen from './screens/Doubtclearing'; 

// ❌ 2. Removed the old placeholder component

// Course Stack Param Types
export type CourseStackParamList = {
  CourseList: undefined;
  CourseDetail: { courseId: string; courseTitle?: string };
};

const CourseStack = createNativeStackNavigator<CourseStackParamList>();

const CourseNavigator = () => (
  <CourseStack.Navigator screenOptions={{ headerShown: false }}>
    <CourseStack.Screen name="CourseList" component={CoursesScreen} />
    <CourseStack.Screen name="CourseDetail" component={CourseDetailScreen} />
  </CourseStack.Navigator>
);

// Profile Stack (to include EditProfile inside Profile flow)
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
   MyLearning: undefined; 
  Settings: undefined; // Add Settings screen to the stack
};

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
     <ProfileStack.Screen name="MyLearning" component={MyLearningScreen} />
     <ProfileStack.Screen name="Settings" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

// Tab Param Types
export type AppTabParamList = {
  Home: undefined;
  Courses: undefined;
  DoubtClearing: undefined;
  AiTutor: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FFA500',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#000000ff',
          borderTopWidth: 0,
          paddingBottom: 5,
          paddingTop: 5,
          height: 90,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Courses':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'DoubtClearing':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'AiTutor':
              iconName = focused ? 'sparkles' : 'sparkles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Courses" component={CourseNavigator} />
      <Tab.Screen
        name="DoubtClearing"
        // ✅ 3. The tab now uses your functional component
        component={DoubtClearingScreen}
        options={{ tabBarLabel: 'Doubts' }}
      />
      <Tab.Screen
        name="AiTutor"
        component={AiTutorScreen}
        options={{ tabBarLabel: 'AI Tutor' }}
      />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
