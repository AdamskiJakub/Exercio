import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';

describe('AvailabilityController', () => {
  let controller: AvailabilityController;
  let service: AvailabilityService;

  const mockAvailabilityService = {
    getWeeklyAvailability: jest.fn(),
    setWeeklySchedule: jest.fn(),
    createAvailability: jest.fn(),
    updateAvailability: jest.fn(),
    deleteAvailability: jest.fn(),
    getExceptions: jest.fn(),
    createException: jest.fn(),
    updateException: jest.fn(),
    deleteException: jest.fn(),
    findInstructorProfileByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
    service = module.get<AvailabilityService>(AvailabilityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
