import { NextResponse } from 'next/server'

/** Return a JSON success response with optional status code (default 200) */
export function successResponse(data: Record<string, unknown> | object | unknown[], status: number = 200) {
  return NextResponse.json(data, { status })
}

/** Return a JSON error response with the given message and status code */
export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/** Return a 401 authentication error response */
export function authErrorResponse() {
  return errorResponse('Not authenticated', 401)
}

/** Return a 403 forbidden response with optional custom message */
export function forbiddenResponse(message: string = 'Forbidden') {
  return errorResponse(message, 403)
}

/** Return a 404 not found response with optional custom message */
export function notFoundResponse(message: string = 'Not found') {
  return errorResponse(message, 404)
}

/** Return a 400 validation error response with the given message */
export function validationErrorResponse(message: string) {
  return errorResponse(message, 400)
}
