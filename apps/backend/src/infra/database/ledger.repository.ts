import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LedgerTransaction, AccountType, EntryDirection } from '../../domain/ledger/ledger-transaction';
import { Prisma } from '@prisma/client';

@Injectable()
export class LedgerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(code: string, name: string, type: AccountType) {
    return this.prisma.ledgerAccount.create({
      data: {
        code,
        name,
        type: type as any, // Map to Prisma enum
      },
    });
  }

  async findAccountByCode(code: string) {
    return this.prisma.ledgerAccount.findUnique({
      where: { code },
    });
  }

  async createTransaction(transaction: LedgerTransaction) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify idempotency
      const existing = await tx.ledgerTransaction.findUnique({
        where: { idempotencyKey: transaction.idempotencyKey },
      });
      if (existing) {
        return existing;
      }

      // 2. Create Transaction
      const dbTx = await tx.ledgerTransaction.create({
        data: {
          idempotencyKey: transaction.idempotencyKey,
          description: transaction.description,
        },
      });

      // 3. Create Entries
      for (const entry of transaction.entries) {
        await tx.ledgerEntry.create({
          data: {
            transactionId: dbTx.id,
            accountId: entry.accountId,
            amount: entry.amount,
            direction: entry.direction as any, // Map to Prisma enum
          },
        });
      }

      return dbTx;
    });
  }

  async getAccountBalance(code: string): Promise<bigint> {
    const account = await this.prisma.ledgerAccount.findUnique({
      where: { code },
      include: {
        entries: true,
      },
    });

    if (!account) {
      throw new Error(`Ledger account with code ${code} not found.`);
    }

    let balance = 0n;
    const isDebitPositive =
      account.type === 'ASSET' || account.type === 'EXPENSE';

    for (const entry of account.entries) {
      const isDebit = entry.direction === 'DEBIT';
      if (isDebitPositive) {
        balance += isDebit ? entry.amount : -entry.amount;
      } else {
        balance += isDebit ? -entry.amount : entry.amount;
      }
    }

    return balance;
  }
}
