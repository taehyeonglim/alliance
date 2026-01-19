import { z } from 'zod';
/**
 * Research workflow stages
 */
export type ResearchStage = 'idea_building' | 'literature_search' | 'experiment_design' | 'data_analysis' | 'paper_writing' | 'formatting_review' | 'completed';
/**
 * Research stage metadata
 */
export declare const RESEARCH_STAGES: Record<ResearchStage, {
    order: number;
    label: {
        en: string;
        ko: string;
    };
}>;
/**
 * State key conventions for inter-agent communication
 * Following Google ADK's outputKey pattern
 */
export declare const StateKeys: {
    readonly RESEARCH_IDEA: "research_idea";
    readonly HYPOTHESIS: "hypothesis";
    readonly RESEARCH_GAPS: "research_gaps";
    readonly LITERATURE_RESULTS: "literature_results";
    readonly RELEVANT_PAPERS: "relevant_papers";
    readonly CITATION_MAP: "citation_map";
    readonly EXPERIMENT_DESIGN: "experiment_design";
    readonly METHODOLOGY: "methodology";
    readonly VARIABLES: "variables";
    readonly ANALYSIS_RESULTS: "analysis_results";
    readonly STATISTICAL_FINDINGS: "statistical_findings";
    readonly VISUALIZATIONS: "visualizations";
    readonly PAPER_DRAFT: "paper_draft";
    readonly ABSTRACT: "abstract";
    readonly SECTIONS: "sections";
    readonly FORMATTED_PAPER: "formatted_paper";
    readonly FORMATTING_ISSUES: "formatting_issues";
    readonly FINAL_DOCUMENT: "final_document";
    /** Create temporary state key (current turn only) */
    readonly temp: (key: string) => string;
};
/**
 * Workflow definition type (manual definition to avoid circular reference issues)
 */
export interface WorkflowDefinition {
    id: string;
    name: string;
    type: 'sequential' | 'parallel' | 'loop' | 'hybrid';
    agents: Array<{
        id: string;
    } | {
        workflow: WorkflowDefinition;
    }>;
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
export declare const WorkflowDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["sequential", "parallel", "loop", "hybrid"]>;
    agents: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, z.ZodObject<{
        workflow: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        workflow?: any;
    }, {
        workflow?: any;
    }>]>, "many">;
    config: z.ZodOptional<z.ZodObject<{
        maxIterations: z.ZodOptional<z.ZodNumber>;
        timeout: z.ZodOptional<z.ZodNumber>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
        approvalGates: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        methodologySpecific: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        continueOnError: boolean;
        approvalGates: string[];
        maxIterations?: number | undefined;
        timeout?: number | undefined;
        methodologySpecific?: Record<string, unknown> | undefined;
    }, {
        maxIterations?: number | undefined;
        timeout?: number | undefined;
        continueOnError?: boolean | undefined;
        approvalGates?: string[] | undefined;
        methodologySpecific?: Record<string, unknown> | undefined;
    }>>;
    mergerAgentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    type: "sequential" | "parallel" | "loop" | "hybrid";
    agents: ({
        id: string;
    } | {
        workflow?: any;
    })[];
    config?: {
        continueOnError: boolean;
        approvalGates: string[];
        maxIterations?: number | undefined;
        timeout?: number | undefined;
        methodologySpecific?: Record<string, unknown> | undefined;
    } | undefined;
    mergerAgentId?: string | undefined;
}, {
    id: string;
    name: string;
    type: "sequential" | "parallel" | "loop" | "hybrid";
    agents: ({
        id: string;
    } | {
        workflow?: any;
    })[];
    config?: {
        maxIterations?: number | undefined;
        timeout?: number | undefined;
        continueOnError?: boolean | undefined;
        approvalGates?: string[] | undefined;
        methodologySpecific?: Record<string, unknown> | undefined;
    } | undefined;
    mergerAgentId?: string | undefined;
}>;
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
//# sourceMappingURL=workflow.types.d.ts.map