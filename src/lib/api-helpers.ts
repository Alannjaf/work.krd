import { NextResponse } from 'next/server'

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function authErrorResponse() {
  return errorResponse('Not authenticated', 401)
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return errorResponse(message, 403)
}

export function notFoundResponse(message: string = 'Not found') {
  return errorResponse(message, 404)
}

export function validationErrorResponse(message: string) {
  return errorResponse(message, 400)
}
