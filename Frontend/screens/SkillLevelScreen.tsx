// src/screens/SkillLevelScreen.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../AuthContext';
import api from '../api';

import { Text, ProgressBar, RadioButton, Button, SegmentedButtons } from 'react-native-paper';
import { View as MotiView } from 'moti';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'SkillLevel'> };

const SkillLevelScreen: React.FC<Props> = ({ navigation }) => {
  const { updateUser } = useAuth();
  const [level, setSkillLevel] = useState('');
  const [timeAvailability, setLearningTime] = useState('');
  const [hasTakenOnlineCourses, setHasExperience] = useState('');
  const [loading, setLoading] = useState(false);

  const skillLevels = useMemo(() => ['Beginner', 'Intermediate', 'Advanced'], []);
  const timeOptions = useMemo(() => ['<15 minutes', '15-30 minutes', '30-60 minutes', '>1 hour'], []);

  const handleContinue = useCallback(async () => {
    if (!level || !timeAvailability || !hasTakenOnlineCourses) {
      Alert.alert('Missing Information', 'Please answer all questions to continue.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        level,
        timeAvailability,
        hasTakenOnlineCourses: hasTakenOnlineCourses === 'yes',
      };
      await api.patch('/user/info/onboarding', payload);
      // ✅ NOTE: This now navigates to the Home tab as onboarding is complete.
      // You can change 'MainTabs' if your tab navigator has a different name.
      navigation.navigate('MainTabs', { screen: 'Home' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      Alert.alert('Onboarding Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [level, timeAvailability, hasTakenOnlineCourses, navigation]);

  // Cleaner way to render radio items for short lists
  const renderRadioItem = (item: string, type: 'skill' | 'time') => (
    <MotiView 
        from={{opacity: 0, scale: 0.9}} 
        animate={{opacity: 1, scale: 1}} 
        transition={{delay: 100, type: 'timing'}}
        key={item}
    >
        <RadioButton.Item
            label={item}
            value={item}
            labelStyle={styles.optionText}
            color={styles.radioSelected.backgroundColor}
            style={(type === 'skill' ? level : timeAvailability) === item ? styles.optionSelected : styles.option}
        />
    </MotiView>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        {/* Progress */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Text style={styles.title}>Final Step!</Text>
          <ProgressBar progress={0.8} color={styles.progressFill.backgroundColor} style={styles.progressBar} />
        </MotiView>

        {/* Skill Level */}
        <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 100 }}>
          <Text style={styles.sectionTitle}>What's your current skill level?</Text>
          <RadioButton.Group onValueChange={setSkillLevel} value={level}>
             {/* ✅ UPDATED: Using .map() for cleaner code, as FlatList is not needed for a short list */}
            {skillLevels.map(item => renderRadioItem(item, 'skill'))}
          </RadioButton.Group>
        </MotiView>

        {/* Time Availability */}
        <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 200 }}>
          <Text style={styles.sectionTitle}>How much time do you have each week?</Text>
          <RadioButton.Group onValueChange={setLearningTime} value={timeAvailability}>
             {/* ✅ UPDATED: Using .map() for cleaner code */}
            {timeOptions.map(item => renderRadioItem(item, 'time'))}
          </RadioButton.Group>
        </MotiView>

        {/* Online Course Experience */}
        <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 300 }}>
          <Text style={styles.sectionTitle}>Have you taken online courses before?</Text>
          <SegmentedButtons
            value={hasTakenOnlineCourses}
            onValueChange={setHasExperience}
            style={styles.segmentedButtonContainer}
            buttons={[
              {
                value: 'yes',
                label: 'Yes',
                showSelectedCheck: true,
                style: hasTakenOnlineCourses === 'yes' ? styles.segmentButtonSelected : styles.segmentButton,
              },
              {
                value: 'no',
                label: 'No',
                showSelectedCheck: true,
                style: hasTakenOnlineCourses === 'no' ? styles.segmentButtonSelected : styles.segmentButton,
              },
            ]}
          />
        </MotiView>

        {/* Next Button */}
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
            {loading ? 'Finishing...' : 'Complete Profile'}
          </Button>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E8C7' },
  // ✅ UPDATED: Added paddingTop from the dev's file for better spacing
  contentContainer: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#000000'},
  progressBar: { height: 10, borderRadius: 5, marginBottom: 20 },
  progressFill: { backgroundColor: '#000000' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 15, color: '#000000' },
  option: { backgroundColor: '#FFFFFF', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#DDDDDD' },
  optionSelected: { backgroundColor: '#FEF3E8', borderColor: '#D87A33', borderWidth: 1.5, borderRadius: 8, marginBottom: 10 },
  optionText: { fontSize: 16, color: '#000000' },
  radioSelected: { backgroundColor: '#000000' },
  segmentedButtonContainer: { marginTop: 10 },
  segmentButton: { backgroundColor: '#FFFFFF', borderColor: '#DDDDDD' },
  segmentButtonSelected: { backgroundColor: '#D87A33', borderColor: '#D87A33' }, // Note: text color is handled by the component
  nextButton: { paddingVertical: 8, borderRadius: 25, marginTop: 40, backgroundColor: '#D87A33' },
  nextButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});

export default SkillLevelScreen;