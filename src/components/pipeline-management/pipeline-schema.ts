import { z } from 'zod';
export const pipelineSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  sourceId: z.string().min(1, 'A data source must be selected.'),
  destinationId: z.string().min(1, 'A data destination must be selected.'),
  schedule: z.enum(['real-time', 'hourly', 'daily', 'weekly']),
  transformationRules: z.string().optional(),
});