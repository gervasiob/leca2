import 'dart:math';
import 'package:battlefit/src/features/rpg_engine/domain/entities/player_stats.dart';

class RpgEngineService {
  // --- Leveling and EXP ---

  /// Calculates the experience required to reach a certain level.
  /// The formula is exponential to make leveling up progressively harder.
  int getExpForLevel(int level) {
    if (level <= 1) return 0;
    // Formula: 100 * (level ^ 1.5)
    return (100 * pow(level, 1.5)).floor();
  }

  /// Adds experience to the player's stats and handles level ups.
  PlayerStats addExp(PlayerStats currentStats, int expGained) {
    int newExp = currentStats.exp + expGained;
    int expForNextLevel = getExpForLevel(currentStats.level + 1);
    int newLevel = currentStats.level;
    int newSkillPoints = currentStats.skillPoints;

    // Check for level up
    while (newExp >= expForNextLevel) {
      newLevel++;
      newExp -= expForNextLevel;
      newSkillPoints += 3; // Grant 3 skill points per level up
      expForNextLevel = getExpForLevel(newLevel + 1);
    }

    return currentStats.copyWith(
      level: newLevel,
      exp: newExp,
      skillPoints: newSkillPoints,
    );
  }

  // --- Attribute Management ---

  /// Uses a skill point to upgrade a specific attribute.
  PlayerStats useSkillPoint(PlayerStats currentStats, String attribute) {
    if (currentStats.skillPoints <= 0) {
      return currentStats; // Not enough points
    }

    int newStrength = currentStats.strength;
    int newStamina = currentStats.stamina;
    int newSpeed = currentStats.speed;

    switch (attribute.toLowerCase()) {
      case 'strength':
        newStrength++;
        break;
      case 'stamina':
        newStamina++;
        break;
      case 'speed':
        newSpeed++;
        break;
      default:
        return currentStats; // Invalid attribute
    }

    return currentStats.copyWith(
      strength: newStrength,
      stamina: newStamina,
      speed: newSpeed,
      skillPoints: currentStats.skillPoints - 1,
    );
  }
}
