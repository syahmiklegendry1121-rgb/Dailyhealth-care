interface HealthInput {
  sleepDuration: number;
  sleepQuality: number;
  stressLevel: number;
  moodEmoji: string;
  waterGlasses: number;
  foodCalories: number;
  foodProtein: number;
  foodCarbs: number;
  foodFat: number;
  foodHasJunk: boolean;
  foodHasHealthy: boolean;
  exerciseDuration: number;
  exerciseWorkoutToday: boolean;
  stepsCount: number;
  heartRateBpm: number;
  bpSystolic: number;
  bpDiastolic: number;
  medsTaken: boolean;
}

export interface HealthScoreResult {
  score: number;
  rating: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

export function calculateHealthScore(data: HealthInput): HealthScoreResult {
  let score = 0;

  // 1. Sleep (Max 20 pts)
  // Duration: 7-9 hours (10 pts), 6-7/9-10 (8 pts), 5-6/10-11 (6 pts), other (4 pts)
  const duration = data.sleepDuration;
  let sleepDurationPoints = 4;
  if (duration >= 7 && duration <= 9) sleepDurationPoints = 10;
  else if (duration >= 6 && duration <= 10) sleepDurationPoints = 8;
  else if (duration >= 5 && duration <= 11) sleepDurationPoints = 6;
  score += sleepDurationPoints;

  // Quality: 1-10 scale mapped to 10 pts
  const sleepQualityPoints = Math.min(10, Math.max(1, data.sleepQuality));
  score += sleepQualityPoints;

  // 2. Stress (Max 15 pts)
  // Stress level 1-10: 1 is best, 10 is worst.
  // Formula: (11 - stressLevel) * 1.5
  const stressVal = Math.min(10, Math.max(1, data.stressLevel));
  const stressPoints = (11 - stressVal) * 1.5;
  score += stressPoints;

  // 3. Nutrition (Max 15 pts)
  let nutritionPoints = 0;
  if (data.foodHasHealthy) nutritionPoints += 5;
  if (!data.foodHasJunk) nutritionPoints += 5;
  // Protein reward (at least 45g)
  if (data.foodProtein >= 45) nutritionPoints += 3;
  // Calories check
  if (data.foodCalories > 1200 && data.foodCalories < 2800) nutritionPoints += 2;
  score += nutritionPoints;

  // 4. Water Intake (Max 10 pts)
  // 8 glasses is 100% (10 pts)
  const waterPoints = Math.min(10, (data.waterGlasses / 8) * 10);
  score += waterPoints;

  // 5. Exercise & Steps (Max 15 pts)
  let exercisePoints = 0;
  if (data.exerciseWorkoutToday) {
    exercisePoints += 5;
    if (data.exerciseDuration >= 30) exercisePoints += 5;
  }
  // Steps bonus: 10,000 steps = 5 pts, 5,000 steps = 2.5 pts
  const stepPoints = Math.min(5, (data.stepsCount / 10000) * 5);
  exercisePoints += stepPoints;
  score += exercisePoints;

  // 6. Mood (Max 10 pts)
  let moodPoints = 5;
  switch (data.moodEmoji) {
    case '😀': moodPoints = 10; break;
    case '😴': moodPoints = 8; break;
    case '😐': moodPoints = 7; break;
    case '😞': moodPoints = 4; break;
    case '😡': moodPoints = 2; break;
  }
  score += moodPoints;

  // 7. Clinical Indicators (Max 10 pts)
  let clinicalPoints = 0;
  // HR: 60 - 90 bpm is normal resting HR
  if (data.heartRateBpm >= 60 && data.heartRateBpm <= 90) clinicalPoints += 5;
  else if (data.heartRateBpm > 50 && data.heartRateBpm <= 110) clinicalPoints += 3;

  // BP: normal systolic < 120, diastolic < 80
  const sys = data.bpSystolic;
  const dia = data.bpDiastolic;
  if (sys > 0 && dia > 0) {
    if (sys >= 110 && sys <= 130 && dia >= 70 && dia <= 85) {
      clinicalPoints += 5;
    } else {
      clinicalPoints += 2.5;
    }
  } else {
    // If BP not logged, distribute points to HR or default
    clinicalPoints += 2.5;
  }
  score += clinicalPoints;

  // 8. Medication consistency (Max 5 pts)
  if (data.medsTaken) {
    score += 5;
  }

  // Round final score
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let rating: 'Excellent' | 'Good' | 'Average' | 'Poor' = 'Average';
  if (finalScore >= 90) rating = 'Excellent';
  else if (finalScore >= 70) rating = 'Good';
  else if (finalScore >= 50) rating = 'Average';
  else rating = 'Poor';

  return { score: finalScore, rating };
}

export function generateAIInsights(data: HealthInput, score: number): string[] {
  const insights: string[] = [];

  // Sleep insights
  if (data.sleepDuration < 7) {
    insights.push(`You slept only ${data.sleepDuration} hours. Aim for 7–8 hours of restful sleep tonight.`);
  } else if (data.sleepDuration > 9.5) {
    insights.push(`Over-sleeping (${data.sleepDuration} hrs) can lead to lethargy. Try setting an alarm for 8 hours.`);
  }
  if (data.sleepQuality < 6) {
    insights.push(`Sleep quality was relatively low (${data.sleepQuality}/10). Try reducing screen time 1 hour before bed.`);
  }

  // Stress insights
  if (data.stressLevel >= 7) {
    insights.push(`Your stress level is high today (${data.stressLevel}/10). Consider a 5-minute breathing exercise or a short walk.`);
  }

  // Mood insights
  if (data.moodEmoji === '😞') {
    insights.push("You're feeling down. Reaching out to a friend or spending time in nature can help boost your mood.");
  } else if (data.moodEmoji === '😡') {
    insights.push("Feeling frustrated or angry is normal. Try taking deep breaths or stretching to release physical tension.");
  }

  // Water insights
  if (data.waterGlasses < 8) {
    const diff = 8 - data.waterGlasses;
    insights.push(`Drink ${diff} more glass${diff > 1 ? 'es' : ''} of water to meet your daily hydration target.`);
  }

  // Nutrition insights
  if (data.foodHasJunk) {
    insights.push("Avoid high-sodium or sugary snacks. Replace them with nutrient-dense healthy fats and raw nuts.");
  }
  if (data.foodProtein < 45) {
    insights.push("Your protein intake is low today. Consider adding eggs, tofu, beans, or lean meat to your next meal.");
  }
  if (data.foodCalories > 2800) {
    insights.push("Calorie intake is higher than usual. Monitor portion sizes to support weight management.");
  }

  // Exercise insights
  if (data.stepsCount < 5000) {
    insights.push(`You walked only ${data.stepsCount.toLocaleString()} steps today. Take a brisk 15-minute walk after dinner.`);
  } else if (data.stepsCount >= 10000) {
    insights.push(`Fantastic job! You've crossed the 10,000 steps milestone (${data.stepsCount.toLocaleString()} steps).`);
  }

  if (!data.exerciseWorkoutToday) {
    insights.push("No workout logged. A quick 10-minute stretch or yoga routine can help maintain mobility.");
  }

  // Blood Pressure / Clinical insights
  if (data.bpSystolic >= 140 || data.bpDiastolic >= 90) {
    insights.push("Your blood pressure reading is in the hypertensive range. Please consult your physician if it stays high.");
  }

  // Generic score insights
  if (score >= 90) {
    insights.push("Outstanding wellness score! Keep maintaining these healthy habits.");
  } else if (score < 50) {
    insights.push("Your health score is currently low. Focus on improving sleep and drinking enough water first.");
  }

  // Default recommendation if empty
  if (insights.length === 0) {
    insights.push("You're on the right track! Continue logging details daily to track your progress.");
  }

  return insights;
}
