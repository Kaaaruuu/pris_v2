'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/encryption';
import { revalidatePath } from 'next/cache';
import { hasPermission } from '@/lib/rbac';

export async function createPatient(slug: string, formData: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // RBAC and Workspace Check
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role, workspace_id')
    .eq('user_id', user.id)
    .single();

  if (!membership || !hasPermission(membership.role as any, 'create_patient')) {
    throw new Error('Forbidden');
  }

  // Verify Workspace Slug
  const { data: ws } = await supabase
    .from('workspaces')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!ws || ws.id !== membership.workspace_id) throw new Error('Workspace mismatch');

  // Encrypt Sensitive Fields (Class A/B)
  const encryptedData = {
    ...formData,
    workspace_id: ws.id,
    mobile_number: formData.mobile_number ? encrypt(formData.mobile_number) : null,
    email: formData.email ? encrypt(formData.email) : null,
    allergies: formData.allergies ? encrypt(formData.allergies) : null,
  };

  // Insert into Database
  const { data, error } = await supabase.from('patients').insert(encryptedData).select().single();

  if (error) throw error;

  revalidatePath(`/${slug}/patients`);
  return data;
}
