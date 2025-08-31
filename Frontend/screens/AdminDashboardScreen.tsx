// File: screens/AdminDashboardScreen.tsx

import React, { useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    ActivityIndicator, Image, RefreshControl, SafeAreaView, Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from '../AdminNavigator';
import { useAuth } from '../AuthContext';
import api from '../api';
import { formatDistanceToNow } from 'date-fns';
import Ionicons from 'react-native-vector-icons/Ionicons';

// --- Type Definitions ---
interface DashboardStats {
    totalUsers: number;
    activeCourses: number;
    totalTeachers: number;
    systemHealth: string;
}

interface Activity {
    _id: string;
    description: string;
    type: 'user_registration' | 'course_creation' | 'system_update' | 'user_deletion';
    user?: { fullname: string; profileImageURL?: string } | null;
    createdAt: string;
}

// --- Helper Components ---
const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
    </View>
);

const ActionButton: React.FC<{ title: string; onPress: () => void; icon: string }> = ({ title, onPress, icon }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <Ionicons name={icon as any} size={20} color="#333" />
        <Text style={styles.actionButtonText}>{title}</Text>
    </TouchableOpacity>
);

const ActivityListItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const userExists = activity.user;
    let iconName: string = 'cog-outline';
    let iconBgColor: string = '#E8EAF6';
    let iconColor: string = '#3F51B5';

    if (activity.type === 'user_registration') {
        iconName = 'person-add-outline'; iconBgColor = '#E0F7FA'; iconColor = '#00BCD4';
    } else if (activity.type === 'course_creation') {
        iconName = 'book-outline'; iconBgColor = '#E8F5E9'; iconColor = '#4CAF50';
    } else if (activity.type === 'user_deletion') {
        iconName = 'person-remove-outline'; iconBgColor = '#FFEBEE'; iconColor = '#DC3545';
    }

    return (
        <View style={styles.activityItem}>
            <View style={[styles.activityIconContainer, { backgroundColor: iconBgColor }]}>
                {userExists?.profileImageURL ? (
                    <Image source={{ uri: userExists.profileImageURL }} style={styles.avatar} />
                ) : (
                    <Ionicons name={iconName as any} size={22} color={iconColor} />
                )}
            </View>
            <View style={styles.activityTextContainer}>
                <Text style={styles.activityDescription} numberOfLines={2}>{activity.description}</Text>
                <Text style={styles.activityTime}>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</Text>
            </View>
        </View>
    );
};

// --- Main Screen ---
type NavigationProp = BottomTabNavigationProp<AdminTabParamList, 'Dashboard'>;

const AdminDashboardScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user, isDataDirty, setDataDirty } = useAuth();
    
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!isRefreshing) setLoading(true);
        setError(null);
        try {
            const [statsRes, activitiesRes] = await Promise.all([
                api.get('/api/admin/stats'),
                api.get('/api/admin/activities')
            ]);
            if (statsRes.data.success) setStats(statsRes.data.stats);
            if (activitiesRes.data.success) setActivities(activitiesRes.data.activities);
        } catch {
            setError('Could not fetch dashboard data. Pull down to refresh.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    useFocusEffect(
        useCallback(() => {
            if (isDataDirty) {
                fetchData();
                setDataDirty(false);
            } else if (loading) {
                fetchData();
            }
        }, [isDataDirty, fetchData, setDataDirty, loading])
    );

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        setDataDirty(true);
    }, [setDataDirty]);

    if (loading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#FFA500" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#FFA500"]} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Dashboard</Text>
                        <Text style={styles.subtitle}>Welcome back, {user?.fullname || 'Admin'}!</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                        <Image source={{ uri: user?.profileImageURL || `https://ui-avatars.com/api/?name=${user?.fullname || 'A'}` }} style={styles.headerAvatar} />
                    </TouchableOpacity>
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}
                
                {/* Stats */}
                <View style={styles.statsRow}>
                    <StatCard title="Total Users" value={stats?.totalUsers ?? '-'} icon="people-outline" color="#007BFF" />
                    <StatCard title="Teachers" value={stats?.totalTeachers ?? '-'} icon="school-outline" color="#FD7E14" />
                    <StatCard title="Courses" value={stats?.activeCourses ?? '-'} icon="book-outline" color="#28A745" />
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                {user?.role === 'admin' && (
                    <ActionButton 
                        title="Create Course" 
                        onPress={() => navigation.navigate('Courses', { screen: 'CreateCourse' })} 
                        icon="add-circle-outline" 
                    />
                )}
                <ActionButton title="Manage Users" onPress={() => navigation.navigate('Users', { screen: 'ManageUsers' })} icon="people-circle-outline" />
                <ActionButton title="View Reports" onPress={() => Alert.alert('Coming Soon', 'This feature is under development.')} icon="stats-chart-outline" />
                 
                {/* Recent Activity */}
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityListContainer}>
                    {activities.length > 0 ? (
                        activities.map(item => <ActivityListItem key={item._id} activity={item} />)
                    ) : (
                        <Text style={styles.noActivityText}>No recent activities found.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    headerAvatar: { width: 45, height: 45, borderRadius: 22.5 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#212529' },
    subtitle: { fontSize: 16, color: '#6C757D', marginTop: 4 },
    errorText: { color: '#DC3545', textAlign: 'center', margin: 20, backgroundColor: '#F8D7DA', padding: 10, borderRadius: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 30, marginBottom: 15, paddingHorizontal: 20, color: '#343A40' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 },
    statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 5 },
    statIconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#212529' },
    statTitle: { fontSize: 13, color: '#6C757D', marginTop: 5 },
    actionButton: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', marginVertical: 6, marginHorizontal: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2.22, elevation: 3 },
    actionButtonText: { color: '#343A40', fontSize: 16, fontWeight: '600', marginLeft: 15 },
    activityListContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, marginHorizontal: 20, paddingHorizontal: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 5 },
    activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
    activityIconContainer: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatar: { width: 45, height: 45, borderRadius: 22.5 },
    activityTextContainer: { flex: 1 },
    activityDescription: { fontSize: 15, fontWeight: '500', color: '#212529', lineHeight: 22 },
    activityTime: { fontSize: 13, color: '#ADB5BD', marginTop: 3 },
    noActivityText: { padding: 20, textAlign: 'center', color: '#6C757D' },
});

export default AdminDashboardScreen;
