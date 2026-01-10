import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to generate icons.json
const generateIcons = () => {
  const iconsDir = path.resolve(__dirname, 'public/Icons');
  const outputFile = path.resolve(__dirname, 'public/icons.json');

  if (!fs.existsSync(iconsDir)) {
    fs.writeFileSync(outputFile, JSON.stringify([]));
    return;
  }

  const files = fs.readdirSync(iconsDir);
  const imageFiles = files.filter(file => /\.(png|jpg|jpeg|svg|webp)$/i.test(file));
  
  const icons = imageFiles.map(file => ({
    name: file,
    path: `/Icons/${file}`
  }));

  fs.writeFileSync(outputFile, JSON.stringify(icons, null, 2));
  console.log(`[vite] Regenerated icons.json (${icons.length} icons)`);
};

// Custom plugin to watch icons
const iconWatcher = (): Plugin => ({
  name: 'icon-watcher',
  buildStart() {
    generateIcons();
  },
  configureServer(server) {
    const iconsPath = path.resolve(__dirname, 'public/Icons');
    server.watcher.add(iconsPath);
    server.watcher.on('all', (event, file) => {
      if (file.startsWith(iconsPath) && /\.(png|jpg|jpeg|svg|webp)$/i.test(file)) {
        generateIcons();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), iconWatcher()],
  resolve: {
    alias: {
      // This forces all libraries to use YOUR version of React
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
})
