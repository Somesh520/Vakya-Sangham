import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../api';
import { TeacherStackParamList } from '../navigation/TeacherNavigator';
import { Course } from '../types/types'; // Now imports from your new types file

type DashboardNavigationProp = StackNavigationProp<TeacherStackParamList, 'TeacherDashboard'>;

const TeacherDashboardScreen = () => {
    const navigation = useNavigation<DashboardNavigationProp>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    // --- FIX for async effect ---
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

    const renderItem = ({ item }: { item: Course }) => (
        <TouchableOpacity 
            style={styles.courseItem} 
            onPress={() => navigation.navigate('CourseManage', { courseId: item._id })}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.courseDesc} numberOfLines={2}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#555" />
        </TouchableOpacity>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    courseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    courseTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
    courseDesc: { fontSize: 14, color: '#666', marginTop: 4 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 18, color: '#888' },
});

export default TeacherDashboardScreen;