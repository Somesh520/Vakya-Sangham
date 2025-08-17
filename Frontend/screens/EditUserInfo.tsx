import React,{ useState, useEffect } from 'react';
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
import { UserManagementStackParamList } from '../UserManagementNavigator'; // ✅ पाथ सही करें
import api from '../api';
import { TextInput, Button, Text, Switch, Title, Menu, Divider } from 'react-native-paper'; // ✅ Menu, Divider इम्पोर्ट करें

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

type EditProfileRouteProp = RouteProp<UserManagementStackParamList, 'EditProfile'>;
type EditProfileNavigationProp = StackNavigationProp<UserManagementStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC = () => {
    const route = useRoute<EditProfileRouteProp>();
    const navigation = useNavigation<EditProfileNavigationProp>();
    const { userId } = route.params;

    const [formData, setFormData] = useState<Partial<UserDetails>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // ✅ 1. मेन्यू को खोलने और बंद करने के लिए स्टेट
    const [menuVisible, setMenuVisible] = useState(false);
    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

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

    const handleInputChange = (name: keyof UserDetails, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
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
                navigation.goBack();
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
                    label="Full name"
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
                
                {/* ✅ 2. Role के लिए TextInput को Menu से बदल दिया गया है */}
                <Menu
                    visible={menuVisible}
                    onDismiss={closeMenu}
                    anchor={
                        <Button 
                            onPress={openMenu} 
                            mode="outlined" 
                            icon="chevron-down"
                            contentStyle={styles.dropdownButton}
                            style={styles.dropdown}
                            labelStyle={styles.dropdownLabel}
                        >
                            {`Role: ${formData.role || 'Select'}`}
                        </Button>
                    }
                >
                    <Menu.Item 
                        onPress={() => { handleInputChange('role', 'student'); closeMenu(); }} 
                        title="Student" 
                    />
                    <Divider />
                    <Menu.Item 
                        onPress={() => { handleInputChange('role', 'teacher'); closeMenu(); }} 
                        title="Teacher" 
                    />
                    <Divider />
                    <Menu.Item 
                        onPress={() => { handleInputChange('role', 'admin'); closeMenu(); }} 
                        title="Admin" 
                    />
                </Menu>

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
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 4,
        backgroundColor: '#FFF'
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
        fontSize: 16,
        textAlign: 'center'
    },
    // ✅ 3. ड्रॉपडाउन के लिए नए स्टाइल्स
    dropdown: {
        marginTop: 5,
        marginBottom: 15,
        borderColor: '#888', // React Native Paper 'outlined' mode color
    },
    dropdownButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    dropdownLabel: {
        fontSize: 16,
        textTransform: 'capitalize',
        color: '#333'
    }
});

export default EditProfileScreen;