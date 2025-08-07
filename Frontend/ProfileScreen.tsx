import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header with message and notification icons */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Image source={require('./assets/message-icon.png')} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
        <TouchableOpacity>
          <Image source={require('./assets/bell-icon.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
      
      {/* Profile picture - now clickable */}
      <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
        <Image source={require('./assets/profile-pic.png')} style={styles.profilePic} />
      </TouchableOpacity>
      
      <Text style={styles.name}>Sophia Carter</Text>
      <Text style={styles.username}>@sophia_carter</Text>
      
      {/* Stats section */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>15</Text>
          <Text style={styles.statText}>Courses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>28</Text>
          <Text style={styles.statText}>Hour</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>10</Text>
          <Text style={styles.statText}>Streak</Text>
        </View>
      </View>
      
      {/* Progress section */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.progressCircle}></View>
      </View>
      
      {/* Subjects section */}
      <View style={styles.subjectsSection}>
        <Text style={styles.sectionTitle}>Subjects</Text>
        <View style={styles.subjectTabs}>
          <Text style={styles.tabText}>All</Text>
          <Text style={styles.tabText}>Math</Text>
          <Text style={styles.tabText}>Science</Text>
          <Text style={styles.tabText}>History</Text>
        </View>
      </View>
      
      {/* Subjects grid */}
      <View style={styles.subjectsGrid}>
        <View style={styles.subjectCard}>
          <Image source={require('./assets/algebra.jpg')} style={styles.subjectImage} />
          <Text style={styles.subjectText}>Algebra</Text>
        </View>
        <View style={styles.subjectCard}>
          <Image source={require('./assets/biology.jpg')} style={styles.subjectImage} />
          <Text style={styles.subjectText}>Biology</Text>
        </View>
        <View style={styles.subjectCard}>
          <Image source={require('./assets/world-history.jpg')} style={styles.subjectImage} />
          <Text style={styles.subjectText}>World History</Text>
        </View>
        <View style={styles.subjectCard}>
          <Image source={require('./assets/geometry.jpg')} style={styles.subjectImage} />
          <Text style={styles.subjectText}>Geometry</Text>
        </View>
      </View>
      
      {/* Navigation bar */}
      <View style={styles.navBar}>
        <TouchableOpacity>
          <Image source={require('./assets/home-icon.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('LanguageSelection')}>
          <Image source={require('./assets/subjects-icon.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('./assets/doubt-icon.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AIChat')}>
          <Image source={require('./assets/aibot-icon.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('./assets/profile-icon.png')} style={styles.navIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8C7',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  icon: {
    width: 24,
    height: 24,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  username: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    marginLeft: 10,
  },
  subjectsSection: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  subjectTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
  },
  subjectCard: {
    width: '45%',
    marginBottom: 20,
    alignItems: 'center',
  },
  subjectImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  subjectText: {
    fontSize: 16,
    marginTop: 5,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5E8C7',
  },
  navIcon: {
    width: 24,
    height: 24,
  },
});

export default ProfileScreen;