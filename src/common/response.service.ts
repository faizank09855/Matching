export const successResponse = (message: string, data: any = null) => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message: string, error: any = null) => ({
  success: false,
  message,
  error,
});
