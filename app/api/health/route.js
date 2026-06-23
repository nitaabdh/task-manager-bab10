import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const startTime = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Query ringan untuk cek koneksi database
    const { error } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);

    if (error) throw error;

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      responseTime: `${Date.now() - startTime}ms`,
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}