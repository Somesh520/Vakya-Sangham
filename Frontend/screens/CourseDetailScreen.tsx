import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList,
    TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../api';
import { useAuth } from '../AuthContext';

interface Lesson {
    _id: string;
    title: string;
    duration: number;
}

interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnailURL: string;
    instructor: { fullname: string };
    lessons: Lesson[];
    price: number;
}

const CourseDetailScreen = () => {
    const { user, updateUser } = useAuth();
    const route = useRoute();
    const navigation = useNavigation();
    const { courseId } = route.params as { courseId: string };

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    
    const fetchCourseDetails = useCallback(async () => {
        if (!courseId) return;
        setLoading(true);
        try {
            const res = await api.get(`/api/${courseId}`);
            if (res.data.success) {
                setCourse(res.data.course);
                const isUserEnrolled = user?.enrolledCourses?.includes(courseId) || false;
                setEnrolled(isUserEnrolled);
            }
        } catch (err) {
            console.error('Course fetch error:', err);
            Alert.alert('Error', 'Failed to fetch course details.');
        } finally {
            setLoading(false);
        }
    }, [courseId, user]);

    useEffect(() => {
        fetchCourseDetails();
    }, [fetchCourseDetails]);

    const handleEnroll = async () => {
        if (!course || !user) return;
        setEnrolling(true);
        try {
            const res = await api.post('/api/enrollment/enroll', { courseId });
            if (res.data.success) {
                Alert.alert('Success', 'You are now enrolled in this course!');
                setEnrolled(true);
                updateUser({ enrolledCourses: res.data.enrolledCourses });
            }
        } catch (err: any) {
            console.error('Enrollment error:', err.response?.data);
            Alert.alert('Error', err.response?.data?.message || 'Enrollment failed');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#FFA500" />
            </SafeAreaView>
        );
    }

    if (!course) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Course not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={course.lessons}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={
                    <View style={styles.content}>
                        <Text style={styles.title}>{course.title}</Text>
                        <Text style={styles.instructor}>by {course.instructor.fullname}</Text>
                        <Text style={styles.description}>{course.description}</Text>
                        <TouchableOpacity
                            style={[styles.enrollButton, enrolled && styles.enrolledButton]}
                            onPress={handleEnroll}
                            disabled={enrolled || enrolling}
                        >
                            <Text style={styles.enrollText}>
                                {enrolled
                                    ? 'Enrolled'
                                    : enrolling
                                    ? 'Enrolling...'
                                    : course.price > 0
                                    ? `Buy ₹${course.price}`
                                    : 'Enroll for Free'}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.sectionTitle}>Lessons</Text>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <View style={styles.lessonItem}>
                        <Text style={styles.lessonIndex}>{index + 1}.</Text>
                        <Text style={styles.lessonTitle}>
                            {item.title}
                        </Text>
                    </View>
                )}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F5F2' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { paddingTop: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
    instructor: { fontSize: 16, color: '#616161', marginBottom: 12 },
    description: { fontSize: 16, color: '#424242', lineHeight: 24, marginBottom: 15 },
    enrollButton: { backgroundColor: '#FFA500', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginVertical: 15, elevation: 2 },
    enrolledButton: { backgroundColor: '#BDBDBD' },
    enrollText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
    lessonItem: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
    lessonIndex: { width: 30, fontSize: 16, color: '#666' },
    lessonTitle: { flex: 1, fontSize: 16, color: '#333' },
});

export default CourseDetailScreen;