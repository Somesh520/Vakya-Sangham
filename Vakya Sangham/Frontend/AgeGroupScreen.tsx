import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AgeGroupScreen = () => {
  const navigation = useNavigation();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);

  const ageGroups = [
    '18-24', '25-34', '35-44', '45-54', '55+'
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
      <Text style={styles.title}>What's your age group?</Text>
      <View style={styles.ageGroupContainer}>
        {ageGroups.map((ageGroup) => (
          <TouchableOpacity
            key={ageGroup}
            style={[styles.ageButton, selectedAgeGroup === ageGroup && styles.selectedAgeButton]}
            onPress={() => setSelectedAgeGroup(ageGroup)}
          >
            <Text style={styles.ageText}>{ageGroup}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.nextButton} onPress={() => {
        if (selectedAgeGroup) {
          navigation.navigate('CreateAccount');
        }
      }}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  closeText: {
    fontSize: 24,
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  ageGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ageButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 25,
    margin: 5,
    width: 80,
    alignItems: 'center',
  },
  selectedAgeButton: {
    backgroundColor: '#87CEEB',
  },
  ageText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#87CEEB',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AgeGroupScreen;