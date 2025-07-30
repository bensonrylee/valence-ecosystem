/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and trims whitespace
 */
export const sanitizeHtml = (text: string): string => {
  return text
    .replace(/[<>]/g, '')
    .trim();
};