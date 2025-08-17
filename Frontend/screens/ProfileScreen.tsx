import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    ActivityIndicator, 
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    RefreshControl
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'; // Navigation type ke liye import
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth, AuthContextType } from '../AuthContext'; // AuthContextType ko import karo
import api from '../api';
import { AppTabParamList } from '../AppNavigator'; // Apne AppNavigator se types import karo
import { signOut } from '@react-native-firebase/auth';

// --- Step 1: Profile object ke liye type define karo ---
interface ProfileType {
    fullname: string;
    email: string;
    profileImageURL?: string; // Optional, ho bhi sakta hai nahi bhi
    profileProgress?: {
        percentage: number;
    };
}

// --- Step 2: Apne AuthContext.tsx me AuthContextType ko aisa update karo ---
/*
// File: AuthContext.tsx (Example)
export interface AuthContextType {
    user: any; // User ka type bhi define kar sakte ho
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void; // <-- Is line ko add karo
}
*/

const ProfileScreen = () => {
    // --- Step 3: Navigation ko sahi type do ---
    const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
    
    // Auth hook ab sahi se काम karega
    const {  signOut } = useAuth() as AuthContextType; // Type assertion se error fix

    // --- Step 4: useState ko profile ka type batao ---
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            const { data } = await api.get<ProfileType>('/user/info/profile'); // API call me bhi type de sakte hain
            setProfile(data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            Alert.alert("Error", "Could not load your profile.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchProfile();
        }, [fetchProfile])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile();
    }, [fetchProfile]);

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", onPress:  signOut, style: 'destructive' }
        ]);
    };

    const menuItems = [
        { title: 'Edit Profile', icon: 'person-circle-outline', screen: 'EditProfile' },
        { title: 'My Learning', icon: 'book-outline', screen: 'MyLearning' },
        { title: 'Settings', icon: 'settings-outline', screen: 'Settings' },
        { title: 'Help & Support', icon: 'help-circle-outline', screen: 'Help' },
    ];

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#FFA500" /></View>;
    }

    // Baaki ka JSX code bilkul waisa hi rahega, ab usme koi error nahi aayegi
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFA500']} />}
            >
                <View style={styles.profileHeader}>
                    <Image 
                        source={{ uri: profile?.profileImageURL || 'https://placehold.co/100x100?text=Avatar' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{profile?.fullname}</Text>
                    <Text style={styles.userEmail}>{profile?.email}</Text>
                </View>

                {profile && (
                    <View style={styles.progressCard}>
                        <Text style={styles.progressTitle}>Profile Completion</Text>
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${profile.profileProgress?.percentage || 0}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{profile.profileProgress?.percentage || 0}% Complete</Text>
                    </View>
                )}

                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.menuItem} 
                            onPress={() => navigation.navigate(item.screen as keyof AppTabParamList)} // Type assertion for safety
                        >
                            <Ionicons name={item.icon} size={24} color="#555" />
                            <Text style={styles.menuItemText}>{item.title}</Text>
                            <Ionicons name="chevron-forward-outline" size={22} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#ff0000ff" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

// Styles (No Change)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F5F2' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F5F2' },
    profileHeader: { alignItems: 'center', paddingVertical: 30 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FFA500' },
    userName: { fontSize: 24, fontWeight: 'bold', marginTop: 15, color: '#212121' },
    userEmail: { fontSize: 16, color: 'gray', marginTop: 5 },
    progressCard: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    progressTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    progressBarContainer: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginTop: 15 },
    progressBar: { height: '100%', backgroundColor: '#FFA500', borderRadius: 4 },
    progressText: { textAlign: 'right', marginTop: 5, color: 'gray', fontSize: 12 },
    menuContainer: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 12, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    menuItemText: { flex: 1, marginLeft: 20, fontSize: 16, color: '#212121' },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 20, paddingVertical: 15, backgroundColor: 'white', borderRadius: 12 },
    logoutButtonText: { marginLeft: 10, fontSize: 16, color: '#FF4B4B', fontWeight: 'bold' },
});

export default ProfileScreen;