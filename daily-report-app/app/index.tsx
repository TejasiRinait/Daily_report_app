import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Colors from "./theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://192.168.29.51:5000/login",
        { email, password }
      );

      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("role", res.data.role);

      if (res.data.role === "admin") {
        router.push("/admin-dashboard");
      } else {
        router.push("/intern-dashboard");
      }

    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.background,
      justifyContent: "center",
      padding: 30
    }}>
      <Text style={{
        fontSize: 28,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 30,
        textAlign: "center"
      }}>
        Internship Management
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          backgroundColor: Colors.card,
          padding: 15,
          borderRadius: 10,
          marginBottom: 15
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{
          backgroundColor: Colors.card,
          padding: 15,
          borderRadius: 10,
          marginBottom: 20
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: Colors.primary,
          padding: 15,
          borderRadius: 10
        }}
      >
        <Text style={{
          color: "white",
          textAlign: "center",
          fontWeight: "bold"
        }}>
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}