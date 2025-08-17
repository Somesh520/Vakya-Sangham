// File: screens/UserDetailsScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    ActivityIndicator, SafeAreaView, Image, Alert, TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../UserManagementNavigator'; // ✅ पाथ सही किया गया
import { useAuth } from '../AuthContext'; // ✅ 'स्मार्ट रिफ्रेश' के लिए इम्पोर्ट करें
import api from '../api';
import { format } from 'date-fns';

// User का टाइप, आपके 'fullname' नियम के अनुसार
interface UserDetails {
    _id: string;
    fullname: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    phoneNumber?: string;
    isVerified: boolean;
    isOnboarded: boolean;
    createdAt: string;
    profileImageURL?: string;
}

type UserDetailsRouteProp = RouteProp<UserManagementStackParamList, 'UserDetails'>;
type UserDetailsNavigationProp = StackNavigationProp<UserManagementStackParamList, 'UserDetails'>;

const formatDateSafely = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), 'dd MMM, yyyy');
    } catch (error) {
        return 'Invalid Date';
    }
};

interface DetailRowProps {
    label: string;
    value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const UserDetailsScreen: React.FC = () => {
    const route = useRoute<UserDetailsRouteProp>();
    const navigation = useNavigation<UserDetailsNavigationProp>();
    const { setDataDirty } = useAuth(); // ✅ 'स्मार्ट रिफ्रेश' के लिए फंक्शन लें
    const { userId } = route.params;

    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUserDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/admin/users/${userId}`);
            if (response.data.success) {
                setUser(response.data.user);
            } else {
                setError('User not found.');
            }
        } catch (err) {
            setError('Failed to fetch user details.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useFocusEffect(
        useCallback(() => {
            fetchUserDetails();
        }, [fetchUserDetails])
    );

    const handleDeleteUser = () => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete ${user?.fullname}? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await api.delete(`/api/admin/users/${userId}`);
                            Alert.alert("Success", "User has been deleted.");
                            setDataDirty(true); // ✅ डैशबोर्ड को बताएं कि डेटा बदल गया है
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete user.");
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handlePromoteToTeacher = () => {
        Alert.alert(
            "Promote User",
            `Are you sure you want to promote ${user?.fullname} to a Teacher?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Promote",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            const response = await api.patch(`/api/admin/users/${userId}/promote`);
                            setUser(response.data.user);
                            Alert.alert("Success", "User has been promoted to teacher.");
                            setDataDirty(true); // ✅ डैशबोर्ड को बताएं कि डेटा बदल गया है
                        } catch (err) {
                            Alert.alert("Error", "Failed to promote user.");
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" color="#FFA500" /></SafeAreaView>;
    }

    if (error || !user) {
        return <SafeAreaView style={styles.centered}><Text style={styles.errorText}>{error || 'User data not available.'}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                 <View style={styles.profileHeader}>
                    <Image
                        source={{ uri: user.profileImageURL || `https://ui-avatars.com/api/?name=${(user.fullname || 'N A').replace(' ', '+')}&size=128` }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{user.fullname}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <DetailRow label="Role" value={user.role} />
                    <DetailRow label="Phone Number" value={user.phoneNumber || 'Not provided'} />
                    <DetailRow label="Email Verified" value={user.isVerified ? 'Yes' : 'No'} />
                    <DetailRow label="Onboarded" value={user.isOnboarded ? 'Yes' : 'No'} />
                    <DetailRow label="Joined On" value={formatDateSafely(user.createdAt)} />
                </View>

                <View style={styles.actionsContainer}>
                    <Text style={styles.actionsTitle}>Admin Actions</Text>

                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={() => navigation.navigate('EditProfile', { userId: user._id })}
                        disabled={actionLoading}
                    >
                        <Text style={styles.actionButtonText}>Edit User Info</Text>
                    </TouchableOpacity>

                    {user.role === 'student' && (
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.promoteButton]} 
                            onPress={handlePromoteToTeacher}
                            disabled={actionLoading}
                        >
                            <Text style={styles.actionButtonText}>Promote to Teacher</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]} 
                        onPress={handleDeleteUser}
                        disabled={actionLoading}
                    >
                        <Text style={styles.actionButtonText}>Delete User</Text>
                    </TouchableOpacity>

                    {actionLoading && <ActivityIndicator style={{ marginTop: 10 }} color="#FFA500" />}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    profileHeader: { alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#212529' },
    userEmail: { fontSize: 16, color: '#6C757D', marginTop: 4 },
    detailsContainer: { paddingHorizontal: 20, backgroundColor: '#fff', paddingTop: 10, paddingBottom: 10 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    detailLabel: { fontSize: 16, color: '#6C757D' },
    detailValue: { fontSize: 16, color: '#212529', fontWeight: '600', textTransform: 'capitalize' },
    actionsContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    actionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    actionButton: {
        backgroundColor: '#007BFF',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    promoteButton: {
        backgroundColor: '#28A745',
    },
    deleteButton: {
        backgroundColor: '#DC3545',
    },
});

export default UserDetailsScreen;