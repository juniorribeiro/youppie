import { readFile } from 'fs/promises';
import { join } from 'path';
import { notFound } from 'next/navigation';

// Simple markdown to HTML converter (basic implementation)
function markdownToHtml(markdown: string): string {
    let html = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary-600 hover:underline">$1</a>')
        // Code blocks
        .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
        // Lists
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        // Paragraphs
        .replace(/\n\n/gim, '</p><p>')
        .replace(/\n/gim, '<br>');
    
    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }
    
    return html;
}

interface PageProps {
    params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: PageProps) {
    const { slug } = await params;

    // Build the file path
    // Try multiple possible base paths
    const cwd = process.cwd();
    const possiblePaths = [
        join(cwd, 'docs', ...slug) + '.mdx',  // cwd is /app/apps/web, so docs is /app/apps/web/docs
        join('/app/apps/web/docs', ...slug) + '.mdx',  // Absolute path fallback
        join(cwd, 'apps/web/docs', ...slug) + '.mdx',  // In case cwd is different
    ];

    let content: string | undefined;
    
    // Try to read from multiple possible paths
    for (const tryPath of possiblePaths) {
        try {
            content = await readFile(tryPath, 'utf-8');
            break; // Success, exit loop
        } catch (err) {
            // Try next path
            continue;
        }
    }
    
    // If we couldn't read from any path, return 404
    if (!content) {
        notFound();
    }

    // Extract frontmatter if present
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
    const markdownContent = frontmatterMatch ? frontmatterMatch[2] : content;

    // Parse title from frontmatter
    const titleMatch = frontmatter.match(/title:\s*(.+)/);
    const title = titleMatch ? titleMatch[1].replace(/['"]/g, '') : slug[slug.length - 1] || 'Documentação';

    // Convert markdown to HTML using simple converter
    const htmlContent = markdownToHtml(markdownContent);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
                <div 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        </div>
    );
}

