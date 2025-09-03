import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../AuthContext'; // Adjust path if needed
import api from '../../api';

// --- Type Definitions ---
interface Profile {
    fullname: string;
    email: string;
    profileImageURL?: string;
}

const TeacherProfileScreen = () => {
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfileData = useCallback(async (abortController: AbortController) => {
        if (!user?._id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data } = await api.get(`/user/info/profile`, {
                signal: abortController.signal
            });
            if (data.success) {
                setProfile(data.data);
            } else {
                setProfile(null);
            }
        } catch (error: any) {
            if (error.name !== 'CanceledError') {
                console.error("Profile fetch error:", error);
                setProfile(null);
            }
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false);
            }
        }
    }, [user?._id]);

    useFocusEffect(
        useCallback(() => {
            const abortController = new AbortController();
            fetchProfileData(abortController);
            return () => abortController.abort();
        }, [fetchProfileData])
    );

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", onPress: signOut, style: 'destructive' }
        ]);
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#FFA500" /></View>;
    }

    if (!profile) {
        return (
            <SafeAreaView style={styles.center}>
                <Ionicons name="cloud-offline-outline" size={60} color="#9E9E9E" />
                <Text style={styles.errorText}>Could not load profile.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchProfileData(new AbortController())}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileHeader}>
                    <Image 
                        source={{ uri: profile.profileImageURL || `https://ui-avatars.com/api/?name=${(profile.fullname || 'Teacher').replace(' ', '+')}&background=FFA500&color=fff&size=128` }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{profile.fullname}</Text>
                    <Text style={styles.userEmail}>{profile.email}</Text>
                </View>
                
                {/* ✅ SIMPLIFIED: Only the logout button remains */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F0F2F5' },
    errorText: { fontSize: 18, color: '#666', marginTop: 10 },
    retryButton: { backgroundColor: '#FFA500', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, marginTop: 20 },
    retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    scrollContainer: { paddingBottom: 20, flexGrow: 1 },
    profileHeader: { 
        alignItems: 'center', 
        paddingVertical: 32, 
        backgroundColor: '#fff',
    },
    avatar: { 
        width: 120, 
        height: 120, 
        borderRadius: 60, 
        borderWidth: 4, 
        borderColor: '#FFA500' 
    },
    userName: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginTop: 16,
        color: '#121212'
    },
    userEmail: { 
        fontSize: 16, 
        color: 'gray', 
        marginTop: 6 
    },
    logoutButton: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    logoutButtonText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    }
});

export default TeacherProfileScreen;