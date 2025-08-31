import io from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import { 
    SafeAreaView, 
    ScrollView, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ActivityIndicator,
    StyleSheet,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const API_BASE = 'http://192.168.9.127:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AiTutorScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [lessonToTeach, setLessonToTeach] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(API_BASE);

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('assistant_chunk', (chunk: string) => {
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1]?.role === 'assistant') {
          updated[updated.length - 1].content += chunk;
        } else {
          updated.push({ role: 'assistant', content: chunk });
        }
        return updated;
      });
    });

    socketRef.current.on('assistant_done', () => {
      setLoading(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setLoading(true);

    socketRef.current.emit('chat', {
      query: input,
      language: selectedLanguage,
      lesson_to_teach: lessonToTeach || null,
      previous_query: messages[messages.length - 2]?.content || null,
      previous_response: messages[messages.length - 1]?.content || null,
    });

    setInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
        >
            {/* --- Setup Section --- */}
            <View style={styles.setupContainer}>
                <Text style={styles.setupTitle}>AI Tutor Setup</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedLanguage}
                        onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="English" value="English" />
                        <Picker.Item label="Hindi" value="Hindi" />
                        <Picker.Item label="Spanish" value="Spanish" />
                    </Picker>
                </View>
                <TextInput
                    style={styles.lessonInput}
                    placeholder="Optional: Current Lesson?"
                    placeholderTextColor="#777"
                    value={lessonToTeach}
                    onChangeText={setLessonToTeach}
                />
            </View>

            {/* --- Chat Section --- */}
            <ScrollView
                ref={scrollRef}
                style={styles.chatScrollView}
                contentContainerStyle={{ paddingBottom: 10, flexGrow: 1 }}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg, idx) => (
                    <View key={idx} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                        <Text style={[styles.messageText, msg.role === 'user' ? styles.userMessageText : styles.assistantMessageText]}>
                            {msg.content}
                        </Text>
                    </View>
                ))}
                {loading && messages[messages.length -1]?.role === 'user' && (
                    <View style={[styles.messageBubble, styles.assistantBubble]}>
                        <ActivityIndicator size="small" color="#FFA500" />
                    </View>
                )}
            </ScrollView>

            {/* --- Input Section --- */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    placeholderTextColor="#777"
                    value={input}
                    onChangeText={setInput}
                    multiline
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={loading}>
                    <Ionicons name="send" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5E8C7' },
    keyboardAvoidingView: { flex: 1 },
    setupContainer: {
        padding: 15,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#A19A8F',
    },
    setupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A4135',
        marginBottom: 10,
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF', // Changed to white
        borderRadius: 8,
        marginBottom: 10,
    },
    picker: {
        color: '#4A4135', // Dark text for white background
    },
    lessonInput: {
        backgroundColor: '#FFFFFF', // Changed to white
        borderRadius: 8,
        padding: 12,
        color: '#4A4135', // Dark text for white background
        fontSize: 16,
    },
    chatScrollView: {
        flex: 1,
        padding: 10,
    },
    messageBubble: {
        marginVertical: 5,
        padding: 12,
        borderRadius: 12,
        maxWidth: '80%',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#FFA500',
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF', // Changed to white
    },
    messageText: {
        fontSize: 16,
    },
    userMessageText: {
        color: '#fff',
    },
    assistantMessageText: {
        color: '#4A4135',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#A19A8F',
        alignItems: 'center',
        backgroundColor: '#FCF0DB',
    },
    input: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Changed to white
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: '#4A4135',
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#FFA500',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AiTutorScreen;