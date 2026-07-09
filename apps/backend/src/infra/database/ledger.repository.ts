import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { LedgerTransaction, AccountType, EntryDirection } from '../../domain/ledger/ledger-transaction';

@Injectable()
export class LedgerRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async createAccount(code: string, name: string, type: AccountType) {
    const { data: account, error } = await this.supabase.client
      .from('LedgerAccount')
      .insert({
        code,
        name,
        type,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ledger account: ${error.message}`);
    }

    return account;
  }

  async findAccountByCode(code: string) {
    const { data: account, error } = await this.supabase.client
      .from('LedgerAccount')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to query account: ${error.message}`);
    }

    return account;
  }

  async createTransaction(transaction: LedgerTransaction) {
    // Map entries to JSON formats, converting BigInts to string representations for JSON safety
    const entriesJson = transaction.entries.map((e) => ({
      accountId: e.accountId,
      amount: e.amount.toString(),
      direction: e.direction,
    }));

    const { data, error } = await this.supabase.client.rpc('create_ledger_transaction', {
      p_idempotency_key: transaction.idempotencyKey,
      p_description: transaction.description,
      p_entries: entriesJson,
    });

    if (error) {
      throw new Error(`Ledger transaction failed to post: ${error.message}`);
    }

    return data;
  }

  async getAccountBalance(code: string): Promise<bigint> {
    const account = await this.findAccountByCode(code);
    if (!account) {
      throw new Error(`Ledger account with code ${code} not found.`);
    }

    const { data: entries, error } = await this.supabase.client
      .from('LedgerEntry')
      .select('*')
      .eq('accountId', account.id);

    if (error) {
      throw new Error(`Failed to retrieve entries: ${error.message}`);
    }

    let balance = 0n;
    const isDebitPositive = account.type === 'ASSET' || account.type === 'EXPENSE';

    for (const entry of (entries || [])) {
      const isDebit = entry.direction === 'DEBIT';
      const amountBig = BigInt(entry.amount);
      if (isDebitPositive) {
        balance += isDebit ? amountBig : -amountBig;
      } else {
        balance += isDebit ? -amountBig : amountBig;
      }
    }

    return balance;
  }
}
