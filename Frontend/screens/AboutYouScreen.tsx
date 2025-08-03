// src/screens/AboutYouScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Platform,
  TextInput,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App'; // Adjust path if necessary
import api from '../api';

// Define the types for navigation and route props
type AboutYouRouteProp = RouteProp<RootStackParamList, 'AboutYou'>;
type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'AboutYou'>;
  route: AboutYouRouteProp;
};

// Define a type for the education level object
type EducationLevel = {
  label: string;
  value: string;
};

const AboutYouScreen: React.FC<Props> = ({ navigation, route }) => {
  // Get dateOfBirth from the previous screen
  const { dateOfBirth } = route.params;

  // State to hold the selected education level object
  const [selectedEducation, setSelectedEducation] = useState<EducationLevel | null>(null);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use an array of objects to separate display labels from backend values
  // Updated values to match common backend enum formats.
  const educationLevels: EducationLevel[] = [
    { label: 'Primary School', value: 'Primary School' },
    { label: 'High School', value: 'High School' },
    { label: 'College', value: 'College' },
    { label: 'Master\'s', value: 'Master\'s' },
    { label: 'PhD', value: 'PhD' }
  ];

  const states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const handleContinue = async () => {
    // Check if an education level has been selected
    if (!selectedEducation || !state || !city.trim() || !district.trim()) {
      Alert.alert('Missing Information', 'Please fill out all the fields to continue.');
      return;
    }

    setLoading(true);
    try {
      // Create a "flat" data object using the 'value' from the selected education object
      // Corrected 'district' to 'District' to match the backend schema.
      const onboardingData = {
        dateOfBirth,
        education: selectedEducation.value, 
        state, 
        city: city.trim(),
        District: district.trim(), // Corrected key
      };

      // Send all onboarding data to the backend
      await api.patch('/user/info/onboarding', onboardingData);

      // The user is not fully onboarded yet.
      // Navigate to the next screen in the onboarding flow.
      navigation.navigate('GetStarted');


    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      Alert.alert('Onboarding Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>About you</Text>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
      
      <Text style={styles.sectionTitle}>What's your education level?</Text>
      
      <View style={styles.educationBoxContainer}>
        {educationLevels.map((level, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.option, selectedEducation?.value === level.value && styles.selectedOption]}
            onPress={() => setSelectedEducation(level)} // Set the entire object in state
          >
            <Text style={styles.optionText}>{level.label}</Text>
            <View style={[
              styles.radio, 
              selectedEducation?.value === level.value && styles.radioSelected
            ]} />
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.sectionTitle}>Where are you located?</Text>
      
      <TouchableOpacity 
        style={styles.pickerContainer}
        onPress={() => setShowStatePicker(!showStatePicker)}
      >
        <Text style={state ? styles.pickerText : styles.pickerPlaceholder}>
          {state || 'SELECT STATE'}
        </Text>
      </TouchableOpacity>
      
      {showStatePicker && (
        <View style={styles.pickerDropdown}>
          <ScrollView 
            style={styles.pickerScroll}
            nestedScrollEnabled={true}
          >
            {states.map((stateName, index) => (
              <TouchableOpacity
                key={index}
                style={styles.pickerOption}
                onPress={() => {
                  setState(stateName);
                  setShowStatePicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>{stateName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="CITY"
        value={city}
        onChangeText={setCity}
        placeholderTextColor="#999999"
      />
      
      <TextInput
        style={styles.input}
        placeholder="DISTRICT"
        value={district}
        onChangeText={setDistrict}
        placeholderTextColor="#999999"
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
    marginBottom: 5,
    marginTop: 50,
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
    width: '50%', // Updated progress
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
  educationBoxContainer: {
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', 
    backgroundColor: '#F5E8C7', 
    borderWidth: 1,
    borderColor: '#DDDDDD', 
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  selectedOption: {
    borderColor: '#D87A33',
    backgroundColor: '#FEF3E8'
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#000000',
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  pickerText: {
    fontSize: 16,
    color: '#000000',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#999999',
  },
  pickerDropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pickerScroll: {
    flexGrow: 0,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  continueButton: {
    backgroundColor: '#D87A33',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 30,
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

export default AboutYouScreen;
