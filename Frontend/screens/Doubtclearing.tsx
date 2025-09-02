import React, { useState, useRef, useCallback, memo } from 'react';
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
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Markdown from 'react-native-markdown-display';
// Don't forget to set up react-native-dotenv for security
// import Config from "react-native-dotenv";

// --- Type Definitions ---
type Message = { id: string; text: string; sender: 'user' | 'tutor' };
type GeminiContent = { role: 'user' | 'model'; parts: [{ text: string }] };

const { width } = Dimensions.get('window');

// ✅ CHANGED: System instructions to define the AI's personality and knowledge
const SYSTEM_INSTRUCTIONS = `
You are the official AI assistant for the "Sarvagya Learning" app. Your name is Guru.

Your core identity and knowledge:
1.  **Founder:** The app was created by Harsh.
2.  **Organization:** It is a product of the Sarvagya Community.
3.  **Key Feature:** The app includes a powerful "AI Tutor" that provides step-by-step, interactive lessons in various languages.
4.  **Your Role:** Your primary purpose is to answer user questions about the app, its features, courses, and the Sarvagya Community.

Your rules of conversation:
- Always be friendly, encouraging, and helpful.
- If a user asks a general knowledge question (e.g., "What is the capital of France?"), gently guide them back to the app's purpose. Say something like, "As the AI assistant for Sarvagya Learning, I can best help with questions about our courses and features. How can I assist you with your learning journey today?"
- Never break character. You are Guru, the helpful guide for this app.
`;

// --- Memoized Message Component ---
const MessageItem = memo(({ item }: { item: Message }) => {
  const isUser = item.sender === 'user';
  return (
    <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.tutorMessage]}>
      {isUser ? (
        <Text style={styles.userMessageText}>{item.text}</Text>
      ) : (
        <Markdown style={markdownStyles}>{item.text}</Markdown>
      )}
    </View>
  );
});

// --- Main Screen Component ---
const DoubtClearingScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // ✅ CHANGED: Initialize Gemini history with the system prompt
  const [geminiHistory, setGeminiHistory] = useState<GeminiContent[]>([
    { role: 'user', parts: [{ text: SYSTEM_INSTRUCTIONS }] },
    { role: 'model', parts: [{ text: 'Okay, I understand my role. I am Guru, the AI assistant for the Sarvagya Learning app, created by Harsh. I am ready to help users with their questions about the app and its features, like the AI Tutor.' }] },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    const userMessage: Message = { id: Date.now().toString(), text: userMessageText, sender: 'user' };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const updatedHistory: GeminiContent[] = [
      ...geminiHistory,
      { role: 'user', parts: [{ text: userMessageText }] },
    ];

    try {
      const apiKey = 'AIzaSyCRvVTvoAcatKJTdFt0A_gvCGP96dsU8yM'; // Replace with your secure key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: updatedHistory }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error ${response.status}: ${errorBody}`);
      }

      const result = await response.json();
      const tutorResponseText =
        result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not understand that.';

      const tutorMessage: Message = { id: (Date.now() + 1).toString(), text: tutorResponseText, sender: 'tutor' };

      setMessages((prev) => [...prev, tutorMessage]);
      setGeminiHistory([
        ...updatedHistory,
        { role: 'model', parts: [{ text: tutorResponseText }] },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Error: ${errorMessage}`,
          sender: 'tutor',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = useCallback(({ item }: { item: Message }) => <MessageItem item={item} />, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
              <Text style={styles.emptyText}>Ask me anything about the app!</Text>
            </View>
          }
        />

        <View style={styles.typingIndicatorContainer}>
            {loading && (
                <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color="#FFA500" />
                    <Text style={styles.typingText}>Guru is thinking...</Text>
                </View>
            )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about Sarvagya Learning..."
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

// --- Styles ---
const markdownStyles = StyleSheet.create({
  body: { fontSize: 16, color: '#333' },
  code_block: {
    backgroundColor: '#1E1E1E',
    color: '#D4D4D4',
    padding: 10,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  heading1: { fontSize: 24, fontWeight: 'bold', color: '#121212' },
  strong: { fontWeight: 'bold' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messageList: { flexGrow: 1, padding: 10 },
  messageBubble: { padding: 12, borderRadius: 20, marginBottom: 10, maxWidth: width * 0.8 },
  userMessage: { backgroundColor: '#FFA500', alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  tutorMessage: { backgroundColor: '#F0F0F0', alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  userMessageText: { color: '#fff', fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#FFA500',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingIndicatorContainer: {
    height: 30,
    justifyContent: 'center',
  },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20 },
  typingText: { marginLeft: 10, color: '#888', fontStyle: 'italic' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, fontSize: 20, fontWeight: 'bold', color: '#BDBDBD' },
});

export default DoubtClearingScreen;