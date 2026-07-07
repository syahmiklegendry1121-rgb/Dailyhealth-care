import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with sample users and 14 days of logs...');

  // Clean existing records to avoid duplicate key issues during seeding
  await prisma.user.deleteMany({});
  await prisma.dailyHealth.deleteMany({});
  await prisma.notifications.deleteMany({});
  await prisma.emailHistory.deleteMany({});

  // Hash passwords
  const userPasswordHash = await bcrypt.hash('health123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Carter',
      email: 'admin@health.com',
      password: adminPasswordHash,
      role: 'ADMIN',
      settings: {
        create: {
          darkMode: true,
          language: 'en'
        }
      },
      adminProfile: {
        create: {
          permissions: 'all'
        }
      }
    }
  });
  console.log(`Seeded Admin: ${admin.email} / password: admin123`);

  // 2. Create User John Doe
  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@health.com',
      password: userPasswordHash,
      role: 'USER',
      age: 28,
      gender: 'Male',
      height: 180, // cm
      weight: 78.5, // kg
      medicalNotes: 'Mild seasonal allergies. Goal is to run a half marathon.',
      goals: JSON.stringify({ steps: 10000, water: 8, sleep: 8, calories: 2200 }),
      emergencyContact: 'Jane Doe (+1 555-0199)',
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      settings: {
        create: {
          darkMode: false,
          language: 'en'
        }
      }
    }
  });
  console.log(`Seeded User: ${john.email} / password: health123`);

  // 3. Seed 14 Days of Daily Health logs
  const today = new Date();
  const emojis = ['😀', '😐', '😞', '😴', '😀', '😐', '😀'];

  for (let i = 14; i >= 0; i--) {
    const logDate = new Date(today);
    logDate.setDate(today.getDate() - i);
    const dateStr = logDate.toISOString().split('T')[0];

    // Seed realistic variations in habits
    const sleepDuration = 6.5 + Math.sin(i) * 1.5; // Fluctuate between 5.0 and 8.0 hrs
    const sleepQuality = Math.round(5 + Math.sin(i) * 3); // Fluctuate between 2 and 8
    const stressLevel = Math.round(5 - Math.sin(i) * 2); // Fluctuate between 3 and 7
    const moodEmoji = emojis[i % emojis.length];
    const waterGlasses = Math.round(6 + Math.cos(i) * 3); // 3 to 9 glasses
    const stepsCount = Math.round(7500 + Math.sin(i * 1.5) * 4000); // 3500 to 11500 steps
    const activeMinutes = Math.round(stepsCount / 120 + (i % 2 === 0 ? 15 : 0));
    const exerciseDuration = i % 3 === 0 ? 45 : 0;
    const caloriesBurned = Math.round(stepsCount * 0.04 + exerciseDuration * 8);
    const heartRateBpm = Math.round(68 + Math.cos(i) * 8); // 60 to 76 bpm
    const bpSystolic = Math.round(118 + Math.sin(i) * 6);
    const bpDiastolic = Math.round(78 + Math.cos(i) * 4);
    const caloriesConsumed = Math.round(2000 + Math.sin(i * 2) * 500);

    const isTaken = i % 7 !== 2; // Missed meds twice in 14 days

    // Calculate score
    const scoreInput = {
      sleepDuration,
      sleepQuality,
      stressLevel,
      moodEmoji,
      waterGlasses,
      foodCalories: caloriesConsumed,
      foodProtein: 65,
      foodCarbs: 220,
      foodFat: 70,
      foodHasJunk: i % 4 === 0,
      foodHasHealthy: i % 2 === 0,
      exerciseDuration,
      exerciseWorkoutToday: i % 3 === 0,
      stepsCount,
      heartRateBpm,
      bpSystolic,
      bpDiastolic,
      medsTaken: isTaken,
    };

    let calculatedScore = Math.min(100, Math.max(0, Math.round(
      (sleepDuration >= 7 ? 10 : 6) +
      (sleepQuality) +
      (11 - stressLevel) * 1.5 +
      (waterGlasses >= 8 ? 10 : (waterGlasses / 8) * 10) +
      (stepsCount >= 10000 ? 10 : (stepsCount / 10000) * 10) +
      (scoreInput.exerciseWorkoutToday ? 5 : 0) +
      (moodEmoji === '😀' ? 10 : moodEmoji === '😐' ? 7 : 5) +
      (heartRateBpm >= 60 && heartRateBpm <= 80 ? 10 : 5) +
      (isTaken ? 5 : 0) +
      15 // buffer constant
    )));

    let rating: 'Excellent' | 'Good' | 'Average' | 'Poor' = 'Average';
    if (calculatedScore >= 90) rating = 'Excellent';
    else if (calculatedScore >= 70) rating = 'Good';
    else if (calculatedScore >= 50) rating = 'Average';
    else rating = 'Poor';

    await prisma.dailyHealth.create({
      data: {
        userId: john.id,
        date: dateStr,
        sleep: {
          create: {
            sleepTime: '23:15',
            wakeTime: '07:00',
            duration: sleepDuration,
            quality: sleepQuality,
          }
        },
        stress: {
          create: {
            level: stressLevel,
            anxiety: Math.max(1, stressLevel - 1),
            happiness: Math.max(1, 10 - stressLevel),
            energy: Math.max(1, 8 - stressLevel),
            focus: Math.max(1, 9 - stressLevel),
            productivity: Math.max(1, 9 - stressLevel),
          }
        },
        mood: {
          create: {
            emoji: moodEmoji,
          }
        },
        water: {
          create: {
            glasses: waterGlasses,
          }
        },
        food: {
          create: {
            breakfast: 'Oatmeal with berries',
            lunch: 'Grilled chicken salad',
            dinner: 'Salmon with sweet potato',
            snacks: 'Apple with peanut butter',
            hasJunk: i % 4 === 0,
            hasHealthy: i % 2 === 0,
            calories: caloriesConsumed,
            protein: 75.0,
            carbs: 230.0,
            fat: 65.5,
            sugar: 45.0,
            fiber: 28.0,
          }
        },
        exercise: {
          create: {
            workoutToday: i % 3 === 0,
            type: i % 3 === 0 ? (i % 6 === 0 ? 'Gym' : 'Running') : undefined,
            duration: exerciseDuration,
            caloriesBurned,
          }
        },
        steps: {
          create: {
            count: stepsCount,
            distance: parseFloat((stepsCount * 0.00075).toFixed(2)), // approx distance in km
            activeMinutes,
            caloriesBurned: Math.round(stepsCount * 0.04),
          }
        },
        heartRate: {
          create: {
            bpm: heartRateBpm,
            source: i % 2 === 0 ? 'smart-device' : 'manual',
          }
        },
        bloodPressure: {
          create: {
            systolic: bpSystolic,
            diastolic: bpDiastolic,
          }
        },
        bloodSugar: {
          create: {
            level: 95.5 + Math.sin(i) * 5,
          }
        },
        medication: {
          create: {
            taken: isTaken,
            notes: 'Took vitamin D and omega-3 supplements.',
          }
        },
        symptom: {
          create: {
            headache: i % 7 === 1,
            cold: false,
            fever: false,
            pain: i % 9 === 0,
            fatigue: stressLevel >= 6,
            other: '',
          }
        },
        healthScore: {
          create: {
            score: calculatedScore,
            rating,
          }
        }
      }
    });
  }

  // 4. Create Notifications for John
  await prisma.notifications.createMany({
    data: [
      {
        userId: john.id,
        title: 'Weekly Report Card',
        message: 'Your health score improved by 4% compared to last week! Keep it up.',
        type: 'info',
        read: false
      },
      {
        userId: john.id,
        title: 'Hydration Goal Alert',
        message: "You haven't logged any water today. Don't forget to drink at least 8 glasses!",
        type: 'reminder',
        read: false
      },
      {
        userId: john.id,
        title: 'Heart Rate Normal',
        message: 'Your resting heart rate synced successfully from Google Fit. (72 bpm)',
        type: 'info',
        read: true
      }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
