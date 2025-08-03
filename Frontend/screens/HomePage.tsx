// screens/HomePage.tsx
import React from 'react';
import { View, Text } from 'react-native';

const HomePage = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome to HomePage!</Text>
    </View>
  );
};

export default HomePage;