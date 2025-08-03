// screens/HomeScreen.tsx

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; // Import the type from App.tsx

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StudentHome'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Button
        title="Edit Your Profile"
        onPress={() => navigation.navigate('EditProfile')} // This line opens the page
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
});

export default HomeScreen;