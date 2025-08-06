// src/screens/StudentHomeScreen.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, FlatList, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import {
  Text,
  Appbar,
  Card,
  List,
  ProgressBar,
  Avatar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Mock Data (Replace with your API data later) ---
const featuredCourses = [
  {
    id: '1',
    title: 'Python for Beginners',
    subtitle: 'Learn the basics of Python',
    image: 'https://i.imgur.com/gBw6a3x.png', // Placeholder for the dark blue graphic
  },
  {
    id: '2',
    title: 'Advanced Java',
    subtitle: 'Master Java programming',
    image: 'https://i.imgur.com/0s72h1p.png', // Placeholder for the computer graphic
  },
];

const inProgressCourses = [
  {
    id: '1',
    title: 'Data Structures and Algorithms',
    progress: 0.5, // 50%
    icon: 'laptop-mac',
  },
];
// --- End of Mock Data ---


type Props = {
  // You might not need navigation directly here if it's in a tab navigator
  // but it's good practice to include it.
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const StudentHomeScreen: React.FC<Props> = ({ navigation }) => {
  const userName = "Arjun"; // This would come from your AuthContext

  const renderFeaturedCourse = ({ item }: { item: typeof featuredCourses[0] }) => (
    <Card style={styles.featuredCard} onPress={() => { /* Navigate to course details */ }}>
      <Card.Cover source={{ uri: item.image }} style={styles.featuredCardImage} />
      <Card.Content>
        <Text variant="titleMedium" style={styles.cardTitle}>{item.title}</Text>
        <Text variant="bodySmall" style={styles.cardSubtitle}>{item.subtitle}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="VAKYA SANGAM" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="cog-outline" onPress={() => { /* Navigate to settings */ }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text variant="headlineLarge" style={styles.welcomeTitle}>Hello, {userName}</Text>
          <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
            Explore courses tailored for students in your region
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Featured Courses</Text>
          <FlatList
            data={featuredCourses}
            renderItem={renderFeaturedCourse}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Your Learning</Text>
          {inProgressCourses.map(course => (
            <Card key={course.id} style={styles.learningCard} onPress={() => { /* Navigate to course */ }}>
              <List.Item
                title={course.title}
                titleStyle={styles.cardTitle}
                description={`_50% completed_`}
                descriptionStyle={styles.learningProgressText}
                left={() => <Avatar.Icon size={48} icon={course.icon} style={styles.learningIcon} />}
              />
              <ProgressBar progress={course.progress} color="#D87A33" style={styles.learningProgressBar} />
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8C7', // Main background color from your design
  },
  appbar: {
    backgroundColor: '#F5E8C7',
    elevation: 0,
  },
  appbarTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeSubtitle: {
    color: '#555',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  featuredCard: {
    width: 220,
    marginRight: 15,
    backgroundColor: '#fff',
  },
  featuredCardImage: {
    height: 120,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  learningCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  learningIcon: {
    backgroundColor: '#E0F7FA', // A light blue color for the icon background
  },
  learningProgressText: {
    color: '#333',
  },
  learningProgressBar: {
    height: 6,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 3,
  },
});

export default StudentHomeScreen;