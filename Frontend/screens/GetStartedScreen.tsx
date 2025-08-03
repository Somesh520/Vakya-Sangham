// src/screens/GetStartedScreen.tsx
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet,
    TextInput,
    Alert,
    ScrollView 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App'; // Adjust path if necessary
import api from '../api';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'GetStarted'>;
};

const GetStartedScreen: React.FC<Props> = ({ navigation }) => {
  const [goal, setGoal] = useState('');
  // Changed state to handle a single string, not an array.
  const [contentPreference, setContentPreference] = useState('');
  const [interest, setInterests] = useState('');
  const [loading, setLoading] = useState(false);

  const goals = [
    'Learn a new skill',
    'Advance my career',
    'Start a business',
    'Grow my business'
  ];

  const courseTypes = [
    'Video courses',
    'PDFs',
    'Live mentorship'
  ];

  // --- Functions to handle selections ---
  const handleGoalSelect = (selectedGoal: string) => {
    setGoal(selectedGoal);
  };

  // Updated function to handle a single selection.
  const handleCourseTypeSelect = (type: string) => {
    setContentPreference(type);
  };

  const handleContinue = async () => {
    // Updated check for contentPreference.
    if (!goal || !contentPreference || !interest.trim()) {
      Alert.alert('Missing Information', 'Please fill out all fields to continue.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        goal,
        contentPreference, // This is now a string.
        interest: interest.trim(),
      };

      // Send data to the backend
      await api.patch('/user/info/onboarding', payload);

      // Navigate to the next screen
      navigation.navigate('SkillLevel');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      Alert.alert('Onboarding Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Get Started</Text>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
      
      <Text style={styles.sectionTitle}>What's your primary goal?</Text>
      
      {goals.map((item, index) => (
        <TouchableOpacity 
          key={index}
          style={[styles.option, goal === item && styles.selectedOption]}
          onPress={() => handleGoalSelect(item)}
        >
          <Text style={styles.optionText}>{item}</Text>
          <View style={[styles.radio, goal === item && styles.radioSelected]} />
        </TouchableOpacity>
      ))}
      
      <Text style={styles.sectionTitle}>What type of course do you prefer?</Text>
      
      {courseTypes.map((type, index) => (
        // Changed UI to a radio button style for single selection.
        <TouchableOpacity 
          key={index}
          style={[styles.option, contentPreference === type && styles.selectedOption]}
          onPress={() => handleCourseTypeSelect(type)}
        >
          <Text style={styles.optionText}>{type}</Text>
          <View style={[styles.radio, contentPreference === type && styles.radioSelected]} />
        </TouchableOpacity>
      ))}
      
      <Text style={styles.sectionTitle}>What are your learning interests?</Text>
      
      <TextInput
        style={styles.interestInput}
        placeholder="Enter your interests (e.g., Design, Coding)"
        placeholderTextColor="#999"
        value={interest}
        onChangeText={setInterests}
      />
      
      <TouchableOpacity 
        style={[styles.continueButton, loading && styles.disabledButton]}
        onPress={handleContinue}
        disabled={loading}
      >
        <Text style={styles.continueButtonText}>
            {loading ? 'Saving...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5E8C7',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 40,
        textAlign: 'left',
        marginLeft: 20,
        color: '#000000',
    },
    progressBar: {
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 2.5,
        marginHorizontal: 20,
        marginBottom: 30,
    },
    progressFill: {
        height: '100%',
        width: '60%', // Adjust as needed
        backgroundColor: '#000000',
        borderRadius: 2.5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 20,
        color: '#000000',
        marginLeft: 20,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
    },
    selectedOption: {
        borderColor: '#D87A33',
        backgroundColor: '#FEF3E8',
    },
    optionText: {
        fontSize: 16,
        color: '#000000',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#DDDDDD',
    },
    radioSelected: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#DDDDDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    checkboxInner: {
        width: 12,
        height: 12,
        // Checkmark can be an icon or a simple view
        backgroundColor: '#FFFFFF',
    },
    interestInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
        color: '#000000',
        marginHorizontal: 20,
    },
    continueButton: {
        backgroundColor: '#D87A33',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 30,
        marginHorizontal: 20,
    },
    disabledButton: {
        backgroundColor: '#E0A981',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default GetStartedScreen;
