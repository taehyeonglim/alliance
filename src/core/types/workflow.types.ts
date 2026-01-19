import { z } from 'zod';

/**
 * Research workflow stages
 */
export type ResearchStage =
  | 'idea_building'
  | 'literature_search'
  | 'experiment_design'
  | 'data_analysis'
  | 'paper_writing'
  | 'formatting_review'
  | 'completed';

/**
 * Research stage metadata
 */
export const RESEARCH_STAGES: Record<ResearchStage, { order: number; label: { en: string; ko: string } }> = {
  idea_building: { order: 1, label: { en: 'Idea Building', ko: '아이디어 빌딩' } },
  literature_search: { order: 2, label: { en: 'Literature Search', ko: '문헌검색' } },
  experiment_design: { order: 3, label: { en: 'Experiment Design', ko: '실험설계' } },
  data_analysis: { order: 4, label: { en: 'Data Analysis', ko: '데이터분석' } },
  paper_writing: { order: 5, label: { en: 'Paper Writing', ko: '논문쓰기' } },
  formatting_review: { order: 6, label: { en: 'Formatting Review', ko: '포맷팅 검토' } },
  completed: { order: 7, label: { en: 'Completed', ko: '완료' } },
};

/**
 * State key conventions for inter-agent communication
 * Following Google ADK's outputKey pattern
 */
export const StateKeys = {
  // Idea Building outputs
  RESEARCH_IDEA: 'research_idea',
  HYPOTHESIS: 'hypothesis',
  RESEARCH_GAPS: 'research_gaps',

  // Literature Search outputs
  LITERATURE_RESULTS: 'literature_results',
  RELEVANT_PAPERS: 'relevant_papers',
  CITATION_MAP: 'citation_map',

  // Experiment Design outputs
  EXPERIMENT_DESIGN: 'experiment_design',
  METHODOLOGY: 'methodology',
  VARIABLES: 'variables',

  // Data Analysis outputs
  ANALYSIS_RESULTS: 'analysis_results',
  STATISTICAL_FINDINGS: 'statistical_findings',
  VISUALIZATIONS: 'visualizations',

  // Paper Writing outputs
  PAPER_DRAFT: 'paper_draft',
  ABSTRACT: 'abstract',
  SECTIONS: 'sections',

  // Formatting Review outputs
  FORMATTED_PAPER: 'formatted_paper',
  FORMATTING_ISSUES: 'formatting_issues',
  FINAL_DOCUMENT: 'final_document',

  /** Create temporary state key (current turn only) */
  temp: (key: string): string => `temp:${key}`,
} as const;

/**
 * Workflow definition type (manual definition to avoid circular reference issues)
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  type: 'sequential' | 'parallel' | 'loop' | 'hybrid';
  agents: Array<{ id: string } | { workflow: WorkflowDefinition }>;
  config?: {
    maxIterations?: number;
    timeout?: number;
    continueOnError?: boolean;
    approvalGates?: string[];
    /** Methodology-specific settings for literature-based workflows */
    methodologySpecific?: Record<string, unknown>;
  };
  mergerAgentId?: string;
}

/**
 * Workflow definition schema (for validation)
 * Note: Uses z.any() for nested workflows to avoid circular type issues
 */
export const WorkflowDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['sequential', 'parallel', 'loop', 'hybrid']),
  agents: z.array(z.union([
    z.object({ id: z.string() }),
    z.object({ workflow: z.any() }),
  ])),
  config: z.object({
    maxIterations: z.number().positive().optional(),
    timeout: z.number().positive().optional(),
    continueOnError: z.boolean().default(false),
    approvalGates: z.array(z.string()).default([]),
    methodologySpecific: z.record(z.unknown()).optional(),
  }).optional(),
  mergerAgentId: z.string().optional(),
});

/**
 * Agent reference in workflow
 */
export interface AgentReference {
  id: string;
}

/**
 * Nested workflow reference
 */
export interface NestedWorkflowReference {
  workflow: WorkflowDefinition;
}

/**
 * Execution options for workflow
 */
export interface ExecutionOptions {
  sessionId?: string;
  timeout?: number;
  abortController?: AbortController;
}
