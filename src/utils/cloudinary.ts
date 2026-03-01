import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";

// Initialize Cloudinary instance
// We use a generic cloud name or expect it from env vars.
// Given no specific cloud name in instructions other than 'your_cloud_name', we'll default to it.
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your_cloud_name",
  },
});

/**
 * Checks if a given string is a Cloudinary public ID or a full URL.
 * Typically, public IDs don't contain 'http' or '://'.
 */
export const isCloudinaryPublicId = (imageRef: string): boolean => {
  return !imageRef.startsWith('http://') && !imageRef.startsWith('https://') && !imageRef.startsWith('blob:');
};

/**
 * Generates the URL for a standard display image (800px width).
 * @param publicId The Cloudinary public ID.
 * @returns The generated image URL.
 */
export const getDisplayImageUrl = (publicId: string): string => {
  if (!isCloudinaryPublicId(publicId)) return publicId;
  return cld.image(publicId).resize(scale().width(800)).toURL();
};

/**
 * Generates the URL for a high-resolution zoom image (2000px width).
 * @param publicId The Cloudinary public ID.
 * @returns The generated high-res image URL.
 */
export const getZoomImageUrl = (publicId: string): string => {
  if (!isCloudinaryPublicId(publicId)) return publicId;
  return cld.image(publicId).resize(scale().width(2000)).toURL();
};

/**
 * Generates the URL for a thumbnail image (200px width).
 * @param publicId The Cloudinary public ID.
 * @returns The generated thumbnail image URL.
 */
export const getThumbnailImageUrl = (publicId: string): string => {
  if (!isCloudinaryPublicId(publicId)) return publicId;
  return cld.image(publicId).resize(scale().width(200)).toURL();
};
