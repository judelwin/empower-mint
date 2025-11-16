import { Request, Response, NextFunction } from 'express';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRequired<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push({
        field: field as string,
        message: `${String(field)} is required`,
      });
    }
  }
  
  return errors;
}

export function validateOneOf<T extends Record<string, any>>(
  data: T,
  field: keyof T,
  allowedValues: any[]
): ValidationError | null {
  if (data[field] !== undefined && !allowedValues.includes(data[field])) {
    return {
      field: field as string,
      message: `${String(field)} must be one of: ${allowedValues.join(', ')}`,
    };
  }
  return null;
}

export function validateRange(
  data: Record<string, any>,
  field: string,
  min: number,
  max: number
): ValidationError | null {
  const value = data[field];
  if (value !== undefined && (typeof value !== 'number' || value < min || value > max)) {
    return {
      field,
      message: `${field} must be a number between ${min} and ${max}`,
    };
  }
  return null;
}

export function validateArray(
  data: Record<string, any>,
  field: string,
  minLength: number = 1
): ValidationError | null {
  const value = data[field];
  if (value !== undefined && (!Array.isArray(value) || value.length < minLength)) {
    return {
      field,
      message: `${field} must be an array with at least ${minLength} item(s)`,
    };
  }
  return null;
}

export function handleValidationErrors(
  _req: Request,
  res: Response,
  _next: NextFunction,
  errors: ValidationError[]
): boolean {
  if (errors.length > 0) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      },
    });
    return false;
  }
  return true;
}

