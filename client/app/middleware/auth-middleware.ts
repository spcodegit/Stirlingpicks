import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_KEY = process.env.JWT_SECRET;
const JWT_SECRET = JWT_SECRET_KEY ? new TextEncoder().encode(JWT_SECRET_KEY) : new TextEncoder().encode('fallback_secret_if_env_missing');

export async function authMiddleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('token')?.value;

    if (!process.env.JWT_SECRET) {
        console.warn('JWT_SECRET is not defined in environment variables');
    }
    if (path.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);

            const userData = (payload.data || payload) as any;

            const isAdmin =
                userData?.role === 0 ||
                userData?.role === '0' ||
                userData?.type === 'admin' ||
                payload.role === 0 ||
                payload.type === 'admin';

            if (isAdmin) {
                return NextResponse.next();
            }
            const normalizedPath = path.toLowerCase().replace(/\/$/, '') || '/';
            const isDashboardRoot = normalizedPath === '/';

            if (isDashboardRoot) {
                return NextResponse.next();
            }
            return NextResponse.redirect(new URL('/', request.url));

        } catch (error) {
            console.error('Middleware Auth Error:', error);
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('token');
            response.cookies.delete('user_role');
            return response;
        }
    }

    return NextResponse.next();
}
