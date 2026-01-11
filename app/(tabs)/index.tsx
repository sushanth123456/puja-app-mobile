import { View, Text, Pressable, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Community</Text>

      <Pressable style={styles.card}>
        <Text style={styles.cardText}>Madhwa</Text>
      </Pressable>

      <Pressable style={styles.card}>
        <Text style={styles.cardText}>Smarta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
  card: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  cardText: {
    fontSize: 16,
  },
});
