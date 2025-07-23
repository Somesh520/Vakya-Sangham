import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Platform,
  TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'AboutYou'>;
};

const AboutYouScreen: React.FC<Props> = ({ navigation }) => {
  const [education, setEducation] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [showStatePicker, setShowStatePicker] = useState(false);

  const educationLevels = [
    'Primary School',
    'High School',
    'College',
    'Master\'s',
    'PhD'
  ];

  const states = [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>About you</Text>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
      
      <Text style={styles.sectionTitle}>What's your education level?</Text>
      
      <View style={styles.educationBoxContainer}>
        {educationLevels.map((level, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.option, styles.educationBox]}
            onPress={() => setEducation(level)}
          >
            <Text style={styles.optionText}>{level}</Text>
            <View style={[
              styles.radio, 
              education === level && styles.radioSelected
            ]} />
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.sectionTitle}>Where are you located?</Text>
      
      {/* State Picker */}
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
      />
      
      <TextInput
        style={styles.input}
        placeholder="DISTRICT"
        value={district}
        onChangeText={setDistrict}
      />
      
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => navigation.navigate('GetStarted')}
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
    width: '20%', 
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
  },
  educationBox: {
    backgroundColor: '#F5E8C7', 
    borderWidth: 1,
    borderColor: '#DDDDDD', 
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
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
    borderColor: '#DDDDDD', // Light gray radio border
  },
  radioSelected: {
    backgroundColor: '#000000', // Black when selected
    borderColor: '#000000', // Black border when selected
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD', // Light gray border
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#FFFFFF', // White input background
    color: '#000000', // Black text
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD', // Light gray border
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#FFFFFF', // White background
  },
  pickerText: {
    fontSize: 16,
    color: '#000000', // Black text
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#999999', // Gray placeholder
  },
  pickerDropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#DDDDDD', // Light gray border
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#FFFFFF', // White background
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
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
    borderBottomColor: '#E0E0E0', // Light gray border
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#000000', // Black text
  },
  continueButton: {
    backgroundColor: '#D87A33', // Darker orange continue button
    padding: 15,
    borderRadius: 25, // Rounded edges
    alignItems: 'center',
    marginTop: 30,
  },
  continueButtonText: {
    color: '#FFFFFF', // White text
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AboutYouScreen;