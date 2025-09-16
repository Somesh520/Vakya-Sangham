import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../api';
import { TeacherStackParamList } from '../navigation/TeacherNavigator';
import { Course } from '../types/types';

type DashboardNavigationProp = StackNavigationProp<TeacherStackParamList, 'TeacherDashboard'>;

const TeacherDashboardScreen = () => {
    const navigation = useNavigation<DashboardNavigationProp>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchMyCourses = async () => {
                try {
                    setLoading(true);
                    const { data } = await api.get('/api/teacher/courses'); 
                    setCourses(data.courses || []);
                } catch (error) {
                    console.error("Failed to fetch courses:", error);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchMyCourses();
        }, [])
    );

    // ✅ Course delete karne ka function
    const handleDelete = async (courseId: string) => {
        try {
            await api.delete(`/api/teacher/courses/${courseId}`);
            
            // Screen se course ko turant hatayein
            setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
            
            Alert.alert('Success', 'Course has been deleted.');

        } catch (error: any) {
            console.error("Delete error:", error.response?.data);
            Alert.alert('Error', 'Failed to delete the course.');
        }
    };
  
    // ✅ Confirmation alert dikhane ka function
    const confirmDelete = (courseId: string, courseTitle: string) => {
        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    onPress: () => handleDelete(courseId),
                    style: "destructive"
                }
            ]
        );
    };

    // ✅ Course item ka design update kiya gaya
    const renderItem = ({ item }: { item: Course }) => (
        <View style={styles.courseItem}>
            {/* Course Details par click karke manage screen par ja सकते hain */}
            <TouchableOpacity 
                style={styles.courseDetails}
                onPress={() => navigation.navigate('CourseManage', { courseId: item._id })}
            >
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.courseDesc} numberOfLines={2}>{item.description}</Text>
            </TouchableOpacity>
            
            {/* Actions (Edit/Delete) */}
            <View style={styles.actionsContainer}>
                {/* --- EDIT BUTTON --- */}
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('CourseEdit', { course: item })}
                >
                    <Ionicons name="pencil" size={24} color="#42A5F5" />
                </TouchableOpacity>
                {/* --- DELETE BUTTON --- */}
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => confirmDelete(item._id, item.title)}
                >
                    <Ionicons name="trash" size={24} color="#E53935" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Courses</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CourseEdit', {})}>
                    <Ionicons name="add-circle" size={40} color="#FFA500" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={courses}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>You haven't created any courses yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    courseItem: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        padding: 16, 
        borderRadius: 8, 
        marginBottom: 12, 
        elevation: 2, 
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } 
    },
    courseDetails: {
        flex: 1, // Takes up most of the space
        marginRight: 10,
    },
    courseTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
    courseDesc: { fontSize: 14, color: '#666', marginTop: 4 },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8, // Makes the touch area larger
        marginLeft: 8,
    },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 18, color: '#888' },
});

export default TeacherDashboardScreen;