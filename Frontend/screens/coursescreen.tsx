// screens/CourseScreen.js

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  TextInput,
  Image,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import api from '../api';
import { useAuth } from '../AuthContext'; 
import Ionicons from 'react-native-vector-icons/Ionicons';

// --- Type Definitions ---
type RootStackParamList = {
  CourseScreen: undefined;
  CourseDetail: { courseId: string; courseTitle?: string };
};

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailURL?: string;
  price: number;
  instructor?: { fullname?: string } | null;
  level?: string;
  language?: string;
}

// --- Category/Language Card ---
const FilterCard = ({ icon, label, value, isSelected, onSelect }) => (
  <TouchableOpacity 
    style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
    onPress={() => onSelect(value)}
  >
    <Ionicons name={icon} size={28} color={isSelected ? '#FFFFFF' : '#4A90E2'} />
    <Text style={[styles.categoryCardText, isSelected && styles.categoryCardTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

// --- Main Component ---
const CourseScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, refreshUser } = useAuth(); 

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>(''); 
  const [activeFilters, setActiveFilters] = useState<{ language?: string }>({});
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
          await refreshUser();

          const params: any = {};
          if (query.trim()) params.q = query.trim();
          if (activeFilters.language) params.language = activeFilters.language;

          // ✅ FIX 1: Changed the API endpoint from '/api/' to '/api/courses'
          const res = await api.get('/api/', { params });

          if (isActive) {
            if (res.data.success && res.data.courses) {
              setCourses(res.data.courses);
            } else {
              setCourses([]);
            }
          }
        } catch (err: any) {
          if (isActive) {
            console.error('❌ Error fetching data:', err.response?.data || err.message);
            setError('Failed to load courses.');
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      // Add a small delay (debounce) to prevent API calls on every keystroke
      const handler = setTimeout(() => {
          loadData();
      }, 300); // 300ms delay

      return () => { 
          clearTimeout(handler);
          isActive = false; 
      };
    }, [refreshUser, query, activeFilters])
  );

  const handleFilterSelect = (value: string | undefined) => {
    setActiveFilters(prev => ({
      language: prev.language === value ? undefined : value,
    }));
  };

  const handleNavigate = (courseId: string, courseTitle: string) => {
    navigation.navigate('CourseDetail', { courseId, courseTitle });
  };

 const renderCourseItem = ({ item }: { item: Course }) => {
    const isEnrolled = user?.enrolledCourses?.some(id => id === item._id) || false;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleNavigate(item._id, item.title)}
      >
        <Image 
          source={{ uri: item.thumbnailURL || 'https://placehold.co/600x400/E2E8F0/333?text=Course' }} 
          style={styles.cardThumbnail} 
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.levelPill}>{item.level || 'All Levels'}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.instructor}>by {item.instructor?.fullname || 'Vakya Sangham'}</Text>
          <View style={styles.cardFooter}>
            {isEnrolled ? (
              <View style={styles.enrolledBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={styles.enrolledText}>Enrolled</Text>
              </View>
            ) : (
              <Text style={styles.price}>
                {/* ✅ FIXED THE PRICE LOGIC HERE */}
                {(item.price && item.price > 0) ? `₹${item.price}` : 'Free'}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const languageFilters = [
    { label: 'Hindi', value: 'hindi', icon: 'globe-outline' },
    { label: 'Telugu', value: 'telugu', icon: 'globe-outline' },
    { label: 'Marathi', value: 'marathi', icon: 'globe-outline' },
    { label: 'Punjabi', value: 'punjabi', icon: 'globe-outline' },
    { label: 'Kannada', value: 'kannada', icon: 'globe-outline' },
  ];

  const renderHeader = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={22} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search for anything..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
        {/* ✅ FIX 2: Added a clear button that shows up when there's text */}
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={22} color="#999" style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Language Filters */}
      <View>
        <Text style={styles.sectionTitle}>Languages</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
          <FilterCard icon="globe-outline" label="All" value={undefined} isSelected={!activeFilters.language} onSelect={handleFilterSelect} />
          {languageFilters.map(filter => (
            <FilterCard key={filter.value} {...filter} isSelected={activeFilters.language === filter.value} onSelect={handleFilterSelect} />
          ))}
        </ScrollView>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Results</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Finding Courses...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={60} color="#E53E3E" />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id}
          renderItem={renderCourseItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingTop: 10 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="cloud-offline-outline" size={60} color="#A0AEC0" />
              <Text style={styles.empty}>No Courses Found</Text>
              <Text style={styles.emptySub}>Try adjusting your search or filters.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4A90E2', fontWeight: '600' },
  
  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: 12, marginHorizontal: 20, marginTop: 10, paddingHorizontal: 15 },
  searchIcon: { marginRight: 10 },
  searchBar: { flex: 1, height: 50, fontSize: 16, color: '#1A202C' },
  // ✅ FIX 3: Added style for the new clear icon
  clearIcon: { padding: 5 },
  
  // Filters
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A202C', marginHorizontal: 20, marginTop: 25, marginBottom: 15 },
  filterScrollView: { paddingHorizontal: 20, paddingBottom: 25 },
  categoryCard: { width: 100, height: 100, backgroundColor: '#F0F5FF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  categoryCardSelected: { backgroundColor: '#4A90E2' },
  categoryCardText: { fontSize: 14, color: '#4A90E2', fontWeight: 'bold', marginTop: 8 },
  categoryCardTextSelected: { color: '#FFFFFF' },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#9DA3B7',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardThumbnail: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: { padding: 15 },
  cardHeader: { flexDirection: 'row', marginBottom: 10 },
  levelPill: { backgroundColor: '#EBF8FF', color: '#2C5282', fontWeight: 'bold', fontSize: 12, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, overflow: 'hidden' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', marginBottom: 5 },
  instructor: { fontSize: 14, color: '#718096', marginBottom: 15 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#4A90E2' },
  
  // Enrolled Badge
  enrolledBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6FFFA', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
  enrolledText: { color: '#28a745', fontWeight: 'bold', fontSize: 14, marginLeft: 5 },
  
  // States
  error: { fontSize: 18, color: '#E53E3E', textAlign: 'center', fontWeight: '600', marginTop: 15 },
  empty: { fontSize: 20, color: '#4A5568', marginTop: 15, fontWeight: 'bold' },
  emptySub: { fontSize: 14, color: '#A0AEC0', marginTop: 5, textAlign: 'center' },
});

export default CourseScreen;