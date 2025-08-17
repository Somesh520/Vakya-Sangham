import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LanguageSelectionScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'LanguageSelection'>>();
  const languages = ['Kannada', 'Hindi', 'Telugu', 'Bhojpuri', 'Tamil'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Select your language</Text>
      {languages.map((lang) => (
        <TouchableOpacity key={lang} style={styles.languageBox} onPress={() => console.log(`Selected: ${lang}`)}>
          <Text style={styles.languageText}>{lang}</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('Notes')}
        >
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5E8C7',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
    marginBottom: 40,
  },
  backButton: {
    padding: 10,
    left: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  languageBox: {
    backgroundColor: '#F4A261',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 18,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  floatingButton: {
    backgroundColor: '#F4A261',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 35,
    color: '#000',
    lineHeight: 40,
  },
});

export default LanguageSelectionScreen;