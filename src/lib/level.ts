export const LEVELS = [
  { level: 1, min: 0, max: 100, name: '뉴비', icon: '🌱', color: 'text-gray-400' },
  { level: 2, min: 100, max: 300, name: '루키', icon: '⭐', color: 'text-blue-400' },
  { level: 3, min: 300, max: 700, name: '레귤러', icon: '🔥', color: 'text-orange-400' },
  { level: 4, min: 700, max: 1500, name: '베테랑', icon: '💎', color: 'text-purple-400' },
  { level: 5, min: 1500, max: 3000, name: '마스터', icon: '👑', color: 'text-yellow-400' },
  { level: 6, min: 3000, max: Infinity, name: '레전드', icon: '🏆', color: 'text-red-400' },
];

export function getLevel(xp: number) {
  return LEVELS.find((l) => xp >= l.min && xp < l.max) || LEVELS[0];
}

export function getNextLevel(currentLevel: typeof LEVELS[number]) {
  const currentIndex = LEVELS.indexOf(currentLevel);
  return LEVELS[currentIndex + 1] || currentLevel;
}

export function getLevelProgress(xp: number) {
  const level = getLevel(xp);
  const nextLevel = getNextLevel(level);
  
  if (nextLevel.max === Infinity) return 100;
  
  return Math.round(((xp - level.min) / (nextLevel.max - level.min)) * 100);
}
