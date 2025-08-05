-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'CLOUDINARY');

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "cloudinaryPublicId" TEXT,
ADD COLUMN     "cloudinaryUrl" TEXT,
ADD COLUMN     "storageProvider" "StorageProvider" NOT NULL DEFAULT 'LOCAL',
ALTER COLUMN "filename" DROP NOT NULL;
