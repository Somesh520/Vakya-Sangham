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

// Placeholder Screen
const DoubtClearingScreen = () => (
  <View style={styles.center}>
    <Text>Doubt Clearing Screen</Text>
  </View>
);

// Course Stack Param Types
export type CourseStackParamList = {
  CourseList: undefined;
  CourseDetail: { courseId: string; courseTitle?: string };
};

const CourseStack = createNativeStackNavigator<CourseStackParamList>();

const CourseNavigator = () => {
  return (
    <CourseStack.Navigator screenOptions={{ headerShown: false }}>
      <CourseStack.Screen name="CourseList" component={CoursesScreen} />
      <CourseStack.Screen name="CourseDetail" component={CourseDetailScreen} />
    </CourseStack.Navigator>
  );
};

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
          let iconName = '';

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

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Courses" component={CourseNavigator} />
      <Tab.Screen
        name="DoubtClearing"
        component={DoubtClearingScreen}
        options={{ tabBarLabel: 'Doubts' }}
      />
      <Tab.Screen
        name="AiTutor"
        component={AiTutorScreen}
        options={{ tabBarLabel: 'AI Tutor' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
