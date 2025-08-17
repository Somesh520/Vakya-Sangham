import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import the Stack Navigator you already created
import TeacherNavigator from '../navigation/teachernavigator'; 

// --- Import the real Profile screen ---
import TeacherProfileScreen from '../screen/TeacherProfileScreen';

// --- Placeholder screen for the Analytics tab ---
const AnalyticsScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Analytics Screen</Text>
    </View>
);

// --- Define types for the new Tab Navigator ---
export type TeacherTabParamList = {
    Courses: undefined;
    Analytics: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<TeacherTabParamList>();

const TeacherTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#FFA500',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1 },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string = '';

                    if (route.name === 'Courses') {
                        iconName = focused ? 'library' : 'library-outline';
                    } else if (route.name === 'Analytics') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                    }
                    return <Ionicons name={iconName as any} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen 
                name="Courses" 
                component={TeacherNavigator} 
            />
            <Tab.Screen name="Analytics" component={AnalyticsScreen} />
            {/* --- FIX: Using the real TeacherProfileScreen --- */}
            <Tab.Screen name="Profile" component={TeacherProfileScreen} />
        </Tab.Navigator>
    );
};

export default TeacherTabNavigator;