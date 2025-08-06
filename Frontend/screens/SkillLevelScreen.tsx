// src/screens/SkillLevelScreen.tsx
import React, { useState } from 'react';
import { 
    StyleSheet,
    Alert,
    ScrollView,
    View
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; // Adjust path
import { useAuth } from '../AuthContext';
import api from '../api';

// --- Import components from React Native Paper ---
import {
    Text,
    ProgressBar,
    RadioButton,
    Button,
    SegmentedButtons
} from 'react-native-paper';

import { View as MotiView } from 'moti';

type SkillLevelScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SkillLevel'>;

type Props = {
  navigation: SkillLevelScreenNavigationProp;
};

const SkillLevelScreen: React.FC<Props> = ({ navigation }) => {
  const { updateUser } = useAuth();
  const [level, setSkillLevel] = useState('');
  const [timeAvailability, setLearningTime] = useState('');
  // Changed state to handle string for SegmentedButtons
  const [hasTakenOnlineCourses, setHasExperience] = useState(''); 
  const [loading, setLoading] = useState(false);

  const timeOptions = [
    '<15 minutes', 
    '15-30 minutes', 
    '30-60 minutes',
    '>1 hour'
  ];

  const handleContinue = async () => {
    if (!level || !timeAvailability || !hasTakenOnlineCourses) {
      Alert.alert('Missing Information', 'Please answer all questions to continue.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        level,
        timeAvailability,
        // Convert the string value back to a boolean for the backend
        hasTakenOnlineCourses: hasTakenOnlineCourses === 'yes', 
      };

      await api.patch('/user/info/onboarding', payload);
      navigation.navigate('EditProfile');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      Alert.alert('Onboarding Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.header}>
                <Text style={styles.progressText}>4/5</Text>
                <ProgressBar progress={0.8} color={styles.progressFill.backgroundColor} style={styles.progressBar} />
            </View>
        </MotiView>
      
      <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 100 }}>
        <Text style={styles.sectionTitle}>What's your current skill level?</Text>
        <RadioButton.Group onValueChange={newValue => setSkillLevel(newValue)} value={level}>
          {['Beginner', 'Intermediate', 'Advanced'].map((item) => (
            <RadioButton.Item 
              key={item}
              label={item}
              value={item}
              labelStyle={styles.optionText}
              color={styles.radioSelected.backgroundColor}
              style={level === item ? styles.optionSelected : styles.option}
            />
          ))}
        </RadioButton.Group>
      </MotiView>

      <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 200 }}>
        <Text style={styles.sectionTitle}>How much time do you have each week for learning?</Text>
        <RadioButton.Group onValueChange={newValue => setLearningTime(newValue)} value={timeAvailability}>
          {timeOptions.map((time) => (
            <RadioButton.Item 
              key={time}
              label={time}
              value={time}
              labelStyle={styles.optionText}
              color={styles.radioSelected.backgroundColor}
              style={timeAvailability === time ? styles.optionSelected : styles.option}
            />
          ))}
        </RadioButton.Group>
      </MotiView>

      <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 300 }}>
        <Text style={styles.sectionTitle}>Have you taken online courses before?</Text>
        {/* --- Creative Upgrade: SegmentedButtons for Yes/No --- */}
        <SegmentedButtons
            value={hasTakenOnlineCourses}
            onValueChange={setHasExperience}
            style={styles.segmentedButtonContainer}
            buttons={[
                { value: 'yes', label: 'Yes', style: styles.segmentButton },
                { value: 'no', label: 'No', style: styles.segmentButton },
            ]}
        />
      </MotiView>
      
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 }}>
        <Button
            mode="contained"
            onPress={handleContinue}
            loading={loading}
            disabled={loading}
            style={styles.nextButton}
            labelStyle={styles.nextButtonText}
            buttonColor={styles.nextButton.backgroundColor}
        >
          {loading ? 'Finishing...' : 'Next'}
        </Button>
      </MotiView>
    </ScrollView>
  );
};

// Styles adjusted for Paper components, using your color scheme
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8C7',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
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
    borderRadius: 5,
  },
  progressFill: {
    backgroundColor: '#000000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#000000',
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  optionSelected: {
    backgroundColor: '#FEF3E8',
    borderColor: '#D87A33',
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
  },
  radioSelected: {
    backgroundColor: '#000000',
  },
  segmentedButtonContainer: {
    marginTop: 10,
  },
  segmentButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
  },
  nextButton: {
    paddingVertical: 8,
    borderRadius: 25,
    marginTop: 40,
    backgroundColor: '#D87A33',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SkillLevelScreen;