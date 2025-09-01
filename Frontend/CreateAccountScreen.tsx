import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'CreateAccount'>;
};

const CreateAccountScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    referralCode: ''
  });
  const handleSubmit = () => {
    navigation.navigate('DateOfBirth');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.fullName}
        onChangeText={text => setFormData({...formData, fullName: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={text => setFormData({...formData, email: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={text => setFormData({...formData, password: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone Number (Optional)"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={text => setFormData({...formData, phone: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Referral Code (Optional)"
        value={formData.referralCode}
        onChangeText={text => setFormData({...formData, referralCode: text})}
      />
      
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      
      <Text style={styles.orText}>---Or---</Text>
      
      <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5E8C7', 
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#F5E8C7', 
    color: '#000',
  },
  button: {
    backgroundColor: '#f4a261',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  googleButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
});

export default CreateAccountScreen;