// src/screens/GetStartedScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import api from '../api';

import {
  Text,
  ProgressBar,
  RadioButton,
  TextInput,
  Button,
} from 'react-native-paper';

import { View as MotiView } from 'moti';
// ✅ UPDATED: Using a more robust Keyboard manager
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'GetStarted'>;
};

const GetStartedScreen: React.FC<Props> = ({ navigation }) => {
  const [goal, setGoal] = useState('');
  const [contentPreference, setContentPreference] = useState('');
  const [interest, setInterests] = useState('');
  const [loading, setLoading] = useState(false);

  const goals = useMemo(
    () => [
      'Learn a new skill',
      'Advance my career',
      'Start a business',
      'Grow my business',
    ],
    []
  );

  const courseTypes = useMemo(
    () => ['Video courses', 'PDFs', 'Live mentorship'],
    []
  );

  const handleContinue = useCallback(async () => {
    if (!goal || !contentPreference || !interest.trim()) {
      Alert.alert('Missing Information', 'Please fill out all fields to continue.');
      return;
    }
    setLoading(true);
    try {
      const payload = { goal, contentPreference, interest: interest.trim() };
      await api.patch('/user/info/onboarding', payload);
      navigation.navigate('SkillLevel');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'An error occurred. Please try again.';
      Alert.alert('Onboarding Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [goal, contentPreference, interest, navigation]);

  const renderRadioItem = useCallback(
    ({ item, type }: { item: string; type: 'goal' | 'content' }) => (
      <MotiView 
        from={{opacity: 0, scale: 0.9}} 
        animate={{opacity: 1, scale: 1}} 
        transition={{delay: 100, type: 'timing'}}
      >
        <RadioButton.Item
          key={item}
          label={item}
          value={item}
          labelStyle={styles.optionText}
          color={styles.radioSelected.backgroundColor}
          style={
            (type === 'goal' ? goal : contentPreference) === item
              ? styles.selectedOption
              : styles.option
          }
          onPress={() =>
            type === 'goal' ? setGoal(item) : setContentPreference(item)
          }
        />
      </MotiView>
    ),
    [goal, contentPreference]
  );

  return (
    // ✅ UPDATED: Using KeyboardAwareScrollView for the best keyboard handling
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      extraScrollHeight={20}
    >
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Text style={styles.title}>Get Started</Text>
        <ProgressBar
          progress={0.6}
          color={styles.progressFill.backgroundColor}
          style={styles.progressBar}
        />
      </MotiView>

      {/* Goals */}
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ delay: 100, type: 'timing' }}
      >
        <Text style={styles.sectionTitle}>What's your primary goal?</Text>
        {/* Note: Using .map() here is slightly cleaner than FlatList for short, static lists */}
        <RadioButton.Group onValueChange={setGoal} value={goal}>
          {goals.map((item) => renderRadioItem({ item, type: 'goal' }))}
        </RadioButton.Group>
      </MotiView>

      {/* Course Preference */}
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ delay: 200, type: 'timing' }}
      >
        <Text style={styles.sectionTitle}>
          What type of course do you prefer?
        </Text>
        <RadioButton.Group
          onValueChange={setContentPreference}
          value={contentPreference}
        >
          {courseTypes.map((item) => renderRadioItem({ item, type: 'content' }))}
        </RadioButton.Group>
      </MotiView>

      {/* Interest Input */}
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ delay: 300, type: 'timing' }}
      >
        <Text style={styles.sectionTitle}>
          What are your learning interests?
        </Text>
        <TextInput
          label="Enter your interests"
          placeholder="e.g., Design, Coding, Marketing"
          value={interest}
          onChangeText={setInterests}
          mode="outlined"
          style={styles.interestInput}
          left={<TextInput.Icon icon="lightbulb-on-outline" />}
        />
      </MotiView>

      {/* Continue Button */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 400, type: 'timing' }}
      >
        <Button
          mode="contained"
          onPress={handleContinue}
          loading={loading}
          disabled={loading}
          style={styles.continueButton}
          labelStyle={styles.continueButtonText}
          buttonColor={styles.continueButton.backgroundColor}
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </MotiView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E8C7' },
  contentContainer: { padding: 20, paddingBottom: 50 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 30,
    color: '#000000',
  },
  progressBar: { height: 5, borderRadius: 2.5, marginBottom: 30 },
  progressFill: { backgroundColor: '#000000' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
    color: '#000000',
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  selectedOption: {
    backgroundColor: '#FEF3E8',
    borderColor: '#D87A33',
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionText: { fontSize: 16, color: '#000000' },
  radioSelected: { backgroundColor: '#000000' },
  interestInput: { marginBottom: 20, backgroundColor: '#FFFFFF' },
  continueButton: {
    paddingVertical: 8,
    borderRadius: 25,
    marginTop: 30,
    backgroundColor: '#D87A33',
  },
  continueButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});

export default GetStartedScreen;