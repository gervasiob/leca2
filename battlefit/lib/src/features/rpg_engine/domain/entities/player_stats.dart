class PlayerStats {
  final int level;
  final int exp;
  final int strength;
  final int stamina;
  final int speed;
  final int energy;
  final int skillPoints;

  PlayerStats({
    this.level = 1,
    this.exp = 0,
    this.strength = 1,
    this.stamina = 1,
    this.speed = 1,
    this.energy = 100,
    this.skillPoints = 0,
  });

  PlayerStats copyWith({
    int? level,
    int? exp,
    int? strength,
    int? stamina,
    int? speed,
    int? energy,
    int? skillPoints,
  }) {
    return PlayerStats(
      level: level ?? this.level,
      exp: exp ?? this.exp,
      strength: strength ?? this.strength,
      stamina: stamina ?? this.stamina,
      speed: speed ?? this.speed,
      energy: energy ?? this.energy,
      skillPoints: skillPoints ?? this.skillPoints,
    );
  }
}
