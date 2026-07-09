export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum EntryDirection {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export interface LedgerEntryInput {
  accountId: string;
  amount: bigint; // In cents (must be positive)
  direction: EntryDirection;
}

export class LedgerTransaction {
  constructor(
    public readonly idempotencyKey: string,
    public readonly description: string,
    public readonly entries: LedgerEntryInput[],
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.entries.length < 2) {
      throw new Error('A double-entry ledger transaction must contain at least 2 entries.');
    }

    let debitsSum = 0n;
    let creditsSum = 0n;

    for (const entry of this.entries) {
      if (entry.amount <= 0n) {
        throw new Error('Ledger entry amount must be a positive integer in cents.');
      }

      if (entry.direction === EntryDirection.DEBIT) {
        debitsSum += entry.amount;
      } else if (entry.direction === EntryDirection.CREDIT) {
        creditsSum += entry.amount;
      }
    }

    if (debitsSum !== creditsSum) {
      throw new Error(
        `Ledger transaction is unbalanced. Debits sum (R${Number(debitsSum) / 100}) does not equal Credits sum (R${Number(creditsSum) / 100}).`
      );
    }
  }
}
