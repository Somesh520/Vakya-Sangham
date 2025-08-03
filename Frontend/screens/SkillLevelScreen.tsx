// src/screens/SkillLevelScreen.tsx
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet,
    Alert,
    ScrollView
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App'; // Make sure RootStackParamList is exported from App.tsx
import { useAuth } from '../AuthContext';
import api from '../api';

// Define the prop types for the screen
type SkillLevelScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SkillLevel'>;

type Props = {
  navigation: SkillLevelScreenNavigationProp;
};

const SkillLevelScreen: React.FC<Props> = ({ navigation }) => {
  const { updateUser } = useAuth();
  const [level, setSkillLevel] = useState('');
  const [timeAvailability, setLearningTime] = useState('');
  // Fix: Explicitly type the state to allow boolean or null
  const [hasTakenOnlineCourses, setHasExperience] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // This array matches your backend schema
  const timeOptions = [
    '<15 minutes', 
    '15-30 minutes', 
    '30-60 minutes',
    '>1 hour'
  ];

  const handleContinue = async () => {
    if (!level || !timeAvailability || hasTakenOnlineCourses === null) {
      Alert.alert('Missing Information', 'Please answer all questions to continue.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        level,
        timeAvailability,
        hasTakenOnlineCourses,
      };

      // Save data to the backend
      await api.patch('/user/info/onboarding', payload);

      // Navigate to the EditProfileScreen
      navigation.navigate('EditProfile');

    } catch (err: any) { // Fix: Type err as 'any' to access response properties
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      Alert.alert('Onboarding Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>3/5</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
      <Text style={styles.title}>What's your current skill level?</Text>
      
      {['Beginner', 'Intermediate', 'Advanced'].map((item, index) => (
        <TouchableOpacity 
          key={index}
          style={[styles.option, level === item && styles.optionSelected]}
          onPress={() => setSkillLevel(item)}
        >
          <Text style={styles.optionText}>{item}</Text>
          <View style={[styles.radio, level === item && styles.radioSelected]} />
        </TouchableOpacity>
      ))}
      
      <Text style={styles.sectionTitle}>How much time do you have each week for learning?</Text>
      
      {timeOptions.map((time, index) => (
        <TouchableOpacity 
          key={index}
          style={[styles.option, timeAvailability === time && styles.optionSelected]}
          onPress={() => setLearningTime(time)}
        >
          <Text style={styles.optionText}>{time}</Text>
          <View style={[styles.radio, timeAvailability === time && styles.radioSelected]} />
        </TouchableOpacity>
      ))}
      
      <Text style={styles.sectionTitle}>Have you taken online courses before?</Text>
      
      <View style={styles.row}>
        {[
            { label: 'Yes', value: true }, 
            { label: 'No', value: false }
        ].map((answer, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.toggleOption, 
              hasTakenOnlineCourses === answer.value && styles.toggleSelected
            ]}
            onPress={() => setHasExperience(answer.value)}
          >
            <Text style={[
              styles.toggleText,
              hasTakenOnlineCourses === answer.value && styles.toggleTextSelected
            ]}>
              {answer.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.nextButton, loading && styles.disabledButton]}
        onPress={handleContinue}
        disabled={loading}
      >
        <Text style={styles.nextButtonText}>{loading ? 'Finishing...' : 'Next'}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#000000',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '80%', // Progress for the 4th screen
    backgroundColor: '#000000',
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    color: '#000000',
    paddingHorizontal: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  toggleOption: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  toggleSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  toggleText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
  toggleTextSelected: {
    color: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#D87A33',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 40,
  },
  disabledButton: {
      backgroundColor: '#E0A981',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SkillLevelScreen;