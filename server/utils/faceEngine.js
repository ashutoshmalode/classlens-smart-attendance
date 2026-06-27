import path from 'path';
import { fileURLToPath } from 'url';
import * as canvas from '@napi-rs/canvas';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const weightsPath = path.join(__dirname, '../weights');
let isLoaded = false;
let faceapi = null;

class SafeCanvas extends canvas.Canvas {
  constructor(width, height) {
    // If width or height is undefined/null/not a number, fallback to default dimensions
    const w = typeof width === 'number' ? width : 300;
    const h = typeof height === 'number' ? height : 150;
    super(w, h);
  }
}

// Load all required face-api.js models from disk
export const loadModels = async () => {
  if (isLoaded) return;
  try {
    if (!faceapi) {
      // Import the Node WASM bundle directly
      faceapi = await import('@vladmandic/face-api/dist/face-api.node-wasm.js');
    }

    // Monkey patch faceapi environment with SafeCanvas
    faceapi.env.monkeyPatch({
      Canvas: SafeCanvas,
      Image: canvas.Image,
      ImageData: canvas.ImageData,
    });

    // Ensure the TFJS WASM backend is ready
    await faceapi.tf.ready();

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(weightsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(weightsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(weightsPath);
    isLoaded = true;
    console.log('Face-api models loaded successfully.');
  } catch (error) {
    console.error('Failed to load face-api models:', error.message);
    throw error;
  }
};

// Compute single face descriptor for a buffer
export const getFaceDescriptor = async (buffer) => {
  await loadModels();
  
  // Load buffer into Canvas Image object
  const img = await canvas.loadImage(buffer);
  
  // Detect single face with landmarks and descriptor
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();
    
  if (!detection) {
    return null;
  }
  
  // Convert Float32Array to standard JS Array
  return Array.from(detection.descriptor);
};

// Compute average face descriptor from multiple buffers (e.g. Front, Left, Right)
export const getAverageFaceDescriptor = async (buffers) => {
  const descriptors = [];
  
  for (let i = 0; i < buffers.length; i++) {
    const desc = await getFaceDescriptor(buffers[i]);
    if (!desc) {
      throw new Error(`No face detected in image index ${i + 1}`);
    }
    descriptors.push(desc);
  }
  
  // Calculate element-wise average of the 128-float descriptors
  const avgDescriptor = new Array(128).fill(0);
  for (let i = 0; i < 128; i++) {
    let sum = 0;
    for (let j = 0; j < descriptors.length; j++) {
      sum += descriptors[j][i];
    }
    avgDescriptor[i] = sum / descriptors.length;
  }
  
  return avgDescriptor;
};

// Detect all faces in a classroom photo with landmarks and descriptors
export const detectAllFacesInImage = async (buffer) => {
  await loadModels();
  
  const img = await canvas.loadImage(buffer);
  
  const detections = await faceapi
    .detectAllFaces(img)
    .withFaceLandmarks()
    .withFaceDescriptors();
    
  return detections.map((det) => ({
    descriptor: Array.from(det.descriptor),
    boundingBox: {
      x: det.detection.box.x,
      y: det.detection.box.y,
      width: det.detection.box.width,
      height: det.detection.box.height,
    },
  }));
};

// Crop face bounding box using Sharp
export const cropFace = async (imageBuffer, box) => {
  try {
    // Get image dimensions to clamp values within boundaries
    const metadata = await sharp(imageBuffer).metadata();
    
    // Add small padding to crop (10% extra)
    const padW = box.width * 0.1;
    const padH = box.height * 0.1;

    let x = Math.round(box.x - padW);
    let y = Math.round(box.y - padH);
    let width = Math.round(box.width + (padW * 2));
    let height = Math.round(box.height + (padH * 2));
    
    // Clamp to image dimensions
    x = Math.max(0, x);
    y = Math.max(0, y);
    if (x + width > metadata.width) {
      width = metadata.width - x;
    }
    if (y + height > metadata.height) {
      height = metadata.height - y;
    }
    
    return await sharp(imageBuffer)
      .extract({ left: x, top: y, width, height })
      .toBuffer();
  } catch (error) {
    console.error('Error cropping face:', error.message);
    // Fallback: extract exact bounding box without padding
    const x = Math.max(0, Math.round(box.x));
    const y = Math.max(0, Math.round(box.y));
    return await sharp(imageBuffer)
      .extract({ left: x, top: y, width: Math.round(box.width), height: Math.round(box.height) })
      .toBuffer();
  }
};

// Calculate Euclidean distance between two descriptors
export const calculateEuclideanDistance = (desc1, desc2) => {
  if (desc1.length !== desc2.length) {
    throw new Error('Descriptors must be of the same length');
  }
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
};
