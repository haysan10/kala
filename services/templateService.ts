/**
 * KALA Academic Templates Service
 * 
 * Provides pre-defined structures for various academic assignments.
 */

import { ContentBlockType } from './blocksApi';

export interface TemplateBlock {
    type: ContentBlockType;
    content: string;
    metadata?: Record<string, any>;
}

export interface AcademicTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    blocks: TemplateBlock[];
}

export const ACADEMIC_TEMPLATES: AcademicTemplate[] = [
    {
        id: 'academic-essay',
        name: 'Standard Academic Essay',
        description: 'Perfect for literature, history, or philosophy papers.',
        icon: 'FileText',
        blocks: [
            { type: 'heading', content: 'Title of the Essay' },
            { type: 'callout', content: 'Central Thesis: State your main argument here.' },
            { type: 'heading', content: 'I. Introduction' },
            { type: 'text', content: 'Hook: Engaging opening sentence...\n\nContext: Background information required for the reader...\n\nThesis Statement: Clear and debatable core argument.' },
            { type: 'heading', content: 'II. Body Paragraph 1: First Argument' },
            { type: 'text', content: 'Topic Sentence: The main point of this paragraph.\n\nEvidence: Direct quotes or data from sources.\n\nAnalysis: Explaining how the evidence supports your thesis.' },
            { type: 'citation', content: 'Author (Year). Title. Journal.' },
            { type: 'heading', content: 'III. Body Paragraph 2: Counter-argument' },
            { type: 'text', content: 'Topic Sentence: Acknowledging an opposing viewpoint.\n\nEvidence/Analysis: Refuting the counter-argument or showing why your position is superior.' },
            { type: 'heading', content: 'IV. Conclusion' },
            { type: 'text', content: 'Restate Thesis: In a new, synthesized way.\n\nMain Points Summary: Briefly recap core findings.\n\nFinal Thought: Broader significance or call to action.' }
        ]
    },
    {
        id: 'lab-report',
        name: 'Scientific Lab Report',
        description: 'Structured layout for chemistry, biology, or physics experiments.',
        icon: 'Sigma',
        blocks: [
            { type: 'heading', content: 'Laboratory Report: [Experiment Name]' },
            { type: 'callout', content: 'Abstract: 200-word summary of the experiment objectives, methods, and results.' },
            { type: 'heading', content: '1. Introduction' },
            { type: 'text', content: 'Background: Theoretical basis of the experiment.\n\nHypothesis: If [Variable A], then [Variable B].' },
            { type: 'math', content: '\\Delta H = m \\cdot c \\cdot \\Delta T' },
            { type: 'heading', content: '2. Methods & Materials' },
            { type: 'text', content: 'Apparatus: List all equipment used.\n\nProcedure: Step-by-step description of the data collection process.' },
            { type: 'heading', content: '3. Data & Results' },
            { type: 'callout', content: 'Insert data table or observation log here.' },
            { type: 'heading', content: '4. Discussion & Conclusion' },
            { type: 'text', content: 'Analysis of results, error analysis, and final conclusions.' }
        ]
    },
    {
        id: 'case-study',
        name: 'Case Study Analysis',
        description: 'Professional layout for business or clinical case studies.',
        icon: 'Layout',
        blocks: [
            { type: 'heading', content: 'Case Analysis: [Subject Name]' },
            { type: 'heading', content: 'Executive Summary' },
            { type: 'text', content: 'Key problems identified and primary recommendations.' },
            { type: 'heading', content: 'Situation Analysis' },
            { type: 'text', content: 'SWOT Analysis:\n\n- Strengths:\n- Weaknesses:\n- Opportunities:\n- Threats:' },
            { type: 'heading', content: 'Alternative Solutions' },
            { type: 'text', content: 'Option A: Pros/Cons\n\nOption B: Pros/Cons' },
            { type: 'heading', content: 'Final Recommendation' },
            { type: 'text', content: 'Detailed roadmap for the chosen solution.' }
        ]
    }
];
