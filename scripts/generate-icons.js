import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '../public/Icons');
const OUTPUT_FILE = path.join(__dirname, '../public/icons.json');

const scanIcons = () => {
    if (!fs.existsSync(ICONS_DIR)) {
        console.log('Icons directory not found. Creating empty icons.json');
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify([]));
        return;
    }

    const files = fs.readdirSync(ICONS_DIR);
    const imageFiles = files.filter(file => /\.(png|jpg|jpeg|svg|webp)$/i.test(file));

    const icons = imageFiles.map(file => ({
        name: file,
        path: `/Icons/${file}`
    }));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(icons, null, 2));
    console.log(`Generated icons.json with ${icons.length} icons.`);
};

scanIcons();
