import React from 'react';
import PageLayout from '../components/PageLayout';

const PrivacyPage: React.FC = () => {
    return (
        <PageLayout title="Privacy Policy">
            <section className="space-y-8 text-gray-600 dark:text-gray-400">
                <p className="text-sm">Last updated: January 2024</p>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">1. Introduction</h2>
                    <p>
                        At Kala ("we", "our", "us"), we respect your privacy and are committed to protecting
                        your personal data. This privacy policy explains how we collect, use, and safeguard
                        your information when you use our Academic Intelligence OS.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">2. Data We Collect</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Account Information:</strong> Email address and name when you create an account.</li>
                        <li><strong>Academic Materials:</strong> Syllabi, assignments, and documents you upload for analysis.</li>
                        <li><strong>Usage Data:</strong> How you interact with Kala to improve our service.</li>
                        <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">3. How We Use Your Data</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To analyze your academic materials and generate personalized roadmaps.</li>
                        <li>To provide AI-powered tutoring and Socratic mentorship.</li>
                        <li>To improve and optimize our service.</li>
                        <li>To communicate with you about updates and features.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">4. Data Security</h2>
                    <p>
                        We implement industry-standard security measures to protect your data. Your uploaded
                        documents are encrypted in transit and at rest. We do not share your academic materials
                        with third parties.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">5. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Access your personal data.</li>
                        <li>Request deletion of your data.</li>
                        <li>Export your data in a portable format.</li>
                        <li>Opt out of marketing communications.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white mb-3">6. Contact Us</h2>
                    <p>
                        If you have questions about this privacy policy or your data, please contact us at{' '}
                        <a href="mailto:privacy@kala.ai" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                            privacy@kala.ai
                        </a>
                    </p>
                </div>
            </section>
        </PageLayout>
    );
};

export default PrivacyPage;
