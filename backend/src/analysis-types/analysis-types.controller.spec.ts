import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisTypesController } from './analysis-types.controller';

describe('AnalysisTypesController', () => {
  let controller: AnalysisTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalysisTypesController],
    }).compile();

    controller = module.get<AnalysisTypesController>(AnalysisTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
