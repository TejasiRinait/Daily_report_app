import { View, Text, FlatList, Button } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        "http://192.168.29.51:5000/my-notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(res.data);
    } catch (error) {
      console.log("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      await axios.put(
        `http://192.168.29.51:5000/mark-notification/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchNotifications();
    } catch (error) {
      console.log("Error marking notification:", error);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Notifications 🔔
      </Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              marginBottom: 10,
              backgroundColor: item.is_read ? "#f0f0f0" : "#ffeeba",
            }}
          >
            <Text>{item.message}</Text>

            {!item.is_read && (
              <Button
                title="Mark as Read"
                onPress={() => markAsRead(item._id)}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}