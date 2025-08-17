import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../../api';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TeacherStackParamList } from '../navigation/TeacherNavigator'; // Adjust the path if needed

type EditScreenRouteProp = RouteProp<TeacherStackParamList, 'CourseEdit'>;

const CourseEditScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<EditScreenRouteProp>();
    const courseToEdit = route.params?.course;

    // --- 1. New State Variables Added ---
    const [title, setTitle] = useState(courseToEdit?.title || '');
    const [description, setDescription] = useState(courseToEdit?.description || '');
    const [category, setCategory] = useState(courseToEdit?.category || '');
    const [price, setPrice] = useState(courseToEdit?.price?.toString() || '');
    const [language, setLanguage] = useState(courseToEdit?.language || '');
    const [level, setLevel] = useState(courseToEdit?.level || '');
    
    const [isLoading, setIsLoading] = useState(false);

    // --- 2. handleSubmit Updated ---
    const handleSubmit = async () => {
        // Updated validation to check all required fields
        if (!title.trim() || !description.trim() || !category.trim() || !language.trim() || !level.trim()) {
            Alert.alert("Missing Information", "Please fill out all required fields.");
            return;
        }
        setIsLoading(true);
        try {
            // All fields are now included in the data sent to the backend
            const courseData = { 
                title, 
                description, 
                category, 
                price: Number(price) || 0, 
                language, 
                level 
            };

            if (courseToEdit) {
                await api.patch(`/api/teacher/courses/${courseToEdit._id}`, courseData);
            } else {
                await api.post('/api/teacher/courses', courseData);
            }
            navigation.goBack();
        } catch (error) {
            console.error("Failed to save course:", error);
            const message = error.response?.data?.message || "Could not save the course.";
            Alert.alert("Error", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            {/* --- 3. New Form Inputs Added --- */}
            <Text style={styles.label}>Course Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g., Introduction to Sanskrit" />
            
            <Text style={styles.label}>Course Description</Text>
            <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholder="Describe what students will learn." />
            
            <Text style={styles.label}>Category</Text>
            <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g., Language, Spirituality" />

            <Text style={styles.label}>Language</Text>
            <TextInput style={styles.input} value={language} onChangeText={setLanguage} placeholder="e.g., Sanskrit" />

            <Text style={styles.label}>Level</Text>
            <TextInput style={styles.input} value={level} onChangeText={setLevel} placeholder="e.g., Beginner, Intermediate, Advanced" />

            <Text style={styles.label}>Price (optional, 0 for free)</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g., 499" />
            
            <View style={styles.buttonContainer}>
                <Button title={isLoading ? "Saving..." : (courseToEdit ? "Update Course" : "Create Course")} onPress={handleSubmit} disabled={isLoading} color="#FFA500" />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 16, 
        backgroundColor: '#fff' 
    },
    label: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginBottom: 8, 
        marginTop: 16,
        color: '#333'
    },
    input: { 
        borderWidth: 1, 
        borderColor: '#ccc', 
        padding: 12, 
        borderRadius: 8, 
        fontSize: 16, 
        textAlignVertical: 'top',
        backgroundColor: '#f8f8f8'
    },
    buttonContainer: {
        marginTop: 32,
    }
});

export default CourseEditScreen;