import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase!: SupabaseClient;

  onModuleInit() {
    const supabaseUrl = process.env['SUPABASE_URL'] || 'https://hauzawykpwvpcaifqevs.supabase.co';
    const supabaseKey = process.env['SUPABASE_SERVICE_KEY'];

    if (!supabaseKey) {
      console.warn('SUPABASE_SERVICE_KEY environment variable is not defined. Connecting in unauthenticated sandbox mode.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey || 'mock-service-key-for-sandbox');
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
