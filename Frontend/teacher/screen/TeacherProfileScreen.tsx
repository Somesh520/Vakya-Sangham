// File: teacher/screen/TeacherProfileScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../AuthContext'; // Adjust path if needed
import api from '../../api';

interface Profile {
    fullname: string;
    email: string;
    profileImageURL?: string;
}

const TeacherProfileScreen = () => {
    const { signOut } = useAuth(); // Assuming signOut is the name in your context
    const navigation = useNavigation();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/user/info/profile'); // Using the general profile route
            setProfile(data);
        } catch (error) {
            Alert.alert("Error", "Could not load profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(fetchProfile);

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", onPress: signOut, style: 'destructive' }
        ]);
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.headerTitle}>My Profile</Text>
                <View style={styles.profileHeader}>
                    <Image 
                        source={{ uri: profile?.profileImageURL || 'https://placehold.co/100x100?text=Avatar' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{profile?.fullname}</Text>
                    <Text style={styles.userEmail}>{profile?.email}</Text>
                </View>
                
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#FF4B4B" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loader: { flex: 1, justifyContent: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', padding: 16, backgroundColor: '#fff' },
    profileHeader: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff' },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FFA500' },
    userName: { fontSize: 24, fontWeight: 'bold', marginTop: 15 },
    userEmail: { fontSize: 16, color: 'gray', marginTop: 5 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 30, paddingVertical: 15, backgroundColor: 'white', borderRadius: 12, elevation: 2 },
    logoutButtonText: { marginLeft: 10, fontSize: 16, color: '#FF4B4B', fontWeight: 'bold' },
});

export default TeacherProfileScreen;