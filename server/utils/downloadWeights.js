import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEIGHTS_DIR = path.join(__dirname, '../weights');

const FILES = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  if (!fs.existsSync(WEIGHTS_DIR)) {
    fs.mkdirSync(WEIGHTS_DIR, { recursive: true });
  }

  console.log('Downloading face-api.js model weights...');
  for (const filename of FILES) {
    const dest = path.join(WEIGHTS_DIR, filename);
    if (fs.existsSync(dest)) {
      console.log(`- ${filename} already exists, skipping.`);
      continue;
    }
    
    const url = `${BASE_URL}${filename}`;
    console.log(`- Downloading ${filename}...`);
    try {
      await downloadFile(url, dest);
      console.log(`  Finished ${filename}`);
    } catch (err) {
      console.error(`  Error downloading ${filename}:`, err.message);
    }
  }
  console.log('Weights downloading completed.');
};

run();
