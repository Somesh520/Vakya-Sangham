import React from 'react';
import { SafeAreaView, ScrollView, View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Font Awesome icons
import { RootStackParamList } from './types';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'EditProfile'>>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              console.log('Navigation state:', navigation.getState());
              console.log('Can go back:', navigation.canGoBack());
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                console.log('Cannot go back, navigating to Profile');
                navigation.navigate('Profile');
              }
            }}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit profile</Text>
        </View>

        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'profile_image_url' }} // Replace with actual image source
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Sophia Carter</Text>
          <Text style={styles.profileUsername}>@sophia_carter</Text>
          <Text style={styles.profileStatus}>5/5 - Profile Completed Successfully</Text>
          <View style={styles.separator} />
        </View>

        {/* Profile Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile picture</Text>
          <View style={styles.buttonWithIcon}>
            <Icon name="camera" size={20} color="#000" style={styles.icon} />
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add profile picture</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <TextInput
            style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
            multiline
            placeholder="Enter your bio"
          />
        </View>

        {/* Social Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social links</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Add social link"
          />
        </View>

        {/* Resume Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <View style={styles.buttonWithIcon}>
            <Icon name="paperclip" size={20} color="#000" style={styles.icon} />
            <Icon name="sticky-note" size={20} color="#000" style={styles.icon} />
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add resume</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferred Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred language</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter preferred language"
          />
        </View>

        {/* Avatar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avatar</Text>
          <View style={styles.avatarGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <TouchableOpacity key={item} style={styles.avatarItem}>
                <Image
                  source={{ uri: `avatar_${item}_url` }} // Replace with actual avatar URLs
                  style={styles.avatarImage}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button Section */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => {
              console.log('Save button pressed');
              console.log('Navigation state:', navigation.getState());
              console.log('Can go back:', navigation.canGoBack());
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                console.log('Cannot go back, navigating to Profile');
                navigation.navigate('Profile');
              }
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E8C7', // Light yellow background
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    zIndex: 1000,
    marginTop: 20, // Added to push the header downward
  },
  closeButton: {
    padding: 10,
    minWidth: 55,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 22,
  },
  closeText: {
    fontSize: 25,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileUsername: {
    fontSize: 16,
    color: '#666',
  },
  profileStatus: {
    fontSize: 14,
    color: '#000',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#000',
    marginVertical: 10,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 60, // Maintain alignment with other sections
  },
  addButton: {
    padding: 20,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 5,
    alignItems: 'center',
    flex: 1, // Take remaining space
  },
  addButtonText: {
    fontSize: 14,
    color: '#000',
  },
  textInput: {
    height: 40,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  icon: {
    marginRight: 8, // Space between icon and button
  },
  iconText: {
    fontSize: 20,
    marginRight: 8,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  avatarItem: {
    width: '30%',
    marginVertical: 5,
  },
  avatarImage: {
    width: '100%',
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  saveButtonContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#f4a261',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;