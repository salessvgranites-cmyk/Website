import * as fs from 'fs';

const file = 'client/src/pages/Admin.tsx';
let content = fs.readFileSync(file, 'utf8');

const helper = `
const optimizeCloudinaryUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && !url.includes('f_auto')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto/').replace(/\\.heic$/i, '.jpg').replace(/\\.heif$/i, '.jpg');
  }
  return url;
};
`;

if (!content.includes('optimizeCloudinaryUrl')) {
    content = content.replace('export default function Admin() {', helper + '\\nexport default function Admin() {');
}

// Global replace for specific image src attributes
content = content.replace(/<img([^>]*)src=\\{value\\}/g, '<img$1src={optimizeCloudinaryUrl(value)}');
content = content.replace(/<img([^>]*)src=\\{src\\}/g, '<img$1src={optimizeCloudinaryUrl(src)}');
content = content.replace(/<img([^>]*)src=\\{item\\[imageKey\\]\\}/g, '<img$1src={optimizeCloudinaryUrl(item[imageKey])}');
content = content.replace(/<img([^>]*)src=\\{item\\.imageUrl\\}/g, '<img$1src={optimizeCloudinaryUrl(item.imageUrl)}');
content = content.replace(/<img([^>]*)src=\\{g\\.imageUrl\\}/g, '<img$1src={optimizeCloudinaryUrl(g.imageUrl)}');
content = content.replace(/<img([^>]*)src=\\{item\\.image\\}/g, '<img$1src={optimizeCloudinaryUrl(item.image)}');
content = content.replace(/<img([^>]*)src=\\{content\\.([a-zA-Z0-9]+)\\}/g, '<img$1src={optimizeCloudinaryUrl(content.$2)}');

fs.writeFileSync(file, content);
console.log('Admin.tsx updated');
