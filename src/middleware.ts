import { type NextRequest, NextResponse } from 'next/server'

/**
 * Middleware: simply passes every request through.
 * Auth guarding is handled client-side in (protected)/layout.tsx
 * using InsForge SDK's getCurrentSession() — Supabase SSR cannot
 * read InsForge's session cookies so server-side checking is not used.
 */
export async function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
