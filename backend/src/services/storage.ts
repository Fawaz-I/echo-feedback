import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

let dirInitialized = false;

async function ensureDir() {
  if (!dirInitialized) {
    try {
      await mkdir(UPLOADS_DIR, { recursive: true });
      console.log(`📁 Uploads directory ready: ${UPLOADS_DIR}`);
      dirInitialized = true;
    } catch (error) {
      console.error('Failed to create uploads directory:', error);
      throw error;
    }
  }
}

export async function saveAudioFile(
  audioBlob: Blob,
  filename: string
): Promise<string> {
  await ensureDir();
  
  try {
    const buffer = Buffer.from(await audioBlob.arrayBuffer());
    const filepath = join(UPLOADS_DIR, filename);
    
    await writeFile(filepath, buffer);
    
    console.log(`💾 Saved audio file: ${filename}`);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Failed to save audio file:', error);
    throw error;
  }
}