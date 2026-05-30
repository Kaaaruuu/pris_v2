import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  console.log('Webhook received:', body);
  console.log('Supabase client initialized:', !!supabase);

  // Logic to handle PayMongo events (e.g., checkout.paid)
  // 1. Verify Signature
  // 2. Update Subscription status in DB
  
  return NextResponse.json({ received: true });
}
