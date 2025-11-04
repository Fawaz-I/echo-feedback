/**
 * Input validation utilities
 */

import { ValidationError } from './errors';

/**
 * Validate that a value is not null or undefined
 */
export function requireField<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new ValidationError(`Missing required field: ${fieldName}`);
  }
  return value;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, fieldName: string = 'url'): URL {
  try {
    return new URL(url);
  } catch {
    throw new ValidationError(`Invalid ${fieldName} format`, { url });
  }
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSize: number,
  maxSizeMB: number
): void {
  if (size > maxSize) {
    throw new ValidationError(`File too large. Maximum size is ${maxSizeMB}MB`, {
      size,
      maxSize,
    });
  }
}

/**
 * Validate audio file format
 */
export function validateAudioFormat(
  filename: string,
  supportedFormats: string[]
): void {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  if (!supportedFormats.includes(ext)) {
    throw new ValidationError(`Unsupported audio format: ${ext}`, {
      supportedFormats,
    });
  }
}

/**
 * Validate string is not empty
 */
export function validateNonEmpty(value: string, fieldName: string): string {
  if (!value || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
  return value.trim();
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: string,
  enumValues: readonly T[],
  fieldName: string
): T {
  if (!enumValues.includes(value as T)) {
    throw new ValidationError(`Invalid ${fieldName}: ${value}`, {
      allowedValues: enumValues,
    });
  }
  return value as T;
}
