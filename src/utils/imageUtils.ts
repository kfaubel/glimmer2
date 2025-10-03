import { IMAGE_TYPES } from '../constants';

/**
 * Determines image type from base64 string first character
 */
export const getImageTypeFromBase64 = (imageString: string): string => {
  const firstChar = imageString.charAt(0);
  
  switch (firstChar) {
    case '/':
      return IMAGE_TYPES.JPEG;
    case 'i':
      return IMAGE_TYPES.PNG;
    case 'R':
      return IMAGE_TYPES.GIF;
    case 'U':
      return IMAGE_TYPES.WEBP;
    default:
      return '';
  }
};

/**
 * Creates a data URI from image buffer
 */
export const createDataUri = (imageString: string, type: string): string => {
  return `data:image/${type};base64,${imageString}`;
};

/**
 * Validates screen item properties
 */
export const validateScreenItem = (screen: any, index: number): string[] => {
  const errors: string[] = [];
  
  // Enabled validation
  if (typeof screen.enabled !== 'boolean') {
    errors.push(`Item: ${index} - invalid enabled element, skipping`);
    return errors;
  }
  
  // FriendlyName validation
  if (typeof screen.friendlyName !== 'string' || screen.friendlyName.length > 50) {
    errors.push(`Item: ${index} - invalid friendlyName, skipping`);
    return errors;
  }
  
  // Skip if not enabled
  if (!screen.enabled) {
    return errors;
  }
  
  // Resource validation
  if (typeof screen.resource !== 'string' || 
      screen.resource.length < 10 || 
      screen.resource.length > 200) {
    errors.push(`Item: ${index} (${screen.friendlyName})- invalid resource, length must be 10-200, skipping`);
    return errors;
  }
  
  // Month validation
  if (screen.month !== undefined && typeof screen.month !== 'string') {
    errors.push(`Item: ${index} (${screen.friendlyName}) - month not a string, skipping`);
    return errors;
  }
  
  // RefreshMinutes validation
  if (typeof screen.refreshMinutes !== 'string') {
    errors.push(`Item: ${index} (${screen.friendlyName}) - refreshMinutes is not a string, skipping`);
    return errors;
  }
  
  const refreshMinutes = parseInt(screen.refreshMinutes);
  if (isNaN(refreshMinutes) || refreshMinutes < 5 || refreshMinutes > 24 * 60) {
    errors.push(`Item: ${index} (${screen.friendlyName}) - refreshMinutes is invalid, skipping`);
    return errors;
  }
  
  // DisplaySecs validation
  if (typeof screen.displaySecs !== 'string') {
    errors.push(`Item: ${index} (${screen.friendlyName}) - displaySecs is not a string, skipping`);
    return errors;
  }
  
  const displaySecs = parseInt(screen.displaySecs);
  if (isNaN(displaySecs) || displaySecs < 5 || displaySecs > 60) {
    errors.push(`Item: ${index} (${screen.friendlyName}) - displaySecs is invalid, skipping`);
    return errors;
  }
  
  // TimeBug validation
  if (screen.timeBug !== undefined && typeof screen.timeBug !== 'string') {
    errors.push(`Item: ${index} (${screen.friendlyName}) - timeBug not a string, skipping`);
    return errors;
  }
  
  return errors;
};

/**
 * Formats time remaining until next update
 */
export const formatTimeRemaining = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  return `${seconds} secs`;
};

/**
 * Pads screen name for consistent logging
 */
export const padScreenName = (name: string, length: number = 25): string => {
  return (name + ' '.repeat(length)).substring(0, length);
};
