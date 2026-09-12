import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  pagination?: ApiResponse['pagination']
) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errors: any[] = []
) => {
  const response: ApiResponse = {
    success: false,
    message,
    errors
  };

  return res.status(statusCode).json(response);
};
