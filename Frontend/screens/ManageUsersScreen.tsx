import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, FlatList, StyleSheet,
    ActivityIndicator, TouchableOpacity, SafeAreaView, Image, RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../UserManagementNavigator'; // ✅ FIX: पाथ को सही किया गया
import api from '../api';
import { AxiosResponse } from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

// User का पूरा और सही टाइप
interface User {
    _id: string;
    fullname: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    profileImageURL?: string;
    createdAt: string;
    isOnboarded: boolean;
    progress?: number;
}

// API से मिलने वाले जवाब के लिए टाइप्स
interface UsersApiResponse {
    users: User[];
    pagination: { totalPages: number; };
}
interface SearchApiResponse {
    users: User[];
}

type ManageUsersNavigationProp = StackNavigationProp<UserManagementStackParamList, 'ManageUsers'>;

// हेल्पर कंपोनेंट: प्रोग्रेस बार
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
    </View>
);

const ManageUsersScreen: React.FC = () => {
    const navigation = useNavigation<ManageUsersNavigationProp>();

    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const fetchUsers = useCallback(async (pageNum = 1, isSearch = false, query = '') => {
        if (pageNum === 1 && !isRefreshing) setLoading(true);
        else setLoadingMore(true);
        setError(null);
        try {
            let response: AxiosResponse<UsersApiResponse | SearchApiResponse>;
            if (isSearch && query) {
                response = await api.get('/api/admin/users/search', { params: { q: query } });
                setUsers(response.data.users);
                setHasSearched(true);
            } else {
                response = await api.get('/api/admin/users', { params: { page: pageNum } });
                const resData = response.data as UsersApiResponse;
                if (pageNum === 1) {
                    setUsers(resData.users);
                } else {
                    setUsers(prevUsers => [...prevUsers, ...resData.users]);
                }
                if (resData.pagination) {
                    setTotalPages(resData.pagination.totalPages);
                }
            }
        } catch (err) {
            setError('Failed to fetch users. Please try again.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    useFocusEffect(useCallback(() => {
        if (!searchQuery) {
            fetchUsers(1);
        }
    }, [searchQuery, fetchUsers])); // ✅ Improvement: fetchUsers को dependency में जोड़ा

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery) {
                setPage(1);
                fetchUsers(1, true, searchQuery);
            } else if (hasSearched) {
                setPage(1);
                fetchUsers(1);
                setHasSearched(false);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, hasSearched, fetchUsers]);

    const handleLoadMore = () => {
        if (loadingMore || page >= totalPages || hasSearched) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchUsers(nextPage);
    };

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        setPage(1);
        setSearchQuery('');
        setHasSearched(false);
        fetchUsers(1);
    }, [fetchUsers]);

    const renderUserItem = ({ item }: { item: User }) => (
        <TouchableOpacity 
            style={styles.userItemContainer}
            onPress={() => navigation.navigate('UserDetails', { userId: item._id })}
        >
            <Image
                source={{ uri: item.profileImageURL || `https://ui-avatars.com/api/?name=${(item.fullname || 'N A').replace(' ', '+')}` }}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <View style={styles.nameAndRole}>
                 <Text style={styles.userName}>{item.fullname || 'No Name'}</Text>
                    <View style={[styles.roleBadge, styles[`role_${item.role}`]]}>
                        <Text style={styles.roleText}>{item.role}</Text>
                    </View>
                </View>
                <Text style={styles.userEmail}>{item.email}</Text>
                
                <View style={styles.statusContainer}>
                    <Ionicons 
                        name={item.isOnboarded ? "checkmark-circle" : "close-circle-outline"} 
                        size={16} 
                        color={item.isOnboarded ? '#28A745' : '#DC3545'} 
                    />
                    <Text style={[styles.statusText, {color: item.isOnboarded ? '#28A745' : '#DC3545'}]}>
                        {item.isOnboarded ? " Onboarded" : " Not Onboarded"}
                    </Text>
                </View>

                {typeof item.progress === 'number' && (
                    <View style={styles.progressSection}>
                        <Text style={styles.progressText}>Progress: {item.progress}%</Text>
                        <ProgressBar progress={item.progress} />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => loadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#FFA500" /> : null;

    if (loading) {
        return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" color="#FFA500" /></SafeAreaView>;
    }

    if (error && !users.length) {
        return <SafeAreaView style={styles.centered}><Text style={styles.errorText}>{error}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
             <View style={styles.header}>
                <Text style={styles.headerTitle}>Manage Users</Text>
            </View>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or email..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={<View style={styles.centered}><Text>No users found.</Text></View>}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#FFA500"]}/>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor: '#FFF' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#212529' },
    searchContainer: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    searchInput: { backgroundColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#333' },
    listContainer: { padding: 20 },
    userItemContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, marginTop: 5 },
    userInfo: { flex: 1 },
    nameAndRole: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    userName: { fontSize: 17, fontWeight: '600', color: '#212529', flexShrink: 1, marginRight: 5 },
    userEmail: { fontSize: 14, color: '#6C757D', marginBottom: 12 },
    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 10 },
    role_student: { backgroundColor: '#E0F7FA' },
    role_teacher: { backgroundColor: '#FFF3E0' },
    role_admin: { backgroundColor: '#FFEBEE' },
    roleText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize', color: '#555' },
    statusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    statusText: { marginLeft: 6, fontSize: 13, fontWeight: '500' },
    progressSection: {},
    progressText: { fontSize: 12, color: '#6C757D', marginBottom: 5 },
    progressBarContainer: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#28A745', borderRadius: 3 },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center' }
});

export default ManageUsersScreen;