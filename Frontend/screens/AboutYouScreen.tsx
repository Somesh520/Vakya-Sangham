// src/screens/AboutYouScreen.tsx
import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  ScrollView,
  Alert,
  Modal,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types'; // Adjust path if necessary
import api from '../api';

// --- Import components from React Native Paper ---
import {
  Text,
  ProgressBar,
  RadioButton,
  TextInput,
  Button,
  Searchbar,
  List,
  Divider
} from 'react-native-paper';

import { View as MotiView } from 'moti';

type AboutYouRouteProp = RouteProp<RootStackParamList, 'AboutYou'>;
type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'AboutYou'>;
  route: AboutYouRouteProp;
};

const AboutYouScreen: React.FC<Props> = ({ navigation, route }) => {
  const { dateOfBirth } = route.params;

  const [education, setEducation] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [isStateModalVisible, setIsStateModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const educationLevels = [
    { label: 'Primary School', value: 'Primary School' },
    { label: 'High School', value: 'High School' },
    { label: 'College', value: 'College' },
    { label: 'Master\'s', value: 'Master\'s' },
    { label: 'PhD', value: 'PhD' }
  ];

  const allStates = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];
  
  const filteredStates = useMemo(() => 
    allStates.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  const handleContinue = async () => {
    if (!education || !state || !city.trim() || !district.trim()) {
      Alert.alert('Missing Information', 'Please fill out all the fields to continue.');
      return;
    }

    setLoading(true);
    try {
      const onboardingData = {
        dateOfBirth,
        education, 
        state, 
        city: city.trim(),
        District: district.trim(),
      };
      await api.patch('/user/info/onboarding', onboardingData);
      navigation.navigate('GetStarted');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      Alert.alert('Onboarding Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <MotiView from={{opacity: 0}} animate={{opacity: 1}}>
        <Text style={styles.title}>About you</Text>
        <ProgressBar progress={0.5} color={styles.progressFill.backgroundColor} style={styles.progressBar} />
      </MotiView>
      
      <MotiView from={{opacity: 0, translateX: -20}} animate={{opacity: 1, translateX: 0}} transition={{delay: 100}}>
        <Text style={styles.sectionTitle}>What's your education level?</Text>
        <RadioButton.Group onValueChange={newValue => setEducation(newValue)} value={education}>
          {educationLevels.map((level) => (
            <RadioButton.Item 
              key={level.value}
              label={level.label}
              value={level.value}
              labelStyle={styles.optionText}
              color={styles.radioSelected.backgroundColor}
              style={education === level.value ? styles.selectedOption : styles.option}
            />
          ))}
        </RadioButton.Group>
      </MotiView>
      
      <MotiView from={{opacity: 0, translateX: -20}} animate={{opacity: 1, translateX: 0}} transition={{delay: 200}}>
        <Text style={styles.sectionTitle}>Where are you located?</Text>
        
        {/* --- Improved State Picker --- */}
        <TouchableOpacity onPress={() => setIsStateModalVisible(true)}>
            <View pointerEvents="none">
                 <TextInput
                    label="State"
                    value={state}
                    mode="outlined"
                    editable={false}
                    right={<TextInput.Icon icon="menu-down" />}
                    style={styles.input}
                 />
            </View>
        </TouchableOpacity>

        <TextInput
          label="City"
          value={city}
          onChangeText={setCity}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="map-marker-outline" />}
        />
        
        <TextInput
          label="District"
          value={district}
          onChangeText={setDistrict}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="map-marker-radius-outline" />}
        />
      </MotiView>
      
      <MotiView from={{opacity: 0, translateY: 20}} animate={{opacity: 1, translateY: 0}} transition={{delay: 300}}>
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

      {/* --- State Selection Modal --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isStateModalVisible}
        onRequestClose={() => setIsStateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Searchbar
              placeholder="Search for a state"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <List.Item
                  title={item}
                  onPress={() => {
                    setState(item);
                    setIsStateModalVisible(false);
                    setSearchQuery('');
                  }}
                />
              )}
              ItemSeparatorComponent={() => <Divider />}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Styles are adjusted for Paper components, using your color scheme
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8C7', 
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 30, // Adjusted margin for status bar
    color: '#000000', 
  },
  progressBar: {
    height: 5,
    marginBottom: 30,
    borderRadius: 2.5,
  },
  progressFill: {
    backgroundColor: '#000000', 
  },
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
  },
  selectedOption: {
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
    backgroundColor: '#000000', // Color for the selected radio dot
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    paddingVertical: 8,
    borderRadius: 25,
    marginTop: 30,
    backgroundColor: '#D87A33',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  searchbar: {
    marginBottom: 10,
  },
});

export default AboutYouScreen;