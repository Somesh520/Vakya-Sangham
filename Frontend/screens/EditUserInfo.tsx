import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../navigation/AdminNavigator'; // पाथ सही करें
import api from '../api';
import { TextInput, Button, Text, Switch, Title } from 'react-native-paper';

// User का पूरा टाइप
interface UserDetails {
    _id: string;
    fullname: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    phoneNumber?: string;
    isVerified: boolean;
    isOnboarded: boolean;
}

type EditProfileRouteProp = RouteProp<AdminStackParamList, 'EditProfile'>;
type EditProfileNavigationProp = StackNavigationProp<AdminStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC = () => {
    const route = useRoute<EditProfileRouteProp>();
    const navigation = useNavigation<EditProfileNavigationProp>();
    const { userId } = route.params;

    // --- State Management ---
    const [formData, setFormData] = useState<Partial<UserDetails>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch Initial Data ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get(`/api/admin/users/${userId}`);
                if (response.data.success) {
                    setFormData(response.data.user);
                } else {
                    setError('User not found.');
                }
            } catch (err) {
                setError('Failed to load user data.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [userId]);

    // --- Handlers ---
    const handleInputChange = (name: keyof UserDetails, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            // Backend को सिर्फ वही फील्ड्स भेजें जो बदलने लायक हैं
            const updatePayload = {
                fullname: formData.fullname,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                role: formData.role,
                isVerified: formData.isVerified,
                isOnboarded: formData.isOnboarded,
            };
            const response = await api.patch(`/api/admin/users/${userId}`, updatePayload);

            if (response.data.success) {
                Alert.alert("Success", "User profile updated successfully!");
                navigation.goBack(); // वापस Details स्क्रीन पर जाएं
            } else {
                Alert.alert("Error", response.data.message || "Could not update profile.");
            }
        } catch (err) {
            Alert.alert("Error", "An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" color="#FFA500" /></SafeAreaView>;
    }
    
    if (error) {
        return <SafeAreaView style={styles.centered}><Text style={styles.errorText}>{error}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Title style={styles.headerTitle}>Edit Profile</Title>
                
                <TextInput
                    label="Full Name"
                    value={formData.fullname}
                    onChangeText={(text) => handleInputChange('fullname', text)}
                    style={styles.input}
                    mode="outlined"
                />
                <TextInput
                    label="Email"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                />
                <TextInput
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChangeText={(text) => handleInputChange('phoneNumber', text)}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="phone-pad"
                />
                {/* Note: A picker would be better for 'role', but TextInput is simpler for this example */}
                 <TextInput
                    label="Role (student, teacher, admin)"
                    value={formData.role}
                    onChangeText={(text) => handleInputChange('role', text as 'student' | 'teacher' | 'admin')}
                    style={styles.input}
                    mode="outlined"
                />

                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Email Verified</Text>
                    <Switch value={formData.isVerified} onValueChange={(value) => handleInputChange('isVerified', value)} />
                </View>
                 <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Is Onboarded</Text>
                    <Switch value={formData.isOnboarded} onValueChange={(value) => handleInputChange('isOnboarded', value)} />
                </View>

                <Button
                    mode="contained"
                    onPress={handleSaveChanges}
                    loading={saving}
                    disabled={saving}
                    style={styles.saveButton}
                    labelStyle={styles.saveButtonText}
                >
                    Save Changes
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
};


// Styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 15,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 15,
    },
    switchLabel: {
        fontSize: 16,
        color: '#333'
    },
    saveButton: {
        marginTop: 20,
        paddingVertical: 8,
        backgroundColor: '#FFA500'
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        fontSize: 16
    }
});

export default EditProfileScreen;