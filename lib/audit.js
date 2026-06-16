import { supabase } from './supabase';

export async function logAuditEvent(action, resourceType = null, metadata = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // Tidak log un-authenticated events

  const { error } = await supabase
    .from('audit_logs')
    .insert([{
      user_id: user.id,
      action,
      resource_type: resourceType,
      metadata: {
        ...metadata,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    }]);

  if (error) console.error('Audit log failed:', error.message);
}