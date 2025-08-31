import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../AuthContext'; // Adjust path if needed
import api from '../../api';
import { ProfileStackParamList } from '../../AppNavigator';

interface Profile {
    fullname: string;
    email: string;
    profileImageURL?: string;
}

// ✅ Define props type for MenuItem
interface MenuItemProps {
    icon: string;
    title: string;
    onPress: () => void;
    isLogout?: boolean;
}

// ✅ Optimization 1: Memoize the MenuItem component to prevent unnecessary re-renders.
const MenuItem = React.memo(({ icon, title, onPress, isLogout = false }: MenuItemProps) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconContainer}>
            <Ionicons name={icon} size={22} color={isLogout ? "#E53935" : "#FFA500"} />
        </View>
        <Text style={[styles.menuItemText, isLogout && styles.logoutText]}>{title}</Text>
        {!isLogout && <Ionicons name="chevron-forward-outline" size={22} color="#BDBDBD" />}
    </TouchableOpacity>
));

const TeacherProfileScreen = () => {
    const { signOut } = useAuth();
    // ✅ Type the navigation hook to get correct route names and methods
    const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ Optimization 2: Use an AbortController to cancel the API request 
    useFocusEffect(
        useCallback(() => {
            const abortController = new AbortController();

            const fetchProfileData = async () => {
                try {
                    setLoading(true);
                    const { data } = await api.get('/user/info/profile', {
                        signal: abortController.signal
                    });
                    setProfile(data);
                } catch (error: any) { // ✅ Type the error
                    if (error.name !== 'CanceledError') {
                        console.error("Profile fetch error:", error);
                    }
                } finally {
                    if (!abortController.signal.aborted) {
                        setLoading(false);
                    }
                }
            };

            fetchProfileData();

            return () => {
                abortController.abort();
            };
        }, [])
    );

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", onPress: signOut, style: 'destructive' }
        ]);
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    if (!profile) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.errorText}>Could not load profile.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => {
                    // Fallback to navigate if replace is not available on this type
                    (navigation as any).replace?.('ProfileMain') ?? (navigation as any).navigate('ProfileMain'); 
                }}>
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
                        source={{ uri: profile?.profileImageURL || `https://ui-avatars.com/api/?name=${(profile?.fullname || 'Default User').replace(' ', '+')}&background=FFA500&color=fff&size=128` }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{profile?.fullname || 'Guest User'}</Text>
                    <Text style={styles.userEmail}>{profile?.email}</Text>
                </View>
                
                <View style={styles.menuCard}>
                    <MenuItem 
                        icon="person-outline" 
                        title="Edit Profile" 
                        onPress={() => navigation.navigate('EditProfile')} 
                    />
                    <MenuItem 
                        icon="settings-outline" 
                        title="Settings" 
                        onPress={() => navigation.navigate('Settings')} 
                    />
                </View>

                <View style={styles.menuCard}>
                    <MenuItem 
                        icon="help-circle-outline" 
                        title="Help & Support" 
                        onPress={() => Alert.alert("Help", "Coming Soon!")} 
                    />
                    <MenuItem 
                        icon="log-out-outline" 
                        title="Logout" 
                        onPress={handleLogout}
                        isLogout={true}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    loader: { flex: 1, justifyContent: 'center', backgroundColor: '#f0f2f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 18, color: '#666' },
    retryButton: { backgroundColor: '#FFA500', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 20 },
    retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    
    scrollContainer: { paddingBottom: 20 },
    
    profileHeader: { 
        alignItems: 'center', 
        paddingVertical: 24, 
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    avatar: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        borderWidth: 3, 
        borderColor: '#FFA500' 
    },
    userName: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        marginTop: 12,
        color: '#121212'
    },
    userEmail: { 
        fontSize: 16, 
        color: 'gray', 
        marginTop: 4 
    },

    menuCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 20,
        overflow: 'hidden',
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF8E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    logoutText: {
        color: '#E53935',
        fontWeight: '600'
    }
});

export default TeacherProfileScreen;
