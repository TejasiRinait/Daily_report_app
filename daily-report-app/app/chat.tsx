import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import Colors from "./theme";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [myRole, setMyRole] = useState("");
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const initChat = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");
      setMyRole(role || "");

      const res = await axios.get(
        "http://192.168.29.51:5000/chat-history",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(res.data);

      socketRef.current = io("http://192.168.29.51:5000");

      socketRef.current.on("message", (data: any) => {
        setMessages((prev) => [...prev, data]);
      });
    };

    initChat();

    return () => socketRef.current?.disconnect();
  }, []);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socketRef.current.emit("message", {
        sender: myRole,
        message: message,
      });
      setMessage("");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, padding: 15 }}>
      <Text style={{
        fontSize: 22,
        fontWeight: "bold",
        color: Colors.secondary,
        marginBottom: 10
      }}>
        Team Chat
      </Text>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const isMe = item.sender === myRole;

          return (
            <View style={{
              alignSelf: isMe ? "flex-end" : "flex-start",
              backgroundColor: isMe ? Colors.primary : Colors.card,
              padding: 12,
              marginVertical: 5,
              borderRadius: 12,
              maxWidth: "75%",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2
            }}>
              <Text style={{
                fontWeight: "bold",
                color: isMe ? "white" : Colors.textDark
              }}>
                {item.sender}
              </Text>
              <Text style={{
                color: isMe ? "white" : Colors.textDark
              }}>
                {item.message}
              </Text>
            </View>
          );
        }}
      />

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type message..."
          style={{
            flex: 1,
            backgroundColor: Colors.card,
            padding: 12,
            borderRadius: 10,
            marginRight: 10
          }}
        />

        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: Colors.primary,
            padding: 12,
            borderRadius: 10
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}