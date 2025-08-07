import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LanguageSelectionScreen = () => {
  const languages = ['Kannada', 'Hindi', 'Telugu', 'Bhojpuri', 'Tamil'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your language</Text>
      {languages.map((lang) => (
        <TouchableOpacity key={lang} style={styles.languageBox} onPress={() => console.log(`Selected: ${lang}`)}>
          <Text style={styles.languageText}>{lang}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor:'#F5E8C7', 
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
});

export default LanguageSelectionScreen;