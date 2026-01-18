import { z } from 'zod';
/**
 * Agent configuration schema (Zod for validation)
 */
export const AgentConfigSchema = z.object({
    id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'ID must be lowercase alphanumeric with hyphens'),
    name: z.string().min(1),
    displayName: z.object({
        en: z.string().min(1),
        ko: z.string().min(1),
    }),
    description: z.string().min(1),
    instruction: z.string(),
    tools: z.array(z.string()).default([]),
    skills: z.array(z.object({
        name: z.string().min(1),
        description: z.string(),
        enabled: z.boolean().default(true),
        config: z.record(z.unknown()).optional(),
    })).default([]),
    outputKey: z.string().optional(),
    model: z.string().optional(),
    timeout: z.number().positive().default(300000),
    maxRetries: z.number().nonnegative().default(3),
    requiresApproval: z.boolean().default(false),
    approvalCheckpoints: z.array(z.string()).default([]),
    dependencies: z.array(z.string()).default([]),
    version: z.string().default('1.0.0'),
    tags: z.array(z.string()).default([]),
});
//# sourceMappingURL=agent.types.js.map