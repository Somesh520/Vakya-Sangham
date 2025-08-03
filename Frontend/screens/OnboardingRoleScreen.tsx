// src/screens/OnboardingRoleScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../AuthContext';
import api from '../api';

const OnboardingRoleScreen: React.FC = () => {
  const { user, updateUser } = useAuth();
  // Example state for a student
  const [grade, setGrade] = useState('');
  const [subjects, setSubjects] = useState('');
  
  // Example state for a teacher
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');

  const [loading, setLoading] = useState(false);

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    
    let onboardingData = {};
    
    // User ke role ke hisab se data taiyar karo
    if (user?.role === 'student') {
      if (!grade || !subjects) {
        Alert.alert('Error', 'Please fill all the details.');
        setLoading(false);
        return;
      }
      onboardingData = { grade, subjects };
    } else if (user?.role === 'teacher') {
      if (!specialization || !experience) {
        Alert.alert('Error', 'Please fill all the details.');
        setLoading(false);
        return;
      }
      onboardingData = { specialization, experience };
    }
    // Admin ke liye bhi logic add kar sakte hain

    try {
      // Backend par onboarding data bhejo
      await api.patch('/user/info/onboarding', onboardingData);

      // Onboarding safal hone par AuthContext me user ko update karo
      updateUser({ isOnboarded: true });
      // Context update hote hi App.tsx user ko automatically sahi home screen par le jayega

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Onboarding failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStudentForm = () => (
    <>
      <Text style={styles.label}>Your Class/Grade</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 12th, B.Tech 2nd Year"
        value={grade}
        onChangeText={setGrade}
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Your Subjects</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Physics, Chemistry, Math"
        value={subjects}
        onChangeText={setSubjects}
        placeholderTextColor="#888"
      />
    </>
  );

  const renderTeacherForm = () => (
    <>
      <Text style={styles.label}>Your Specialization</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Computer Science"
        value={specialization}
        onChangeText={setSpecialization}
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Years of Experience</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 5"
        value={experience}
        onChangeText={setExperience}
        keyboardType="number-pad"
        placeholderTextColor="#888"
      />
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>
        Tell us a bit more about yourself to get started.
      </Text>
      
      {user?.role === 'student' && renderStudentForm()}
      {user?.role === 'teacher' && renderTeacherForm()}
      {/* Admin ke liye form yahan render kar sakte hain */}

      <TouchableOpacity style={styles.button} onPress={handleCompleteOnboarding} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Complete Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5E8C7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    height: 50,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#A7727D',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OnboardingRoleScreen;
