import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AllCoursesScreen from './screens/AllCoursesScreen';
import CreateCourseScreen from './screens/CreateCourseScreen';

export type CourseManagementStackParamList = {
  AllCourses: undefined;
  CreateCourse: undefined;
};

const Stack = createNativeStackNavigator<CourseManagementStackParamList>();

const CourseManagementNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AllCourses"
        component={AllCoursesScreen}
        options={{ title: 'All Courses' }}
      />
      <Stack.Screen
        name="CreateCourse"
        component={CreateCourseScreen}
        options={{ title: 'Create Course' }}
      />
    </Stack.Navigator>
  );
};

export default CourseManagementNavigator;
