import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="mail" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
        <TouchableOpacity>
          <Icon name="notifications" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
        <Image source={require('./assets/profile-pic.png')} style={styles.profilePic} />
      </TouchableOpacity>
      
      <Text style={styles.name}>Sophia Carter</Text>
      <Text style={styles.username}>@sophia_carter</Text>
      
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
      
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Subjects</Text>
        <TouchableOpacity style={styles.progressSection} onPress={() => navigation.navigate('AIChat')}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressCircle}>
            <View style={styles.progressInnerCircle}></View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.subjectsSection}>
        <View style={styles.subjectTabs}>
          <Text style={styles.selectedTabText}>All</Text>
          <Text style={styles.tabText}>Math</Text>
          <Text style={styles.tabText}>Science</Text>
          <Text style={styles.tabText}>History</Text>
        </View>
      </View>
      
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
      
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBarItem}>
          <Icon name="home" size={24} color="#000" />
          <Text style={styles.navBarText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('LanguageSelection')}>
          <Icon name="bookmark" size={24} color="#000" />
          <Text style={styles.navBarText}>Subjects</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBarItem}>
          <Icon name="help-outline" size={24} color="#000" />
          <Text style={styles.navBarText}>Doubt Clearing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('AIChat')}>
          <Icon name="smart-toy" size={24} color="#000" />
          <Text style={styles.navBarText}>AI Chat Bot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBarItem}>
          <Icon name="person" size={24} color="#000" />
          <Text style={styles.navBarText}>Profile</Text>
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
  headerIcon: {
    width: 24,
    height: 24,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
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
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    paddingVertical: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  progressInnerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
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
  selectedTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  subjectCard: {
    width: '48%',
    marginBottom: 20,
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectImage: {
    width: '100%',
    height: 100,
  },
  subjectText: {
    fontSize: 16,
    marginTop: 5,
    paddingBottom: 10,
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
  navBarItem: {
    alignItems: 'center',
  },
  navBarText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ProfileScreen;