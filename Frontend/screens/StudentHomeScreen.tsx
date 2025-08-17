import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList,
    TouchableOpacity, Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { useAuth } from '../AuthContext';
import api from '../api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from '../AppNavigator'; // Adjust path if needed
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Course {
    _id: string;
    title: string;
    thumbnailURL: string;
    instructor: {
        fullname: string;
    };
    progress?: number;
}

type HomeScreenNavigationProp = BottomTabNavigationProp<AppTabParamList, 'Home'>;

const StudentHomeScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
    const [myLearning, setMyLearning] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => { /* ... (fetchData logic remains the same) ... */ }, [user]);
    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
    const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);
    const navigateToCourseDetail = (courseId: string, courseTitle: string) => {
        navigation.navigate('Courses', {
            screen: 'CourseDetail',
            params: { courseId, courseTitle },
        });
    };

    const renderCourseCard = ({ item }: { item: Course | null }) => {
        if (!item) return null;
        return (
            <TouchableOpacity
                style={styles.courseCard}
                onPress={() => navigateToCourseDetail(item._id, item.title)}
            >
                <Image source={{ uri: item.thumbnailURL || 'https://placehold.co/400x200?text=Course' }} style={styles.thumbnail} />
                <View style={styles.cardContent}>
                    <Text style={styles.courseTitleDarkBg} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.instructorNameDarkBg}>by {item.instructor?.fullname || 'Instructor'}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderLearningItem = ({ item }: { item: Course | null }) => {
        if (!item) return null;
        return (
            <TouchableOpacity
                key={item._id}
                style={styles.learningItem}
                onPress={() => navigateToCourseDetail(item._id, item.title)}
            >
                <Image source={{ uri: item.thumbnailURL || 'https://placehold.co/100x100?text=Course' }} style={styles.learningThumbnail} />
                <View style={styles.learningTextContainer}>
                    <Text style={styles.learningTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.learningInstructor}>by {item.instructor?.fullname || 'Instructor'}</Text>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarForeground, { width: `${(item.progress || 0) * 100}%` }]} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#FFA500" /></SafeAreaView>;
    }

    const firstName = user?.fullname?.split(' ')[0] || 'Student';
    
    // --- THIS IS THE FIX ---
    // We define the sections of our screen in an array
    const screenSections = [
        { type: 'HEADER', key: 'header' },
        { type: 'FEATURED', key: 'featured', data: featuredCourses },
        { type: 'LEARNING_TITLE', key: 'learning_title' },
        { type: 'LEARNING_LIST', key: 'learning_list', data: myLearning },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={screenSections}
                keyExtractor={item => item.key}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFA500']} />}
                renderItem={({ item }) => {
                    switch (item.type) {
                        case 'HEADER':
                            return (
                                <View style={styles.header}>
                                    <View>
                                        <Text style={styles.greeting}>Hello, {firstName}!</Text>
                                        <Text style={styles.subtitle}>What will you learn today?</Text>
                                    </View>
                                    <TouchableOpacity>
                                        <Ionicons name="search-outline" size={28} color="#333" />
                                    </TouchableOpacity>
                                </View>
                            );
                        case 'FEATURED':
                            return (
                                <>
                                    <Text style={styles.sectionTitle}>Featured Courses</Text>
                                    <FlatList
                                        data={item.data}
                                        renderItem={renderCourseCard}
                                        keyExtractor={(course) => course?._id || Math.random().toString()}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingLeft: 20, paddingBottom: 10 }}
                                    />
                                </>
                            );
                        case 'LEARNING_TITLE':
                            return <Text style={styles.sectionTitle}>Continue Your Learning</Text>;
                        case 'LEARNING_LIST':
                            return (
                                <FlatList
                                    data={item.data}
                                    renderItem={renderLearningItem}
                                    keyExtractor={(course) => course?._id || Math.random().toString()}
                                    scrollEnabled={false}
                                    contentContainerStyle={{ paddingHorizontal: 20 }}
                                    ListEmptyComponent={
                                        <View style={styles.emptyContainer}>
                                            <Text style={styles.noLearningText}>You haven't enrolled in any courses yet.</Text>
                                        </View>
                                    }
                                />
                            );
                        default:
                            return null;
                    }
                }}
            />
        </SafeAreaView>
    );
};

// ... (Your existing styles are fine)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    greeting: { fontSize: 28, fontWeight: 'bold', color: '#121212' },
    subtitle: { fontSize: 16, color: '#555', marginTop: 4 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', marginHorizontal: 20, marginTop: 30, marginBottom: 15 },
    courseCard: { width: 250, marginRight: 15, backgroundColor: '#0A2540', borderRadius: 16, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 4 } },
    thumbnail: { width: '100%', height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    cardContent: { padding: 14 },
    courseTitleDarkBg: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
    instructorNameDarkBg: { fontSize: 13, color: '#ccc' },
    learningItem: { flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    learningThumbnail: { width: 90, height: 90, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
    learningTextContainer: { flex: 1, padding: 12, justifyContent: 'center' },
    learningTitle: { fontSize: 16, fontWeight: 'bold', color: '#121212' },
    learningInstructor: { fontSize: 13, color: '#666', marginTop: 4, marginBottom: 8 },
    progressBarBackground: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden' },
    progressBarForeground: { height: '100%', backgroundColor: '#FFA500', borderRadius: 3 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: '#F8F9FA', borderRadius: 12 },
    noLearningText: { textAlign: 'center', color: '#616161' },
});

export default StudentHomeScreen;