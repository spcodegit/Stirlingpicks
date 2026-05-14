import { NextRequest } from 'next/server'
import { authMiddleware } from './app/middleware/auth-middleware'

export async function middleware(request: NextRequest) {
    return await authMiddleware(request)
}

export const config = {
    matcher: ['/dashboard', '/dashboard/:path*'],
}
