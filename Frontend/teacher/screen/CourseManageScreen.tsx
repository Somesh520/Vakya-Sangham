import React, { useState, useCallback } from 'react';
import { 
    View, Text, Button, Alert, StyleSheet, ScrollView, 
    ActivityIndicator, SafeAreaView, TouchableOpacity, Modal, TextInput 
} from 'react-native';
import api from '../../api';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DocumentPicker from 'react-native-document-picker';
import { TeacherStackParamList } from '../navigation/TeacherNavigator';
import { Course } from '../types/types'; // Assuming you have this types file
import Ionicons from 'react-native-vector-icons/Ionicons';

type ManageScreenRouteProp = RouteProp<TeacherStackParamList, 'CourseManage'>;
type ManageScreenNavigationProp = StackNavigationProp<TeacherStackParamList, 'CourseManage'>;

// ✅ UPDATED: Make sure your Course type in types.ts includes modules
/*
export interface Course {
    _id: string;
    title: string;
    description: string;
    modules: {
        _id: string;
        title: string;
        lessons: {
            _id: string;
            title: string;
        }[];
    }[];
}
*/

const CourseManageScreen = () => {
    const navigation = useNavigation<ManageScreenNavigationProp>();
    const route = useRoute<ManageScreenRouteProp>();
    const { courseId } = route.params;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    // --- State for Modals and Forms ---
    const [moduleModalVisible, setModuleModalVisible] = useState(false);
    const [lessonModalVisible, setLessonModalVisible] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [moduleTitle, setModuleTitle] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonVideoURL, setLessonVideoURL] = useState('');
    const [lessonDuration, setLessonDuration] = useState('');

    const fetchCourse = useCallback(async () => {
        try {
            // No need to set loading here as it's handled by the main loading state
            const { data } = await api.get(`/api/courses/${courseId}`); // Using the general course route
            setCourse(data.course);
        } catch (error) {
            console.error("Failed to fetch course details:", error);
            Alert.alert("Error", "Could not load course details.");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useFocusEffect(fetchCourse);

    // --- API Handlers for Modules and Lessons ---
    const handleAddModule = async () => {
        if (!moduleTitle.trim()) return;
        try {
            const res = await api.post(`/api/courses/${courseId}/modules`, { title: moduleTitle });
            setCourse(res.data.course);
            setModuleTitle('');
            setModuleModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to add module.');
        }
    };

    const handleAddLesson = async () => {
        if (!lessonTitle.trim() || !lessonVideoURL.trim() || !lessonDuration.trim() || !selectedModuleId) return;
        try {
            const res = await api.post(`/api/courses/${courseId}/modules/${selectedModuleId}/lessons`, {
                title: lessonTitle,
                videoURL: lessonVideoURL,
                duration: parseInt(lessonDuration, 10)
            });
            setCourse(res.data.course);
            setLessonTitle('');
            setLessonVideoURL('');
            setLessonDuration('');
            setLessonModalVisible(false);
            setSelectedModuleId(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to add lesson.');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Course", 
            "Are you sure? This action cannot be undone.", 
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/api/courses/${courseId}`);
                            Alert.alert("Success", "Course deleted successfully.");
                            navigation.goBack();
                        } catch (error) {
                            const message = error.response?.data?.message || "An unknown error occurred.";
                            Alert.alert("Deletion Failed", message);
                        }
                    }
                },
            ]
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    if (!course) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Course not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.card}>
                    <Text style={styles.title}>{course.title}</Text>
                    <Text style={styles.description}>{course.description}</Text>
                </View>

                {/* --- Modules and Lessons Section --- */}
                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>Course Content</Text>
                    {course.modules.map((module) => (
                        <View key={module._id} style={styles.moduleContainer}>
                            <Text style={styles.moduleTitle}>{module.title}</Text>
                            {module.lessons.map((lesson) => (
                                <View key={lesson._id} style={styles.lessonItem}>
                                    <Ionicons name="play-circle-outline" size={20} color="#555" />
                                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                </View>
                            ))}
                            <TouchableOpacity 
                                style={styles.addButtonSmall}
                                onPress={() => {
                                    setSelectedModuleId(module._id);
                                    setLessonModalVisible(true);
                                }}
                            >
                                <Ionicons name="add" size={20} color="#FFA500" />
                                <Text style={styles.addButtonTextSmall}>Add Lesson</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addButton} onPress={() => setModuleModalVisible(true)}>
                        <Ionicons name="add-circle" size={24} color="#fff" />
                        <Text style={styles.addButtonText}>Add New Module</Text>
                    </TouchableOpacity>
                </View>

                {/* --- Actions Section --- */}
                <View style={styles.actionsContainer}>
                    <View style={styles.buttonContainer}>
                        <Button title="Edit Course Info" onPress={() => navigation.navigate('CourseEdit', { course })} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="Delete Course" color="#c0392b" onPress={handleDelete} />
                    </View>
                </View>
            </ScrollView>

            {/* --- Modals for Adding Content --- */}
            <Modal visible={moduleModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Module</Text>
                        <TextInput placeholder="Module Title" style={styles.input} value={moduleTitle} onChangeText={setModuleTitle} />
                        <View style={styles.buttonRow}>
                            <Button title="Save" onPress={handleAddModule} color="#FFA500" />
                            <Button title="Cancel" onPress={() => setModuleModalVisible(false)} color="#888" />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={lessonModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Lesson</Text>
                        <TextInput placeholder="Lesson Title" style={styles.input} value={lessonTitle} onChangeText={setLessonTitle} />
                        <TextInput placeholder="Video URL (e.g., from Cloudinary)" style={styles.input} value={lessonVideoURL} onChangeText={setLessonVideoURL} />
                        <TextInput placeholder="Duration (in minutes)" style={styles.input} value={lessonDuration} onChangeText={setLessonDuration} keyboardType="numeric" />
                        <View style={styles.buttonRow}>
                            <Button title="Save" onPress={handleAddLesson} color="#FFA500" />
                            <Button title="Cancel" onPress={() => setLessonModalVisible(false)} color="#888" />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { textAlign: 'center', marginTop: 20, fontSize: 18, color: '#666' },
    card: { backgroundColor: '#fff', borderRadius: 8, padding: 20, margin: 16, elevation: 3 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    description: { fontSize: 16, color: '#666', lineHeight: 24 },
    contentSection: { marginHorizontal: 16, marginTop: 10 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    moduleContainer: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginBottom: 15, elevation: 2 },
    moduleTitle: { fontSize: 18, fontWeight: '600', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10 },
    lessonItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginLeft: 10 },
    lessonTitle: { marginLeft: 10, fontSize: 16 },
    addButton: { flexDirection: 'row', backgroundColor: '#FFA500', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 3, marginTop: 10 },
    addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
    addButtonSmall: { flexDirection: 'row', borderWidth: 1, borderColor: '#FFA500', marginTop: 15, padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    addButtonTextSmall: { color: '#FFA500', fontWeight: 'bold', marginLeft: 5 },
    actionsContainer: { marginHorizontal: 16, marginTop: 20, paddingBottom: 40 },
    buttonContainer: { marginTop: 16 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 15, fontSize: 16 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
});

export default CourseManageScreen;
