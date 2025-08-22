import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  TextInput 
} from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import api from '../api';
import { useAuth } from '../AuthContext'; // ✅ 1. Import useAuth to get user data

type RootStackParamList = {
  CourseScreen: undefined;
  CourseDetail: { courseId: string };
};

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailURL?: string;
  price: number;
  instructor?: { fullname?: string } | null;
}

interface Filters {
  language?: string;
  level?: string;
}

const CourseScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth(); // ✅ 2. Get the user object from your Auth Context

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>(''); 
  const [activeFilters, setActiveFilters] = useState<Filters>({});
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (query.trim()) params.q = query.trim();
      if (activeFilters.language) params.language = activeFilters.language;
      if (activeFilters.level) params.level = activeFilters.level;

      const res = await api.get('/api/courses', { params });

      if (res.data.success && res.data.courses.length > 0) {
        const sanitized = res.data.courses.map((c: Course) => ({
          ...c,
          instructor: c.instructor || { fullname: 'Unknown Instructor' },
          price: c.price ?? 0,
        }));
        setCourses(sanitized);
      } else {
        setCourses([]);
        setError('No courses found with the selected criteria.');
      }
    } catch (err: any) {
      console.error('Error fetching courses:', err.message);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, activeFilters]);

  // useFocusEffect will re-run fetchCourses every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [fetchCourses])
  );

  const handleNavigate = (courseId: string) => {
    navigation.navigate('CourseDetail', { courseId });
  };

  const renderCourseItem = ({ item }: { item: Course }) => {
    // ✅ 3. Check if the user is enrolled in this specific course
    const isEnrolled = user?.enrolledCourses?.includes(item._id);

    return (
      <TouchableOpacity 
        style={[styles.card, isEnrolled && styles.enrolledCard]} // Apply different style if enrolled
        onPress={() => handleNavigate(item._id)}
        disabled={isEnrolled} // Disable the button if enrolled
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.instructor}>by {item.instructor?.fullname}</Text>
        
        {/* ✅ 4. Show a badge if enrolled, otherwise show the price */}
        {isEnrolled ? (
          <View style={styles.enrolledBadge}>
            <Text style={styles.enrolledText}>✓ Enrolled</Text>
          </View>
        ) : (
          <Text style={styles.price}>
            {item.price > 0 ? `₹${item.price}` : 'Free'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search courses..."
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.filterRow}>
        <View style={styles.pickerBox}>
          <Text style={styles.filterLabel}>Language:</Text>
          <Picker
            selectedValue={activeFilters.language}
            onValueChange={(val) => 
              setActiveFilters((prev) => ({ ...prev, language: val || undefined }))
            }
            style={styles.picker}
          >
            <Picker.Item label="All" value="" />
            <Picker.Item label="Hindi" value="hindi" />
            <Picker.Item label="English" value="english" />
          </Picker>
        </View>

        <View style={styles.pickerBox}>
          <Text style={styles.filterLabel}>Level:</Text>
          <Picker
            selectedValue={activeFilters.level}
            onValueChange={(val) => 
              setActiveFilters((prev) => ({ ...prev, level: val || undefined }))
            }
            style={styles.picker}
          >
            <Picker.Item label="All" value="" />
            <Picker.Item label="Beginner" value="beginner" />
            <Picker.Item label="Intermediate" value="intermediate" />
            <Picker.Item label="Advanced" value="advanced" />
          </Picker>
        </View>
      </View>

      {error && !loading ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id}
          renderItem={renderCourseItem} // Use the new render function
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>No courses available.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#F6F5F2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    elevation: 2,
  },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pickerBox: { flex: 1, marginHorizontal: 5, backgroundColor: '#fff', borderRadius: 8, elevation: 2, justifyContent: 'center' },
  filterLabel: { fontSize: 12, fontWeight: '600', marginLeft: 10, color: '#555' },
  picker: { height: 50, width: '100%' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  // ✅ 5. New styles for enrolled courses
  enrolledCard: {
    backgroundColor: '#F0FFF4', // A light green background
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  enrolledBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  enrolledText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  instructor: { fontSize: 14, color: '#616161', marginBottom: 10 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#FFA500', alignSelf: 'flex-end' },
  error: { fontSize: 16, color: 'red', textAlign: 'center' },
  empty: { fontSize: 16, color: '#666', textAlign: 'center' },
});

export default CourseScreen;
