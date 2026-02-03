import { useState, useRef } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryService";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onError,
  disabled = false,
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onError?.("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      onError?.("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      if (url) {
        setPreview(url);
        onChange(url);
      } else {
        onError?.("Failed to upload image. Please try again.");
      }
    } catch (error) {
      onError?.("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
  };

  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        Featured Image
      </label>
      <div className="space-y-3">
        {preview ? (
          <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <img
              src={preview}
              alt="Featured"
              className="h-48 w-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 disabled:opacity-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-[#2b579a] hover:bg-slate-100 transition-colors"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2b579a] border-t-transparent" />
                <span className="text-sm text-slate-600">Uploading...</span>
              </div>
            ) : (
              <>
                <svg
                  className="h-10 w-10 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="mt-2 text-sm text-slate-600">
                  Click to upload image
                </span>
                <span className="text-xs text-slate-500">
                  PNG, JPG up to 5MB
                </span>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />
      </div>
    </div>
  );
}
