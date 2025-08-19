export class ApiError extends Error {
  statusCode: number;
  usageLimit?: {
    used: number;
    limit: number;
    resetTime?: Date;
  };

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }

  static badRequest(message: string) {
    return new ApiError(message, 400);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403);
  }

  static notFound(message: string = 'Not found') {
    return new ApiError(message, 404);
  }

  static tooManyRequests(message: string, usageLimit?: ApiError['usageLimit']) {
    const error = new ApiError(message, 429);
    error.usageLimit = usageLimit;
    return error;
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(message, 500);
  }
}

export function handleApiError(error: any) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    const response: any = { error: error.message };
    if (error.usageLimit) {
      response.usageLimit = error.usageLimit;
    }
    return { data: response, status: error.statusCode };
  }

  // Handle Prisma errors
  if (error.code === 'P2025') {
    return { data: { error: 'Record not found' }, status: 404 };
  }

  if (error.code === 'P2002') {
    return { data: { error: 'Duplicate record' }, status: 409 };
  }

  // Default error
  return { data: { error: 'Internal server error' }, status: 500 };
}