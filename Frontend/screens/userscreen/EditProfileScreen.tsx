<<<<<<< HEAD
import React, { useState } from 'react';

import {
    View, Text, StyleSheet, ScrollView, Alert, Image,
    TouchableOpacity, PermissionsAndroid, Platform, ActivityIndicator, SafeAreaView,
    TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
=======
import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    StyleSheet, 
    Alert, 
    ScrollView, 
    Text, 
    TouchableOpacity, 
    Platform,
    SafeAreaView,
    TextInput
} from 'react-native';

// External Libraries
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
>>>>>>> origin/master
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ActivityIndicator, Avatar, ProgressBar } from 'react-native-paper';
import { View as MotiView } from 'moti';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

// Internal Imports
import { RootStackParamList } from '../../types'; // Adjust path if needed
import { useAuth } from '../../AuthContext'; // Adjust path if needed
import api from '../../api'; // Adjust path if needed

<<<<<<< HEAD
interface InputFieldProps {
    label: string;
    icon: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address';
}

const InputField = ({ label, icon, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: InputFieldProps) => (
    <View style={styles.inputContainer}>
        <Ionicons name={icon} size={22} color="#A0AEC0" style={styles.inputIcon} />
        <TextInput
            style={[styles.input, multiline && styles.multilineInput]}
            placeholder={placeholder}
            placeholderTextColor="#A0AEC0"
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            keyboardType={keyboardType}
        />
    </View>
);

interface PickerItem { label: string; value: string; }
interface PickerFieldProps {
    label: string;
    icon: string;
    selectedValue: string;
    onValueChange: (value: string) => void;
    items: PickerItem[];
}

const PickerField = ({ label, icon, selectedValue, onValueChange, items }: PickerFieldProps) => (
    <View style={styles.inputContainer}>
        <Ionicons name={icon} size={22} color="#A0AEC0" style={styles.inputIcon} />
        <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
            dropdownIconColor="#4A90E2"
        >
            {items.map(item => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
        </Picker>
    </View>
);

const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
);

// --- Main Component ---

export default function EditProfileScreen() {
    const { user: authUser, refreshUser } = useAuth(); // Get user for header and refresh function
=======
// --- Custom Components ---
const InputField = ({ label, icon, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: { label: string, icon: string, value: string, onChangeText: (text: string) => void, placeholder: string, multiline?: boolean, keyboardType?: any }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputWrapper}>
            <Ionicons name={icon} size={22} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput
                style={[styles.input, multiline && styles.multilineInput]}
                placeholder={placeholder}
                placeholderTextColor="#A0AEC0"
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                keyboardType={keyboardType}
            />
        </View>
    </View>
);

const PickerField = ({ label, icon, selectedValue, onValueChange, items }: { label: string, icon: string, selectedValue: any, onValueChange: (value: any) => void, items: { label: string, value: string }[] }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputWrapper}>
            <Ionicons name={icon} size={22} color="#A0AEC0" style={styles.inputIcon} />
            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                style={styles.picker}
                dropdownIconColor="#4A90E2"
            >
                {items.map(item => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
            </Picker>
        </View>
    </View>
);

const EditProfileScreen: React.FC<any> = ({ route, navigation }) => {
    const { user: authUser, refreshUser } = useAuth();
>>>>>>> origin/master
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    
    const [formData, setFormData] = useState({
        dateOfBirth: null as Date | null,
        education: "",
        state: "",
        district: "",
        goal: "",
        contentPreference: "",
        timeAvailability: "",
        level: "",
        bio: "",
        socialLinks: "",
        preferredLanguage: "",
        interest: "",
        hasTakenOnlineCourses: "false",
    });
    const [profileImage, setProfileImage] = useState<Asset | null>(null);
    const [resume, setResume] = useState<DocumentPickerResponse | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('0/13');

    useEffect(() => {
        const fields = Object.values(formData);
        const completedFields = fields.filter(field => (typeof field === 'string' ? field.trim() !== '' : field !== null)).length;
        setProgress(completedFields / fields.length);
        setProgressText(`${completedFields}/${fields.length} Completed`);
    }, [formData]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/user/info/me");
                const u = res.data.data;

                if (u) {
                    setFormData({
                        dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth) : null,
                        education: u.education || "",
                        state: u.state || "",
                        district: u.district || "",
                        goal: u.goal || "",
                        contentPreference: u.contentPreference || "",
                        timeAvailability: u.timeAvailability || "",
                        level: u.level || "",
                        bio: u.bio || "",
                        socialLinks: (u.socialLinks || []).join(", "),
                        preferredLanguage: u.preferredLanguage || "",
                        interest: u.interest || "",
                        hasTakenOnlineCourses: u.hasTakenOnlineCourses ? "true" : "false",
                    });
                    if (u.profileImageURL) {
                        setProfileImage({ uri: u.profileImageURL, type: 'image/jpeg', fileName: 'profile.jpg' } as Asset);
                    }
                }
            } catch (err) {
                console.log("Error fetching user:", err);
                Alert.alert("Error", "Could not load your profile data.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchUser();
    }, []);

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            handleInputChange('dateOfBirth', selectedDate);
        }
    };

    const handlePickImage = useCallback(async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
        if (result.assets && result.assets[0]) {
            setProfileImage(result.assets[0]);
        }
    }, []);

<<<<<<< HEAD
    const handlePickResume = async () => {
        Alert.alert("Resume Upload", "Document picker is temporarily unavailable on this build.");
    };
=======
    const handlePickResume = useCallback(async () => {
        try {
            const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.pdf] });
            setResume(res);
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) Alert.alert('Error', 'Failed to pick resume.');
        }
    }, []);
>>>>>>> origin/master

    const handleSave = useCallback(async () => {
        setLoading(true);
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'dateOfBirth' && value) {
                data.append(key, (value as Date).toISOString());
            } else if (key === 'socialLinks' && typeof value === 'string') {
                const links = value.split(",").map(link => link.trim()).filter(Boolean);
                links.forEach(link => data.append("socialLinks[]", link)); // Use [] for arrays
            } else if (key === 'hasTakenOnlineCourses') {
                data.append(key, value === 'true');
            } else if (value) {
                data.append(key, value as string);
            }
        });

        if (profileImage && !profileImage.uri?.startsWith('http')) {
            data.append("profileImage", { uri: profileImage.uri, type: profileImage.type, name: profileImage.fileName } as any);
        }
        if (resume) {
            data.append("resume", { uri: resume.uri, type: resume.type, name: resume.name } as any);
        }

        try {
            await api.patch("/user/info/onboarding", data, { headers: { "Content-Type": "multipart/form-data" } });
            await refreshUser();
            Alert.alert("Success", "Profile updated successfully!");
            navigation.goBack();
        } catch (err: any) {
            Alert.alert("Error", err.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    }, [formData, profileImage, resume, navigation, refreshUser]);

    if (isFetching) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    const profileImageUri = profileImage?.uri || `https://ui-avatars.com/api/?name=${(authUser?.fullname || 'User').replace(' ', '+')}&background=EBF8FF&color=2C5282&size=128`;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handlePickImage}>
                        <Avatar.Image size={120} source={{ uri: profileImageUri }} />
                    </TouchableOpacity>
                    <Text style={styles.userName}>{authUser?.fullname}</Text>
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>{progressText}</Text>
                        <ProgressBar progress={progress} color="#4A90E2" style={styles.progressBar} />
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar-outline" size={22} color="#A0AEC0" style={styles.inputIcon} />
                        <Text style={styles.datePickerText}>
                            {formData.dateOfBirth ? format(formData.dateOfBirth, 'dd MMMM yyyy') : 'Select Date of Birth'}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (<DateTimePicker value={formData.dateOfBirth || new Date()} mode="date" display="default" onChange={onDateChange} />)}
                    <InputField label="State" icon="map-outline" placeholder="e.g. Maharashtra" value={formData.state} onChangeText={(val) => handleInputChange('state', val)} />
                    <InputField label="District" icon="location-outline" placeholder="e.g. Mumbai" value={formData.district} onChangeText={(val) => handleInputChange('district', val)} />
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Professional & Educational</Text>
                    <PickerField label="Education" icon="school-outline" selectedValue={formData.education} onValueChange={(val) => handleInputChange('education', val)} items={[ { label: "Select Education", value: "" }, { label: "High School", value: "High school" }, { label: "College", value: "College" } ]} />
                    <InputField label="Bio" icon="document-text-outline" placeholder="Tell us about yourself" value={formData.bio} onChangeText={(val) => handleInputChange('bio', val)} multiline />
                    <InputField label="Social Links (comma separated)" icon="link-outline" placeholder="your-linkedin, your-github" value={formData.socialLinks} onChangeText={(val) => handleInputChange('socialLinks', val)} />
                    <TouchableOpacity style={styles.uploadButton} onPress={handlePickResume}>
                        <Ionicons name="document-attach-outline" size={22} color="#4A90E2" />
                        <Text style={styles.uploadButtonText}>{resume?.name || 'Upload Resume (PDF)'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Learning Preferences</Text>
                    <PickerField label="Your Goal" icon="flag-outline" selectedValue={formData.goal} onValueChange={(val) => handleInputChange('goal', val)} items={[ { label: "Select Goal", value: "" }, { label: "Learn a new skill", value: "Learn a new skill" }, { label: "Advance my career", value: "Advance my career" } ]} />
                    <PickerField label="Learning Level" icon="bar-chart-outline" selectedValue={formData.level} onValueChange={(val) => handleInputChange('level', val)} items={[ { label: "Select Level", value: "" }, { label: "Beginner", value: "Beginner" }, { label: "Intermediate", value: "Intermediate" }, { label: "Advanced", value: "Advanced" } ]} />
                    <InputField label="Interests" icon="heart-outline" placeholder="e.g. Coding, Marketing" value={formData.interest} onChangeText={(val) => handleInputChange('interest', val)} />
                    {/* <PickerField label="Preferred Content" icon="play-circle-outline" selectedValue={formData.contentPreference} onValueChange={(val) => handleInputChange('contentPreference', val)} items={[ { label: "Select Content Type", value: "" }, { label: "Video", value: "Video" }, { label: "Text", value: "Text" }, { label: "Both", value: "Both" } ]} /> */}
                    {/* <PickerField label="Time Availability" icon="time-outline" selectedValue={formData.timeAvailability} onValueChange={(val) => handleInputChange('timeAvailability', val)} items={[ { label: "Select Time", value: "" }, { label: "1-2 hours/week", value: "1-2 hours/week" }, { label: "3-5 hours/week", value: "3-5 hours/week" } ]} /> */}
                    <PickerField label="Taken Online Courses Before?" icon="help-circle-outline" selectedValue={formData.hasTakenOnlineCourses} onValueChange={(val) => handleInputChange('hasTakenOnlineCourses', val)} items={[ { label: "No", value: "false" }, { label: "Yes", value: "true" } ]} />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    contentContainer: { paddingBottom: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    userName: { fontSize: 24, fontWeight: 'bold', marginTop: 12, color: '#1A202C' },
    progressContainer: { paddingHorizontal: 40, width: '100%', marginTop: 20 },
    progressText: { textAlign: 'center', marginBottom: 8, color: '#4A5568' },
    progressBar: { height: 8, borderRadius: 4 },
    formSection: { paddingHorizontal: 20, marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#2D3748' },
    fieldContainer: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '500', color: '#4A5568', marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    inputIcon: { paddingLeft: 15 },
    input: { flex: 1, height: 50, fontSize: 16, color: '#1A202C', paddingHorizontal: 15 },
    multilineInput: { height: 100, textAlignVertical: 'top', paddingTop: 15 },
    picker: { flex: 1, height: 50, color: '#1A202C' },
    datePickerText: { flex: 1, fontSize: 16, color: '#1A202C', paddingVertical: 14, marginLeft: 10 },
    uploadButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBF8FF', borderRadius: 12, padding: 15, justifyContent: 'center' },
    uploadButtonText: { color: '#2C5282', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
    saveButton: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 12, alignItems: 'center', margin: 20 },
    saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default EditProfileScreen;