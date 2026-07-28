import { Injectable } from '@nestjs/common';

@Injectable()
export class StaticConfigService {
  private readonly specializations = [
    {
      id: 'personal-training',
      nameEn: 'Personal Training',
      namePl: 'Trening personalny',
      icon: '💪',
      order: 1,
    },
    {
      id: 'fitness-cardio',
      nameEn: 'Fitness & Cardio',
      namePl: 'Fitness & Cardio',
      icon: '🏃',
      order: 2,
    },
    {
      id: 'yoga-mobility',
      nameEn: 'Yoga & Mobility',
      namePl: 'Joga & Mobilność',
      icon: '🧘',
      order: 3,
    },
    {
      id: 'dance',
      nameEn: 'Dance',
      namePl: 'Taniec',
      icon: '🕺',
      order: 4,
    },
    {
      id: 'martial-arts',
      nameEn: 'Martial Arts',
      namePl: 'Sztuki walki',
      icon: '🥊',
      order: 5,
    },
    {
      id: 'sports',
      nameEn: 'Sports',
      namePl: 'Sporty',
      icon: '⚽',
      order: 6,
    },
    {
      id: 'nutrition',
      nameEn: 'Nutrition',
      namePl: 'Dietetyka',
      icon: '🥗',
      order: 7,
    },
    {
      id: 'recovery',
      nameEn: 'Recovery',
      namePl: 'Regeneracja',
      icon: '🩹',
      order: 8,
    },
  ];

  private readonly goals = [
    {
      id: 'weight_loss',
      nameEn: 'Weight Loss',
      namePl: 'Redukcja wagi',
      icon: '🎯',
    },
    {
      id: 'muscle_gain',
      nameEn: 'Muscle Gain',
      namePl: 'Budowa masy mięśniowej',
      icon: '💪',
    },
    {
      id: 'endurance',
      nameEn: 'Endurance',
      namePl: 'Wytrzymałość',
      icon: '🏃',
    },
    {
      id: 'flexibility',
      nameEn: 'Flexibility',
      namePl: 'Elastyczność',
      icon: '🧘',
    },
    { id: 'strength', nameEn: 'Strength', namePl: 'Siła', icon: '💪' },
    {
      id: 'health',
      nameEn: 'General Health',
      namePl: 'Ogólne zdrowie',
      icon: '❤️',
    },
    {
      id: 'sport_performance',
      nameEn: 'Sport Performance',
      namePl: 'Wyniki sportowe',
      icon: '⚡',
    },
  ];

  // Pre-computed Sets for O(1) validation lookup
  private readonly validSpecializationIds: Set<string>;
  private readonly validGoalIds: Set<string>;

  constructor() {
    // Initialize Sets once for fast lookups
    this.validSpecializationIds = new Set(
      this.specializations.map((spec) => spec.id),
    );
    this.validGoalIds = new Set(this.goals.map((goal) => goal.id));
  }

  getAllSpecializations() {
    return this.specializations;
  }

  getAllGoals() {
    return this.goals;
  }

  isValidSpecialization(specializationId: string): boolean {
    return this.validSpecializationIds.has(specializationId);
  }

  isValidGoal(goalId: string): boolean {
    return this.validGoalIds.has(goalId);
  }
}
