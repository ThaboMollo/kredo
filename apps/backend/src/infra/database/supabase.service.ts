import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase!: SupabaseClient;

  onModuleInit() {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    const supabaseUrl = process.env['SUPABASE_URL'];
    const supabaseKey = process.env['SUPABASE_SERVICE_KEY'];

    if (isProduction && (!supabaseUrl || !supabaseKey)) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be configured for production deployments.');
    }

    if (!supabaseUrl || !supabaseKey) {
      console.warn('SUPABASE_SERVICE_KEY environment variable is not defined. Connecting in unauthenticated sandbox mode.');
    }

    this.supabase = createClient(
      supabaseUrl || 'https://hauzawykpwvpcaifqevs.supabase.co',
      supabaseKey || 'mock-service-key-for-sandbox',
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
