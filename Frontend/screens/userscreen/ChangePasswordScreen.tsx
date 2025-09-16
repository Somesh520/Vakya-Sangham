import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar
} from "react-native";
import { useAuth } from "../../AuthContext";

const ChangePasswordScreen = () => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Please enter both current and new password.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Status bar color to match theme */}
      <StatusBar backgroundColor="#F5E8C7" barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Change Password</Text>

        {/* Current Password */}
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Enter current password"
          placeholderTextColor="#888"
        />

        {/* New Password */}
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Enter new password"
          placeholderTextColor="#888"
        />

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.6 }]} 
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Updating..." : "Update Password"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5E8C7", 
    paddingTop:20, 
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,              
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4A4135",
    textAlign: "center",         // ✅ center for consistency
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#4A4135",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FFA500",   // ✅ matches your theme
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default ChangePasswordScreen;
