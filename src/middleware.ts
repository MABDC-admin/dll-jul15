import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based routing
    if (path === '/') {
      if (token.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', req.url));
      if (token.role === 'PRINCIPAL') return NextResponse.redirect(new URL('/principal', req.url));
      if (token.role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', req.url));
    }

    if (path.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    if (path.startsWith('/principal') && token.role !== 'PRINCIPAL') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    if (path.startsWith('/teacher') && token.role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
