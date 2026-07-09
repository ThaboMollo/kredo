import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LedgerRepository } from './ledger.repository';

@Global()
@Module({
  providers: [PrismaService, LedgerRepository],
  exports: [PrismaService, LedgerRepository],
})
export class DatabaseModule {}
