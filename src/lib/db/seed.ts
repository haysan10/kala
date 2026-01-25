/**
 * Database Seed Script
 * 
 * Creates initial data for development and testing
 * Run with: npx tsx src/db/seed.ts
 */

import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from "../config/database";
import { users, userSettings, assignments, milestones, notifications } from "./schema";
import { hashPassword } from "../utils/hash";



async function seed() {
    console.log("🌱 Starting database seed...\n");

    try {
        // ==================== SEED USERS ====================
        console.log("Creating test users...");

        const testPassword = await hashPassword("password123");

        // Check if users exist first
        const existingUsers = await db.select().from(users).where(
            eq(users.email, "student@kala.app")
        );

        let user1, user2;

        if (existingUsers.length > 0) {
            console.log("  ⚠ Users already exist, skipping creation...");
            user1 = existingUsers[0];
            const existingDemo = await db.select().from(users).where(
                eq(users.email, "demo@kala.app")
            );
            user2 = existingDemo[0] || user1;
        } else {
            [user1] = await db.insert(users).values({
                email: "student@kala.app",
                passwordHash: testPassword,
                name: "Sarah Mahasiswa",
            }).returning();

            // Create settings for user1
            await db.insert(userSettings).values({
                userId: user1.id,
                aiProvider: "gemini",
                language: "id",
            });

            [user2] = await db.insert(users).values({
                email: "demo@kala.app",
                passwordHash: testPassword,
                name: "Demo User",
            }).returning();

            // Create settings for user2
            await db.insert(userSettings).values({
                userId: user2.id,
                aiProvider: "gemini",
                language: "en",
            });

            console.log(`  ✓ Created ${user1.email}`);
            console.log(`  ✓ Created ${user2.email}`);
        }


        // ==================== SEED ASSIGNMENTS ====================
        console.log("\nCreating sample assignments...");

        const [assignment1] = await db.insert(assignments).values({
            userId: user1.id,
            title: "Essay Etika Kantian",
            description: "Tulis essay 2000 kata tentang imperatif kategoris Kant dan aplikasinya dalam etika modern.",
            learningOutcome: "Menganalisis dan mengevaluasi kerangka etika Kantian dalam konteks dilema moral kontemporer.",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            course: "Filsafat Moral",
            tags: JSON.stringify(["ethics", "kant", "philosophy", "essay"]),
            rubrics: JSON.stringify(["Critical Analysis", "Argumentation", "Citations", "Structure"]),
            diagnosticQuestions: JSON.stringify([
                "Apa perbedaan antara hipotesis dan imperativ kategoris?",
                "Bagaimana Kant mendefinisikan 'good will'?",
                "Apa kritik utama terhadap etika deontologis?"
            ]),
            overallProgress: 25,
            atRisk: false,
            clarityScore: 30,
        }).returning();

        const [assignment2] = await db.insert(assignments).values({
            userId: user1.id,
            title: "Research Proposal: AI in Education",
            description: "Develop a research proposal examining the impact of AI tutoring systems on student learning outcomes.",
            learningOutcome: "Design and justify a rigorous mixed-methods research proposal.",
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days - at risk!
            course: "Research Methods",
            tags: JSON.stringify(["research", "AI", "education", "proposal"]),
            rubrics: JSON.stringify(["Literature Review", "Methodology", "Feasibility", "Ethics"]),
            diagnosticQuestions: JSON.stringify([
                "What makes a research question 'researchable'?",
                "How do you ensure validity in mixed-methods research?",
                "What ethical considerations apply to EdTech research?"
            ]),
            overallProgress: 0,
            atRisk: true,
            clarityScore: 0,
        }).returning();

        console.log(`  ✓ Created: ${assignment1.title}`);
        console.log(`  ✓ Created: ${assignment2.title}`);

        // ==================== SEED MILESTONES ====================
        console.log("\nCreating milestones...");

        // Milestones for Assignment 1
        const milestones1 = [
            {
                assignmentId: assignment1.id,
                title: "Literature Review",
                description: "Review primary and secondary sources on Kantian ethics",
                estimatedMinutes: 120,
                deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: "completed",
                sortOrder: 1,
            },
            {
                assignmentId: assignment1.id,
                title: "Thesis Development",
                description: "Formulate clear thesis statement and argument structure",
                estimatedMinutes: 60,
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                status: "in_progress",
                sortOrder: 2,
            },
            {
                assignmentId: assignment1.id,
                title: "Draft Writing",
                description: "Write first complete draft of essay",
                estimatedMinutes: 180,
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: "todo",
                sortOrder: 3,
            },
            {
                assignmentId: assignment1.id,
                title: "Revision & Citations",
                description: "Revise draft and format all citations properly",
                estimatedMinutes: 90,
                deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
                status: "todo",
                sortOrder: 4,
            },
        ];

        // Milestones for Assignment 2 (research proposal)
        const milestones2 = [
            {
                assignmentId: assignment2.id,
                title: "Problem Statement",
                description: "Define research problem and questions",
                estimatedMinutes: 45,
                deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
                status: "todo",
                sortOrder: 1,
            },
            {
                assignmentId: assignment2.id,
                title: "Literature Review",
                description: "Survey existing research on AI tutoring",
                estimatedMinutes: 120,
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                status: "todo",
                sortOrder: 2,
            },
            {
                assignmentId: assignment2.id,
                title: "Methodology Design",
                description: "Design mixed-methods research approach",
                estimatedMinutes: 90,
                deadline: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
                status: "todo",
                sortOrder: 3,
            },
        ];

        await db.insert(milestones).values([...milestones1, ...milestones2]);
        console.log(`  ✓ Created ${milestones1.length + milestones2.length} milestones`);

        // ==================== SEED NOTIFICATIONS ====================
        console.log("\nCreating notifications...");

        await db.insert(notifications).values([
            {
                userId: user1.id,
                title: "Deadline Alert",
                message: "Research Proposal due in 2 days! You have 0% progress.",
                type: "risk",
                read: false,
                link: JSON.stringify({ view: "assignment", id: assignment2.id }),
            },
            {
                userId: user1.id,
                title: "Daily Synapse Ready",
                message: "Your intellectual challenge for today is available.",
                type: "system",
                read: false,
            },
            {
                userId: user1.id,
                title: "Milestone Completed",
                message: "Great work on completing Literature Review for Ethics essay!",
                type: "feedback",
                read: true,
            },
        ]);
        console.log("  ✓ Created 3 notifications");

        // ==================== SUMMARY ====================
        console.log("\n" + "=".repeat(50));
        console.log("🎉 Seed completed successfully!");
        console.log("=".repeat(50));
        console.log("\nTest Accounts:");
        console.log("  Email: student@kala.app");
        console.log("  Password: password123");
        console.log("\n  Email: demo@kala.app");
        console.log("  Password: password123");
        console.log("=".repeat(50));

    } catch (error) {
        console.error("\n❌ Seed failed:", error);
        process.exit(1);
    }
}

// Run seed
seed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
