import 'dart:convert';
import 'package:http/http.dart' as http;

class AIService {
  final String baseUrl = 'http://localhost:8000';

  Future<Map<String, dynamic>> processData(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/process'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(data),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to process data');
    }
  }
} 