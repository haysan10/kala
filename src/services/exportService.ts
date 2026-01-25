/**
 * KALA Export Service
 * 
 * Handles conversion of ContentBlocks to various formats (Markdown, PDF).
 */

import { ContentBlock } from './blocksApi';

export const exportToMarkdown = (blocks: ContentBlock[], title: string): string => {
    let markdown = `# ${title}\n\n`;

    blocks.forEach(block => {
        switch (block.type) {
            case 'heading':
                markdown += `## ${block.content}\n\n`;
                break;
            case 'text':
                markdown += `${block.content}\n\n`;
                break;
            case 'math':
                markdown += `$$\n${block.content}\n$$\n\n`;
                break;
            case 'code':
                const lang = block.metadata?.language || '';
                markdown += `\`\`\`${lang}\n${block.content}\n\`\`\`\n\n`;
                break;
            case 'callout':
                markdown += `> **INFO**: ${block.content}\n\n`;
                break;
            case 'citation':
                markdown += `*(${block.content})*\n\n`;
                break;
            case 'image':
                markdown += `![Image](${block.content})\n\n`;
                break;
            case 'divider':
                markdown += `---\n\n`;
                break;
            case 'milestone_ref':
                markdown += `**Milestone**: ${block.content}\n\n`;
                break;
            default:
                break;
        }
    });

    return markdown;
};

export const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
};

export const printToPDF = () => {
    window.print();
};
