import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFF4CAF50);
  static const Color background = Color(0xFFE8F5E9);
  static const Color accent = Color(0xFF8BC34A);
  static const Color neutralDark = Color(0xFF1F2933);
  static const Color neutralLight = Color(0xFFF7FFF9);

  static ThemeData get theme {
    return ThemeData(
      primaryColor: primary,
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme(
        primary: primary,
        secondary: accent,
        surface: background,
        background: background,
        error: Colors.red,
        onPrimary: neutralLight,
        onSecondary: neutralDark,
        onSurface: neutralDark,
        onBackground: neutralDark,
        onError: neutralLight,
        brightness: Brightness.light,
      ),
      textTheme: GoogleFonts.poppinsTextTheme(),
      appBarTheme: AppBarTheme(
        backgroundColor: primary,
        foregroundColor: neutralLight,
        elevation: 0,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: neutralLight,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
