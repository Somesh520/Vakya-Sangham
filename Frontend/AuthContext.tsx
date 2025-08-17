import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import api from './api';

// --- FIXED: User interface
export interface User {
  _id: string;
  fullname: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  isOnboarded: boolean;
  profileImageURL?: string;
  token: string; // JWT token for auth
  enrolledCourses: string[]; // array of course IDs
}

interface AuthState {
  userToken: string | null;
  user: User | null;
  isLoading: boolean;
  isDataDirty: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (token: string, userData: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
  setDataDirty: (isDirty: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    userToken: null,
    user: null,
    isLoading: true,
    isDataDirty: true,
  });

  // Load stored user + token
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userDataJson = await AsyncStorage.getItem('userData');

        if (token && userDataJson) {
          const userFromStorage: User = JSON.parse(userDataJson);

          // Ensure token is included in user object
          const userWithToken = { ...userFromStorage, token };
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          setAuthState({
            userToken: token,
            user: userWithToken,
            isLoading: false,
            isDataDirty: true,
          });
        } else {
          setAuthState(s => ({ ...s, isLoading: false }));
        }
      } catch (e) {
        console.error('Auth bootstrap error:', e);
        setAuthState(s => ({ ...s, isLoading: false }));
      }
    };
    bootstrapAsync();
  }, []);

  const signIn = useCallback(async (token: string, userData: User) => {
    const userWithToken = { ...userData, token }; // Include token in user object
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setAuthState({ userToken: token, user: userWithToken, isLoading: false, isDataDirty: true });
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userWithToken));
  }, []);

  const signOut = useCallback(async () => {
    delete api.defaults.headers.common['Authorization'];
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    setAuthState({ userToken: null, user: null, isLoading: false, isDataDirty: true });
  }, []);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    setAuthState(currentState => {
      if (!currentState.user) return currentState;
      const newUser = { ...currentState.user, ...updatedData };
      AsyncStorage.setItem('userData', JSON.stringify(newUser));
      return { ...currentState, user: newUser, isDataDirty: true };
    });
  }, []);

  const setDataDirty = useCallback((isDirty: boolean) => {
    setAuthState(prevState => ({ ...prevState, isDataDirty: isDirty }));
  }, []);

  const contextValue = useMemo(() => ({
    ...authState,
    signIn,
    signOut,
    updateUser,
    setDataDirty,
  }), [authState, signIn, signOut, updateUser, setDataDirty]);

  if (authState.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  }
});
