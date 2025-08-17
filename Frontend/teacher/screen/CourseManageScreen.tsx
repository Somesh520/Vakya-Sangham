import React, { useState, useCallback } from 'react';
import { View, Text, Button, Alert, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import api from '../../api';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DocumentPicker from 'react-native-document-picker';
import { TeacherStackParamList } from '../navigation/TeacherNavigator';
import { Course } from '../types/types';

type ManageScreenRouteProp = RouteProp<TeacherStackParamList, 'CourseManage'>;
type ManageScreenNavigationProp = StackNavigationProp<TeacherStackParamList, 'CourseManage'>;

const CourseManageScreen = () => {
    const navigation = useNavigation<ManageScreenNavigationProp>();
    const route = useRoute<ManageScreenRouteProp>();
    const { courseId } = route.params;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCourse = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/api/teacher/courses/${courseId}`);
            setCourse(data.course);
        } catch (error) {
            console.error("Failed to fetch course details:", error);
            Alert.alert("Error", "Could not load course details.");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useFocusEffect(fetchCourse);

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
                            await api.delete(`/api/teacher/courses/${courseId}`);
                            Alert.alert("Success", "Course deleted successfully.");
                            navigation.goBack();
                        } catch (error) {
                            console.error("Delete failed:", error.response?.data);
                            // This shows the specific error message from the backend
                            const message = error.response?.data?.message || "An unknown error occurred.";
                            Alert.alert("Deletion Failed", message);
                        }
                    }
                },
            ]
        );
    };

    const handleUpload = async () => {
        try {
            const res = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.pdf, DocumentPicker.types.plainText],
            });
            
            const formData = new FormData();
            formData.append('material', {
                uri: res.uri,
                type: res.type,
                name: res.name,
            });
            
            await api.post(`/api/teacher/courses/${courseId}/materials`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert("Success", "Material uploaded successfully!");
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
                console.log("User cancelled the document picker.");
            } else {
                console.log("Upload error:", err);
                Alert.alert("Error", "Could not upload the file.");
            }
        }
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

                <View style={styles.actionsContainer}>
                    <View style={styles.buttonContainer}>
                        <Button title="Upload Material (PDF/TXT)" onPress={handleUpload} color="#FFA500" />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="Edit Course Info" onPress={() => navigation.navigate('CourseEdit', { course })} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="Delete Course" color="#c0392b" onPress={handleDelete} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    loader: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    errorText: { 
        textAlign: 'center', 
        marginTop: 20, 
        fontSize: 18, 
        color: '#666'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        margin: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 }
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 8,
        color: '#333'
    },
    description: { 
        fontSize: 16, 
        color: '#666', 
        lineHeight: 24 
    },
    actionsContainer: {
        marginHorizontal: 16,
    },
    buttonContainer: { 
        marginTop: 16 
    },
});

export default CourseManageScreen;