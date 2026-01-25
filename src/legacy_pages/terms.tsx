import React from 'react';
import PageLayout from '../components/PageLayout';

const TermsPage: React.FC = () => {
    return (
        <PageLayout title="Terms of Service">
            <section className="space-y-8 text-gray-600 dark:text-gray-400">
                <p className="text-sm">Last updated: January 2024</p>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">1. Agreement to Terms</h2>
                    <p>
                        By accessing or using Kala, you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use our service.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">2. Description of Service</h2>
                    <p>
                        Kala is an Academic Intelligence Operating System that provides AI-powered academic
                        scaffolding, including syllabus analysis, roadmap generation, and Socratic tutoring.
                        Our service is designed to assist with academic organization and learning, not to
                        complete assignments on your behalf.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">3. User Responsibilities</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>You must provide accurate information when creating an account.</li>
                        <li>You are responsible for maintaining the confidentiality of your account.</li>
                        <li>You agree not to use Kala for academic dishonesty or plagiarism.</li>
                        <li>You must only upload materials you have the right to use.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">4. Academic Integrity</h2>
                    <p>
                        Kala is a learning tool, not a cheating tool. Our AI provides guidance and scaffolding
                        to help you understand concepts and organize your work. You are responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Completing your own assignments.</li>
                        <li>Following your institution's academic integrity policies.</li>
                        <li>Using Kala as a study aid, not a substitute for learning.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">5. Intellectual Property</h2>
                    <p>
                        You retain ownership of all academic materials you upload. Kala does not claim any
                        intellectual property rights over your content. Our service, including its design,
                        features, and functionality, is owned by Kala and protected by copyright.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">6. Limitation of Liability</h2>
                    <p>
                        Kala is provided "as is" without warranties of any kind. We are not responsible for
                        academic outcomes, grades, or any decisions you make based on our AI's guidance.
                        Always verify important information with your instructors.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">7. Changes to Terms</h2>
                    <p>
                        We may update these terms from time to time. Continued use of Kala after changes
                        constitutes acceptance of the new terms.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">8. Contact</h2>
                    <p>
                        For questions about these terms, contact us at{' '}
                        <a href="mailto:legal@kala.ai" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                            legal@kala.ai
                        </a>
                    </p>
                </div>
            </section>
        </PageLayout>
    );
};

export default TermsPage;
