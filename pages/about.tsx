import React from 'react';
import PageLayout from '../components/PageLayout';

const AboutPage: React.FC = () => {
    return (
        <PageLayout title="About Kala">
            <section className="space-y-8">
                <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Our Mission</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Kala exists to eliminate academic procrastination through intelligent scaffolding.
                        We believe every student deserves a clear path from assignment to achievement.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-4">What is Kala?</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Kala is an Academic Intelligence Operating System powered by AI. It transforms
                        overwhelming academic tasks into manageable, actionable roadmaps.
                    </p>
                    <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold flex-shrink-0">1</span>
                            <span><strong>Neural Ingestion</strong> - Upload your syllabus and we extract learning outcomes, deadlines, and requirements.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold flex-shrink-0">2</span>
                            <span><strong>Logic Scaffolding</strong> - AI generates personalized milestone roadmaps tailored to your pace.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold flex-shrink-0">3</span>
                            <span><strong>Socratic Mentorship</strong> - Get guided through complex concepts with AI-powered tutoring.</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-4">For Students, By Students</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kala was built by students who understand the struggle of academic overwhelm.
                        We've been there - staring at a 50-page syllabus wondering where to even start.
                        That's why we created an AI that doesn't just tell you what to do, but scaffolds
                        the entire process so you can focus on learning, not panicking.
                    </p>
                </div>

                <div className="p-8 bg-black dark:bg-white rounded-2xl text-center">
                    <h3 className="text-xl font-bold text-white dark:text-black mb-2">Ready to beat procrastination?</h3>
                    <p className="text-gray-400 dark:text-gray-600 mb-4">Join thousands of students using Kala.</p>
                    <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-black text-black dark:text-white rounded-xl font-semibold hover:opacity-90 transition-all">
                        Get Started Free
                    </a>
                </div>
            </section>
        </PageLayout>
    );
};

export default AboutPage;
