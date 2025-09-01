import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, Alert, Image
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../api';
import { useAuth } from '../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';


type CourseStackParamList = {
  CourseList: undefined;
  CourseDetail: { courseId: string };
  CoursePlayer: { courseId: string }; 
};



type CourseDetailScreenRouteProp = RouteProp<CourseStackParamList, 'CourseDetail'>;


type CourseDetailScreenNavigationProp = NativeStackNavigationProp<CourseStackParamList, 'CourseDetail'>;

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
  instructor: { 
    _id: string;
    fullname: string 
  };
  modules: {
    _id: string;
    title: string;
    lessons: Lesson[];
  }[];
  price: number;
}

const CourseDetailScreen = () => {
  const { user, updateUser } = useAuth();
  const route = useRoute<CourseDetailScreenRouteProp>();
  const navigation = useNavigation<CourseDetailScreenNavigationProp>();
  const { courseId } = route.params;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Course details fetch karne ka function
  const fetchCourseDetails = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await api.get(`/api/${courseId}`);
      if (res.data.success) {
        const fetchedCourse = res.data.course;
        setCourse(fetchedCourse);

        const isUserEnrolled = user?.enrolledCourses?.includes(fetchedCourse._id);
        setEnrolled(!!isUserEnrolled);
      }
    } catch (err: any) {
      console.error('Course fetch error:', err?.response?.data || err);
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
        
        const updatedEnrolledCourses = [...(user.enrolledCourses || []), course._id];
        updateUser({ ...user, enrolledCourses: updatedEnrolledCourses });
        setEnrolled(true);

     
        navigation.navigate('CoursePlayer', { courseId: course._id });

      }
    } catch (err: any) {
      console.error('Enrollment error:', err?.response?.data || err);
      Alert.alert('Error', err?.response?.data?.message || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };
  
  // ✅ Footer button ke liye naya function
  const handleFooterButtonPress = () => {
    if (enrolled) {
      // Agar pehle se enrolled hai, to seedhe player par jaayein
      navigation.navigate('CoursePlayer', { courseId });
    } else {
      // Varna, enroll karein
      handleEnroll();
    }
  };

  // Lesson par tap karne ka function
  const handleLessonPress = () => {
    if (enrolled) {
      // Yahan se aap video player screen par navigate kar sakte hain
      navigation.navigate('CoursePlayer', { courseId });
    } else {
      Alert.alert("Enroll First", "Please enroll in the course to watch the lessons.");
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
        <Text>Sorry, course not found.</Text>
      </SafeAreaView>
    );
  }

  const allLessons = course.modules.flatMap(module => module.lessons);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={allLessons}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <>
            <Image source={{ uri: course.thumbnailURL || 'https://placehold.co/400x250' }} style={styles.thumbnail} />
            <View style={styles.headerContent}>
              <Text style={styles.title}>{course.title}</Text>
              <Text style={styles.instructor}>Created by {course.instructor.fullname}</Text>
              <Text style={styles.description}>{course.description}</Text>
            </View>
            <View style={styles.lessonsHeader}>
              <Text style={styles.sectionTitle}>What you'll learn</Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.lessonItem}
            // ✅ Lesson par tap karke bhi player par jaa sakte hain
            onPress={handleLessonPress}
          >
            <View style={styles.lessonNumberContainer}>
                <Text style={styles.lessonIndex}>{index + 1}</Text>
            </View>
            <Text style={styles.lessonTitle}>{item.title}</Text>
            {!enrolled && <Ionicons name="lock-closed" size={20} color="#BDBDBD" />}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      
      {/* --- Enroll Button (Sticky at the bottom) --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.enrollButton, (enrolled || enrolling) && styles.enrolledButton]}
          // ✅ Naya function use karein
          onPress={handleFooterButtonPress}
          // ✅ Sirf enrolling ke time disable hoga
          disabled={enrolling}
        >
          {enrolling ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.enrollText}>
              {enrolled
                ? 'Go to Course' // ✅ Text badla gaya
                : course.price > 0
                ? `Buy Now for ₹${course.price}`
                : 'Enroll for Free'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  thumbnail: { width: '100%', height: 220 },
  headerContent: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#121212', marginBottom: 5 },
  instructor: { fontSize: 16, color: '#555', marginBottom: 15 },
  description: { fontSize: 16, color: '#424242', lineHeight: 24 },
  lessonsHeader: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#121212', borderTopWidth: 1, borderTopColor: '#EFEFEF', paddingTop: 20, marginBottom: 10 },
  lessonItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
  lessonNumberContainer: { width: 30, alignItems: 'center', justifyContent: 'center'},
  lessonIndex: { fontSize: 16, color: '#666' },
  lessonTitle: { flex: 1, fontSize: 16, color: '#333', marginLeft: 10 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  enrollButton: { 
    backgroundColor: '#FFA500', 
    paddingVertical: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  enrolledButton: { backgroundColor: '#4CAF50' }, // Green color for enrolled/enrolling
  enrollText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default CourseDetailScreen;