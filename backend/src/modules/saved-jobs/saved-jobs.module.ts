import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedJobsController } from './saved-jobs.controller';
import { SavedJobsService } from './saved-jobs.service';
import { SavedJob, SavedJobSchema } from './schemas/saved-job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SavedJob.name, schema: SavedJobSchema }]),
  ],
  controllers: [SavedJobsController],
  providers: [SavedJobsService],
  exports: [SavedJobsService],
})
export class SavedJobsModule { }