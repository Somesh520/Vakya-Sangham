import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList,
    TouchableOpacity, Image, ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import { useAuth } from '../AuthContext';
import api from '../api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from '../AppNavigator'; // Adjust path if needed
import Ionicons from 'react-native-vector-icons/Ionicons';

// --- Type Definitions ---
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
const { width } = Dimensions.get('window');

// --- Main Component ---
const StudentHomeScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
    const [myLearning, setMyLearning] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            // Use Promise.all to fetch data in parallel for better performance
            const [featuredRes, myLearningRes] = await Promise.all([
                api.get("/api/featured"),
                api.get("/api/users/my-learning")
            ]);
            setFeaturedCourses(featuredRes.data?.courses || []);
            setMyLearning(myLearningRes.data?.courses || []);
        } catch (error: any) {
            console.error("Error fetching data:", error.response?.data || error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]));

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    // --- Navigation Handlers ---
    const navigateToCourseDetail = (courseId: string, courseTitle: string) => {
        navigation.navigate('Courses', {
            screen: 'CourseDetail',
            params: { courseId, courseTitle },
        });
    };

    const navigateToCoursePlayer = (courseId: string) => {
        // This navigates to the player screen which sits on top of the tabs
        navigation.navigate('CoursePlayer', { courseId });
    };

    const navigateToCourseList = () => {
        navigation.navigate('Courses');
    };

    // --- Render Components ---
    const renderHeader = () => {
        const firstName = user?.fullname?.split(' ')[0] || 'Student';
        return (
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, {firstName}!</Text>
                        <Text style={styles.subtitle}>Let's start learning</Text>
                    </View>
                    {/* Notification Button Removed From Here */}
                </View>
            </View>
        );
    };

    const renderFeaturedCourse = ({ item }: { item: Course }) => (
        <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => navigateToCourseDetail(item._id, item.title)}
        >
            <Image
                source={{ uri: item.thumbnailURL || 'https://placehold.co/600x400/E2E8F0/333?text=Course' }}
                style={styles.featuredThumbnail}
            />
            <View style={styles.featuredCardContent}>
                <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.featuredInstructor}>by {item.instructor?.fullname || 'Instructor'}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderLearningItem = ({ item }: { item: Course }) => (
        <TouchableOpacity
            style={styles.learningItem}
            onPress={() => navigateToCoursePlayer(item._id)}
        >
            <Image
                source={{ uri: item.thumbnailURL || 'https://placehold.co/200x200/E2E8F0/333?text=...' }}
                style={styles.learningThumbnail}
            />
            <View style={styles.learningTextContainer}>
                <Text style={styles.learningTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.learningInstructor}>by {item.instructor?.fullname || 'Instructor'}</Text>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarForeground, { width: `${item.progress || 0}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{item.progress || 0}%</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderMyLearning = () => (
        <View>
            <Text style={styles.sectionTitle}>Continue Your Learning</Text>
            {myLearning.length > 0 ? (
                <FlatList
                    data={myLearning}
                    renderItem={renderLearningItem}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false} // The parent FlatList handles scrolling
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="rocket-outline" size={50} color="#4A90E2" />
                    <Text style={styles.emptyTitle}>Ready to learn?</Text>
                    <Text style={styles.emptySubtitle}>You haven't enrolled in any courses yet.</Text>
                    <TouchableOpacity style={styles.browseButton} onPress={navigateToCourseList}>
                        <Text style={styles.browseButtonText}>Browse Courses</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
    
    const renderFeaturedSection = () => (
        <View>
            <Text style={styles.sectionTitle}>Featured Courses</Text>
            <FlatList
                data={featuredCourses}
                renderItem={renderFeaturedCourse}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20, paddingRight: 5, paddingVertical: 10 }}
            />
        </View>
    );

    if (loading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#4A90E2" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={[{ key: 'content' }]} // Dummy data to enable the list structure
                keyExtractor={item => item.key}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A90E2']} />}
                ListHeaderComponent={renderHeader}
                renderItem={() => (
                    <>
                        {renderMyLearning()}
                        {renderFeaturedSection()}
                    </>
                )}
                contentContainerStyle={{ paddingBottom: 30 }}
            />
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    // Header
    headerContainer: { backgroundColor: '#E3F2FD', paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
    greeting: { fontSize: 28, fontWeight: 'bold', color: '#1A202C' },
    subtitle: { fontSize: 16, color: '#4A5568', marginTop: 4 },
    // You can also remove the notificationButton style if it's no longer used anywhere else
    // notificationButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20 },

    // Section Title
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A202C', marginHorizontal: 20, marginTop: 30, marginBottom: 15 },

    // Featured Course Card
    featuredCard: { width: width * 0.7, marginRight: 15, backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 4, shadowColor: '#9DA3B7', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    featuredThumbnail: { width: '100%', height: 150, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    featuredCardContent: { padding: 14 },
    featuredTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 4 },
    featuredInstructor: { fontSize: 13, color: '#718096' },

    // My Learning Item
    learningItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#9DA3B7', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, alignItems: 'center' },
    learningThumbnail: { width: 80, height: 80, borderRadius: 10, margin: 10 },
    learningTextContainer: { flex: 1, paddingVertical: 12, paddingRight: 12 },
    learningTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
    learningInstructor: { fontSize: 13, color: '#718096', marginTop: 4, marginBottom: 8 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto' },
    progressBarBackground: { flex: 1, height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
    progressBarForeground: { height: '100%', backgroundColor: '#4A90E2', borderRadius: 4 },
    progressText: { fontSize: 12, color: '#4A5568', marginLeft: 8, fontWeight: '600' },

    // Empty State
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 16 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginTop: 15 },
    emptySubtitle: { textAlign: 'center', color: '#718096', marginTop: 5, marginBottom: 20 },
    browseButton: { backgroundColor: '#4A90E2', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    browseButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default StudentHomeScreen;