import { PrismaClient } from '@prisma/client';
import { uploadVideoToCloudinary, deleteVideoFromCloudinary } from '../utils/cloudinary';
import fs from 'fs';
import path from 'path';
import { getPrisma } from "../index";

/**
 * Migrate existing local videos to Cloudinary
 * This script is optional and can be used to migrate existing videos
 */
export async function migrateToCloudinary(): Promise<void> {
    try {
        const prisma = getPrisma();
        
        // Get all videos that are stored locally
        const localVideos = await prisma.video.findMany({
            where: {
                storageProvider: "LOCAL",
                filename: { not: null },
            },
        });

        if (localVideos.length === 0) {
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const video of localVideos) {
            if (!video.filename) {
                continue;
            }

            const localFilePath = path.join(
                __dirname,
                "../../uploads",
                video.filename
            );

            if (!fs.existsSync(localFilePath)) {
                continue;
            }

            try {
                // Upload to Cloudinary
                const result = await uploadVideoToCloudinary(localFilePath, {
                    public_id: `screenforge/videos/${video.id}`,
                    folder: "screenforge/videos",
                    resource_type: "video",
                });

                // Update database record
                await prisma.video.update({
                    where: { id: video.id },
                    data: {
                        storageProvider: "CLOUDINARY",
                        cloudinaryPublicId: result.public_id,
                        cloudinaryUrl: result.secure_url,
                        videoUrl: result.secure_url,
                        filename: null, // Remove local filename
                    },
                });

                // Delete local file
                fs.unlinkSync(localFilePath);

                successCount++;
            } catch (error) {
                failCount++;
            }
        }

        console.log(`\n📊 Migration complete:`);
        console.log(`   ✅ Successfully migrated: ${successCount}`);
        console.log(`   ❌ Failed: ${failCount}`);
    } catch (error) {
        throw new Error(`Migration failed: ${error}`);
    }
}

// Rollback migration (not fully implemented)
export async function rollbackMigration(): Promise<void> {
    try {
        const prisma = getPrisma();
        
        // Get all videos that are stored in Cloudinary
        const cloudinaryVideos = await prisma.video.findMany({
            where: {
                storageProvider: "CLOUDINARY",
                cloudinaryPublicId: { not: null },
            },
        });

        if (cloudinaryVideos.length === 0) {
            return;
        }

        // Note: This is a placeholder for rollback functionality
        // In a real implementation, you would download from Cloudinary and restore local files
        throw new Error("Rollback functionality not implemented");
    } catch (error) {
        throw new Error(`Rollback failed: ${error}`);
    }
}

// CLI usage
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'migrate') {
        migrateToCloudinary().catch(console.error);
    } else if (command === 'rollback') {
        rollbackMigration().catch(console.error);
    } else {
        console.log('Usage:');
        console.log('  npm run migrate -- migrate    # Migrate local videos to Cloudinary');
        console.log('  npm run migrate -- rollback   # Rollback migration (not implemented)');
    }
}
