// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
 

import { AuthProvider, useAuth } from "./AuthContext";

// Navigators
import AdminTabNavigator from "./AdminNavigator";
import AppNavigator from "./AppNavigator"; // Student Navigator
import AuthStack from "./AuthStack";
import OnboardingStack from "./OnboardingStack";
import TeacherNavigator from "./teacher/navigation/TeacherTabNavigator";

// ❌ LoadingScreen ko ab yahan use nahi karenge, isliye import hata sakte hain
// import LoadingScreen from "./screens/loading";

const RootNavigator = () => {
  const { userToken, user, isLoading } = useAuth();

  // Native splash module removed; render directly when ready

  // ✅ Jab tak auth check ho raha hai, hum kuch bhi render nahi karenge (null)
  // Native splash screen is dauraan screen ko cover karke rakhegi.
  if (isLoading) {
    return null;
  }

  // If not logged in → Auth flow
  if (!userToken || !user) {
    return <AuthStack />;
  }

  // If user logged in but onboarding not done → Onboarding flow
  if (!user.isOnboarded) {
    return <OnboardingStack />;
  }

  // Role-based navigation
  if (user.role === "admin") {
    return <AdminTabNavigator />;
  } else if (user.role === "teacher") {
    return <TeacherNavigator />;
  } else {
    return <AppNavigator />; // Default → Student
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

export default App;