// src/screens/AboutYouScreen.tsx
import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  ScrollView,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import api from '../api';

import {
  Text,
  ProgressBar,
  RadioButton,
  TextInput,
  Button,
  Searchbar,
  Divider,
  Snackbar
} from 'react-native-paper';

import { View as MotiView, AnimatePresence } from 'moti';
import statesData from '../statesDistricts.json';

type AboutYouRouteProp = RouteProp<RootStackParamList, 'AboutYou'>;
type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'AboutYou'>;
  route: AboutYouRouteProp;
};

const AboutYouScreen: React.FC<Props> = ({ navigation, route }) => {
  const { dateOfBirth } = route.params;

  const [education, setEducation] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);

  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [step, setStep] = useState<'state' | 'district'>('state');

  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const educationLevels = [
    { label: 'Primary School', value: 'Primary School' },
    { label: 'High school', value: 'High school' },
    { label: 'College', value: 'College' },
    { label: 'Master’s', value: 'Master’s' },
    { label: 'PhD', value: 'PhD' }
  ];

  const allStates = Object.keys(statesData);

  const filteredStates = useMemo(
    () => allStates.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  const filteredDistricts = useMemo(
    () => districts.filter(d => d.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, districts]
  );

  const onStateSelect = (selectedState: string) => {
    setState(selectedState);
    setDistricts(statesData[selectedState as keyof typeof statesData] || []);
    setDistrict('');
    setSearchQuery('');
    setStep('district');
  };

  const onDistrictSelect = (selectedDistrict: string) => {
    setDistrict(selectedDistrict);
    setIsLocationModalVisible(false);
    setSearchQuery('');
    setStep('state');
  };

  const handleContinue = async () => {
    if (!education || !state || !district.trim()) {
      setSnackbar({ visible: true, message: 'Please fill out all the fields ✨' });
      return;
    }

    setLoading(true);
    try {
      const onboardingData = { dateOfBirth, education, state, district: district.trim() };
      await api.patch('/user/info/onboarding', onboardingData);
      navigation.navigate('GetStarted');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Something went wrong 🚧';
      setSnackbar({ visible: true, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MotiView from={{opacity: 0, translateY: -20}} animate={{opacity: 1, translateY: 0}} transition={{type: "timing", duration: 600}}>
          <Text style={styles.title}>About you</Text>
          <ProgressBar progress={0.5} color={styles.progressFill.backgroundColor} style={styles.progressBar} />
        </MotiView>

        {/* Education */}
        <MotiView from={{opacity: 0, translateX: -30}} animate={{opacity: 1, translateX: 0}} transition={{delay: 150}}>
          <Text style={styles.sectionTitle}>What's your education level?</Text>
          <RadioButton.Group onValueChange={setEducation} value={education}>
            {educationLevels.map((level, i) => (
              <MotiView key={level.value} from={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} transition={{delay: 200 + i*80}}>
                <RadioButton.Item 
                  label={level.label}
                  value={level.value}
                  labelStyle={styles.optionText}
                  color={styles.radioSelected.backgroundColor}
                  style={education === level.value ? styles.selectedOption : styles.option}
                />
              </MotiView>
            ))}
          </RadioButton.Group>
        </MotiView>

        {/* Location */}
        <MotiView from={{opacity: 0, translateX: -30}} animate={{opacity: 1, translateX: 0}} transition={{delay: 400}}>
          <Text style={styles.sectionTitle}>Where are you located?</Text>

          <TouchableOpacity onPress={() => { setIsLocationModalVisible(true); setStep('state'); }}>
            <View pointerEvents="none">
              <TextInput label="State" value={state} mode="outlined" editable={false} right={<TextInput.Icon icon="menu-down" />} style={styles.input}/>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            if (!state) return setSnackbar({ visible: true, message: 'Select a state first ✨' });
            setIsLocationModalVisible(true);
            setStep('district');
          }}>
            <View pointerEvents="none">
              <TextInput label="District" value={district} mode="outlined" editable={false} right={<TextInput.Icon icon="menu-down" />} style={styles.input}/>
            </View>
          </TouchableOpacity>
        </MotiView>

        {/* Continue Button */}
        <MotiView from={{opacity: 0, translateY: 20}} animate={{opacity: 1, translateY: 0}} transition={{delay: 600}}>
          <MotiView from={{scale: 1}} animate={{scale: [1,1.05,1]}} transition={{loop:true,type:'timing',duration:2000}}>
            <Button mode="contained" onPress={handleContinue} loading={loading} disabled={loading} style={styles.continueButton} labelStyle={styles.continueButtonText} buttonColor={styles.continueButton.backgroundColor}>
              {loading ? 'Saving...' : 'Continue'}
            </Button>
          </MotiView>
        </MotiView>
      </ScrollView>

      {/* Location Modal */}
      <AnimatePresence>
        {isLocationModalVisible && (
          <MotiView from={{opacity:0, translateY:50}} animate={{opacity:1, translateY:0}} exit={{opacity:0, translateY:50}} style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetContent}>
              <Searchbar 
                placeholder={step === 'state' ? 'Search state...' : 'Search district...'}
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
              />

              <FlatList
                data={step === 'state' ? filteredStates : filteredDistricts}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => step === 'state' ? onStateSelect(item) : onDistrictSelect(item)}
                    style={[styles.listItem,
                      (step === 'state' && state === item) || (step === 'district' && district === item)
                        ? styles.selectedListItem : null]}
                  >
                    <Text style={styles.listItemText}>{item}</Text>
                    {((step === 'state' && state === item) || (step === 'district' && district === item)) && (
                      <Text style={styles.checkmark}>✔</Text>
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <Divider />}
              />

              <Button mode="outlined" onPress={() => setIsLocationModalVisible(false)} style={styles.closeButton}>
                Close
              </Button>
            </View>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Snackbar */}
      <Snackbar visible={snackbar.visible} onDismiss={() => setSnackbar({...snackbar,visible:false})} duration={2000} style={{backgroundColor:'#D87A33'}}>
        {snackbar.message}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E8C7' },
  contentContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, marginTop: 30, color: '#000' },
  progressBar: { height: 5, marginBottom: 30, borderRadius: 2.5 },
  progressFill: { backgroundColor: '#000' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 20, color: '#000' },
  option: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 10 },
  selectedOption: { backgroundColor: '#FEF3E8', borderColor: '#D87A33', borderWidth: 1.5, borderRadius: 8, marginBottom: 10 },
  optionText: { fontSize: 16, color: '#000' },
  radioSelected: { backgroundColor: '#000' },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  continueButton: { paddingVertical: 8, borderRadius: 25, marginTop: 30, backgroundColor: '#D87A33' },
  continueButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  bottomSheetContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', flex: 1 },
  bottomSheetContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '70%' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10 },
  selectedListItem: { backgroundColor: '#FEF3E8' },
  listItemText: { fontSize: 16, color: '#000' },
  checkmark: { fontSize: 16, color: '#D87A33', fontWeight: 'bold' },
  closeButton: { marginTop: 12, borderColor: '#D87A33' },
  searchbar: { marginBottom: 10 }
});

export default AboutYouScreen;
