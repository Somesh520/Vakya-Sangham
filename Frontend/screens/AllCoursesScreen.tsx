import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../api';
import { useAuth } from '../AuthContext';

const AllCoursesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userToken } = useAuth(); // ✅ Always at top level

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setCourses(res.data.courses || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color="#FFA500"
      />
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateCourse' as never)}
      >
        <Text style={styles.createButtonText}>+ Create New Course</Text>
      </TouchableOpacity>

      {courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No courses found.</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.meta}>
                {item.language} • {item.level}
              </Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFA500"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E', padding: 10 },
  createButton: { backgroundColor: '#FFA500', padding: 12, borderRadius: 8, marginBottom: 10 },
  createButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  card: { backgroundColor: '#333', padding: 15, borderRadius: 8, marginBottom: 10 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  desc: { color: '#ccc', marginVertical: 5 },
  meta: { color: '#aaa', fontSize: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#aaa', fontSize: 16 }
});

export default AllCoursesScreen;
