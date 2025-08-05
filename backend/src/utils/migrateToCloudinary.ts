import { PrismaClient } from '@prisma/client';
import { uploadVideoToCloudinary, deleteVideoFromCloudinary } from '../utils/cloudinary';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Migrate existing local videos to Cloudinary
 * This script is optional and can be used to migrate existing videos
 */
async function migrateVideosToCloudinary() {
  console.log('🚀 Starting video migration to Cloudinary...');

  try {
    // Get all videos that are stored locally
    const localVideos = await prisma.video.findMany({
      where: {
        storageProvider: 'LOCAL'
      }
    });

    console.log(`📹 Found ${localVideos.length} videos to migrate`);

    if (localVideos.length === 0) {
      console.log('✅ No videos to migrate');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const video of localVideos) {
      console.log(`\n📤 Migrating video: ${video.title} (${video.id})`);

      try {
        if (!video.filename) {
          console.log('❌ Skipping video - no filename');
          failCount++;
          continue;
        }

        const localFilePath = path.join(__dirname, '../../uploads', video.filename);

        // Check if local file exists
        if (!fs.existsSync(localFilePath)) {
          console.log('❌ Local file not found, skipping...');
          failCount++;
          continue;
        }

        // Generate unique public ID for Cloudinary
        const publicId = `migration/${video.userId}/${video.id}`;

        // Upload to Cloudinary
        const cloudinaryResult = await uploadVideoToCloudinary(localFilePath, {
          public_id: publicId,
          folder: 'screenforge/videos',
          resource_type: 'video',
          quality: 'auto',
        });

        // Update video record
        await prisma.video.update({
          where: { id: video.id },
          data: {
            cloudinaryPublicId: cloudinaryResult.public_id,
            cloudinaryUrl: cloudinaryResult.secure_url,
            videoUrl: cloudinaryResult.secure_url,
            storageProvider: 'CLOUDINARY',
            // Update duration if Cloudinary provides it
            duration: cloudinaryResult.duration || video.duration,
          }
        });

        console.log('✅ Successfully migrated to Cloudinary');

        // Optionally delete local file after successful migration
        // Uncomment the lines below if you want to delete local files
        // fs.unlinkSync(localFilePath);
        // console.log('🗑️  Local file deleted');

        successCount++;

      } catch (error) {
        console.error('❌ Error migrating video:', error);
        failCount++;
      }
    }

    console.log(`\n📊 Migration complete:`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    if (successCount > 0) {
      console.log('\n💡 Note: Local files were kept for safety. You can manually delete them after verifying the migration.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Rollback migration - move videos back to local storage
 * This function can be used to rollback the migration if needed
 */
async function rollbackMigration() {
  console.log('🔄 Starting rollback migration...');

  try {
    const cloudinaryVideos = await prisma.video.findMany({
      where: {
        storageProvider: 'CLOUDINARY'
      }
    });

    console.log(`📹 Found ${cloudinaryVideos.length} videos to rollback`);

    // This is a placeholder - you would need to implement downloading from Cloudinary
    // and saving to local storage if you need this functionality
    console.log('ℹ️  Rollback not implemented - please implement if needed');

  } catch (error) {
    console.error('❌ Rollback failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'migrate') {
  migrateVideosToCloudinary();
} else if (command === 'rollback') {
  rollbackMigration();
} else {
  console.log('Usage:');
  console.log('  npm run migrate -- migrate    # Migrate local videos to Cloudinary');
  console.log('  npm run migrate -- rollback   # Rollback migration (not implemented)');
}
