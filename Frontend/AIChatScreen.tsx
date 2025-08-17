import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from './types';

type AIChatScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AIChat'>;
};

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const AIChatScreen = ({ navigation }: AIChatScreenProps) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat when a new message is added
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim().length > 0) {
      const newUserMessage: Message = { text: inputText.trim(), sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputText('');

      // Simulate bot response after a short delay
      setTimeout(() => {
        const botResponse: Message = {
          text: "I'm still learning, but thank you for your question!",
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>AI Chat</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Initial Bot Greeting */}
      <View style={styles.initialMessage}>
        <Image source={require('./assets/aibot-icon.png')} style={styles.avatar} />
        <Text style={styles.greeting}>Hi, how may I help you today?</Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputSection}
        keyboardVerticalOffset={10}
      >
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8C7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  initialMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
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
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    maxWidth: '80%',
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#f4a261',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#d8c49e',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
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
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#f4a261',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AIChatScreen;