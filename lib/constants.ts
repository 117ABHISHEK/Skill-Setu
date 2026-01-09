export const SKILL_CATEGORIES = [
  'Creative',
  'Music',
  'Cooking',
  'Dance',
  'Tech',
  'Languages',
  'Soft Skills',
  'Gaming',
  'Practical',
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

export const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

export type ProficiencyLevel = typeof PROFICIENCY_LEVELS[number];
