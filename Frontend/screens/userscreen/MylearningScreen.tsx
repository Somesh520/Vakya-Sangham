import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    ActivityIndicator, 
    RefreshControl, 
    Image, 
    TouchableOpacity 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../../api';

//================================================================
// TYPE DEFINITIONS
//================================================================

// ✅ CHANGED: Use '_id' to match the backend's default ID field
type Course = {
  _id: string; 
  title: string;
  imageUrl?: string;
  progress: number;
};

// ✅ CHANGED: Pass '_id' as 'courseId' in navigation
type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  MyLearning: undefined;
  CourseLessons: { courseId: string; courseTitle: string; };
};

type MyLearningScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'MyLearning'>;

//================================================================
// HELPER COMPONENT (CourseProgressCard)
//================================================================

type CourseProgressCardProps = {
  title: string;
  imageUrl?: string;
  progress: number;
  onPress: () => void;
};

const CourseProgressCard: React.FC<CourseProgressCardProps> = ({ title, imageUrl, progress, onPress }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <Image 
        source={{ uri: imageUrl || 'https://placehold.co/100x100/e2e8f0/e2e8f0' }} 
        style={styles.courseImage} 
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarForeground, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}% Complete</Text>
      </View>
    </TouchableOpacity>
  );
};

//================================================================
// MAIN SCREEN COMPONENT (MyLearningScreen)
//================================================================

const MyLearningScreen = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<MyLearningScreenNavigationProp>();

  const fetchMyCourses = async () => {
    try {
      const response = await api.get('/api/users/my-learning');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyCourses();
  };
  
  const handleCoursePress = (courseId: string, courseTitle: string) => {
    navigation.navigate('CourseLessons', { courseId, courseTitle });
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        // ✅ CHANGED: Use 'item._id' and add a fallback to prevent crashes
        keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <CourseProgressCard
            title={item.title}
            imageUrl={item.imageUrl}
            progress={item.progress}
            // ✅ CHANGED: Pass 'item._id' to the press handler
            onPress={() => handleCoursePress(item._id, item.title)}
          />
        )}
        ListHeaderComponent={<Text style={styles.header}>My Learning</Text>}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't enrolled in any courses yet.</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

// ... (Styles remain the same)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
    textAlign: 'right',
    fontWeight: '500',
  },
});

export default MyLearningScreen;