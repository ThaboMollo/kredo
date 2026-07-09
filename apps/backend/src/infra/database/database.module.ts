import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { LedgerRepository } from './ledger.repository';
import { ConsumerRepository } from './consumer.repository';

@Global()
@Module({
  providers: [SupabaseService, LedgerRepository, ConsumerRepository],
  exports: [SupabaseService, LedgerRepository, ConsumerRepository],
})
export class DatabaseModule {}
