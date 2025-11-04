#!/usr/bin/env bun

/**
 * Clean uploads script
 * Removes old audio files from uploads directory
 */

import { readdir, stat, unlink } from 'fs/promises';
import { resolve, join } from 'path';

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';
const MAX_AGE_DAYS = parseInt(process.env.MAX_FILE_AGE_DAYS || '30', 10);
const DRY_RUN = process.env.DRY_RUN === 'true';

console.log('🧹 Cleaning old uploads...');
console.log(`📁 Directory: ${UPLOADS_DIR}`);
console.log(`⏰ Max age: ${MAX_AGE_DAYS} days`);
console.log(`🔍 Dry run: ${DRY_RUN ? 'Yes (no files will be deleted)' : 'No'}`);

const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
const now = Date.now();

try {
  const uploadsPath = resolve(UPLOADS_DIR);
  const files = await readdir(uploadsPath);

  let deletedCount = 0;
  let totalSize = 0;

  for (const file of files) {
    if (file === '.gitkeep') continue;

    const filePath = join(uploadsPath, file);
    const stats = await stat(filePath);

    if (!stats.isFile()) continue;

    const age = now - stats.mtimeMs;

    if (age > maxAgeMs) {
      const ageDays = Math.floor(age / (24 * 60 * 60 * 1000));
      const sizeKB = Math.round(stats.size / 1024);

      console.log(`🗑️  ${file} (${ageDays} days old, ${sizeKB}KB)`);

      if (!DRY_RUN) {
        await unlink(filePath);
      }

      deletedCount++;
      totalSize += stats.size;
    }
  }

  const totalSizeMB = Math.round(totalSize / (1024 * 1024) * 100) / 100;

  if (deletedCount === 0) {
    console.log('✅ No old files to clean');
  } else {
    if (DRY_RUN) {
      console.log(`\n💡 Would delete ${deletedCount} files (${totalSizeMB}MB)`);
      console.log('   Run without DRY_RUN=true to actually delete files');
    } else {
      console.log(`\n✅ Deleted ${deletedCount} files (${totalSizeMB}MB)`);
    }
  }
} catch (error) {
  console.error('❌ Error cleaning uploads:', error);
  process.exit(1);
}
