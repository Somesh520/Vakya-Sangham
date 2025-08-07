import React from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  AIChat: undefined;
};

type AIChatScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AIChat'>;
};

const AIChatScreen = ({ navigation }: AIChatScreenProps) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          
        </TouchableOpacity>
        <Text style={styles.headerText}>AI Chat</Text>
      </View>
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Image source={require('./assets/aibot-icon.png')} style={styles.avatar} />
        <Text style={styles.greeting}>Hi, how may I help you today?</Text>
      </View>
      
      {/* Input Section */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity>
          <Image source={require('./assets/message-icon.png')} style={styles.attachmentIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8C7',
    padding:10, // Matches profile page background
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    alignItems:'center'
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  greeting: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  attachmentIcon: {
    width: 24,
    height: 24,
  },
});

export default AIChatScreen;