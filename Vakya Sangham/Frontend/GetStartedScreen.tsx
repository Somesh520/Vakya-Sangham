import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'GetStarted'>;
};

const GetStartedScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedGoal, setSelectedGoal] = useState('');
  const [courseType, setCourseType] = useState('');
  const [interests, setInterests] = useState('');

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Started</Text>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
      
      <Text style={styles.sectionTitle}>What's your primary goal?</Text>
      
      {goals.map((goal, index) => (
        <TouchableOpacity 
          key={index}
          style={[styles.option, styles.optionBox]}
          onPress={() => setSelectedGoal(goal)}
        >
          <Text style={styles.optionText}>{goal}</Text>
          <View style={[
            styles.checkbox, 
            selectedGoal === goal && styles.checkboxSelected
          ]}>
            {selectedGoal === goal && <View style={styles.checkboxInner} />}
          </View>
        </TouchableOpacity>
      ))}
      
      <Text style={styles.sectionTitle}>What type of course do you prefer?</Text>
      
      {courseTypes.map((type, index) => (
        <TouchableOpacity 
          key={index}
          style={[styles.option, styles.optionBox]}
          onPress={() => setCourseType(type)}
        >
          <Text style={styles.optionText}>{type}</Text>
          <View style={[
            styles.checkbox, 
            courseType === type && styles.checkboxSelected
          ]}>
            {courseType === type && <View style={styles.checkboxInner} />}
          </View>
        </TouchableOpacity>
      ))}
      
      <Text style={styles.sectionTitle}>What are your learning interests?</Text>
      
      <TouchableOpacity style={styles.interestInput}>
        <Text style={styles.interestText}>Enter your interests</Text>
        <View style={[
          styles.checkbox, 
          interests !== '' && styles.checkboxSelected
        ]}>
          {interests !== '' && <View style={styles.checkboxInner} />}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => navigation.navigate('SkillLevel')}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5E8C7', // Matching the background color from DateOfBirthScreen and SkillLevelScreen
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 40,
    textAlign: 'left',
    marginLeft: 40,
    color: '#000000',
  },
  progressBar: {
    height: 5,
    backgroundColor: '#E0E0E0',
    marginBottom: 30,
    borderRadius: 2.5,
  },
  progressFill: {
    height: '100%',
    width: '40%', // 2/5 progress as shown in the image
    backgroundColor: '#000000',
    borderRadius: 2.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
    color: '#000000',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionBox: {
    backgroundColor: '#F5E8C7', // Same as container background
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#000',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 6,
  },
  interestInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  interestText: {
    color: '#999',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#F4A261', // Matching the orange color from the image
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 30,
  },
  continueButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GetStartedScreen;