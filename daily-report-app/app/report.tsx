import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ReportScreen() {
  const [completed, setCompleted] = useState("");
  const [pending, setPending] = useState("");
  const [remarks, setRemarks] = useState("");

  const submitReport = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        "http://192.168.29.51:5000/submit-report",
        {
          completed,
          pending,
          remarks,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Report Submitted Successfully ✅");

      setCompleted("");
      setPending("");
      setRemarks("");

    } catch (error) {
      console.log("Error submitting report:", error);
      alert("Report Submission Failed ❌");
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Submit Daily Report 📋
      </Text>

      <TextInput
        placeholder="Completed Tasks"
        value={completed}
        onChangeText={setCompleted}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Pending Tasks"
        value={pending}
        onChangeText={setPending}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Remarks"
        value={remarks}
        onChangeText={setRemarks}
        style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
      />

      <Button title="Submit Report" onPress={submitReport} />
    </View>
  );
}