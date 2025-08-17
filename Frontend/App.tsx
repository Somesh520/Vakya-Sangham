// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './AuthContext'; 

// Navigators
import AdminTabNavigator from './AdminNavigator';
import AppNavigator from './AppNavigator'; // This is the Student Navigator
import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
// --- FIX: Corrected the filename casing for consistency ---
import TeacherNavigator from './teacher/navigation/TeacherTabNavigator'; 

// This component now checks for the teacher role
const RootNavigator = () => {
    const { userToken, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFA500" />
            </View>
        );
    }

    if (!userToken || !user) {
        return <AuthStack />;
    }

    if (!user.isOnboarded) {
        return <OnboardingStack />;
    }

    // Now we check for each role specifically
    if (user.role === 'admin') {
        return <AdminTabNavigator />;
    } else if (user.role === 'teacher') {
        return <TeacherNavigator />;
    } else {
        return <AppNavigator />; // Default for students
    }
};

const App = () => {
    return (
        <SafeAreaProvider>
            <PaperProvider>
                <AuthProvider>
                    <NavigationContainer>
                        <RootNavigator />
                    </NavigationContainer>
                </AuthProvider>
            </PaperProvider>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    }
});

export default App;