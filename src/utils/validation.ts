/**
 * Validates a phone number for international format (specifically Kenya +254).
 * Matches patterns like:
 * +254 712 345 678
 * +254712345678
 * 0712345678 (will be considered valid if we auto-format, but strictly we want + format)
 */
export const isValidInternationalPhone = (phone: string): boolean => {
  // Regex for +254 followed by 9 digits (standard Kenyan mobile)
  // Allows optional spaces or hyphens for readability
  const kenyaRegex = /^\+254\s?\d{3}\s?\d{3}\s?\d{3}$/;
  
  // Also check for leading 0 format if we want to be lenient or guide them
  const localRegex = /^0[17]\d{8}$/;

  return kenyaRegex.test(phone) || localRegex.test(phone);
};

/**
 * Formats a phone number to standard +254 format if it starts with 0.
 */
export const formatToInternational = (phone: string): string => {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('0')) {
    return '+254' + cleaned.substring(1);
  }
  return cleaned;
};
