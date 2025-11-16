// This is a basic Flutter widget test.
import 'package:battlefit/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('App starts and shows splash screen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the app shows a loading indicator on the splash screen.
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Cargando...'), findsOneWidget);
  });
}
