import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LedgerRepository } from './ledger.repository';
import { ConsumerRepository } from './consumer.repository';

@Global()
@Module({
  providers: [PrismaService, LedgerRepository, ConsumerRepository],
  exports: [PrismaService, LedgerRepository, ConsumerRepository],
})
export class DatabaseModule {}
