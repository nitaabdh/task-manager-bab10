import { createSupabaseMiddleware } from '@/lib/supabase-middleware';

export async function middleware(request) {
  const { supabase, supabaseResponse } = createSupabaseMiddleware(request);
  const { data: { user } } = await supabase.auth.getUser();

  const protectedPaths = ['/dashboard', '/tasks', '/profile'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return Response.redirect(url);
  }

  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return Response.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/profile/:path*', '/login', '/signup'],
};