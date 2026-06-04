const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\velora\\src';
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/gradient-brand-v2 text-white shadow-lg shadow-brand-500\/20/g, 'bg-foreground text-background shadow-sm')
        .replace(/gradient-brand-v2 text-white/g, 'bg-foreground text-background')
        .replace(/gradient-brand-v2/g, 'bg-foreground')
        .replace(/text-brand-500/g, 'text-foreground')
        .replace(/text-brand-600/g, 'text-foreground/80')
        .replace(/bg-brand-500\/10/g, 'bg-foreground/10')
        .replace(/ring-brand-500\/20/g, 'ring-foreground/20')
        .replace(/shadow-premium-lg/g, 'shadow-lg')
        .replace(/shadow-premium-hover/g, 'shadow-md')
        .replace(/shadow-premium/g, 'shadow-sm')
        .replace(/shadow-glow/g, 'shadow-sm');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
});
