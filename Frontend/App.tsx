import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import OnboardingNavigator from './OnboardingNavigator';

const App = () => {
  return (
    <NavigationContainer>
      <OnboardingNavigator />
    </NavigationContainer>
  );
};

export default App;