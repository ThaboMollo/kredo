import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerRepository } from './consumer.repository';
import { PrismaService } from './prisma.service';
import { encrypt, decrypt } from '../../utils/crypto';

describe('ConsumerRepository', () => {
  let repository: ConsumerRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    consumer: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    consent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<ConsumerRepository>(ConsumerRepository);
    prismaService = module.get<PrismaService>(PrismaService);
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

    mockPrismaService.consumer.create.mockResolvedValue(mockCreatedDbRecord);

    const result = await repository.createConsumer(input);

    expect(prismaService.consumer.create).toHaveBeenCalledWith({
      data: {
        emailEncrypted: expect.any(String),
        idNumberEncrypted: expect.any(String),
        mobileEncrypted: expect.any(String),
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });

    // Check that we got decrypted values back
    expect(result.email).toBe(input.email);
    expect(result.idNumber).toBe(input.idNumber);
    expect(result.mobile).toBe(input.mobile);
    expect(result.emailEncrypted).not.toBe(input.email);
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

    mockPrismaService.consumer.findUnique.mockResolvedValue(mockDbRecord);

    const result = await repository.findConsumerByEmail(email);

    expect(prismaService.consumer.findUnique).toHaveBeenCalledWith({
      where: { emailEncrypted: encryptedEmail },
    });

    expect(result.email).toBe(email);
    expect(result.idNumber).toBe('1234567890');
  });
});
