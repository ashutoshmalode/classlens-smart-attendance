import * as canvas from '@napi-rs/canvas';

// Create a subclass that handles undefined width/height
class SafeCanvas extends canvas.Canvas {
  constructor(width, height) {
    // If width or height is undefined/null/not a number, fallback to default dimensions
    const w = typeof width === 'number' ? width : 300;
    const h = typeof height === 'number' ? height : 150;
    super(w, h);
  }
}

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const weightsPath = path.join(__dirname, './weights');

async function test() {
  const faceapi = await import('@vladmandic/face-api/dist/face-api.node-wasm.js');
  
  // Monkeypatch SafeCanvas
  faceapi.env.monkeyPatch({
    Canvas: SafeCanvas,
    Image: canvas.Image,
    ImageData: canvas.ImageData,
  });

  // Ensure the TFJS WASM backend is ready
  await faceapi.tf.ready();

  console.log('Loading face-api nets from disk...');
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(weightsPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(weightsPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(weightsPath);
  console.log('Nets loaded successfully!');

  console.log('Generating a 100x100 white canvas buffer...');
  const c = canvas.createCanvas(100, 100);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 100, 100);
  const buffer = await c.toBuffer('image/jpeg');
  
  console.log('Running detectSingleFace on image...');
  const img = await canvas.loadImage(buffer);
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  console.log('Detection ran without crashing. Result:', detection);
}

test().catch(console.error);
