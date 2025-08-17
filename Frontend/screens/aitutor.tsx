// AiTutorScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Lesson {
  number: number;
  title: string;
}

const API_BASE = 'http://192.168.9.127:8000'; // Apna backend IP + port

const AiTutorScreen: React.FC = () => {
  const { userToken } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE}/lessons`)
      .then(res => res.json())
      .then(data => {
        setLessons(data.lessons || []);
      })
      .catch(err => {
        console.error('Error fetching lessons:', err);
      });
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setLoading(true);

    const body = {
      query: input,
      previous_query: messages.length > 0 ? messages[messages.length - 2]?.content : null,
      previous_response: messages.length > 0 ? messages[messages.length - 1]?.content : null,
      lesson_to_teach: null,
    };

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        { role: 'assistant', content: data?.response || '⚠️ No response from server.' }
      ]);
    } catch (error) {
      console.error("Chat request error:", error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '⚠️ Error: Could not connect to server.' }
      ]);
    }

    setInput('');
    setLoading(false);
  };

  const startLesson = async (lessonNum: number) => {
    if (lessonNum > currentLesson) return;

    const displayText = `*(Starting Lesson ${lessonNum})*`;
    const newMessages = [...messages, { role: 'user', content: displayText }];
    setMessages(newMessages);
    setLoading(true);

    const body = {
      query: `Direct instruction to teach lesson ${lessonNum}`,
      previous_query: null,
      previous_response: null,
      lesson_to_teach: lessonNum,
    };

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        { role: 'assistant', content: data?.response || `⚠️ No content for lesson ${lessonNum}.` }
      ]);

      if (lessonNum === currentLesson && lessonNum < lessons.length) {
        setCurrentLesson(prev => prev + 1);
      }
    } catch (error) {
      console.error("Lesson request error:", error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '⚠️ Error: Could not connect to server.' }
      ]);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 📚 Lesson Panel */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lessonPanel}>
        {lessons.map(lesson => {
          const isLocked = lesson.number > currentLesson;
          return (
            <TouchableOpacity
              key={lesson.number}
              onPress={() => startLesson(lesson.number)}
              style={[
                styles.lessonButton,
                isLocked ? styles.lockedLesson : styles.unlockedLesson
              ]}
              disabled={isLocked}
            >
              <Text style={styles.lessonNumber}>
                {lesson.number}
              </Text>
              <Text style={styles.lessonText}>
                {lesson.title}
              </Text>
              {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 💬 Chat Messages */}
      <ScrollView style={styles.chatContainer}>
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.message,
              msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator size="large" color="#FFA500" style={{ marginBottom: 10 }} />}

      {/* ✏️ Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
        />
        <Button title="Send" onPress={sendMessage} color="#FFA500" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },

  lessonPanel: { paddingVertical: 12, paddingHorizontal: 8, backgroundColor: '#1E1E1E', flexDirection: 'row' },

  lessonButton: {
    width: 90,
    height: 100,
    borderRadius: 16,
    padding: 10,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  unlockedLesson: {
    backgroundColor: '#FFA500',
  },
  lockedLesson: {
    backgroundColor: '#444',
  },
  lessonNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  lessonText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  lockIcon: {
    fontSize: 16,
    marginTop: 4,
  },

  chatContainer: { flex: 1, padding: 10 },

  message: { padding: 10, borderRadius: 8, marginVertical: 5, maxWidth: '80%' },
  userMessage: { backgroundColor: '#FFA500', alignSelf: 'flex-end' },
  assistantMessage: { backgroundColor: '#444', alignSelf: 'flex-start' },
  messageText: { color: '#fff' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  input: { flex: 1, borderColor: '#555', borderWidth: 1, borderRadius: 8, padding: 10, color: '#fff', marginRight: 5 },
});

export default AiTutorScreen;
