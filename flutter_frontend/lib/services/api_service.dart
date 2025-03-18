import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl = "http://localhost:5000/api";

  // 📌 Fetch Exercise History
  Future<List<dynamic>> fetchExercises(String token) async {
    final response = await http.get(
      Uri.parse("$baseUrl/exercises/history"),
      headers: {
        "Authorization": "Bearer $token",
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception("Failed to load exercises");
    }
  }

  // 📌 Add an Exercise
  Future<void> addExercise(String token, String exerciseName, int repetitions) async {
    final response = await http.post(
      Uri.parse("$baseUrl/exercises/add"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "exerciseName": exerciseName,
        "repetitions": repetitions,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to add exercise");
    }
  }
}
