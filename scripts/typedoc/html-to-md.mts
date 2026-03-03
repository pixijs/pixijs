import glob from 'glob';
import * as fs from 'node:fs';
import * as path from 'node:path';

const docsDir = path.join(process.cwd(), '.s3_uploads/docs_md');
const htmlDir = path.join(process.cwd(), '.s3_uploads/docs');
const mdFiles = glob.sync('**/*.html', { cwd: docsDir, absolute: true });

for (const mdFile of mdFiles)
{
    const htmlPath = path.join(htmlDir, path.basename(mdFile));
    const destPath = `${htmlPath}.md`;

    let content = fs.readFileSync(mdFile, 'utf-8');
    const headerIndex = content.indexOf('\n# ');

    if (headerIndex !== -1)
    {
        content = content.slice(headerIndex + 1);
    }

    content = content.replace(/\]\(([^)/:]+?)\.html\)/g, ']($1.html.md)');
    content = content.replace(/```[\s\S]*?```/g, (block) => block.replace(/^@(?:advanced|standard)\n?/gm, ''));

    fs.writeFileSync(destPath, content);
    fs.unlinkSync(mdFile);
}

fs.rmdirSync(docsDir, { recursive: true, force: true } as any);
console.warn(`Moved ${mdFiles.length} files from docs_md to docs`);
