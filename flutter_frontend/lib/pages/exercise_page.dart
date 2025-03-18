import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ExercisePage extends StatefulWidget {
  final String token;
  ExercisePage({required this.token});

  @override
  _ExercisePageState createState() => _ExercisePageState();
}

class _ExercisePageState extends State<ExercisePage> {
  final ApiService apiService = ApiService();
  List exercises = [];

  @override
  void initState() {
    super.initState();
    loadExercises();
  }

  Future<void> loadExercises() async {
    try {
      var data = await apiService.fetchExercises(widget.token);
      setState(() {
        exercises = data;
      });
    } catch (e) {
      print("Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Exercise History")),
      body: ListView.builder(
        itemCount: exercises.length,
        itemBuilder: (context, index) {
          return ListTile(
            title: Text(exercises[index]["exerciseName"]),
            subtitle: Text("Reps: ${exercises[index]["repetitions"]}"),
          );
        },
      ),
    );
  }
}
