import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TeacherDashboardScreen from '../screen/TeacherHomeScreen';
import CourseEditScreen from '../screen/CourseEditScreen';
import CourseManageScreen from '../screen/CourseManageScreen';
import { Course } from '../types/types'; // Corrected path assuming types is in src/types

// --- FIX: Added the 'export' keyword ---
export type TeacherStackParamList = {
    TeacherDashboard: undefined;
    CourseEdit: { course?: Course }; // Pass course for editing
    CourseManage: { courseId: string };
};

const Stack = createStackNavigator<TeacherStackParamList>();

const TeacherNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFA500' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen 
                name="TeacherDashboard" 
                component={TeacherDashboardScreen} 
                options={{ title: 'Teacher Panel' }} 
            />
            <Stack.Screen 
                name="CourseEdit" 
                component={CourseEditScreen} 
                options={({ route }) => ({ 
                    title: route.params?.course ? 'Edit Course' : 'Create Course' 
                })} 
            />
            <Stack.Screen 
                name="CourseManage" 
                component={CourseManageScreen} 
                options={{ title: 'Manage Course' }} 
            />
        </Stack.Navigator>
    );
};

export default TeacherNavigator;