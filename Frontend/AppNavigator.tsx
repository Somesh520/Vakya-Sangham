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
import EditProfileScreen from './screens/userscreen/EditProfileScreen'; 
import MyLearningScreen from './screens/userscreen/MylearningScreen';
import SettingsScreen from './screens/userscreen/SettingsScreen';
import DoubtClearingScreen from './screens/Doubtclearing'; 
import CoursePlayerScreen from './screens/CoursePlayerScreen'; 

// --- Course Stack ---
export type CourseStackParamList = {
    CourseList: undefined;
    CourseDetail: { courseId: string; courseTitle?: string };
};
const CourseStack = createNativeStackNavigator<CourseStackParamList>();
const CourseNavigator = () => (
    <CourseStack.Navigator
        screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#000',
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
        <CourseStack.Screen 
            name="CourseList" 
            component={CoursesScreen} 
            options={{ title: 'All Courses' }} 
        />
        <CourseStack.Screen 
            name="CourseDetail" 
            component={CourseDetailScreen}
            options={({ route }) => ({ title: route.params?.courseTitle || 'Course Details' })}
        />
    </CourseStack.Navigator>
);

// --- Profile Stack ---
export type ProfileStackParamList = {
    ProfileMain: undefined;
    EditProfile: undefined;
    MyLearning: undefined; 
    Settings: undefined;
};
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const ProfileNavigator = () => (
    <ProfileStack.Navigator 
        screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#000',
        }}
    >
        <ProfileStack.Screen 
            name="ProfileMain" 
            component={ProfileScreen} 
            options={{ title: 'My Profile' }}
        />
        <ProfileStack.Screen 
            name="EditProfile" 
            component={EditProfileScreen} 
            options={{ title: 'Edit Profile' }}
        />
        <ProfileStack.Screen 
            name="MyLearning" 
            component={MyLearningScreen} 
            options={{ title: 'My Learning' }}
        />
        <ProfileStack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ title: 'Settings' }}
        />
    </ProfileStack.Navigator>
);

// --- Tab Navigator ---
export type AppTabParamList = {
    Home: undefined;
    Courses: undefined;
    DoubtClearing: undefined;
    AiTutor: undefined;
    Profile: undefined;
};
const Tab = createBottomTabNavigator<AppTabParamList>();
const AppTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false, 
                tabBarActiveTintColor: '#FFA500',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { backgroundColor: '#000000ff', borderTopWidth: 0, height: 90, paddingBottom: 5, paddingTop: 5 },
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
            <Tab.Screen name="Courses" component={CourseNavigator} />
            <Tab.Screen name="DoubtClearing" component={DoubtClearingScreen} options={{ tabBarLabel: 'Doubts' }} />
            <Tab.Screen name="AiTutor" component={AiTutorScreen} options={{ tabBarLabel: 'AI Tutor' }} />
            <Tab.Screen name="Profile" component={ProfileNavigator} />
        </Tab.Navigator>
    );
};

// --- Main App Stack ---

// ✅ FIX: Define the parameters for the Main Stack
export type MainStackParamList = {
    MainTabs: undefined; // The tabs screen takes no parameters
    CoursePlayer: { courseId: string }; // The player screen expects a courseId
};

// ✅ FIX: Use the new ParamList when creating the stack
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AppNavigator = () => {
    return (
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
};

export default AppNavigator;
