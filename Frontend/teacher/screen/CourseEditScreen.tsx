import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Alert, Image,
    TouchableOpacity, PermissionsAndroid, Platform, ActivityIndicator, SafeAreaView,
    TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import api from '../../api';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { TeacherStackParamList } from '../navigation/TeacherNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';

// --- Type Definitions ---
type EditScreenRouteProp = RouteProp<TeacherStackParamList, 'CourseEdit'>;
interface InputFieldProps {
    label: string;
    icon: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address';
}
interface PickerItem {
    label: string;
    value: string;
}
interface PickerFieldProps {
    label: string;
    icon: string;
    selectedValue: string;
    onValueChange: (value: string) => void;
    items: PickerItem[];
}

// --- Custom Components ---
const InputField = ({ label, icon, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: InputFieldProps) => (
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
                keyboardType={keyboardType}
            />
        </View>
    </View>
);

const PickerField = ({ label, icon, selectedValue, onValueChange, items }: PickerFieldProps) => (
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

// --- Main Component ---
const CourseEditScreen = () => {
    const navigation = useNavigation<NavigationProp<TeacherStackParamList>>();
    const route = useRoute<EditScreenRouteProp>();
    const courseToEdit = route.params?.course;

    const [title, setTitle] = useState(courseToEdit?.title || '');
    const [description, setDescription] = useState(courseToEdit?.description || '');
    const [category, setCategory] = useState(courseToEdit?.category || '');
    const [price, setPrice] = useState(courseToEdit?.price?.toString() || '');
    const [language, setLanguage] = useState(courseToEdit?.language || '');
    const [level, setLevel] = useState<string>(courseToEdit?.level || 'Beginner');
    const [isLoading, setIsLoading] = useState(false);
    const [thumbnail, setThumbnail] = useState<Asset | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const isEditing = !!courseToEdit;
        let isValid = false;

        const allTextFieldsFilled =
            title.trim() !== '' &&
            description.trim() !== '' &&
            category.trim() !== '' &&
            language.trim() !== '' &&
            level.trim() !== '';

        if (isEditing) {
            isValid = allTextFieldsFilled;
        } else {
            isValid = allTextFieldsFilled && thumbnail !== null;
        }

        setIsFormValid(isValid);
    }, [title, description, category, language, level, thumbnail, courseToEdit]);

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

    const handlePickThumbnail = async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) {
            Alert.alert("Permission Denied", "You need to allow access to photos.");
            return;
        }
        launchImageLibrary({ mediaType: "photo", quality: 0.7 }, (response) => {
            if (response.didCancel || response.errorCode) return;
            if (response.assets && response.assets[0]) {
                setThumbnail(response.assets[0]);
            }
        });
    };

    const handleSubmit = async () => {
        if (!isFormValid) {
             Alert.alert("Incomplete Form", "Please fill out all required fields and select a thumbnail.");
             return;
        }

        setIsLoading(true);
        try {
            const courseData = new FormData();
            courseData.append('title', title);
            courseData.append('description', description);
            courseData.append('category', category);
            courseData.append('price', Number(price) || 0);
            courseData.append('language', language);
            courseData.append('level', level);

            if (thumbnail) {
                courseData.append('thumbnail', {
                    uri: thumbnail.uri,
                    type: thumbnail.type || 'image/jpeg',
                    name: thumbnail.fileName || 'thumbnail.jpg',
                } as any);
            }

            if (courseToEdit) {
                await api.patch(`/api/${courseToEdit._id}`, courseData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/api/createcourse', courseData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            navigation.goBack();
        } catch (error: any) {
             if (error.response) {
                console.error("Server Error Response:", JSON.stringify(error.response.data, null, 2));
             } else {
                console.error("Failed to save course:", error);
             }
             const message = error.response?.data?.message || "Could not save the course.";
             Alert.alert("Error", message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // ✅ New function to format the price for the input field display
    const formatPriceForDisplay = (value: string) => {
        if (value === '0') {
            return 'Free';
        }
        return value;
    };

    // ✅ New handler for the price input to manage state correctly
    const handlePriceChange = (text: string) => {
        if (text.toLowerCase() === 'free') {
            setPrice('0');
        } 
        else if (/^\d*$/.test(text)) { 
            setPrice(text);
        }
    };
    
    const thumbnailUri = thumbnail?.uri || courseToEdit?.thumbnailURL;

    return (
        <SafeAreaView style={styles.container}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Saving...</Text>
                </View>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <Text style={styles.headerTitle}>{courseToEdit ? 'Edit Course' : 'Create New Course'}</Text>
                    <Text style={styles.label}>Course Thumbnail</Text>
                    <TouchableOpacity style={styles.thumbnailPicker} onPress={handlePickThumbnail}>
                        {thumbnailUri ? (
                            <Image source={{ uri: thumbnailUri }} style={styles.thumbnailImage} />
                        ) : (
                            <View style={styles.thumbnailPlaceholder}>
                                <Ionicons name="image-outline" size={40} color="#A0AEC0" />
                                <Text style={styles.thumbnailPlaceholderText}>Tap to upload an image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <InputField label="Course Title" icon="text-outline" value={title} onChangeText={setTitle} placeholder="e.g., Introduction to Sanskrit" />
                    <InputField label="Course Description" icon="document-text-outline" value={description} onChangeText={setDescription} multiline placeholder="Describe what students will learn." />
                    <InputField label="Category" icon="grid-outline" value={category} onChangeText={setCategory} placeholder="e.g., Language, Spirituality" />
                    <InputField label="Language" icon="language-outline" value={language} onChangeText={setLanguage} placeholder="e.g., Sanskrit" />
                    <PickerField label="Level" icon="bar-chart-outline" selectedValue={level} onValueChange={setLevel} items={[
                        { label: "Beginner", value: "Beginner" },
                        { label: "Intermediate", value: "Intermediate" },
                        { label: "Advanced", value: "Advanced" },
                    ]} />

                    {/* ✅ Updated Price InputField to use the new handlers */}
                    <InputField 
                        label="Price (₹)" 
                        icon="cash-outline" 
                        value={formatPriceForDisplay(price)} 
                        onChangeText={handlePriceChange} 
                        keyboardType="numeric" 
                        placeholder="e.g., 499 (or type 'Free')" 
                    />

                </View>
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.saveButton, (!isFormValid || isLoading) && styles.disabledButton]} 
                    onPress={handleSubmit} 
                    disabled={!isFormValid || isLoading}
                >
                    <Text style={styles.saveButtonText}>{courseToEdit ? "Update Course" : "Create Course"}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    loadingText: { color: '#FFFFFF', marginTop: 10, fontSize: 16, fontWeight: '600' },
    formContainer: { padding: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A202C', marginBottom: 25 },
    label: { fontSize: 16, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
    fieldContainer: { marginBottom: 20 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    inputIcon: { paddingLeft: 15 },
    input: { flex: 1, height: 50, fontSize: 16, color: '#1A202C', paddingHorizontal: 15 },
    multilineInput: { height: 120, textAlignVertical: 'top', paddingTop: 15 },
    picker: { flex: 1, color: '#1A202C' },
    thumbnailPicker: {
        height: 200,
        borderRadius: 12,
        backgroundColor: '#EDF2F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        marginBottom: 20,
        overflow: 'hidden',
    },
    thumbnailImage: { width: '100%', height: '100%' },
    thumbnailPlaceholder: { alignItems: 'center' },
    thumbnailPlaceholderText: {
        marginTop: 10,
        color: '#A0AEC0',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EDF2F7' },
    saveButton: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 12, alignItems: 'center' },
    saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#A0AEC0' },
});

export default CourseEditScreen;