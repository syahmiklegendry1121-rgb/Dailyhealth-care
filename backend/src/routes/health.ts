import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { calculateHealthScore, generateAIInsights } from '../utils/ai';
import { sendDailyHealthReport } from '../utils/mailer';

const router = Router();

// 1. SUBMIT DAILY HEALTH QUESTIONNAIRE
router.post('/submit', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      date, // YYYY-MM-DD
      sleep, // { sleepTime, wakeTime, duration, quality }
      stress, // { level, anxiety, happiness, energy, focus, productivity }
      mood, // { emoji }
      water, // { glasses }
      food, // { breakfast, lunch, dinner, snacks, hasJunk, hasHealthy, calories, protein, carbs, fat, sugar, fiber }
      exercise, // { workoutToday, type, duration, caloriesBurned }
      steps, // { count, distance, activeMinutes, caloriesBurned }
      heartRate, // { bpm, source }
      bloodPressure, // { systolic, diastolic }
      bloodSugar, // { level }
      medication, // { taken, notes }
      symptom, // { headache, cold, fever, pain, fatigue, other }
    } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required (YYYY-MM-DD).' });
    }

    // Prepare variables for score calculation
    const scoreInput = {
      sleepDuration: sleep?.duration || 0,
      sleepQuality: sleep?.quality || 5,
      stressLevel: stress?.level || 5,
      moodEmoji: mood?.emoji || '😐',
      waterGlasses: water?.glasses || 0,
      foodCalories: food?.calories || 0,
      foodProtein: food?.protein || 0,
      foodCarbs: food?.carbs || 0,
      foodFat: food?.fat || 0,
      foodHasJunk: !!food?.hasJunk,
      foodHasHealthy: !!food?.hasHealthy,
      exerciseDuration: exercise?.duration || 0,
      exerciseWorkoutToday: !!exercise?.workoutToday,
      stepsCount: steps?.count || 0,
      heartRateBpm: heartRate?.bpm || 72,
      bpSystolic: bloodPressure?.systolic || 120,
      bpDiastolic: bloodPressure?.diastolic || 80,
      medsTaken: !!medication?.taken,
    };

    // Calculate AI Health Score
    const scoreResult = calculateHealthScore(scoreInput);
    const aiInsightsList = generateAIInsights(scoreInput, scoreResult.score);

    // Upsert DailyHealth log
    const healthLog = await prisma.dailyHealth.upsert({
      where: {
        userId_date: { userId, date }
      },
      update: {
        sleep: sleep ? {
          upsert: {
            create: { sleepTime: sleep.sleepTime, wakeTime: sleep.wakeTime, duration: sleep.duration, quality: sleep.quality },
            update: { sleepTime: sleep.sleepTime, wakeTime: sleep.wakeTime, duration: sleep.duration, quality: sleep.quality }
          }
        } : undefined,
        stress: stress ? {
          upsert: {
            create: { level: stress.level, anxiety: stress.anxiety, happiness: stress.happiness, energy: stress.energy, focus: stress.focus, productivity: stress.productivity },
            update: { level: stress.level, anxiety: stress.anxiety, happiness: stress.happiness, energy: stress.energy, focus: stress.focus, productivity: stress.productivity }
          }
        } : undefined,
        mood: mood ? {
          upsert: {
            create: { emoji: mood.emoji },
            update: { emoji: mood.emoji }
          }
        } : undefined,
        water: water ? {
          upsert: {
            create: { glasses: water.glasses },
            update: { glasses: water.glasses }
          }
        } : undefined,
        food: food ? {
          upsert: {
            create: {
              breakfast: food.breakfast, lunch: food.lunch, dinner: food.dinner, snacks: food.snacks,
              hasJunk: !!food.hasJunk, hasHealthy: !!food.hasHealthy, calories: food.calories,
              protein: food.protein, carbs: food.carbs, fat: food.fat, sugar: food.sugar, fiber: food.fiber
            },
            update: {
              breakfast: food.breakfast, lunch: food.lunch, dinner: food.dinner, snacks: food.snacks,
              hasJunk: !!food.hasJunk, hasHealthy: !!food.hasHealthy, calories: food.calories,
              protein: food.protein, carbs: food.carbs, fat: food.fat, sugar: food.sugar, fiber: food.fiber
            }
          }
        } : undefined,
        exercise: exercise ? {
          upsert: {
            create: { workoutToday: !!exercise.workoutToday, type: exercise.type, duration: exercise.duration, caloriesBurned: exercise.caloriesBurned },
            update: { workoutToday: !!exercise.workoutToday, type: exercise.type, duration: exercise.duration, caloriesBurned: exercise.caloriesBurned }
          }
        } : undefined,
        steps: steps ? {
          upsert: {
            create: { count: steps.count, distance: steps.distance, activeMinutes: steps.activeMinutes, caloriesBurned: steps.caloriesBurned },
            update: { count: steps.count, distance: steps.distance, activeMinutes: steps.activeMinutes, caloriesBurned: steps.caloriesBurned }
          }
        } : undefined,
        heartRate: heartRate ? {
          upsert: {
            create: { bpm: heartRate.bpm, source: heartRate.source || 'manual' },
            update: { bpm: heartRate.bpm, source: heartRate.source || 'manual' }
          }
        } : undefined,
        bloodPressure: bloodPressure ? {
          upsert: {
            create: { systolic: bloodPressure.systolic, diastolic: bloodPressure.diastolic },
            update: { systolic: bloodPressure.systolic, diastolic: bloodPressure.diastolic }
          }
        } : undefined,
        bloodSugar: bloodSugar?.level !== undefined ? {
          upsert: {
            create: { level: bloodSugar.level },
            update: { level: bloodSugar.level }
          }
        } : undefined,
        medication: medication ? {
          upsert: {
            create: { taken: !!medication.taken, notes: medication.notes },
            update: { taken: !!medication.taken, notes: medication.notes }
          }
        } : undefined,
        symptom: symptom ? {
          upsert: {
            create: { headache: !!symptom.headache, cold: !!symptom.cold, fever: !!symptom.fever, pain: !!symptom.pain, fatigue: !!symptom.fatigue, other: symptom.other },
            update: { headache: !!symptom.headache, cold: !!symptom.cold, fever: !!symptom.fever, pain: !!symptom.pain, fatigue: !!symptom.fatigue, other: symptom.other }
          }
        } : undefined,
        healthScore: {
          upsert: {
            create: { score: scoreResult.score, rating: scoreResult.rating },
            update: { score: scoreResult.score, rating: scoreResult.rating }
          }
        }
      },
      create: {
        userId,
        date,
        sleep: sleep ? { create: { sleepTime: sleep.sleepTime, wakeTime: sleep.wakeTime, duration: sleep.duration, quality: sleep.quality } } : undefined,
        stress: stress ? { create: { level: stress.level, anxiety: stress.anxiety, happiness: stress.happiness, energy: stress.energy, focus: stress.focus, productivity: stress.productivity } } : undefined,
        mood: mood ? { create: { emoji: mood.emoji } } : undefined,
        water: water ? { create: { glasses: water.glasses } } : undefined,
        food: food ? { create: {
          breakfast: food.breakfast, lunch: food.lunch, dinner: food.dinner, snacks: food.snacks,
          hasJunk: !!food.hasJunk, hasHealthy: !!food.hasHealthy, calories: food.calories,
          protein: food.protein, carbs: food.carbs, fat: food.fat, sugar: food.sugar, fiber: food.fiber
        } } : undefined,
        exercise: exercise ? { create: { workoutToday: !!exercise.workoutToday, type: exercise.type, duration: exercise.duration, caloriesBurned: exercise.caloriesBurned } } : undefined,
        steps: steps ? { create: { count: steps.count, distance: steps.distance, activeMinutes: steps.activeMinutes, caloriesBurned: steps.caloriesBurned } } : undefined,
        heartRate: heartRate ? { create: { bpm: heartRate.bpm, source: heartRate.source || 'manual' } } : undefined,
        bloodPressure: bloodPressure ? { create: { systolic: bloodPressure.systolic, diastolic: bloodPressure.diastolic } } : undefined,
        bloodSugar: bloodSugar?.level !== undefined ? { create: { level: bloodSugar.level } } : undefined,
        medication: medication ? { create: { taken: !!medication.taken, notes: medication.notes } } : undefined,
        symptom: symptom ? { create: { headache: !!symptom.headache, cold: !!symptom.cold, fever: !!symptom.fever, pain: !!symptom.pain, fatigue: !!symptom.fatigue, other: symptom.other } } : undefined,
        healthScore: { create: { score: scoreResult.score, rating: scoreResult.rating } }
      },
      include: {
        sleep: true, stress: true, mood: true, water: true, food: true,
        exercise: true, steps: true, heartRate: true, bloodPressure: true,
        bloodSugar: true, medication: true, symptom: true, healthScore: true
      }
    });

    // Fetch user details to send email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.email) {
      try {
        await sendDailyHealthReport({
          name: user.name,
          email: user.email,
          date,
          score: scoreResult.score,
          rating: scoreResult.rating,
          sleep: { duration: scoreInput.sleepDuration, quality: scoreInput.sleepQuality },
          stress: scoreInput.stressLevel,
          water: scoreInput.waterGlasses,
          steps: scoreInput.stepsCount,
          calories: scoreInput.foodCalories,
          mood: scoreInput.moodEmoji,
          insights: aiInsightsList,
        });

        // Store Email history log
        await prisma.emailHistory.create({
          data: {
            userId,
            subject: `Daily Health Summary - ${date}`,
            status: 'success'
          }
        });
      } catch (mailError) {
        console.error('Failed to send email summary:', mailError);
        await prisma.emailHistory.create({
          data: {
            userId,
            subject: `Daily Health Summary - ${date}`,
            status: 'failed'
          }
        });
      }
    }

    res.status(200).json({
      message: 'Daily health metrics saved successfully.',
      data: healthLog,
      insights: aiInsightsList
    });

  } catch (error: any) {
    console.error('Error submitting daily health log:', error);
    res.status(500).json({ error: 'Internal server error saving health logs.' });
  }
});

// 2. GET HISTORY FOR DASHBOARD / CHARTS
router.get('/history', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Number(req.query.limit) || 30; // default to last 30 entries

    const logs = await prisma.dailyHealth.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        sleep: true, stress: true, mood: true, water: true, food: true,
        exercise: true, steps: true, heartRate: true, bloodPressure: true,
        bloodSugar: true, medication: true, symptom: true, healthScore: true
      }
    });

    // Reverse logs so it is in chronological order for charts
    res.status(200).json(logs.reverse());
  } catch (error: any) {
    console.error('Error fetching health history:', error);
    res.status(500).json({ error: 'Internal server error retrieving health history.' });
  }
});

// 3. STEP SYNC FROM SMART BROWSER API / APP
router.post('/sync-steps', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date, count, distance, activeMinutes, caloriesBurned } = req.body;

    if (!date || count === undefined) {
      return res.status(400).json({ error: 'Date and steps count are required.' });
    }

    // Find if DailyHealth exists for this date, if not create one
    let dailyLog = await prisma.dailyHealth.findUnique({
      where: { userId_date: { userId, date } }
    });

    if (!dailyLog) {
      dailyLog = await prisma.dailyHealth.create({
        data: { userId, date }
      });
    }

    // Upsert Steps relation
    const stepsLog = await prisma.steps.upsert({
      where: { dailyHealthId: dailyLog.id },
      update: {
        count: count,
        distance: distance || 0.0,
        activeMinutes: activeMinutes || 0,
        caloriesBurned: caloriesBurned || 0,
      },
      create: {
        dailyHealthId: dailyLog.id,
        count: count,
        distance: distance || 0.0,
        activeMinutes: activeMinutes || 0,
        caloriesBurned: caloriesBurned || 0,
      }
    });

    // Recalculate health score dynamically after steps sync
    const fullLog = await prisma.dailyHealth.findUnique({
      where: { id: dailyLog.id },
      include: {
        sleep: true, stress: true, mood: true, water: true, food: true,
        exercise: true, steps: true, heartRate: true, bloodPressure: true,
        medication: true
      }
    });

    if (fullLog) {
      const scoreInput = {
        sleepDuration: fullLog.sleep?.duration || 0,
        sleepQuality: fullLog.sleep?.quality || 5,
        stressLevel: fullLog.stress?.level || 5,
        moodEmoji: fullLog.mood?.emoji || '😐',
        waterGlasses: fullLog.water?.glasses || 0,
        foodCalories: fullLog.food?.calories || 0,
        foodProtein: fullLog.food?.protein || 0,
        foodCarbs: fullLog.food?.carbs || 0,
        foodFat: fullLog.food?.fat || 0,
        foodHasJunk: !!fullLog.food?.hasJunk,
        foodHasHealthy: !!fullLog.food?.hasHealthy,
        exerciseDuration: fullLog.exercise?.duration || 0,
        exerciseWorkoutToday: !!fullLog.exercise?.workoutToday,
        stepsCount: stepsLog.count,
        heartRateBpm: fullLog.heartRate?.bpm || 72,
        bpSystolic: fullLog.bloodPressure?.systolic || 120,
        bpDiastolic: fullLog.bloodPressure?.diastolic || 80,
        medsTaken: !!fullLog.medication?.taken,
      };

      const scoreResult = calculateHealthScore(scoreInput);
      await prisma.healthScore.upsert({
        where: { dailyHealthId: fullLog.id },
        create: { dailyHealthId: fullLog.id, score: scoreResult.score, rating: scoreResult.rating },
        update: { score: scoreResult.score, rating: scoreResult.rating }
      });
    }

    res.status(200).json({
      message: 'Steps synced successfully.',
      data: stepsLog
    });

  } catch (error: any) {
    console.error('Steps sync error:', error);
    res.status(500).json({ error: 'Internal server error syncing steps.' });
  }
});

// 4. GET TODAY'S INSIGHTS
router.get('/insights', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date query parameter is required.' });
    }

    const log = await prisma.dailyHealth.findUnique({
      where: { userId_date: { userId, date: String(date) } },
      include: {
        sleep: true, stress: true, mood: true, water: true, food: true,
        exercise: true, steps: true, heartRate: true, bloodPressure: true,
        medication: true, healthScore: true
      }
    });

    if (!log) {
      return res.status(200).json({
        score: 0,
        rating: 'N/A',
        insights: ['No entry for today yet. Fill in the daily questionnaire to see insights!']
      });
    }

    const scoreInput = {
      sleepDuration: log.sleep?.duration || 0,
      sleepQuality: log.sleep?.quality || 5,
      stressLevel: log.stress?.level || 5,
      moodEmoji: log.mood?.emoji || '😐',
      waterGlasses: log.water?.glasses || 0,
      foodCalories: log.food?.calories || 0,
      foodProtein: log.food?.protein || 0,
      foodCarbs: log.food?.carbs || 0,
      foodFat: log.food?.fat || 0,
      foodHasJunk: !!log.food?.hasJunk,
      foodHasHealthy: !!log.food?.hasHealthy,
      exerciseDuration: log.exercise?.duration || 0,
      exerciseWorkoutToday: !!log.exercise?.workoutToday,
      stepsCount: log.steps?.count || 0,
      heartRateBpm: log.heartRate?.bpm || 72,
      bpSystolic: log.bloodPressure?.systolic || 120,
      bpDiastolic: log.bloodPressure?.diastolic || 80,
      medsTaken: !!log.medication?.taken,
    };

    const score = log.healthScore?.score || 0;
    const rating = log.healthScore?.rating || 'Average';
    const insights = generateAIInsights(scoreInput, score);

    res.status(200).json({
      score,
      rating,
      insights
    });

  } catch (error: any) {
    console.error('Error fetching daily insights:', error);
    res.status(500).json({ error: 'Internal server error fetching insights.' });
  }
});

export default router;
