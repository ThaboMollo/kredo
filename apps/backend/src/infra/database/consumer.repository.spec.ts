import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerRepository } from './consumer.repository';
import { SupabaseService } from './supabase.service';
import { encrypt, decrypt } from '../../utils/crypto';

describe('ConsumerRepository', () => {
  let repository: ConsumerRepository;
  let supabaseService: SupabaseService;

  const mockChain = {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    order: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  };

  const mockSupabaseService = {
    client: {
      from: jest.fn().mockReturnValue(mockChain),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerRepository,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    repository = module.get<ConsumerRepository>(ConsumerRepository);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should encrypt PII fields on create and return decrypted fields', async () => {
    const input = {
      email: 'student@university.ac.za',
      idNumber: '0101015000081',
      mobile: '0821234567',
      firstName: 'Thabo',
      lastName: 'Mollo',
    };

    const mockCreatedDbRecord = {
      id: 'consumer-uuid',
      emailEncrypted: encrypt(input.email, true),
      idNumberEncrypted: encrypt(input.idNumber, true),
      mobileEncrypted: encrypt(input.mobile),
      firstName: input.firstName,
      lastName: input.lastName,
      kycStatus: 'PENDING',
      studentVerified: false,
      studentCardDocUrl: null,
      createdAt: new Date(),
    };

    mockChain.single.mockResolvedValue({ data: mockCreatedDbRecord, error: null });

    const result = await repository.createConsumer(input);

    expect(supabaseService.client.from).toHaveBeenCalledWith('Consumer');
    expect(mockChain.insert).toHaveBeenCalledWith({
      emailEncrypted: expect.any(String),
      idNumberEncrypted: expect.any(String),
      mobileEncrypted: expect.any(String),
      firstName: input.firstName,
      lastName: input.lastName,
    });

    // Check that we got decrypted values back
    expect(result.email).toBe(input.email);
    expect(result.idNumber).toBe(input.idNumber);
    expect(result.mobile).toBe(input.mobile);
  });

  it('should decrypt PII fields when loading by email', async () => {
    const email = 'thabo@mollo.com';
    const encryptedEmail = encrypt(email, true);

    const mockDbRecord = {
      id: 'consumer-uuid',
      emailEncrypted: encryptedEmail,
      idNumberEncrypted: encrypt('1234567890', true),
      mobileEncrypted: null,
      firstName: 'Thabo',
      lastName: 'Mollo',
      kycStatus: 'VERIFIED',
      studentVerified: true,
      studentCardDocUrl: null,
      createdAt: new Date(),
    };

    mockChain.maybeSingle.mockResolvedValue({ data: mockDbRecord, error: null });

    const result = await repository.findConsumerByEmail(email);

    expect(supabaseService.client.from).toHaveBeenCalledWith('Consumer');
    expect(mockChain.eq).toHaveBeenCalledWith('emailEncrypted', encryptedEmail);

    expect(result.email).toBe(email);
    expect(result.idNumber).toBe('1234567890');
  });
});
