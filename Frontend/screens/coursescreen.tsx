import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import api from '../api';

type RootStackParamList = {
  CourseScreen: undefined;
  CourseDetail: { courseId: string };
};

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailURL: string;
  price: number;
  instructor?: { fullname?: string } | null;
}

interface Filters {
  language?: string;
  level?: string;
}

const CourseScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Filters>({});

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params: Filters & { q: string } = {
          q: query,
          language: activeFilters.language,
          level: activeFilters.level,
        };
        const res = await api.get('/api/courses', { params });
        if (res.data.success) {
          // Ensure every course has a valid instructor object
          const sanitizedCourses = res.data.courses.map((c: Course) => ({
            ...c,
            instructor: c.instructor || { fullname: 'Unknown Instructor' },
            price: c.price ?? 0,
          }));
          setCourses(sanitizedCourses);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [query, activeFilters]);

  const handleNavigate = (courseId: string) => {
    navigation.navigate('CourseDetail', { courseId });
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
      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleNavigate(item._id)}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.instructor}>by {item.instructor?.fullname}</Text>
            <Text style={styles.price}>₹{item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#F6F5F2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  instructor: { fontSize: 14, color: '#616161', marginBottom: 5 },
  price: { fontSize: 14, fontWeight: '600', color: '#FFA500' },
});

export default CourseScreen;
