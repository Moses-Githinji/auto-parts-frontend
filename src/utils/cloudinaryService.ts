// Cloudinary configuration for image uploads
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads a single image to Cloudinary
 * @param file - The file to upload
 * @returns The secure URL of the uploaded image, or null if failed
 */
export const uploadToCloudinary = async (
  file: File,
): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

/**
 * Uploads multiple images to Cloudinary in parallel
 * @param files - Array of files to upload
 * @returns Array of secure URLs (null for failed uploads)
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
};

/**
 * Generates an optimized image URL for display
 * Uses Cloudinary transformations for optimal performance
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized URL
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
  } = {},
): string => {
  const { width, height, quality = "auto", format = "auto" } = options;

  // Check if it's a Cloudinary URL
  if (!url.includes("cloudinary.com")) {
    return url;
  }

  // Build transformation string
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`f_${format}`);
  transformations.push(`q_${quality}`);

  // Insert transformations into the Cloudinary URL
  // Format: .../upload/v123/image.jpg -> .../upload/w_500,f_auto,q_auto/v123/image.jpg
  const transformStr = transformations.join(",");

  return url.replace("/upload/", `/upload/${transformStr}/`);
};
