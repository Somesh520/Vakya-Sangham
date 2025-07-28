import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'SkillLevel'>;
};

const SkillLevelScreen: React.FC<Props> = ({ navigation }) => {
  const [skillLevel, setSkillLevel] = useState('');
  const [learningTime, setLearningTime] = useState('');
  const [hasExperience, setHasExperience] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>3/5</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
      <Text style={styles.title}>What's your current skill level?</Text>
      
      {['Beginner', 'Intermediate', 'Advanced'].map((level, index) => (
        <TouchableOpacity 
          key={index}
          style={[
            styles.option,
            skillLevel === level && styles.optionSelected
          ]}
          onPress={() => setSkillLevel(level)}
        >
          <Text style={styles.optionText}>{level}</Text>
          <View style={[
            styles.radio, 
            skillLevel === level && styles.radioSelected
          ]} />
        </TouchableOpacity>
      ))}
      
      <Text style={styles.sectionTitle}>How much time do you have each week for learning?</Text>
      
      {['Less than 5 hours', '5-10 hours', 'More than 10 hours'].map((time, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.option}
          onPress={() => setLearningTime(time)}
        >
          <Text style={styles.optionText}>{time}</Text>
          <View style={[
            styles.radio, 
            learningTime === time && styles.radioSelected
          ]} />
        </TouchableOpacity>
      ))}
      
      <Text style={styles.sectionTitle}>Have you taken online language courses before?</Text>
      
      <View style={styles.row}>
        {['Yes', 'No'].map((answer, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.toggleOption, 
              hasExperience === answer && styles.toggleSelected
            ]}
            onPress={() => setHasExperience(answer)}
          >
            <Text style={[
              styles.toggleText,
              hasExperience === answer && styles.toggleTextSelected
            ]}>
              {answer}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={() => navigation.navigate('Profile')} 
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5E8C7',
    paddingTop: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#FDFAF2',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '60%',
    backgroundColor: '#000',
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: -10,
    marginLeft: 35,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginLeft: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#F5E8C7',
  },
  optionSelected: {
    borderColor: '#000',
    backgroundColor: '#e0e0e0',
  },
  optionText: {
    fontSize: 16,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  radioSelected: {
    borderColor: '#000',
    backgroundColor: '#000',
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
    borderColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  toggleSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  toggleText: {
    fontSize: 16,
  },
  toggleTextSelected: {
    color: '#fff',
  },
  nextButton: {
    backgroundColor: '#F4A261',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SkillLevelScreen;