import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WeeklySummary() {
  const [summaries, setSummaries] = useState([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        "http://192.168.29.51:5000/my-weekly-summary",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSummaries(res.data);
    } catch (error) {
      console.log("Error fetching weekly summary:", error);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Weekly Summary 📊
      </Text>

      <FlatList
        data={summaries}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              marginBottom: 10,
              borderWidth: 1,
            }}
          >
            <Text>Completed: {item.total_completed}</Text>
            <Text>Pending: {item.total_pending}</Text>
            <Text>
              Week: {new Date(item.week_start).toDateString()} -
              {new Date(item.week_end).toDateString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}