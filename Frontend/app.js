import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreateAccountScreen from './CreateAccountScreen';
import AgeGroupScreen from './AgeGroupScreen.tsx';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.2.2:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;