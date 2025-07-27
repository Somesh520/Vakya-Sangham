import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreateAccountScreen from './CreateAccountScreen';
import AgeGroupScreen from './AgeGroupScreen.tsx';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CreateAccount">
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="AgeGroup" component={AgeGroupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;