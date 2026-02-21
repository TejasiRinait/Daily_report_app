import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "./theme";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      
      {/* Dark Gradient Header */}
      <LinearGradient
        colors={["#0F172A", "#1E293B"]}
        style={{
          padding: 30,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <Text style={{ color: "white", fontSize: 26, fontWeight: "bold" }}>
          👑 Admin Dashboard
        </Text>
        <Text style={{ color: "white", marginTop: 5, opacity: 0.9 }}>
          Monitor interns and manage system.
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, marginTop: -20 }}>
        {renderCard("📑 View All Reports", "#4F46E5", () => router.push("/admin-reports"))}
        {renderCard("📋 All Tasks", "#22C55E", () => router.push("/tasks"))}
        {renderCard("🔔 Notifications", "#F59E0B", () => router.push("/notifications"))}
        {renderCard("📊 Weekly Summary", "#06B6D4", () => router.push("/weekly-summary"))}
        {renderCard("💬 Team Chat", "#EC4899", () => router.push("/chat"))}
      </ScrollView>
    </View>
  );
}

function renderCard(title: string, color: string, onPress: () => void) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20,
        marginBottom: 18,
        borderLeftWidth: 6,
        borderLeftColor: color,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <Text style={{
        fontSize: 18,
        fontWeight: "600",
        color: Colors.textDark
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}