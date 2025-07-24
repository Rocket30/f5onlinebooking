export function logError(error: unknown, context: string) {
  console.error(`Error in ${context}:`, error)

  // You could also send this to an error tracking service
  // like Sentry, LogRocket, etc.

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    }
  }

  return {
    message: String(error),
    unknown: true,
  }
}

export function handleError(error: unknown, context: string) {
  console.error(`Error in ${context}:`, error)

  // You could also send this to an error tracking service
  // like Sentry, LogRocket, etc.

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: false,
    error: String(error),
  }
}
