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
    Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const API_BASE = 'http://192.168.9.127:8000'; // Your backend IP

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AiTutorScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New state for language and lesson
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

    // Send language and lesson with the chat message
    socketRef.current.emit('chat', {
      query: input,
      language: selectedLanguage,
      lesson_to_teach: lessonToTeach || null, // Send null if no lesson is specified
      // You can still include previous messages if your backend supports it
      previous_query: messages[messages.length - 2]?.content || null,
      previous_response: messages[messages.length - 1]?.content || null,
    });

    setInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
        {/* --- Setup Section --- */}
        <View style={styles.setupContainer}>
            <Text style={styles.setupTitle}>AI Tutor Setup</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedLanguage}
                    onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    <Picker.Item label="English" value="English" />
                    <Picker.Item label="Hindi" value="Hindi" />
                    <Picker.Item label="Spanish" value="Spanish" />
                </Picker>
            </View>
            <TextInput
                style={styles.lessonInput}
                placeholder="Optional: What lesson should I teach?"
                placeholderTextColor="#aaa"
                value={lessonToTeach}
                onChangeText={setLessonToTeach}
            />
        </View>

        {/* --- Chat Section --- */}
        <ScrollView
            ref={scrollRef}
            style={styles.chatScrollView}
            contentContainerStyle={{ paddingBottom: 10 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
            {messages.map((msg, idx) => (
                <View key={idx} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                    <Text style={styles.messageText}>
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
                placeholderTextColor="#aaa"
                value={input}
                onChangeText={setInput}
                multiline
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={loading}>
                <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    setupContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    setupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    pickerContainer: {
        backgroundColor: '#333',
        borderRadius: 8,
        marginBottom: 10,
        ...Platform.select({
            ios: {
                padding: 0,
            },
            android: {
                paddingHorizontal: 10,
            }
        })
    },
    picker: {
        color: '#fff',
        height: Platform.OS === 'ios' ? 120 : 50,
    },
    pickerItem: {
        color: '#fff',
        height: 120,
    },
    lessonInput: {
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
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
        backgroundColor: '#444',
    },
    messageText: {
        color: '#fff',
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#333',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: '#fff',
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
