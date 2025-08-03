import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const TeacherHome = () => {
  const teacherName = "Mr. Sharma";
  const subjects = ["Mathematics", "Physics", "Computer Science", "English"];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👨‍🏫 Welcome, {teacherName}</Text>
      <Text style={styles.subtext}>Your Subjects:</Text>

      <FlatList
        data={subjects}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.subjectBox}>
            <Text style={styles.subjectText}>{item}</Text>
          </View>
        )}
        style={{ width: '100%' }}
      />

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TeacherHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF0F1',
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C3A47',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 18,
    fontWeight: '500',
    color: '#34495e',
    marginVertical: 20,
    alignSelf: 'flex-start',
  },
  subjectBox: {
    backgroundColor: '#dff9fb',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    elevation: 2,
  },
  subjectText: {
    fontSize: 16,
    color: '#130f40',
  },
  logoutButton: {
    backgroundColor: '#eb4d4b',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    width: '60%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
