import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Button,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';

// --- Configuration ---
const PYTHON_API_BASE_URL = "http://192.168.9.162:8000"; // Use 10.0.2.2 for Android Emulator

const AVAILABLE_LANGUAGES = [
  { label: 'Sanskrit', value: 'Sanskrit' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
];

const ALL_LESSONS = [
  { id: 1, title: 'Greetings' }, { id: 2, title: 'Numbers' },
  { id: 3, title: 'Common Phrases' }, { id: 4, title: 'Travel' }, { id: 5, title: 'Food' },
];
const lessonMap: Record<string, number> = {
  'Greetings': 1, 'Numbers': 2, 'Common Phrases': 3, 'Travel': 4, 'Food': 5
};

export default function AiTutorScreen() {
  const [appPhase, setAppPhase] = useState('loading');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [currentLessonNumber, setCurrentLessonNumber] = useState<number>(1);
  const [activeLessonTitle, setActiveLessonTitle] = useState<string>('');
  const [pickedLanguage, setPickedLanguage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const lang = await AsyncStorage.getItem('currentUserLanguage');
        const lessonNumStr = await AsyncStorage.getItem('currentLessonNumber');
        
        if (lang) {
          setSelectedLanguage(lang);
          setCurrentLessonNumber(lessonNumStr ? parseInt(lessonNumStr, 10) : 1);
          setAppPhase('lesson_overview');
        } else {
          setAppPhase('language_selection');
        }
      } catch (error) {
        console.error("Failed to load progress from AsyncStorage:", error);
        setAppPhase('language_selection');
      }
    };
    
    loadProgress();
  }, []);

  const handleSelectLanguage = async () => {
    if (!pickedLanguage) return;
    try {
      await AsyncStorage.setItem('currentUserLanguage', pickedLanguage);
      await AsyncStorage.setItem('currentLessonNumber', '1');
      setSelectedLanguage(pickedLanguage);
      setCurrentLessonNumber(1);
      setAppPhase('lesson_overview');
    } catch (error) {
      console.error("Failed to save language to AsyncStorage:", error);
    }
  };
  
  const handleCompleteLesson = async () => {
    try {
      const nextLessonNum = currentLessonNumber + 1;
      await AsyncStorage.setItem('currentLessonNumber', String(nextLessonNum));
      setCurrentLessonNumber(nextLessonNum);
      setAppPhase('lesson_overview');
    } catch (error) {
      console.error("Failed to complete lesson in AsyncStorage:", error);
    }
  };

  const handleStartLesson = async (lesson: { id: number; title: string }) => {
    setActiveLessonTitle(lesson.title);
    setMessages([]);
    setAppPhase('chat_active');
    setLoading(true);
    await sendMessageToPython(`Teach me Lesson ${lesson.id}: ${lesson.title}`, lesson.id);
    setLoading(false);
  };
  
  const handleResetProgress = async () => {
    try {
      await AsyncStorage.removeItem('currentUserLanguage');
      await AsyncStorage.removeItem('currentLessonNumber');
      setSelectedLanguage(null);
      setCurrentLessonNumber(1);
      setAppPhase('language_selection');
    } catch (error) {
      console.error("Failed to reset progress:", error);
    }
  };

  const sendMessageToPython = async (query: string, lessonId: number | null = null) => {
    if (!query.trim()) return;
    const newMessage = { role: "user", text: query };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);
    try {
      const pythonResponse = await fetch(`${PYTHON_API_BASE_URL}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query, language: selectedLanguage, lesson_to_teach: lessonId ? lessonMap[activeLessonTitle] : null,
        }),
      });
      const pythonData = await pythonResponse.json();
      setMessages((prev) => [...prev, { role: "assistant", text: pythonData.response || "No reply" }]);
    } catch (error) {
      console.error("Error connecting to Python AI:", error);
      setMessages((prev) => [...prev, { role: "assistant", text: "⚠️ Error connecting to AI tutor." }]);
    } finally {
      setLoading(false);
    }
  };
  
  const renderLoadingView = () => ( <View style={styles.centerContainer}><ActivityIndicator size="large" /><Text>Loading Progress...</Text></View> );
  
  const renderLanguageSelection = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>Choose a Language</Text>
      <View style={styles.pickerContainer}>
        <RNPickerSelect
            onValueChange={(value) => setPickedLanguage(value)}
            items={AVAILABLE_LANGUAGES}
            placeholder={{ label: "Select a language...", value: null }}
            style={pickerSelectStyles}
        />
      </View>
      <TouchableOpacity 
        style={[styles.bigButton, !pickedLanguage && styles.disabledButton]} 
        onPress={handleSelectLanguage}
        disabled={!pickedLanguage}
      >
        <Text style={styles.bigButtonText}>Start Learning</Text>
      </TouchableOpacity>
    </View> 
  );
  
  const renderLessonOverview = () => {
    const availableLessons = ALL_LESSONS
      .filter(lesson => lesson.id <= currentLessonNumber)
      .map(lesson => ({
          label: `${lesson.id === currentLessonNumber ? '▶️' : '✅'} Lesson ${lesson.id}: ${lesson.title}`,
          value: lesson.id,
      }));

    const handleLessonSelect = (lessonId: number) => {
      if (!lessonId) return;
      const lesson = ALL_LESSONS.find(l => l.id === lessonId);
      if (lesson) handleStartLesson(lesson);
    };
    
    return (
      <View style={styles.overviewContainer}>
        <Text style={styles.title}>Your Course</Text>
        <Text style={styles.subtitle}>Language: {selectedLanguage} (Locked)</Text>
        <Text style={styles.pickerLabel}>Select a Lesson</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
              onValueChange={(value) => handleLessonSelect(value)}
              items={availableLessons}
              placeholder={{ label: "Choose from available lessons...", value: null }}
              style={pickerSelectStyles}
              value={currentLessonNumber}
          />
        </View>
        <View style={{ marginTop: 20 }}>
          <Button title="Reset Progress & Choose New Language" onPress={handleResetProgress} color="red" />
        </View>
      </View> 
    );
  };
  
  const renderChatView = () => ( <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}><Text style={styles.chatHeader}>{activeLessonTitle}</Text><FlatList ref={flatListRef} data={messages} style={{ flex: 1, paddingHorizontal: 10 }} keyExtractor={(_, i) => i.toString()} renderItem={({ item }) => ( <View style={[ styles.message, item.role === "user" ? styles.user : styles.assistant ]}><Text style={item.role === "user" ? styles.userText : styles.assistantText}>{item.text}</Text></View> )} /><View style={{padding: 10}}><Button title="Mark Lesson as Complete" onPress={handleCompleteLesson} color="#28a745"/></View><View style={styles.inputContainer}><TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type your message..." /><TouchableOpacity style={styles.button} onPress={() => sendMessageToPython(input)}><Text style={styles.buttonText}>Send</Text></TouchableOpacity></View></KeyboardAvoidingView> );
  const renderContent = () => { switch (appPhase) { case 'language_selection': return renderLanguageSelection(); case 'lesson_overview': return renderLessonOverview(); case 'chat_active': return renderChatView(); case 'loading': default: return renderLoadingView(); }};
  return (<SafeAreaView style={styles.container}>{renderContent()}</SafeAreaView>);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  overviewContainer: { flex: 1, paddingTop: 40, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 18, marginBottom: 40, textAlign: 'center', color: '#666' },
  chatHeader: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 15, backgroundColor: '#fff' },
  bigButton: { backgroundColor: '#007bff', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10, marginTop: 20 },
  bigButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#a0a0a0' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff', width: '100%' },
  pickerLabel: { fontSize: 16, fontWeight: '500', marginBottom: 10, color: '#333' },
  message: { marginVertical: 5, padding: 12, borderRadius: 18, maxWidth: "85%" },
  user: { backgroundColor: "#007bff", alignSelf: "flex-end" },
  assistant: { backgroundColor: "#e5e5ea", alignSelf: "flex-start" },
  userText: { color: "#fff" },
  assistantText: { color: "#000" },
  inputContainer: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderColor: "#ddd", backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingVertical: 10, paddingHorizontal: 15, marginRight: 10 },
  button: { backgroundColor: "#007bff", borderRadius: 20, paddingHorizontal: 20, justifyContent: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, color: 'black' },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, color: 'black' },
});