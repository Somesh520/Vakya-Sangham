import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from './types';

const NotesScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Notes'>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notes</Text>
        <TouchableOpacity onPress={() => { /* Handle menu press */ }}>
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.noteInput}
          placeholder=""
          multiline
          textAlignVertical="top"
        />
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
          <Icon name="show-chart" size={24} color="#000" />
          <Text style={styles.navBarText}>Progress</Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    fontSize: 18,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
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

export default NotesScreen;