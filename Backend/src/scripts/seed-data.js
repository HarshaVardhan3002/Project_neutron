/**
 * Seed script to populate the database with sample LMS data
 */

require('dotenv').config();
const prisma = require('../lib/database.service');

async function seedData() {
    try {
        console.log('🌱 Starting to seed database with LMS data...');

        // Create sample courses for each test type
        const courses = [
            {
                title: 'IELTS Complete Preparation Course',
                shortDescription: 'Comprehensive IELTS preparation covering all four skills: Listening, Reading, Writing, and Speaking.',
                fullDescription: 'Master the IELTS exam with our AI-powered course designed to help you achieve your target band score. This course includes personalized learning paths, practice tests, and expert feedback.',
                testType: null, // Set to null since 'ielts' is not a valid test_kind enum value
                difficulty: 'Intermediate',
                language: 'en',
                published: true,
                modules: [
                    {
                        title: 'IELTS Foundations',
                        description: 'Understanding the IELTS test format and scoring system',
                        orderIndex: 0,
                        lessons: [
                            {
                                title: 'Introduction to IELTS',
                                kind: 'video',
                                description: 'Overview of the IELTS test structure and requirements',
                                orderIndex: 0,
                                durationSeconds: 1200
                            },
                            {
                                title: 'Understanding Band Scores',
                                kind: 'text',
                                description: 'Learn how IELTS scoring works and what each band means',
                                orderIndex: 1,
                                durationSeconds: 900
                            },
                            {
                                title: 'Foundation Assessment',
                                kind: 'quiz',
                                description: 'Test your basic understanding of IELTS',
                                orderIndex: 2,
                                durationSeconds: 1800
                            }
                        ]
                    },
                    {
                        title: 'Listening Skills',
                        description: 'Master IELTS listening with proven strategies',
                        orderIndex: 1,
                        lessons: [
                            {
                                title: 'Listening Strategies',
                                kind: 'video',
                                description: 'Essential techniques for IELTS listening success',
                                orderIndex: 0,
                                durationSeconds: 1500
                            },
                            {
                                title: 'Practice Test 1',
                                kind: 'other',
                                description: 'Full IELTS listening practice test',
                                orderIndex: 1,
                                durationSeconds: 2400
                            }
                        ]
                    },
                    {
                        title: 'Reading Skills',
                        description: 'Develop speed and accuracy in IELTS reading',
                        orderIndex: 2,
                        lessons: [
                            {
                                title: 'Skimming and Scanning',
                                kind: 'video',
                                description: 'Learn efficient reading techniques',
                                orderIndex: 0,
                                durationSeconds: 1200
                            },
                            {
                                title: 'Question Types',
                                kind: 'text',
                                description: 'Master all IELTS reading question formats',
                                orderIndex: 1,
                                durationSeconds: 1800
                            }
                        ]
                    }
                ]
            },
            {
                title: 'TOEFL iBT Mastery Course',
                shortDescription: 'Complete TOEFL iBT preparation with integrated skills practice and computer-based test simulation.',
                fullDescription: 'Achieve your target TOEFL score with our comprehensive course featuring AI-powered feedback, integrated skills practice, and full-length computer-based simulations.',
                testType: null,
                difficulty: 'Advanced',
                language: 'en',
                published: true,
                modules: [
                    {
                        title: 'TOEFL Basics',
                        description: 'Introduction to TOEFL iBT format and strategies',
                        orderIndex: 0,
                        lessons: [
                            {
                                title: 'TOEFL Overview',
                                kind: 'video',
                                description: 'Complete guide to TOEFL iBT structure',
                                orderIndex: 0,
                                durationSeconds: 1800
                            }
                        ]
                    }
                ]
            },
            {
                title: 'PTE Academic Success Program',
                shortDescription: 'Master PTE Academic with AI-powered speaking practice and automated scoring insights.',
                fullDescription: 'Excel in PTE Academic with our innovative course featuring AI speech analysis, automated scoring, and personalized improvement recommendations.',
                testType: null,
                difficulty: 'Intermediate',
                language: 'en',
                published: true,
                modules: [
                    {
                        title: 'PTE Fundamentals',
                        description: 'Understanding PTE Academic test format',
                        orderIndex: 0,
                        lessons: [
                            {
                                title: 'PTE Introduction',
                                kind: 'video',
                                description: 'Overview of PTE Academic test',
                                orderIndex: 0,
                                durationSeconds: 1200
                            }
                        ]
                    }
                ]
            },
            {
                title: 'GRE General Test Preparation',
                shortDescription: 'Comprehensive GRE prep covering Verbal Reasoning, Quantitative Reasoning, and Analytical Writing.',
                fullDescription: 'Master the GRE with our advanced course featuring adaptive practice, detailed analytics, and personalized study plans for each section.',
                testType: null,
                difficulty: 'Advanced',
                language: 'en',
                published: true,
                modules: [
                    {
                        title: 'GRE Overview',
                        description: 'Introduction to GRE test structure and strategies',
                        orderIndex: 0,
                        lessons: [
                            {
                                title: 'GRE Basics',
                                kind: 'video',
                                description: 'Understanding the GRE test format',
                                orderIndex: 0,
                                durationSeconds: 1500
                            }
                        ]
                    }
                ]
            }
        ];

        // Create courses with modules and lessons
        for (const courseData of courses) {
            console.log(`📚 Creating course: ${courseData.title}`);

            const { modules, ...courseInfo } = courseData;

            const course = await prisma.course.create({
                data: courseInfo
            });

            // Create modules for this course
            for (const moduleData of modules) {
                console.log(`  📖 Creating module: ${moduleData.title}`);

                const { lessons, ...moduleInfo } = moduleData;

                const module = await prisma.module.create({
                    data: {
                        ...moduleInfo,
                        courseId: course.id
                    }
                });

                // Create lessons for this module
                for (const lessonData of lessons) {
                    console.log(`    📝 Creating lesson: ${lessonData.title}`);

                    await prisma.lesson.create({
                        data: {
                            ...lessonData,
                            moduleId: module.id
                        }
                    });
                }
            }
        }

        // Create sample tests
        console.log('🧪 Creating sample tests...');

        const sampleTests = [
            {
                title: 'IELTS Diagnostic Test',
                kind: 'quiz',
                timeLimitSeconds: 3600,
                passingScore: 60,
                allowedAttempts: 3,
                randomized: true,
                questions: [
                    {
                        stem: 'What is the maximum band score in IELTS?',
                        kind: 'single_choice',
                        points: 1,
                        orderIndex: 0,
                        options: [
                            { optionText: '7', isCorrect: false, orderIndex: 0 },
                            { optionText: '8', isCorrect: false, orderIndex: 1 },
                            { optionText: '9', isCorrect: true, orderIndex: 2 },
                            { optionText: '10', isCorrect: false, orderIndex: 3 }
                        ]
                    },
                    {
                        stem: 'How many sections are there in IELTS Listening?',
                        kind: 'single_choice',
                        points: 1,
                        orderIndex: 1,
                        options: [
                            { optionText: '3', isCorrect: false, orderIndex: 0 },
                            { optionText: '4', isCorrect: true, orderIndex: 1 },
                            { optionText: '5', isCorrect: false, orderIndex: 2 },
                            { optionText: '6', isCorrect: false, orderIndex: 3 }
                        ]
                    }
                ]
            }
        ];

        for (const testData of sampleTests) {
            console.log(`🧪 Creating test: ${testData.title}`);

            const { questions, ...testInfo } = testData;

            const test = await prisma.test.create({
                data: testInfo
            });

            // Create questions for this test
            for (const questionData of questions) {
                const { options, ...questionInfo } = questionData;

                const question = await prisma.question.create({
                    data: {
                        ...questionInfo,
                        testId: test.id
                    }
                });

                // Create options for this question
                for (const optionData of options) {
                    await prisma.questionOption.create({
                        data: {
                            ...optionData,
                            questionId: question.id
                        }
                    });
                }
            }
        }

        console.log('✅ Database seeded successfully!');
        console.log('📊 Summary:');

        const courseCount = await prisma.course.count();
        const moduleCount = await prisma.module.count();
        const lessonCount = await prisma.lesson.count();
        const testCount = await prisma.test.count();

        console.log(`   - ${courseCount} courses created`);
        console.log(`   - ${moduleCount} modules created`);
        console.log(`   - ${lessonCount} lessons created`);
        console.log(`   - ${testCount} tests created`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
seedData()
    .then(() => {
        console.log('🎉 Seeding completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
    });