import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Markdown from 'react-native-markdown-display';

// --- Type Definitions ---
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'tutor';
};

type GeminiContent = {
  role: 'user' | 'model';
  parts: [{ text: string }];
};

const DoubtClearingScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (input.trim().length === 0 || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
    };

    // Create history before updating the state for the new message
    const history: GeminiContent[] = [
      ...messages.map((msg): GeminiContent => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      { role: 'user', parts: [{ text: userMessage.text }] }
    ];

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = "AIzaSyDmu5mRdCikoYJA9RBtLBHuyVKc91XpwCo";
     
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const requestBody = { contents: history };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      let tutorResponseText = "Sorry, I couldn't understand that. Please try again.";
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        tutorResponseText = result.candidates[0].content.parts[0].text;
      } else if (result.error) {
        tutorResponseText = `API Error: ${result.error.message}`;
      }

      const tutorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: tutorResponseText,
        sender: 'tutor',
      };

      setMessages(prev => [...prev, tutorMessage]);

    } catch (error) {
      if (error instanceof Error) {
        console.error("AI Tutor Fetch Error:", error);
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `An error occurred: ${error.message}`,
            sender: 'tutor',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender === 'user';
    return (
      <View style={[ styles.messageBubble, isUserMessage ? styles.userMessage : styles.tutorMessage ]}>
        {isUserMessage ? (
          <Text style={styles.userMessageText}>{item.text}</Text>
        ) : (
          <Markdown style={markdownStyles}>{item.text || '...'}</Markdown>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="help-circle-outline" size={60} color="#BDBDBD" />
              <Text style={styles.emptyText}>Ask me anything!</Text>
            </View>
          }
        />

        {loading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#FFA500" />
            <Text style={styles.typingText}>Tutor is thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your question here..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const markdownStyles = StyleSheet.create({
  body: { fontSize: 16, color: '#333' },
  code_block: { backgroundColor: '#1E1E1E', color: '#D4D4D4', padding: 10, borderRadius: 4, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  heading1: { fontSize: 24, fontWeight: 'bold', color: '#121212' },
  strong: { fontWeight: 'bold' },
});
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  messageList: { padding: 10, flexGrow: 1 },
  messageBubble: { padding: 12, borderRadius: 20, marginBottom: 10, maxWidth: '80%' },
  userMessage: { backgroundColor: '#FFA500', alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  tutorMessage: { backgroundColor: '#F0F0F0', alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  userMessageText: { color: '#fff', fontSize: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#fff' },
  input: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
  sendButton: { marginLeft: 10, backgroundColor: '#FFA500', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 5 },
  typingText: { marginLeft: 10, color: '#888', fontStyle: 'italic' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, fontSize: 20, fontWeight: 'bold', color: '#BDBDBD' },
});

export default DoubtClearingScreen;
