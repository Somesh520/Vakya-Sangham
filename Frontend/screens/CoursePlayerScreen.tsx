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
import { WebView } from 'react-native-webview';
import api from '../api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Type Definitions ---
interface Lesson { 
    _id: string; 
    title: string; 
    videoURL?: string; 
    videoUrl?: string;
    duration: number; 
    lessonType?: 'video' | 'pdf' | 'youtube' | 'nptel';
    pdfUrl?: string;
    nptelUrl?: string;
}
interface Module { _id: string; title: string; lessons: Lesson[]; }
interface Course { _id: string; title: string; thumbnailURL?: string; instructor: { fullname: string }; modules: Module[]; }
type MainStackParamList = { MainTabs: undefined; CoursePlayer: { courseId: string }; };
type CoursePlayerScreenProps = { route: RouteProp<MainStackParamList, 'CoursePlayer'>; navigation: NativeStackNavigationProp<MainStackParamList, 'CoursePlayer'>; };

// --- Utility Functions ---
const isYouTubeURL = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/i;
    return youtubeRegex.test(url);
};

const isNPTELURL = (url: string): boolean => {
    return url.includes('nptel.ac.in');
};

const getYouTubeEmbedURL = (url: string): string => {
    try {
        let videoId = '';
        
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1]?.split('?')[0];
        }
        
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&controls=1&modestbranding=1&playsinline=1` : '';
    } catch (error) {
        console.error('Error creating YouTube embed URL:', error);
        return '';
    }
};

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
    
    const playFirstLesson = () => {
        if (course?.modules?.[0]?.lessons?.[0]) {
            const firstLesson = course.modules[0].lessons[0];
            setSelectedLesson(firstLesson);
        } else {
            Alert.alert("No Lessons", "This course doesn't have any lessons available yet.");
        }
    };

    const handleLessonPress = (lesson: Lesson) => {
        setSelectedLesson(lesson);
    };

    const markLessonAsComplete = async (lessonId?: string) => {
        const targetLessonId = lessonId || selectedLesson?._id;
        if (!targetLessonId || completedLessons.has(targetLessonId)) return;
        
        try {
            await api.post('/api/progress/complete-lesson', {
                courseId: course?._id,
                lessonId: targetLessonId,
            });
            setCompletedLessons(prev => new Set(prev).add(targetLessonId));
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

    // ✅ Get preview content for all lesson types
    const getPreviewContent = () => {
        if (!selectedLesson) return null;
        
        const videoUrl = selectedLesson.videoURL || selectedLesson.videoUrl || selectedLesson.nptelUrl;
        
        // NPTEL videos - Use WebView for course pages
        if (selectedLesson.lessonType === 'nptel' || isNPTELURL(videoUrl || '')) {
            return (
                <WebView
                    source={{ uri: videoUrl || '' }}
                    style={styles.videoPlayer}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.webViewLoading}>
                            <ActivityIndicator size="large" color="#2563EB" />
                            <Text style={styles.loadingText}>Loading NPTEL Course...</Text>
                        </View>
                    )}
                    onLoadEnd={() => {
                        setTimeout(() => markLessonAsComplete(), 5000);
                    }}
                    onError={(error) => {
                        console.error('NPTEL WebView Error:', error);
                        Alert.alert("Error", "Failed to load NPTEL course. Please check your internet connection.");
                    }}
                    bounces={false}
                    scrollEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15"
                    mixedContentMode="compatibility"
                />
            );
        }
        
        // YouTube videos - WebView embed
        else if (selectedLesson.lessonType === 'youtube' || (videoUrl && isYouTubeURL(videoUrl))) {
            const embedUrl = getYouTubeEmbedURL(videoUrl || '');
            return (
                <WebView
                    source={{ uri: embedUrl }}
                    style={styles.videoPlayer}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.webViewLoading}>
                            <ActivityIndicator size="large" color="#FF0000" />
                            <Text style={styles.loadingText}>Loading YouTube Video...</Text>
                        </View>
                    )}
                    onLoadEnd={() => {
                        setTimeout(() => markLessonAsComplete(), 3000);
                    }}
                    onError={(error) => {
                        console.error('YouTube WebView Error:', error);
                        Alert.alert("Error", "Failed to load YouTube video.");
                    }}
                    bounces={false}
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                />
            );
        }
        
        // PDF files
        else if (selectedLesson.lessonType === 'pdf') {
            return (
                <WebView
                    source={{ uri: selectedLesson.pdfUrl || '' }}
                    style={styles.videoPlayer}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.webViewLoading}>
                            <ActivityIndicator size="large" color="#4A90E2" />
                            <Text style={styles.loadingText}>Loading PDF...</Text>
                        </View>
                    )}
                    onError={(error) => {
                        console.error('PDF WebView Error:', error);
                        Alert.alert("Error", "Failed to load PDF file.");
                    }}
                />
            );
        }
        
        // Regular videos (Direct URLs - Cloudinary, etc.)
        else if (videoUrl) {
            return (
                <Video
                    source={{ uri: videoUrl }}
                    style={styles.videoPlayer}
                    controls={true}
                    resizeMode="contain"
                    onEnd={() => markLessonAsComplete()}
                    onError={(e: OnVideoErrorData) => console.error("Video Error:", JSON.stringify(e))}
                />
            );
        }
        
        return (
            <View style={styles.noContentContainer}>
                <Ionicons name="alert-circle-outline" size={60} color="#718096" />
                <Text style={styles.noContentText}>Content not available</Text>
            </View>
        );
    };

    if (loading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#4A90E2" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.playerArea}>
                {selectedLesson ? (
                    getPreviewContent()
                ) : (
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
                                    {module.lessons.map((lesson: Lesson) => {
                                        const isCompleted = completedLessons.has(lesson._id);
                                        const isSelected = selectedLesson?._id === lesson._id;
                                        const videoUrl = lesson.videoURL || lesson.videoUrl || lesson.nptelUrl;
                                        
                                        // Icon based on lesson type
                                        let iconName = "play-circle-outline";
                                        let iconColor = "#718096";
                                        
                                        if (isCompleted) {
                                            iconName = "checkmark-circle";
                                            iconColor = "#28a745";
                                        } else if (lesson.lessonType === 'youtube' || (videoUrl && isYouTubeURL(videoUrl))) {
                                            iconName = "logo-youtube";
                                            iconColor = isSelected ? "#FF0000" : "#FF6666";
                                        } else if (lesson.lessonType === 'nptel' || isNPTELURL(videoUrl || '')) {
                                            iconName = "school";
                                            iconColor = isSelected ? "#2563EB" : "#3B82F6";
                                        } else if (lesson.lessonType === 'pdf') {
                                            iconName = "document-text";
                                            iconColor = isSelected ? "#4A90E2" : "#718096";
                                        } else if (isSelected) {
                                            iconName = "play-circle";
                                            iconColor = "#4A90E2";
                                        }

                                        return (
                                            <TouchableOpacity 
                                                key={lesson._id} 
                                                style={[styles.lessonItem, isSelected && styles.selectedLessonItem]}
                                                onPress={() => handleLessonPress(lesson)}
                                            >
                                                <Ionicons name={iconName} size={26} color={iconColor} />
                                                <View style={styles.lessonInfo}>
                                                    <Text style={[styles.lessonTitle, isSelected && styles.selectedLessonTitle]}>
                                                        {lesson.title}
                                                    </Text>
                                                    {/* Show lesson type indicator */}
                                                    {lesson.lessonType === 'youtube' || (videoUrl && isYouTubeURL(videoUrl)) ? (
                                                        <Text style={styles.lessonTypeIndicator}>YouTube Video</Text>
                                                    ) : lesson.lessonType === 'nptel' || isNPTELURL(videoUrl || '') ? (
                                                        <Text style={styles.lessonTypeIndicator}>NPTEL Course</Text>
                                                    ) : lesson.lessonType === 'pdf' ? (
                                                        <Text style={styles.lessonTypeIndicator}>PDF Document</Text>
                                                    ) : (
                                                        <Text style={styles.lessonTypeIndicator}>Video</Text>
                                                    )}
                                                </View>
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

    // WebView loading styles
    webViewLoading: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        fontSize: 14,
        marginTop: 10,
    },
    
    // No content styles
    noContentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    noContentText: {
        fontSize: 16,
        color: '#718096',
        marginTop: 10,
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
    
    // Lesson info container
    lessonInfo: { 
        marginLeft: 15, 
        flex: 1,
    },
    lessonTitle: { 
        fontSize: 15, 
        color: '#4A5568',
        fontWeight: '500',
    },
    selectedLessonTitle: { 
        color: '#2C5282', 
        fontWeight: 'bold' 
    },
    // Lesson type indicator
    lessonTypeIndicator: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
        fontStyle: 'italic',
    },
});

export default CoursePlayerScreen;