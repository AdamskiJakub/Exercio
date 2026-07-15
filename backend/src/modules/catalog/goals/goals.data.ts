import { Goal } from './goals.types';

export const goalsData: Goal[] = [
  {
    id: 'goal_weight_loss',
    key: 'weight_loss',
    names: { pl: 'Redukcja wagi', en: 'Weight Loss' },
    icon: '🎯',
    enabled: true,
  },
  {
    id: 'goal_muscle_gain',
    key: 'muscle_gain',
    names: { pl: 'Budowa masy mięśniowej', en: 'Muscle Gain' },
    icon: '💪',
    enabled: true,
  },
  {
    id: 'goal_endurance',
    key: 'endurance',
    names: { pl: 'Wytrzymałość', en: 'Endurance' },
    icon: '🏃',
    enabled: true,
  },
  {
    id: 'goal_flexibility',
    key: 'flexibility',
    names: { pl: 'Elastyczność', en: 'Flexibility' },
    icon: '🧘',
    enabled: true,
  },
  {
    id: 'goal_strength',
    key: 'strength',
    names: { pl: 'Siła', en: 'Strength' },
    icon: '💪',
    enabled: true,
  },
  {
    id: 'goal_health',
    key: 'health',
    names: { pl: 'Ogólne zdrowie', en: 'General Health' },
    icon: '❤️',
    enabled: true,
  },
  {
    id: 'goal_sport_performance',
    key: 'sport_performance',
    names: { pl: 'Wyniki sportowe', en: 'Sport Performance' },
    icon: '⚡',
    enabled: true,
  },
];
