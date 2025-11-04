/**
 * Custom error classes for the Echo Feedback system
 */

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class TranscriptionError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(500, message, details);
    this.name = 'TranscriptionError';
  }
}

export class WebhookError extends Error {
  constructor(
    message: string,
    public webhookUrl: string,
    public feedbackId: string,
    public httpStatus?: number
  ) {
    super(message);
    this.name = 'WebhookError';
    Error.captureStackTrace(this, this.constructor);
  }
}
