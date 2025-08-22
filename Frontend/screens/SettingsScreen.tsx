import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useAuth } from '../AuthContext'; 
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'; 
import { AdminTabParamList } from '../AdminNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
type SettingsNavigationProp = BottomTabNavigationProp<AdminTabParamList, 'Settings'>;


const SettingsItem: React.FC<{ label: string; icon: string; onPress: () => void; color?: string }> = ({ label, icon, onPress, color = '#333' }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
        <Ionicons name={icon as any} size={24} color={color} style={styles.settingsIcon} />
        <Text style={[styles.settingsLabel, { color }]}>{label}</Text>
        <Ionicons name="chevron-forward-outline" size={22} color="#C7C7CC" />
    </TouchableOpacity>
);

const SettingsScreen = () => {
    const navigation = useNavigation<SettingsNavigationProp>();
    const { user, signOut } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => signOut(),
                },
            ]
        );
    };

    if (!user) {
        return <SafeAreaView style={styles.container} />;
    }

    // ✅ FIX 2: "Edit Profile" के लिए नेविगेशन को ठीक किया गया
    const handleEditProfile = () => {
        // पहले 'Users' टैब पर जाओ, फिर उसके अंदर 'EditProfile' स्क्रीन पर जाओ
        navigation.navigate('Users', { 
            screen: 'EditProfile', 
            params: { userId: user._id } 
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.profileContainer}>
                    <Image 
                        // ❗ ज़रूरी नोट: सुनिश्चित करें कि AuthContext में user.fullname है, user.fullName नहीं।
                        source={{ uri: user.profileImageURL || `https://ui-avatars.com/api/?name=${user.fullname}&background=FFA500&color=FFF` }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{user.fullname}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <SettingsItem 
                        label="Edit Profile" 
                        icon="person-outline"
                        onPress={handleEditProfile} // ✅ नए फंक्शन का उपयोग करें
                    />
                    <SettingsItem 
                        label="Change Password" 
                        icon="lock-closed-outline"
                        onPress={() => Alert.alert("Coming Soon!")}
                    />
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App</Text>
                    <SettingsItem 
                        label="Notifications" 
                        icon="notifications-outline"
                        onPress={() => Alert.alert("Coming Soon!")}
                    />
                     <View style={styles.settingsItem}>
                        <Ionicons name="information-circle-outline" size={24} color="#333" style={styles.settingsIcon} />
                        <Text style={styles.settingsLabel}>App Version</Text>
                        <Text style={styles.versionText}>1.0.0</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <SettingsItem 
                        label="Logout" 
                        icon="log-out-outline"
                        onPress={handleLogout}
                        color="#DC3545"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F2F2F7' 
    },
    profileContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 30,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
    },
    userEmail: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 4,
    },
    section: {
        marginTop: 30,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5EA',
    },
    sectionTitle: {
        fontSize: 14,
        color: '#6D6D72',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        textTransform: 'uppercase'
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderColor: '#E5E5EA',
    },
    settingsIcon: {
        marginRight: 16,
    },
    settingsLabel: {
        flex: 1,
        fontSize: 17,
    },
    versionText: {
        fontSize: 17,
        color: '#8E8E93'
    }
});

export default SettingsScreen;