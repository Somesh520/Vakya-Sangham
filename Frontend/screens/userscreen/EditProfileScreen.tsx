import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DocumentPicker from "react-native-document-picker";
import { launchImageLibrary } from "react-native-image-picker";
import api from "../../api"; // <-- your axios instance with token interceptor

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(false);

  // Profile fields
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [education, setEducation] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [goal, setGoal] = useState("");
  const [contentPreference, setContentPreference] = useState("");
  const [timeAvailability, setTimeAvailability] = useState("");
  const [level, setLevel] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [interest, setInterest] = useState("");
  const [hasTakenOnlineCourses, setHasTakenOnlineCourses] = useState("false");

  const [profileImage, setProfileImage] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);

  useEffect(() => {
    // Fetch user data to prefill form
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/info/me");
        const u = res.data.user;
        setDateOfBirth(u.dateOfBirth || "");
        setEducation(u.education || "");
        setState(u.state || "");
        setDistrict(u.district || "");
        setGoal(u.goal || "");
        setContentPreference(u.contentPreference || "");
        setTimeAvailability(u.timeAvailability || "");
        setLevel(u.level || "");
        setBio(u.bio || "");
        setSocialLinks(u.socialLinks || "");
        setPreferredLanguage(u.preferredLanguage || "");
        setInterest(u.interest || "");
        setHasTakenOnlineCourses(u.hasTakenOnlineCourses ? "true" : "false");
      } catch (err) {
        console.log("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // 📄 Pick Resume
  const handlePickResume = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
      });
      setResume(res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error("Resume picker error:", err);
      }
    }
  };

  // 🖼️ Pick Image
  const handlePickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.error("Image picker error:", response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0]);
      }
    });
  };

  // 💾 Save Profile
const handleSave = async () => {
  try {
    setLoading(true);
    const formData = new FormData();

    if (dateOfBirth) formData.append("dateOfBirth", dateOfBirth);
    if (education) formData.append("education", education);
    if (state) formData.append("state", state);
    if (district) formData.append("district", district);
    if (goal) formData.append("goal", goal);
    if (contentPreference) formData.append("contentPreference", contentPreference);
    if (timeAvailability) formData.append("timeAvailability", timeAvailability);
    if (level) formData.append("level", level);
    if (bio) formData.append("bio", bio);
  
    if (socialLinks) {
      // Split the comma-separated string into an array
      const links = socialLinks.split(",").map((link) => link.trim());
      // Append each link individually
      links.forEach((link) => {
        if (link) { // Ensure you don't append empty strings
          formData.append("socialLinks[]", link);
        }
      });
    }


    if (preferredLanguage) formData.append("preferredLanguage", preferredLanguage);
    if (interest) formData.append("interest", interest);
    formData.append("hasTakenOnlineCourses", hasTakenOnlineCourses === "true");

    if (profileImage) {
      formData.append("profileImage", {
        uri: profileImage.uri,
        type: profileImage.type || "image/jpeg",
        name: profileImage.fileName || "profile.jpg",
      } as any);
    }
    if (resume) {
      formData.append("resume", {
        uri: resume.uri,
        type: resume.type || "application/pdf",
        name: resume.name || "resume.pdf",
      } as any);
    }

    await api.patch("/user/info/onboarding", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    Alert.alert("Success", "Profile updated successfully!");
  } catch (err) {
    console.log("Error updating profile:", err);
    Alert.alert("Error", "Failed to update profile");
  } finally {
    setLoading(false);
  }
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Date of Birth */}
      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      {/* Education */}
      <Text style={styles.label}>Education</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={education} onValueChange={setEducation}>
          <Picker.Item label="Select Education" value="" />
          <Picker.Item label="Primary School" value="Primary School" />
          <Picker.Item label="High school" value="High school" />
          <Picker.Item label="College" value="College" />
          <Picker.Item label="Master’s" value="Master’s" />
          <Picker.Item label="PhD" value="PhD" />
        </Picker>
      </View>

      {/* Goal */}
      <Text style={styles.label}>Goal</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={goal} onValueChange={setGoal}>
          <Picker.Item label="Select Goal" value="" />
          <Picker.Item label="Learn a new skill" value="Learn a new skill" />
          <Picker.Item label="Advance my career" value="Advance my career" />
          <Picker.Item label="Start a business" value="Start a business" />
          <Picker.Item label="Grow my business" value="Grow my business" />
        </Picker>
      </View>

      <Text style={styles.label}>Content Preference</Text>
<View style={styles.pickerWrapper}>
  <Picker
    selectedValue={contentPreference}
    onValueChange={setContentPreference}
  >
    <Picker.Item label="Select Preference" value="" />
    <Picker.Item label="Video courses" value="Video courses" />
    <Picker.Item label="PDFs" value="PDFs" />
    <Picker.Item label="Live mentorship" value="Live mentorship" />
  </Picker>
</View>

{/* Time Availability */}
<Text style={styles.label}>Time Availability</Text>
<View style={styles.pickerWrapper}>
  <Picker
    selectedValue={timeAvailability}
    onValueChange={setTimeAvailability}
  >
    <Picker.Item label="Select Time" value="" />
    <Picker.Item label="<15 minutes" value="<15 minutes" />
    <Picker.Item label="15-30 minutes" value="15-30 minutes" />
    <Picker.Item label="30-60 minutes" value="30-60 minutes" />
    <Picker.Item label=">1 hour" value=">1 hour" />
  </Picker>
</View>

      {/* Level */}
      <Text style={styles.label}>Level</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={level} onValueChange={setLevel}>
          <Picker.Item label="Select Level" value="" />
          <Picker.Item label="Beginner" value="Beginner" />
          <Picker.Item label="Intermediate" value="Intermediate" />
          <Picker.Item label="Advanced" value="Advanced" />
        </Picker>
      </View>

      {/* State */}
      <Text style={styles.label}>State</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter State"
        value={state}
        onChangeText={setState}
      />

      {/* District */}
      <Text style={styles.label}>District</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter District"
        value={district}
        onChangeText={setDistrict}
      />

      {/* Bio */}
      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Write about yourself"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      {/* Social Links */}
      <Text style={styles.label}>Social Links</Text>
      <TextInput
        style={styles.input}
        placeholder="Your social profile link"
        value={socialLinks}
        onChangeText={setSocialLinks}
      />

      {/* Preferred Language */}
      <Text style={styles.label}>Preferred Language</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Hindi, English"
        value={preferredLanguage}
        onChangeText={setPreferredLanguage}
      />

      {/* Interest */}
      <Text style={styles.label}>Interest</Text>
      <TextInput
        style={styles.input}
        placeholder="Your interest"
        value={interest}
        onChangeText={setInterest}
      />

      {/* Has Taken Online Courses */}
      <Text style={styles.label}>Taken Online Courses?</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={hasTakenOnlineCourses}
          onValueChange={setHasTakenOnlineCourses}
        >
          <Picker.Item label="No" value="false" />
          <Picker.Item label="Yes" value="true" />
        </Picker>
      </View>

      {/* Image Preview */}
      {profileImage && (
        <Image source={{ uri: profileImage.uri }} style={styles.imagePreview} />
      )}

      <TouchableOpacity style={styles.btn} onPress={handlePickImage}>
        <Text style={styles.btnText}>Upload Profile Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handlePickResume}>
        <Text style={styles.btnText}>Upload Resume</Text>
      </TouchableOpacity>

      <Button
        title={loading ? "Saving..." : "Save Profile"}
        onPress={handleSave}
        disabled={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { fontWeight: "600", marginTop: 15, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginVertical: 10,
  },
  btn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});
