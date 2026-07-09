import { LedgerTransaction, EntryDirection } from './ledger-transaction';

describe('LedgerTransaction Domain Entity', () => {
  it('should successfully instantiate a balanced double-entry transaction', () => {
    const tx = new LedgerTransaction('idemp-123', 'Repayment checkout', [
      {
        accountId: 'acc-cash',
        amount: 10000n, // R100.00
        direction: EntryDirection.DEBIT,
      },
      {
        accountId: 'acc-receivable',
        amount: 10000n, // R100.00
        direction: EntryDirection.CREDIT,
      },
    ]);

    expect(tx).toBeDefined();
    expect(tx.idempotencyKey).toBe('idemp-123');
    expect(tx.entries.length).toBe(2);
  });

  it('should throw an error for unbalanced transactions', () => {
    expect(() => {
      new LedgerTransaction('idemp-124', 'Unbalanced transaction', [
        {
          accountId: 'acc-cash',
          amount: 10000n,
          direction: EntryDirection.DEBIT,
        },
        {
          accountId: 'acc-receivable',
          amount: 9900n, // R99.00 - unbalanced by R1.00
          direction: EntryDirection.CREDIT,
        },
      ]);
    }).toThrow('Ledger transaction is unbalanced.');
  });

  it('should throw an error if there are less than 2 entries', () => {
    expect(() => {
      new LedgerTransaction('idemp-125', 'Single entry', [
        {
          accountId: 'acc-cash',
          amount: 10000n,
          direction: EntryDirection.DEBIT,
        },
      ]);
    }).toThrow('A double-entry ledger transaction must contain at least 2 entries.');
  });

  it('should throw an error if an entry amount is zero or negative', () => {
    expect(() => {
      new LedgerTransaction('idemp-126', 'Zero entry', [
        {
          accountId: 'acc-cash',
          amount: 0n,
          direction: EntryDirection.DEBIT,
        },
        {
          accountId: 'acc-receivable',
          amount: 0n,
          direction: EntryDirection.CREDIT,
        },
      ]);
    }).toThrow('Ledger entry amount must be a positive integer in cents.');

    expect(() => {
      new LedgerTransaction('idemp-127', 'Negative entry', [
        {
          accountId: 'acc-cash',
          amount: -500n,
          direction: EntryDirection.DEBIT,
        },
        {
          accountId: 'acc-receivable',
          amount: -500n,
          direction: EntryDirection.CREDIT,
        },
      ]);
    }).toThrow('Ledger entry amount must be a positive integer in cents.');
  });
});
