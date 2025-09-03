import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

// --- App-wide Color Theme ---
const COLORS = {
  primary: '#FFC72C', 
  dark: '#34495E',
  light: '#FDF9F0',
  white: '#FFFFFF',
  grey: '#bdc3c7',
  success: '#2ECC71',
  danger: '#E74C3C',
};

// --- Configuration ---
const PYTHON_API_BASE_URL = "http://192.168.10.134:8000";

const AVAILABLE_LANGUAGES = [
  { label: 'Sanskrit', value: 'Sanskrit' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Telugu', value: 'Telugu' },
  { label: 'Marathi', value: 'Marathi' },
  { label: 'Panjabi', value: 'Punjabi' },
  { label: 'Kannada', value: 'Kannada' },
];

// --- Helper function to assign icons to lessons ---
const getIconForLesson = (lessonNumber) => {
    const icons = [
        'chatbubble-ellipses-outline', // Day 1: Greetings
        'list-outline',                // Day 2: Numbers
        'person-outline',              // Day 3: Pronouns
        'help-circle-outline',         // Day 4: Questions
        'time-outline',                // Day 5: Time/Days
        'people-outline',              // Day 6: Family
        'color-palette-outline',       // Day 7: Colors
        'reader-outline',              // Day 8: Sentence Structure
        'newspaper-outline',           // Day 9: Present Tense
        'move-outline',                // Day 10: Prepositions
        'cart-outline',                // Day 11: Shopping
        'fast-food-outline',           // Day 12: Restaurant
        'map-outline',                 // Day 13: Directions
        'game-controller-outline',     // Day 14: Hobbies
        'trophy-outline',              // Day 15: Review
    ];
    return icons[lessonNumber - 1] || 'book-outline'; 
};

// --- Main Component ---
export default function AiTutorScreen() {
  // State Management
  const [appPhase, setAppPhase] = useState('loading');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [currentLessonNumber, setCurrentLessonNumber] = useState<number>(1);
  const [activeLessonTitle, setActiveLessonTitle] = useState<string>('');
  const [pickedLanguage, setPickedLanguage] = useState<string | null>(null);
  const [lessonsList, setLessonsList] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [totalLessons, setTotalLessons] = useState(0); // Track total lessons count
  
  const flatListRef = useRef<FlatList>(null);

  // --- Effects ---

  // Effect to load saved progress from storage on initial app start
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
        console.error("Failed to load progress:", error);
        setAppPhase('language_selection');
      }
    };
    loadProgress();
  }, []);

  // Effect to fetch lessons from the backend whenever the selected language changes
  useEffect(() => {
    const fetchLessons = async (language) => {
      if (!language) return;
      
      setLessonsLoading(true);
      try {
        const response = await fetch(`${PYTHON_API_BASE_URL}/lessons?language=${language}`);
        const data = await response.json();
        
        const formattedLessons = data.lessons.map(lesson => ({
          id: lesson.number,
          title: lesson.title,
          icon: getIconForLesson(lesson.number),
        }));
        
        setLessonsList(formattedLessons);
        setTotalLessons(formattedLessons.length); // Store total lessons count
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        setLessonsList([]);
        setTotalLessons(0);
      } finally {
        setLessonsLoading(false);
      }
    };

    fetchLessons(selectedLanguage);
  }, [selectedLanguage]);

  // --- Helper Functions ---

  // Check if all lessons are completed
  const areAllLessonsCompleted = () => {
    return totalLessons > 0 && currentLessonNumber > totalLessons;
  };

  // Check if course can be changed (all lessons completed)
  const canChangeLanguage = () => {
    return areAllLessonsCompleted() || !selectedLanguage;
  };

  // --- Handler Functions ---

  const handleSelectLanguage = async () => {
    if (!pickedLanguage) return;
    try {
      await AsyncStorage.setItem('currentUserLanguage', pickedLanguage);
      await AsyncStorage.setItem('currentLessonNumber', '1');
      setSelectedLanguage(pickedLanguage);
      setCurrentLessonNumber(1);
      setAppPhase('lesson_overview');
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };
  
  const handleCompleteLesson = async () => {
    try {
      const nextLessonNum = currentLessonNumber + 1;
      await AsyncStorage.setItem('currentLessonNumber', String(nextLessonNum));
      setCurrentLessonNumber(nextLessonNum);
      
      // Check if this was the last lesson
      if (nextLessonNum > totalLessons) {
        // Course completed!
        Alert.alert(
          "🎉 Congratulations!",
          `You have completed the entire ${selectedLanguage} course! You can now choose a new language to learn.`,
          [{ text: "OK", onPress: () => setAppPhase('lesson_overview') }]
        );
      } else {
        setAppPhase('lesson_overview');
      }
    } catch (error) {
      console.error("Failed to complete lesson:", error);
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
    if (!canChangeLanguage()) {
      Alert.alert(
        "Cannot Change Language",
        `You must complete all ${totalLessons} lessons in ${selectedLanguage} before you can choose a new language. This helps maintain your learning consistency!`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Reset Progress?",
      "This will reset all your progress and allow you to choose a new language. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['currentUserLanguage', 'currentLessonNumber']);
              setSelectedLanguage(null);
              setCurrentLessonNumber(1);
              setTotalLessons(0);
              setAppPhase('language_selection');
              setLessonsList([]);
            } catch (error) {
              console.error("Failed to reset progress:", error);
            }
          }
        }
      ]
    );
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
          query, 
          language: selectedLanguage, 
          lesson_to_teach: lessonId,
        }),
      });
      if (!pythonResponse.ok) {
        throw new Error(`HTTP error! status: ${pythonResponse.status}`);
      }
      const pythonData = await pythonResponse.json();
      setMessages((prev) => [...prev, { role: "assistant", text: pythonData.response || "No reply" }]);
    } catch (error) {
      console.error("Error connecting to Python AI:", error);
      setMessages((prev) => [...prev, { role: "assistant", text: "⚠️ Error connecting to AI tutor. Please check the server." }]);
    } finally {
      setLoading(false);
    }
  };
  
  // --- Render Functions ---

  const renderLoadingView = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
  
  const renderLanguageSelection = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="school-outline" size={60} color={COLORS.primary} />
      <Text style={styles.title}>Welcome to Your AI Tutor</Text>
      <Text style={styles.subtitle}>Start by choosing a language to master.</Text>
      
      <View style={styles.cardContainer}>
        {AVAILABLE_LANGUAGES.map(lang => (
          <TouchableOpacity 
            key={lang.value} 
            style={[styles.langCard, pickedLanguage === lang.value && styles.langCardSelected]}
            onPress={() => setPickedLanguage(lang.value)}
          >
            <Text style={[styles.langCardText, pickedLanguage === lang.value && styles.langCardTextSelected]}>
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
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
  
  const renderLessonOverview = () => (
    <View style={styles.overviewContainer}>
        <View style={styles.overviewHeader}>
            <Text style={styles.title}>Your {selectedLanguage} Course</Text>
            <Text style={styles.subtitle}>Select a lesson to begin or review.</Text>
            
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Progress: {Math.min(currentLessonNumber - 1, totalLessons)} / {totalLessons} lessons completed
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${totalLessons > 0 ? (Math.min(currentLessonNumber - 1, totalLessons) / totalLessons) * 100 : 0}%` }
                  ]} 
                />
              </View>
              {areAllLessonsCompleted() && (
                <Text style={styles.completedText}>🎉 Course Completed! You can now choose a new language.</Text>
              )}
            </View>
        </View>
        
        {lessonsLoading ? (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Fetching lessons...</Text>
            </View>
        ) : lessonsList.length === 0 ? (
            <View style={styles.centerContainer}>
                <Ionicons name="cloud-offline-outline" size={50} color={COLORS.grey} />
                <Text style={styles.subtitle}>No lessons found for {selectedLanguage}.</Text>
                <Text style={styles.subtitle}>Please check the backend server.</Text>
            </View>
        ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {lessonsList.map(lesson => {
                    const isCompleted = lesson.id < currentLessonNumber;
                    const isCurrent = lesson.id === currentLessonNumber;
                    const isLocked = lesson.id > currentLessonNumber;
                    return (
                        <TouchableOpacity
                            key={lesson.id}
                            style={[styles.lessonCard, isLocked && styles.lessonCardLocked, isCurrent && styles.lessonCardCurrent]}
                            disabled={isLocked}
                            onPress={() => handleStartLesson(lesson)}
                        >
                            <Ionicons name={isLocked ? "lock-closed" : lesson.icon} size={28} color={isLocked ? COLORS.grey : isCurrent ? COLORS.white : COLORS.dark} />
                            <View style={styles.lessonCardTextContainer}>
                                <Text style={[styles.lessonCardTitle, (isLocked || isCurrent) && styles.lessonCardTitleAlt]}>{lesson.title}</Text>
                                {isCompleted && <Text style={styles.lessonCardStatusComplete}>Completed</Text>}
                                {isCurrent && <Text style={styles.lessonCardStatusCurrent}>Start Here!</Text>}
                                {isLocked && <Text style={styles.lessonCardStatusLocked}>Complete previous lesson to unlock</Text>}
                            </View>
                            {!isLocked && <Ionicons name="chevron-forward-outline" size={24} color={isCurrent ? COLORS.white : COLORS.dark} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        )}
        
        <TouchableOpacity 
          style={[styles.resetButton, !canChangeLanguage() && styles.disabledResetButton]} 
          onPress={handleResetProgress}
        >
            <Ionicons name={canChangeLanguage() ? "refresh-outline" : "lock-closed-outline"} size={16} color={canChangeLanguage() ? COLORS.danger : COLORS.grey} />
            <Text style={[styles.resetButtonText, !canChangeLanguage() && styles.disabledResetText]}>
              {canChangeLanguage() 
                ? "Choose New Language" 
                : `Complete all ${totalLessons} lessons to change language`
              }
            </Text>
        </TouchableOpacity>
    </View> 
  );
  
  const renderChatView = () => (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.light }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setAppPhase('lesson_overview')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.chatHeaderText}>{activeLessonTitle}</Text>
        <View style={{width: 40}} />
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        style={styles.chatList}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[ styles.message, item.role === "user" ? styles.user : styles.assistant ]}>
            <Text style={item.role === "user" ? styles.userText : styles.assistantText}>{item.text}</Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {loading && <ActivityIndicator style={{ marginVertical: 10 }} color={COLORS.primary} />}
      <View style={styles.chatFooter}>
        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteLesson}>
          <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.white} />
          <Text style={styles.bigButtonText}>Mark as Complete</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question or practice..."
          placeholderTextColor={COLORS.grey}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => sendMessageToPython(input)} disabled={!input.trim()}>
          <Ionicons name="arrow-up-circle" size={40} color={!input.trim() ? COLORS.grey : COLORS.primary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderContent = () => {
    switch (appPhase) {
      case 'language_selection': return renderLanguageSelection();
      case 'lesson_overview': return renderLessonOverview();
      case 'chat_active': return renderChatView();
      case 'loading':
      default: return renderLoadingView();
    }
  };

  return (<SafeAreaView style={styles.container}>{renderContent()}</SafeAreaView>);
}

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  overviewContainer: { flex: 1, backgroundColor: COLORS.light },
  overviewHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark, textAlign: 'center' },
  subtitle: { fontSize: 16, color: COLORS.dark, textAlign: 'center', marginTop: 8, opacity: 0.7 },
  loadingText: { marginTop: 10, color: COLORS.dark, fontSize: 16, fontWeight: '500' },
  cardContainer: { width: '100%', padding: 10, marginTop: 20 },
  
  // Progress Indicator Styles
  progressContainer: { marginTop: 15, paddingHorizontal: 10 },
  progressText: { fontSize: 14, color: COLORS.dark, textAlign: 'center', marginBottom: 8, fontWeight: '500' },
  progressBar: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  completedText: { fontSize: 14, color: COLORS.success, textAlign: 'center', marginTop: 8, fontWeight: '600' },
  
  langCard: { backgroundColor: COLORS.white, padding: 20, borderRadius: 12, borderWidth: 2, borderColor: COLORS.grey, marginBottom: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 3 },
  langCardSelected: { borderColor: COLORS.primary, backgroundColor: '#FFFBEA' },
  langCardText: { fontSize: 18, fontWeight: '600', color: COLORS.dark },
  lessonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 12, marginHorizontal: 20, marginBottom: 10, borderWidth: 1, borderColor: '#EAEAEA' },
  lessonCardLocked: { backgroundColor: '#F0F0F0' },
  lessonCardCurrent: { backgroundColor: COLORS.dark },
  lessonCardTextContainer: { flex: 1, marginLeft: 15 },
  lessonCardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark },
  lessonCardTitleAlt: { color: COLORS.white },
  lessonCardStatusComplete: { fontSize: 12, color: COLORS.success, fontWeight: '500' },
  lessonCardStatusCurrent: { fontSize: 12, color: COLORS.white, fontWeight: '500' },
  lessonCardStatusLocked: { fontSize: 12, color: COLORS.grey },
  bigButton: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 20, width: '90%' },
  bigButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  disabledButton: { backgroundColor: COLORS.grey },
  resetButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20 },
  resetButtonText: { color: COLORS.danger, marginLeft: 5, fontWeight: '600', textDecorationLine: 'underline' },
  disabledResetButton: { opacity: 0.6 },
  disabledResetText: { color: COLORS.grey, textDecorationLine: 'none' },
  completeButton: { backgroundColor: COLORS.success, flexDirection: 'row', gap: 10, paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  chatHeaderText: { fontSize: 20, fontWeight: 'bold', color: COLORS.dark },
  backButton: { padding: 5 },
  chatList: { flex: 1, paddingHorizontal: 10 },
  chatFooter: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: COLORS.light },
  message: { marginVertical: 5, padding: 12, borderRadius: 18, maxWidth: "85%" },
  user: { backgroundColor: COLORS.dark, alignSelf: "flex-end", borderBottomRightRadius: 4 },
  assistant: { backgroundColor: COLORS.white, alignSelf: "flex-start", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#EAEAEA' },
  userText: { color: COLORS.white, fontSize: 16, lineHeight: 22 },
  assistantText: { color: COLORS.dark, fontSize: 16, lineHeight: 22 },
  inputContainer: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderColor: "#EAEAEA", backgroundColor: COLORS.white, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 20, paddingVertical: Platform.OS === 'ios' ? 12 : 8, paddingHorizontal: 15, marginRight: 10, fontSize: 16, color: COLORS.dark },
  sendButton: { justifyContent: "center", alignItems: 'center' },
});