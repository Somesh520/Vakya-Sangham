import React, { useState, useEffect, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    SafeAreaView,
    LayoutAnimation,
    UIManager,
    Platform,
    Image
} from 'react-native';
import Video, { OnVideoErrorData } from 'react-native-video';
import api from '../api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Type Definitions ---
interface Lesson { _id: string; title: string; videoURL: string; duration: number; }
interface Module { _id: string; title: string; lessons: Lesson[]; }
interface Course { _id: string; title: string; thumbnailURL?: string; instructor: { fullname: string }; modules: Module[]; }
type MainStackParamList = { MainTabs: undefined; CoursePlayer: { courseId: string }; };
type CoursePlayerScreenProps = { route: RouteProp<MainStackParamList, 'CoursePlayer'>; navigation: NativeStackNavigationProp<MainStackParamList, 'CoursePlayer'>; };

// --- Main Component ---
const CoursePlayerScreen = ({ route, navigation }: CoursePlayerScreenProps) => {
    const { courseId } = route.params;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [openModuleIds, setOpenModuleIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchCourseContent = async () => {
            try {
                const { data } = await api.get(`/api/${courseId}/content`);
                setCourse(data.course);
                
                if (data.userProgress?.completedLessons) {
                    setCompletedLessons(new Set(data.userProgress.completedLessons));
                }

                if (data.course?.modules?.length > 0) {
                    setOpenModuleIds(new Set([data.course.modules[0]._id]));
                }
            } catch (error: any) {
                const message = error.response?.status === 403 
                    ? "Please enroll in this course to view the content."
                    : "Could not load course content.";
                Alert.alert("Error", message, [{ text: "OK", onPress: () => navigation.goBack() }]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseContent();
    }, [courseId, navigation]);

    const toggleModule = (moduleId: string) => { 
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenModuleIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(moduleId)) { newIds.delete(moduleId); } else { newIds.add(moduleId); }
            return newIds;
        });
    };
    
    // ✅ This function finds and plays the first lesson
    const playFirstLesson = () => {
        if (course?.modules?.[0]?.lessons?.[0]) {
            setSelectedLesson(course.modules[0].lessons[0]);
        } else {
            Alert.alert("No Lessons", "This course doesn't have any lessons available yet.");
        }
    };

    const markLessonAsComplete = async () => {
        if (!selectedLesson || completedLessons.has(selectedLesson._id)) return;
        try {
            await api.post('/api/progress/complete-lesson', {
                courseId: course?._id,
                lessonId: selectedLesson._id,
            });
            setCompletedLessons(prev => new Set(prev).add(selectedLesson._id));
        } catch (error) {
            console.error("Failed to mark lesson as complete:", error);
        }
    };

    const progressInfo = useMemo(() => {
        if (!course?.modules) return { totalLessons: 0, progressPercentage: 0 };
        const total = course.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
        if (total === 0) return { totalLessons: 0, progressPercentage: 0 };
        const percentage = Math.round((completedLessons.size / total) * 100);
        return { totalLessons: total, progressPercentage: percentage };
    }, [course, completedLessons]);

    if (loading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#4A90E2" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.playerArea}>
                {selectedLesson ? (
                    <Video
                        source={{ uri: selectedLesson.videoURL }}
                        style={styles.videoPlayer}
                        controls={true}
                        resizeMode="contain"
                        onEnd={markLessonAsComplete}
                        onError={(e: OnVideoErrorData) => console.error("Video Error:", JSON.stringify(e))}
                    />
                ) : (
                    // ✅ This is now a TouchableOpacity that calls playFirstLesson
                    <TouchableOpacity style={styles.thumbnailContainer} onPress={playFirstLesson} activeOpacity={0.8}>
                        <Image 
                            source={{ uri: course?.thumbnailURL || 'https://placehold.co/600x400/000000/FFFFFF?text=Course' }} 
                            style={styles.thumbnail} 
                        />
                        <View style={styles.thumbnailOverlay}>
                            <Ionicons name="play-circle-outline" size={60} color="rgba(255, 255, 255, 0.9)" />
                            <Text style={styles.thumbnailText}>Start Course</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.contentContainer}>
                <View style={styles.headerInfo}>
                    <Text style={styles.lessonTitleHeader}>{selectedLesson?.title || course?.title || 'Course Content'}</Text>
                    <Text style={styles.instructor}>by {course?.instructor?.fullname}</Text>
                    
                    <View style={styles.progressWrapper}>
                        <View style={styles.progressHeader}>
                           <Text style={styles.progressText}>{progressInfo.progressPercentage}% Complete</Text>
                           <Text style={styles.progressDetail}>{completedLessons.size} of {progressInfo.totalLessons} lessons</Text>
                        </View>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarForeground, { width: `${progressInfo.progressPercentage}%` }]} />
                        </View>
                    </View>
                </View>
                
                <Text style={styles.playlistHeader}>Course Playlist</Text>

                {course?.modules.map((module, index) => {
                    const isOpen = openModuleIds.has(module._id);
                    return (
                        <View key={module._id} style={styles.moduleContainer}>
                            <TouchableOpacity style={styles.moduleHeader} onPress={() => toggleModule(module._id)}>
                                <View style={styles.moduleHeaderText}>
                                    <Text style={styles.moduleIndex}>Section {index + 1}</Text>
                                    <Text style={styles.moduleTitle}>{module.title}</Text>
                                </View>
                                <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={22} color="#4A5568" />
                            </TouchableOpacity>
                            
                            {isOpen && (
                                <View style={styles.lessonsList}>
                                    {module.lessons.map(lesson => {
                                        const isCompleted = completedLessons.has(lesson._id);
                                        const isSelected = selectedLesson?._id === lesson._id;
                                        const iconName = isCompleted ? "checkmark-circle" : (isSelected ? "play-circle" : "play-circle-outline");
                                        const iconColor = isCompleted ? "#28a745" : (isSelected ? "#4A90E2" : "#718096");

                                        return (
                                            <TouchableOpacity 
                                                key={lesson._id} 
                                                style={[styles.lessonItem, isSelected && styles.selectedLessonItem]}
                                                onPress={() => setSelectedLesson(lesson)}
                                            >
                                                <Ionicons name={iconName} size={26} color={iconColor} />
                                                <Text style={[styles.lessonTitle, isSelected && styles.selectedLessonTitle]}>{lesson.title}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA' },
    
    playerArea: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: 'black',
    },
    videoPlayer: { flex: 1 },
    thumbnailContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnail: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    thumbnailOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnailText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },

    contentContainer: { flex: 1 },
    headerInfo: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
    lessonTitleHeader: { fontSize: 22, fontWeight: 'bold', color: '#1A202C', marginBottom: 4 },
    courseTitle: { fontSize: 16, color: '#4A5568', marginBottom: 4 },
    instructor: { fontSize: 14, color: '#718096' },
    
    progressWrapper: { marginTop: 20 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressText: { fontSize: 14, color: '#2D3748', fontWeight: '600' },
    progressDetail: { fontSize: 14, color: '#718096' },
    progressBarBackground: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
    progressBarForeground: { height: '100%', backgroundColor: '#4A90E2', borderRadius: 4 },

    playlistHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A202C',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    moduleContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#9DA3B7',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        overflow: 'hidden',
    },
    moduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    moduleHeaderText: { flex: 1, marginRight: 10 },
    moduleIndex: { fontSize: 12, color: '#718096', fontWeight: '600', textTransform: 'uppercase' },
    moduleTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginTop: 2 },
    
    lessonsList: { borderTopWidth: 1, borderTopColor: '#EDF2F7' },
    lessonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F7F8FA',
    },
    selectedLessonItem: { backgroundColor: '#EBF8FF' },
    lessonTitle: { marginLeft: 15, fontSize: 15, flex: 1, color: '#4A5568' },
    selectedLessonTitle: { color: '#2C5282', fontWeight: 'bold' },
});

export default CoursePlayerScreen;
