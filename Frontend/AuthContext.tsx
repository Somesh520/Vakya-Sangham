// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface User {
  id: string;
  name?: string;
  //  fullName: string; 
 fullname: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  isOnboarded: boolean;
  bio?: string;
  avatar?: string;
  socialLinks?: string;
  preferredLanguage?: string;
}

// ✅ State ke liye ek naya interface banayein
interface AuthState {
  userToken: string | null;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (token: string, userData: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ✅ Sabhi states ko ek object me rakhein
  const [authState, setAuthState] = useState<AuthState>({
    userToken: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userDataJson = await AsyncStorage.getItem('userData');
        if (token && userDataJson) {
          setAuthState({
            userToken: token,
            user: JSON.parse(userDataJson),
            isLoading: false,
          });
        } else {
          setAuthState(s => ({ ...s, isLoading: false }));
        }
      } catch (e) {
        console.error('Failed to load data from storage', e);
        setAuthState(s => ({ ...s, isLoading: false }));
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (token: string, userData: User) => {
    try {
      // ✅ Ek saath state update karein
      setAuthState({ userToken: token, user: userData, isLoading: false });
      
      // Fir background me data save karo
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      console.log('AuthContext: User state updated successfully.');

    } catch (e) {
      console.error('Failed to save auth data', e);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // ✅ State ko reset karein
      setAuthState({ userToken: null, user: null, isLoading: false });
    } catch (e) {
      console.error('Failed to remove auth data', e);
    }
  };
  
  const updateUser = (updatedData: Partial<User>) => {
      setAuthState(currentState => {
          if (!currentState.user) return currentState;
          const newUser = { ...currentState.user, ...updatedData };
          AsyncStorage.setItem('userData', JSON.stringify(newUser));
          return { ...currentState, user: newUser };
      });
  };

  // ✅ isLoading ko authState se lein
  if (authState.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    // ✅ Provider value me authState ko spread karein
    <AuthContext.Provider value={{ ...authState, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    }
});
