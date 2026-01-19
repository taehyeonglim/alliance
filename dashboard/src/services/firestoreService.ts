/**
 * Firestore Data Service
 * Firebase Firestore 기반 데이터 저장 - 실시간 동기화 지원
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db, functions } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';
import type { Workflow, Approval, LogEntry } from '../types';
import { mockAgents } from '../data/mockData';

// Collection 이름
const COLLECTIONS = {
  WORKFLOWS: 'workflows',
  APPROVALS: 'approvals',
  LOGS: 'logs',
};

// 휴지통 보관 기간 (30일)
const TRASH_RETENTION_DAYS = 30;

/**
 * 연구 프로젝트 생성 시 입력 타입
 */
export interface CreateResearchInput {
  title: string;
  abstract: string;
  methodologyId: string;
  methodologyName: string;
  workflowId: string;
  workflowName: string;
  workflowType: 'sequential' | 'parallel' | 'hybrid';
  agentCount: number;
  skipsExperimentDesign: boolean;
  options: {
    autoApprove: {
      experimentDesign: boolean;
      paperDraft: boolean;
      formatting: boolean;
    };
    notifications: boolean;
  };
}

/**
 * Firestore Timestamp를 ISO 문자열로 변환
 * serverTimestamp()가 아직 확정되지 않은 경우 (pending write) 처리
 */
function timestampToString(timestamp: Timestamp | string | undefined | null): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  // Firestore Timestamp 객체인지 확인
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    try {
      return timestamp.toDate().toISOString();
    } catch {
      // serverTimestamp()가 아직 확정되지 않은 경우
      return new Date().toISOString();
    }
  }
  return new Date().toISOString();
}

/**
 * 워크플로우 목록 가져오기 (삭제되지 않은 것만)
 */
export async function getWorkflows(): Promise<Workflow[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.WORKFLOWS),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
          deletedAt: data.deletedAt ? timestampToString(data.deletedAt) : undefined,
          permanentDeleteAt: data.permanentDeleteAt ? timestampToString(data.permanentDeleteAt) : undefined,
        } as Workflow;
      })
      .filter(w => !w.deletedAt); // 삭제된 항목 제외
  } catch (error) {
    console.error('[Firestore] Failed to load workflows:', error);
    return [];
  }
}

/**
 * 휴지통에 있는 워크플로우 목록 가져오기
 */
export async function getTrashWorkflows(): Promise<Workflow[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.WORKFLOWS),
      orderBy('deletedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
          deletedAt: data.deletedAt ? timestampToString(data.deletedAt) : undefined,
          permanentDeleteAt: data.permanentDeleteAt ? timestampToString(data.permanentDeleteAt) : undefined,
        } as Workflow;
      })
      .filter(w => w.deletedAt); // 삭제된 항목만
  } catch (error) {
    console.error('[Firestore] Failed to load trash workflows:', error);
    return [];
  }
}

/**
 * 단일 워크플로우 가져오기
 */
export async function getWorkflow(id: string): Promise<Workflow | null> {
  try {
    console.log('[Firestore] Loading workflow:', id);
    const docRef = doc(db, COLLECTIONS.WORKFLOWS, id);
    const docSnap = await getDoc(docRef);
    console.log('[Firestore] Document exists:', docSnap.exists());
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('[Firestore] Workflow data:', data);
      return {
        ...data,
        id: docSnap.id,
        createdAt: timestampToString(data.createdAt),
        updatedAt: timestampToString(data.updatedAt),
      } as Workflow;
    }
    return null;
  } catch (error) {
    console.error('[Firestore] Failed to load workflow:', error);
    return null;
  }
}

/**
 * 워크플로우 저장
 */
export async function saveWorkflow(workflow: Workflow): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.WORKFLOWS, workflow.id);
    await setDoc(docRef, {
      ...workflow,
      updatedAt: serverTimestamp(),
    });
    console.log(`[Firestore] Saved workflow: ${workflow.id}`);
  } catch (error) {
    console.error('[Firestore] Failed to save workflow:', error);
    throw error;
  }
}

/**
 * 워크플로우 휴지통으로 이동 (소프트 삭제)
 */
export async function trashWorkflow(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.WORKFLOWS, id);
    const now = new Date();
    const permanentDeleteDate = new Date(now.getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    await setDoc(docRef, {
      deletedAt: serverTimestamp(),
      permanentDeleteAt: Timestamp.fromDate(permanentDeleteDate),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log(`[Firestore] Moved workflow to trash: ${id}`);

    // 로그 추가
    await addLog({
      level: 'info',
      workflowId: id,
      message: `워크플로우가 휴지통으로 이동됨 (30일 후 영구 삭제 예정)`,
    });

    return true;
  } catch (error) {
    console.error('[Firestore] Failed to trash workflow:', error);
    return false;
  }
}

/**
 * 워크플로우 복원 (휴지통에서 꺼내기)
 */
export async function restoreWorkflow(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.WORKFLOWS, id);

    // deletedAt와 permanentDeleteAt 필드 제거
    await setDoc(docRef, {
      deletedAt: null,
      permanentDeleteAt: null,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log(`[Firestore] Restored workflow from trash: ${id}`);

    // 로그 추가
    await addLog({
      level: 'info',
      workflowId: id,
      message: `워크플로우가 휴지통에서 복원됨`,
    });

    return true;
  } catch (error) {
    console.error('[Firestore] Failed to restore workflow:', error);
    return false;
  }
}

/**
 * 워크플로우 영구 삭제
 */
export async function permanentDeleteWorkflow(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.WORKFLOWS, id));
    console.log(`[Firestore] Permanently deleted workflow: ${id}`);

    // 로그 추가
    await addLog({
      level: 'info',
      message: `워크플로우가 영구 삭제됨: ${id}`,
    });

    return true;
  } catch (error) {
    console.error('[Firestore] Failed to permanently delete workflow:', error);
    return false;
  }
}

/**
 * 휴지통 비우기 (모든 삭제된 워크플로우 영구 삭제)
 */
export async function emptyTrash(): Promise<{ deleted: number; failed: number }> {
  try {
    const trashWorkflows = await getTrashWorkflows();
    let deleted = 0;
    let failed = 0;

    for (const workflow of trashWorkflows) {
      const success = await permanentDeleteWorkflow(workflow.id);
      if (success) {
        deleted++;
      } else {
        failed++;
      }
    }

    console.log(`[Firestore] Emptied trash: ${deleted} deleted, ${failed} failed`);
    return { deleted, failed };
  } catch (error) {
    console.error('[Firestore] Failed to empty trash:', error);
    return { deleted: 0, failed: 0 };
  }
}

/**
 * 새 연구 프로젝트 생성
 */
export async function createResearch(input: CreateResearchInput): Promise<Workflow> {
  const now = new Date().toISOString();

  // 에이전트 단계 구성
  const baseAgents = ['idea-building', 'literature-search'];
  const middleAgents = input.skipsExperimentDesign ? [] : ['experiment-design'];
  const endAgents = ['data-analysis', 'paper-writing', 'formatting-review'];
  const agentIds = [...baseAgents, ...middleAgents, ...endAgents];

  console.log('[Firestore] Creating research with agents:', agentIds);

  // Firestore에서 자동 ID 생성
  const docRef = await addDoc(collection(db, COLLECTIONS.WORKFLOWS), {
    name: input.title,
    type: input.workflowType,
    status: 'pending',
    progress: 0,
    currentAgent: agentIds[0],
    researchTopic: input.abstract || input.title,
    description: `${input.methodologyName} 기반 연구`,
    steps: agentIds.map(agentId => ({
      agentId,
      status: 'idle' as const,
    })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log('[Firestore] Created research with ID:', docRef.id);

  const workflow: Workflow = {
    id: docRef.id,
    name: input.title,
    type: input.workflowType,
    status: 'pending',
    progress: 0,
    currentAgent: agentIds[0],
    researchTopic: input.abstract || input.title,
    description: `${input.methodologyName} 기반 연구`,
    steps: agentIds.map(agentId => ({
      agentId,
      status: 'idle' as const,
    })),
    createdAt: now,
    updatedAt: now,
  };

  // 로그 추가
  await addLog({
    level: 'info',
    message: `새 연구 프로젝트 생성: ${input.title}`,
  });

  return workflow;
}

/**
 * 승인 요청 목록 가져오기
 */
export async function getApprovals(): Promise<Approval[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.APPROVALS),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: timestampToString(data.createdAt),
      } as Approval;
    });
  } catch (error) {
    console.error('[Firestore] Failed to load approvals:', error);
    return [];
  }
}

/**
 * 승인 요청 저장
 */
export async function saveApproval(approval: Approval): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.APPROVALS, approval.id);
    await setDoc(docRef, {
      ...approval,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Firestore] Failed to save approval:', error);
    throw error;
  }
}

/**
 * 로그 목록 가져오기
 */
export async function getLogs(): Promise<LogEntry[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.LOGS),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        timestamp: timestampToString(data.timestamp),
      } as LogEntry;
    });
  } catch (error) {
    console.error('[Firestore] Failed to load logs:', error);
    return [];
  }
}

/**
 * 로그 추가
 */
export async function addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTIONS.LOGS), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Firestore] Failed to add log:', error);
  }
}

/**
 * 대시보드 통계
 */
export async function getStats(): Promise<{
  activeWorkflows: number;
  pendingApprovals: number;
  completedToday: number;
  totalAgents: number;
  totalWorkflows: number;
}> {
  const workflows = await getWorkflows();
  const approvals = await getApprovals();

  const today = new Date().toDateString();

  return {
    activeWorkflows: workflows.filter(w =>
      w.status === 'running' || w.status === 'paused' || w.status === 'pending'
    ).length,
    pendingApprovals: approvals.filter(a => a.status === 'pending').length,
    completedToday: workflows.filter(w =>
      w.status === 'completed' &&
      new Date(w.updatedAt).toDateString() === today
    ).length,
    totalAgents: mockAgents.length,
    totalWorkflows: workflows.length,
  };
}

/**
 * 워크플로우 실시간 구독
 */
export function subscribeToWorkflows(
  callback: (workflows: Workflow[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTIONS.WORKFLOWS),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const workflows = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
          deletedAt: data.deletedAt ? timestampToString(data.deletedAt) : undefined,
        } as Workflow;
      })
      .filter(w => !w.deletedAt); // 삭제된 항목 제외
    callback(workflows);
  });
}

/**
 * 승인 요청 실시간 구독
 */
export function subscribeToApprovals(
  callback: (approvals: Approval[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTIONS.APPROVALS),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const approvals = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: timestampToString(data.createdAt),
      } as Approval;
    });
    callback(approvals);
  });
}

// ============================================
// Firebase Functions 호출
// ============================================

/**
 * 승인 처리 (Cloud Function 호출)
 */
export async function processApproval(
  approvalId: string,
  action: 'approve' | 'reject',
  feedback?: string
): Promise<{ success: boolean }> {
  try {
    const processApprovalFn = httpsCallable<
      { approvalId: string; action: string; feedback?: string },
      { success: boolean }
    >(functions, 'processApproval');

    const result = await processApprovalFn({ approvalId, action, feedback });
    console.log('[Functions] processApproval result:', result.data);
    return result.data;
  } catch (error) {
    console.error('[Functions] processApproval error:', error);
    throw error;
  }
}

/**
 * 워크플로우 재시작 (Cloud Function 호출)
 */
export async function restartWorkflow(
  workflowId: string,
  fromAgentId?: string
): Promise<{ success: boolean }> {
  try {
    const restartWorkflowFn = httpsCallable<
      { workflowId: string; fromAgentId?: string },
      { success: boolean }
    >(functions, 'restartWorkflow');

    const result = await restartWorkflowFn({ workflowId, fromAgentId });
    console.log('[Functions] restartWorkflow result:', result.data);
    return result.data;
  } catch (error) {
    console.error('[Functions] restartWorkflow error:', error);
    throw error;
  }
}

/**
 * 특정 워크플로우의 로그 실시간 구독
 */
export function subscribeToWorkflowLogs(
  workflowId: string,
  callback: (logs: LogEntry[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTIONS.LOGS),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: timestampToString(data.timestamp),
        } as LogEntry;
      })
      .filter(log => log.workflowId === workflowId);
    callback(logs);
  });
}

/**
 * 단일 워크플로우 실시간 구독
 */
export function subscribeToWorkflow(
  workflowId: string,
  callback: (workflow: Workflow | null) => void
): () => void {
  const docRef = doc(db, COLLECTIONS.WORKFLOWS, workflowId);

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        ...data,
        id: snapshot.id,
        createdAt: timestampToString(data.createdAt),
        updatedAt: timestampToString(data.updatedAt),
        startedAt: data.startedAt ? timestampToString(data.startedAt) : undefined,
        completedAt: data.completedAt ? timestampToString(data.completedAt) : undefined,
      } as Workflow);
    } else {
      callback(null);
    }
  });
}
