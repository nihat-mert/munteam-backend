import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisTypesService } from './analysis-types.service';

describe('AnalysisTypesService', () => {
  let service: AnalysisTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalysisTypesService],
    }).compile();

    service = module.get<AnalysisTypesService>(AnalysisTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
