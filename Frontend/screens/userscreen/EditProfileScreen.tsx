import React, { useState } from 'react';

import {
    View, Text, StyleSheet, ScrollView, Alert, Image,
    TouchableOpacity, PermissionsAndroid, Platform, ActivityIndicator, SafeAreaView,
    TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import api from '../../api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../AuthContext'; // To get the user's name for the header

// --- Custom Components for a better UI ---

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
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // --- Profile State ---
    const [formData, setFormData] = useState({
        dateOfBirth: "",
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
    const [resume, setResume] = useState<any>(null);
    const [existingProfileImageUrl, setExistingProfileImageUrl] = useState<string | undefined>(undefined);

    // --- Data Fetching ---
    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsFetching(true);
                const res = await api.get("/user/info/me");
                const u = res.data.user;
                setFormData({
                    dateOfBirth: u.dateOfBirth || "",
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
                setExistingProfileImageUrl(u.profileImageURL);
            } catch (err) {
                console.log("Error fetching user:", err);
                Alert.alert("Error", "Could not load your profile data.");
            } finally {
                setIsFetching(false);
            }
        };
        fetchUser();
    }, []);
    
    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // --- File Picking Logic ---
    const requestGalleryPermission = async () => {
        if (Platform.OS === "android") {
            try {
                const permission = Platform.Version >= 33
                    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
                const granted = await PermissionsAndroid.request(permission);
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn("Permission error:", err);
                return false;
            }
        }
        return true;
    };

    const handlePickImage = async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) {
            Alert.alert("Permission Denied", "You need to allow access to photos.");
            return;
        }
        launchImageLibrary({ mediaType: "photo", quality: 0.7 }, (response) => {
            if (response.didCancel || response.errorCode) return;
            if (response.assets && response.assets[0]) {
                setProfileImage(response.assets[0]);
            }
        });
    };

    const handlePickResume = async () => {
        Alert.alert("Resume Upload", "Document picker is temporarily unavailable on this build.");
    };

    // --- Save Logic ---
    const handleSave = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            
            // Append all text fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'socialLinks') {
                    const links = value.split(",").map(link => link.trim()).filter(Boolean);
                    links.forEach(link => data.append("socialLinks", link));
                } else if (key === 'hasTakenOnlineCourses') {
                    data.append(key, value === 'true');
                } else if (value) {
                    data.append(key, value);
                }
            });

            // Append files if they've been changed
            if (profileImage) {
                data.append("profileImage", {
                    uri: profileImage.uri,
                    type: profileImage.type || "image/jpeg",
                    name: profileImage.fileName || "profile.jpg",
                });
            }
            if (resume) {
                data.append("resume", {
                    uri: resume.uri,
                    type: resume.type || "application/pdf",
                    name: resume.name || "resume.pdf",
                });
            }

            await api.patch("/user/info/onboarding", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            await refreshUser(); // Refresh user data globally
            Alert.alert("Success", "Profile updated successfully!");

        } catch (err) {
            console.log("Error updating profile:", err);
            Alert.alert("Error", "Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (isFetching) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#4A90E2" /></View>;
    }

    const profileImageUri = profileImage?.uri || existingProfileImageUrl || `https://ui-avatars.com/api/?name=${(authUser?.fullname || 'User').replace(' ', '+')}&background=EBF8FF&color=2C5282&size=128`;

    return (
        <SafeAreaView style={styles.container}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Saving...</Text>
                </View>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Image source={{ uri: profileImageUri }} style={styles.avatar} />
                    <Text style={styles.userName}>{authUser?.fullname}</Text>
                    <Text style={styles.userEmail}>{authUser?.email}</Text>
                </View>

                <View style={styles.formContainer}>
                    <SectionHeader title="Personal Information" />
                    <InputField label="Date of Birth" icon="calendar-outline" placeholder="YYYY-MM-DD" value={formData.dateOfBirth} onChangeText={(val) => handleInputChange('dateOfBirth', val)} />
                    <InputField label="State" icon="map-outline" placeholder="e.g. Maharashtra" value={formData.state} onChangeText={(val) => handleInputChange('state', val)} />
                    <InputField label="District" icon="location-outline" placeholder="e.g. Mumbai" value={formData.district} onChangeText={(val) => handleInputChange('district', val)} />

                    <SectionHeader title="Professional Details" />
                    <PickerField label="Education" icon="school-outline" selectedValue={formData.education} onValueChange={(val) => handleInputChange('education', val)} items={[
                        { label: "Select Education", value: "" }, { label: "High School", value: "High school" }, { label: "College", value: "College" }, { label: "Master’s", value: "Master’s" }, { label: "PhD", value: "PhD" }
                    ]} />
                    <InputField label="Bio" icon="document-text-outline" placeholder="Tell us about yourself" value={formData.bio} onChangeText={(val) => handleInputChange('bio', val)} multiline />
                    <InputField label="Social Links" icon="link-outline" placeholder="your-linkedin, your-github" value={formData.socialLinks} onChangeText={(val) => handleInputChange('socialLinks', val)} />

                    <SectionHeader title="Preferences" />
                    <PickerField label="Your Goal" icon="flag-outline" selectedValue={formData.goal} onValueChange={(val) => handleInputChange('goal', val)} items={[
                        { label: "Select Goal", value: "" }, { label: "Learn a new skill", value: "Learn a new skill" }, { label: "Advance my career", value: "Advance my career" }, { label: "Start a business", value: "Start a business" }
                    ]} />
                    <PickerField label="Learning Level" icon="bar-chart-outline" selectedValue={formData.level} onValueChange={(val) => handleInputChange('level', val)} items={[
                        { label: "Select Level", value: "" }, { label: "Beginner", value: "Beginner" }, { label: "Intermediate", value: "Intermediate" }, { label: "Advanced", value: "Advanced" }
                    ]} />
                    <InputField label="Interests" icon="heart-outline" placeholder="e.g. Coding, Marketing" value={formData.interest} onChangeText={(val) => handleInputChange('interest', val)} />

                    <SectionHeader title="File Uploads" />
                    <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                        <Ionicons name="image-outline" size={22} color="#4A90E2" />
                        <Text style={styles.uploadButtonText}>{profileImage ? "Change Profile Photo" : "Upload Profile Photo"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.uploadButton} onPress={handlePickResume}>
                        <Ionicons name="document-attach-outline" size={22} color="#4A90E2" />
                        <Text style={styles.uploadButtonText}>{resume ? "Change Resume (PDF)" : "Upload Resume (PDF)"}</Text>
                        {resume && <Text style={styles.fileName}>{resume.name}</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    loadingText: { color: '#FFFFFF', marginTop: 10, fontSize: 16, fontWeight: '600' },

    header: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#4A90E2' },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#1A202C', marginTop: 12 },
    userEmail: { fontSize: 16, color: '#718096', marginTop: 4 },
    
    formContainer: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginTop: 25, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#4A90E2', paddingLeft: 10 },
    
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
    inputIcon: { padding: 12 },
    input: { flex: 1, height: 50, fontSize: 16, color: '#1A202C', paddingRight: 15 },
    multilineInput: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
    picker: { flex: 1, color: '#1A202C' },

    uploadButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBF8FF', borderRadius: 12, padding: 15, marginBottom: 15 },
    uploadButtonText: { color: '#2C5282', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
    fileName: { flex: 1, textAlign: 'right', color: '#718096', fontStyle: 'italic' },
    
    footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EDF2F7' },
    saveButton: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 12, alignItems: 'center' },
    saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
