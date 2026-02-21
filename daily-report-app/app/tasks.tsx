import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "./theme";

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");

  const API = "http://192.168.29.51:5000";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.get(`${API}/my-tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setTasks(res.data);
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    const token = await AsyncStorage.getItem("token");

    await axios.post(
      `${API}/add-task`,
      { task_name: newTask },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNewTask("");
    fetchTasks();
  };

  const markCompleted = async (id: string) => {
    const token = await AsyncStorage.getItem("token");

    await axios.put(
      `${API}/update-task/${id}`,
      { status: "completed" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    const token = await AsyncStorage.getItem("token");

    await axios.delete(`${API}/delete-task/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchTasks();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      
      {/* Header */}
      <View style={{
        backgroundColor: Colors.primary,
        padding: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
      }}>
        <Text style={{
          color: "white",
          fontSize: 24,
          fontWeight: "bold"
        }}>
          📋 My Tasks
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Add Task */}
        <View style={{
          flexDirection: "row",
          marginBottom: 20
        }}>
          <TextInput
            placeholder="Enter new task..."
            value={newTask}
            onChangeText={setNewTask}
            style={{
              flex: 1,
              backgroundColor: "white",
              padding: 12,
              borderRadius: 15,
              marginRight: 10
            }}
          />

          <TouchableOpacity
            onPress={addTask}
            style={{
              backgroundColor: Colors.accent,
              padding: 12,
              borderRadius: 15,
              justifyContent: "center"
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        {tasks.map((task) => (
          <View
            key={task._id}
            style={{
              backgroundColor: "white",
              padding: 18,
              borderRadius: 20,
              marginBottom: 15,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: "600",
              color: Colors.textDark
            }}>
              {task.task_name}
            </Text>

            <Text style={{
              marginTop: 5,
              color: task.status === "completed"
                ? Colors.accent
                : Colors.danger
            }}>
              {task.status.toUpperCase()}
            </Text>

            <View style={{
              flexDirection: "row",
              marginTop: 10
            }}>
              {task.status !== "completed" && (
                <TouchableOpacity
                  onPress={() => markCompleted(task._id)}
                  style={{
                    backgroundColor: Colors.primary,
                    padding: 8,
                    borderRadius: 10,
                    marginRight: 10
                  }}
                >
                  <Text style={{ color: "white" }}>
                    Complete
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => deleteTask(task._id)}
                style={{
                  backgroundColor: Colors.danger,
                  padding: 8,
                  borderRadius: 10
                }}
              >
                <Text style={{ color: "white" }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}