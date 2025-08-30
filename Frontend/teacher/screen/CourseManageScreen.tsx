import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Platform, PermissionsAndroid
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import api from '../../api'; // axios instance with Authorization header
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker, { types } from 'react-native-document-picker';
import { TeacherStackParamList } from '../navigation/TeacherNavigator';
import { Course, Lesson } from '../types/types';

type ManageScreenRouteProp = RouteProp<TeacherStackParamList, 'CourseManage'>;

const CourseManageScreen = () => {
    const route = useRoute<ManageScreenRouteProp>();
    const { courseId } = route.params;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [moduleModalVisible, setModuleModalVisible] = useState(false);
    const [lessonModalVisible, setLessonModalVisible] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

    const [moduleTitle, setModuleTitle] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonDuration, setLessonDuration] = useState('');
    const [lessonType, setLessonType] = useState<'video' | 'pdf'>('video');
    const [lessonVideoUrl, setLessonVideoUrl] = useState('');
    const [lessonPdfFile, setLessonPdfFile] = useState<{ uri: string; type: string; name: string } | null>(null);

    // Storage permissions
    useEffect(() => {
        const requestPermissions = async () => {
            if (Platform.OS === 'android') {
                const permission = Platform.Version >= 33 
                    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO 
                    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
                const granted = await PermissionsAndroid.request(permission);
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert("Permission Denied", "You need storage permission to upload files.");
                }
            }
        };
        requestPermissions();
    }, []);

    // Fetch course on focus
    useFocusEffect(
        useCallback(() => {
            const fetchCourse = async () => {
                try {
                    const { data } = await api.get(`/api/${courseId}`);
                    setCourse(data.course);
                } catch (error) {
                    console.error("Fetch Course Error:", error);
                    Alert.alert("Error", "Could not load course details.");
                } finally {
                    setLoading(false);
                }
            };
            fetchCourse();
        }, [courseId])
    );

    // ======= Add Module =======
 const handleAddModule = async () => {
    console.log("Add Module pressed");
    if (!moduleTitle.trim()) {
        Alert.alert("Error", "Module title required");
        return;
    }
    setIsSaving(true);
    try {
        const res = await api.post(`/api/${courseId}/modules`, { title: moduleTitle });
        console.log("Response:", res.data);
        setCourse(res.data.course);
        setModuleTitle('');
        setModuleModalVisible(false);
    } catch (error) {
        console.error("Add Module Error:", error);
        Alert.alert("Error", "Failed to add module");
    } finally {
        setIsSaving(false);
    }
};


    // ======= Pick PDF =======
    const pickPdf = useCallback(async () => {
        try {
            const doc = await DocumentPicker.pickSingle({ type: [types.pdf] });
            setLessonPdfFile({ uri: doc.uri, type: doc.type || 'application/pdf', name: doc.name || `lesson_${Date.now()}.pdf` });
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) Alert.alert('Error', 'Error picking PDF.');
        }
    }, []);

    // ======= Add Lesson =======
    const handleAddLesson = async () => {
        if (!lessonTitle.trim() || !lessonDuration.trim() || !selectedModuleId) {
            return Alert.alert("Incomplete Form", "Please fill all fields.");
        }

        if (lessonType === 'video' && !lessonVideoUrl.trim()) {
            return Alert.alert("Missing Video URL", "Please enter YouTube video link.");
        }

        if (lessonType === 'pdf' && !lessonPdfFile) {
            return Alert.alert("Missing PDF", "Please select a PDF file.");
        }

        setIsSaving(true);
        setUploadProgress(0);

        try {
            const endpoint = `/api/${courseId}/modules/${selectedModuleId}/lessons`;
            let res;

            if (lessonType === 'video') {
                res = await api.post(endpoint, { title: lessonTitle, duration: lessonDuration, lessonType, videoUrl: lessonVideoUrl });
            } else {
                const formData = new FormData();
                formData.append('title', lessonTitle);
                formData.append('duration', lessonDuration);
                formData.append('lessonType', 'pdf');
                formData.append('pdf', { uri: lessonPdfFile!.uri, type: lessonPdfFile!.type, name: lessonPdfFile!.name });

                res = await api.post(endpoint, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (event: any) => {
                        if (event.total) setUploadProgress(Math.round((event.loaded * 100) / event.total));
                    },
                });
            }

            if (res.data?.course) setCourse(res.data.course);

            // Reset form
            setLessonTitle('');
            setLessonDuration('');
            setLessonVideoUrl('');
            setLessonPdfFile(null);
            setLessonType('video');
            setSelectedModuleId(null);
            setLessonModalVisible(false);
        } catch (error: any) {
            console.error("Add Lesson Error:", error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Failed to add lesson.');
        } finally {
            setIsSaving(false);
            setUploadProgress(0);
        }
    };

    if (loading) return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#FFA500" /></View>;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.courseTitle}>{course?.title}</Text>
                <Text style={styles.sectionTitle}>Course Content</Text>

                {course?.modules?.map((module) => (
                    <View key={module._id} style={styles.moduleContainer}>
                        <Text style={styles.moduleTitle}>{module.title}</Text>
                        {module.lessons.map((lesson, idx) => (
                            <View key={lesson._id} style={styles.lessonItem}>
                                <Text style={styles.lessonNumber}>{idx + 1}.</Text>
                                <Ionicons name={lesson.lessonType === 'pdf' ? 'document-text-outline' : 'logo-youtube'} size={20} color={lesson.lessonType === 'pdf' ? '#D32F2F' : '#c4302b'} />
                                <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addButtonSmall} onPress={() => { setSelectedModuleId(module._id); setLessonModalVisible(true); }}>
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

            {/* Lesson Modal */}
            <Modal visible={lessonModalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {isSaving ? (
                            <View style={styles.uploadingContainer}>
                                <ActivityIndicator size="large" color="#FFA500" />
                                <Text style={styles.uploadingText}>{uploadProgress > 0 ? `Uploading: ${uploadProgress}%` : 'Saving...'}</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>Add Lesson</Text>
                                <View style={styles.typeSelectorContainer}>
                                    {['video', 'pdf'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[styles.typeButton, lessonType === type && styles.typeButtonActive]}
                                            onPress={() => setLessonType(type as 'video' | 'pdf')}
                                        >
                                            <Ionicons name={type === 'video' ? 'logo-youtube' : 'document-text-outline'} size={20} color={lessonType === type ? '#fff' : '#FFA500'} />
                                            <Text style={[styles.typeButtonText, lessonType === type && styles.typeButtonTextActive]}>{type === 'video' ? 'Video' : 'PDF'}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput placeholder="Lesson Title" style={styles.input} value={lessonTitle} onChangeText={setLessonTitle} />
                                {lessonType === 'video' ? (
                                    <TextInput placeholder="YouTube Video Link" style={styles.input} value={lessonVideoUrl} onChangeText={setLessonVideoUrl} />
                                ) : (
                                    <TouchableOpacity style={styles.uploadButton} onPress={pickPdf}>
                                        <Ionicons name="document-attach-outline" size={24} color="#555" />
                                        <Text style={styles.uploadButtonText}>{lessonPdfFile?.name || 'Select PDF'}</Text>
                                    </TouchableOpacity>
                                )}
                                <TextInput placeholder="Duration (min)" style={styles.input} value={lessonDuration} onChangeText={setLessonDuration} keyboardType="numeric" />
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={styles.modalButton} onPress={handleAddLesson} disabled={isSaving}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setLessonModalVisible(false)} disabled={isSaving}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Module Modal */}
            <Modal visible={moduleModalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {isSaving ? <ActivityIndicator size="large" color="#FFA500" /> : (
                            <>
                                <Text style={styles.modalTitle}>Add Module</Text>
                                <TextInput placeholder="Module Title" style={styles.input} value={moduleTitle} onChangeText={setModuleTitle} />
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={styles.modalButton} onPress={handleAddModule} disabled={isSaving}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModuleModalVisible(false)} disabled={isSaving}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

// Styles (unchanged)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    courseTitle: { fontSize: 24, fontWeight: 'bold', padding: 20, textAlign: 'center', color: '#333' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10 },
    moduleContainer: { backgroundColor: 'white', marginHorizontal: 15, marginVertical: 8, borderRadius: 12, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    moduleTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    lessonItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginLeft: 10 },
    lessonNumber: { marginRight: 10, color: '#888', fontSize: 16 },
    lessonTitle: { marginLeft: 10, fontSize: 16, color: '#333', flex: 1 },
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
    typeSelectorContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
    typeButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 10, borderWidth: 1.5, borderColor: '#FFA500', borderRadius: 8, marginHorizontal: 5 },
    typeButtonActive: { backgroundColor: '#FFA500' },
    typeButtonText: { color: '#FFA500', fontWeight: 'bold', marginLeft: 8 },
    typeButtonTextActive: { color: '#fff' },
});

export default CourseManageScreen;
