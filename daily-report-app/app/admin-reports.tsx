import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        "http://192.168.29.51:5000/all-reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReports(res.data);
    } catch (error) {
      console.log("Error fetching reports:", error);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        All Reports (Admin) 📋
      </Text>

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>Completed: {item.completed_tasks}</Text>
            <Text>Pending: {item.pending_tasks}</Text>
            <Text>Remarks: {item.remarks}</Text>
          </View>
        )}
      />
    </View>
  );
}