import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // ✅ Picker import
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import api from "../api";

const CreateCourseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userToken, setDataDirty } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = ["Programming", "Mathematics", "Science", "History"];
  const languages = ["English", "Hindi", "Spanish", "French"];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  const handleSubmit = async () => {
    if (!title || !description || !category || !language || !level) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        "/api/createcourse",
        { title, description, category, price: Number(price), language, level },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (res.data.success) {
        Alert.alert("Success", "Course created successfully!", [
          {
            text: "OK",
            onPress: () => {
              setDataDirty(true);
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert("Error", res.data.message || "Something went wrong.");
      }
    } catch (error: any) {
      console.error("Create course error:", error);
      Alert.alert("Error", error.response?.data?.message || "Server error.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Create New Course</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Description"
          placeholderTextColor="#aaa"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Category Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => setCategory(value)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        {/* Price */}
        <TextInput
          style={styles.input}
          placeholder="Price (optional)"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        {/* Language Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={language}
            onValueChange={(value) => setLanguage(value)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Select Language" value="" />
            {languages.map((lang) => (
              <Picker.Item key={lang} label={lang} value={lang} />
            ))}
          </Picker>
        </View>

        {/* Level Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={level}
            onValueChange={(value) => setLevel(value)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Select Level" value="" />
            {levels.map((lvl) => (
              <Picker.Item key={lvl} label={lvl} value={lvl} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Course</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E1E1E" },
  scrollContainer: { padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: "#333",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: {
    color: "#fff",
    height: 50,
  },
  button: {
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default CreateCourseScreen;
