import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function getSubscriptionStatus(workspace_id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('workspace_id', workspace_id)
    .single();

  if (error || !data) return 'trial';
  return data.status;
}

export async function isLocked(workspace_id: string): Promise<boolean> {
  const status = await getSubscriptionStatus(workspace_id);
  // Any state that isn't 'trial', 'active', or 'past_due' (grace period) is locked
  return !['trial', 'active', 'past_due'].includes(status);
}
