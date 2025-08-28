import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, PermissionsAndroid, Platform
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import api from '../../api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker, { types } from 'react-native-document-picker';
import { TeacherStackParamList } from '../navigation/TeacherNavigator';
import { Course } from '../types/types';

type ManageScreenRouteProp = RouteProp<TeacherStackParamList, 'CourseManage'>;

const CourseManageScreen = () => {
    const route = useRoute<ManageScreenRouteProp>();
    const { courseId } = route.params;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    // ✅ 1. Upload percentage ke liye naya state
    const [uploadProgress, setUploadProgress] = useState(0);

    // Modals and Forms State
    const [moduleModalVisible, setModuleModalVisible] = useState(false);
    const [lessonModalVisible, setLessonModalVisible] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [moduleTitle, setModuleTitle] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonDuration, setLessonDuration] = useState('');
    const [lessonVideoFile, setLessonVideoFile] = useState<{ uri: string; type: string; name: string } | null>(null);

    // Permissions (No change)
    useEffect(() => {
        const requestPermissions = async () => {
            if (Platform.OS === 'android') {
                try {
                    const permission = Platform.Version >= 33
                        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
                        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
                    const granted = await PermissionsAndroid.request(permission);
                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert("Permission Denied", "You will not be able to select videos without storage permission.");
                    }
                } catch (err) {
                    console.warn(err);
                }
            }
        };
        requestPermissions();
    }, []);

    const fetchCourse = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/${courseId}`);
            setCourse(data.course);
        } catch (error) {
            Alert.alert("Error", "Could not load course details.");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useFocusEffect(fetchCourse);

    const pickVideo = useCallback(async () => {
        try {
            const doc = await DocumentPicker.pickSingle({ type: [types.video] });
            setLessonVideoFile({
                uri: doc.uri,
                type: doc.type || 'video/mp4',
                name: doc.name || `lesson_${Date.now()}.mp4`,
            });
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
                Alert.alert('Error', 'An unknown error occurred while picking the video.');
                console.error(err);
            }
        }
    }, []);

    const handleAddModule = async () => {
        if (!moduleTitle.trim()) return;
        try {
            const res = await api.post(`/api/${courseId}/modules`, { title: moduleTitle });
            setCourse(res.data.course);
            setModuleTitle('');
            setModuleModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to add module.');
        }
    };

    const handleAddLesson = async () => {
        if (!lessonTitle.trim() || !lessonVideoFile || !lessonDuration.trim() || !selectedModuleId) {
            Alert.alert("Missing Information", "Please provide a title, video file, and duration.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0); // Progress ko reset karein

        const formData = new FormData();
        formData.append('title', lessonTitle);
        formData.append('duration', lessonDuration);
        formData.append('video', {
            uri: lessonVideoFile.uri,
            type: lessonVideoFile.type,
            name: lessonVideoFile.name,
        });

        // ✅ 2. Axios request mein 'onUploadProgress' config add karein
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            },
        };

        try {
            const res = await api.post(
                `/api/${courseId}/modules/${selectedModuleId}/lessons`,
                formData,
                config // Yahan naya config object pass karein
            );

            setCourse(res.data.course);
            // Reset form
            setLessonTitle('');
            setLessonVideoFile(null);
            setLessonDuration('');
            setLessonModalVisible(false);
            setSelectedModuleId(null);

        } catch (error: any) {
            console.error("UPLOAD FAILED. Raw Error:", error);
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                 Alert.alert('Upload Failed', 'The request timed out. Please check your internet connection or increase the timeout in api.ts');
            } else if (error.message === 'Network Error') {
                Alert.alert('Upload Failed', 'Please check your internet connection. The server might be down.');
            } else {
                const serverMessage = error.response?.data?.message || 'An unknown error occurred.';
                Alert.alert('Upload Failed', serverMessage);
            }
        } finally {
            setIsUploading(false);
        }
    };

    if (loading && !isUploading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.courseTitle}>{course?.title}</Text>
                <Text style={styles.sectionTitle}>Course Content</Text>

                {course?.modules?.map((module) => (
                    <View key={module._id} style={styles.moduleContainer}>
                        <Text style={styles.moduleTitle}>{module.title}</Text>
                        {module.lessons.map((lesson, index) => (
                            <View key={lesson._id} style={styles.lessonItem}>
                                <Text style={styles.lessonNumber}>{index + 1}.</Text>
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
            </ScrollView>

            <Modal visible={lessonModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {isUploading ? (
                            <View style={styles.uploadingContainer}>
                                <ActivityIndicator size="large" color="#FFA500" />
                                {/* ✅ 3. Yahan percentage dikhayein */}
                                <Text style={styles.uploadingText}>
                                    Uploading: {uploadProgress}%
                                </Text>
                                <Text style={styles.uploadingSubText}>Please wait, this may take a moment.</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>Add New Lesson</Text>
                                <TextInput placeholder="Lesson Title" style={styles.input} value={lessonTitle} onChangeText={setLessonTitle} />
                                <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
                                    <Ionicons name="film-outline" size={24} color="#555" />
                                    <Text style={styles.uploadButtonText} numberOfLines={1}>
                                        {lessonVideoFile ? lessonVideoFile.name : 'Select Lesson Video'}
                                    </Text>
                                </TouchableOpacity>
                                <TextInput placeholder="Duration (in minutes)" style={styles.input} value={lessonDuration} onChangeText={setLessonDuration} keyboardType="numeric" />
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={styles.modalButton} onPress={handleAddLesson}>
                                        <Text style={styles.buttonText}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setLessonModalVisible(false)}>
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            
            <Modal visible={moduleModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Module</Text>
                        <TextInput placeholder="Module Title" style={styles.input} value={moduleTitle} onChangeText={setModuleTitle} />
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleAddModule}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModuleModalVisible(false)}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loader: { flex: 1, justifyContent: 'center' },
    courseTitle: { fontSize: 24, fontWeight: 'bold', padding: 20, textAlign: 'center', color: '#333' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10 },
    moduleContainer: { backgroundColor: 'white', marginHorizontal: 15, marginVertical: 8, borderRadius: 12, padding: 15, elevation: 2 },
    moduleTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    lessonItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginLeft: 10 },
    lessonNumber: { marginRight: 10, color: '#888', fontSize: 16 },
    lessonTitle: { marginLeft: 10, fontSize: 16, color: '#333' },
    addButton: { flexDirection: 'row', backgroundColor: '#FFA500', margin: 20, padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 3 },
    addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
    addButtonSmall: { flexDirection: 'row', borderWidth: 1, borderColor: '#FFA500', marginTop: 15, padding: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    addButtonTextSmall: { color: '#FFA500', fontWeight: 'bold', marginLeft: 5 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5, minHeight: 200, justifyContent: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
    uploadButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, },
    uploadButtonText: { marginLeft: 10, fontSize: 16, color: '#555', flex: 1, },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    modalButton: { backgroundColor: '#FFA500', padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
    cancelButton: { backgroundColor: '#888' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    uploadingContainer: { alignItems: 'center', justifyContent: 'center', padding: 20 },
    uploadingText: { marginBottom: 10, fontSize: 18, color: '#333', fontWeight: '600' },
    // ✅ 4. Naya style
    uploadingSubText: { fontSize: 14, color: '#666' },
});

export default CourseManageScreen;
