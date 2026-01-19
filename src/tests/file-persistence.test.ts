/**
 * File Persistence Adapter 테스트
 * JSON 파일 기반 저장 및 Git 동기화 검증
 */

import { promises as fs } from 'fs';
import path from 'path';
import { FilePersistenceAdapter } from '../state/FilePersistenceAdapter.js';
import { StateManager } from '../state/StateManager.js';
import type { SerializedState } from '../core/interfaces/state.interface.js';

const TEST_DATA_DIR = path.join(process.cwd(), 'data', 'test-sessions');

async function cleanup() {
  try {
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('📁 File Persistence Adapter 테스트');
  console.log('========================================\n');

  await cleanup();

  let passed = 0;
  let failed = 0;

  // Test 1: 디렉토리 자동 생성
  console.log('1️⃣ 디렉토리 자동 생성 테스트');
  try {
    const adapter = new FilePersistenceAdapter(TEST_DATA_DIR);
    await adapter.list(); // This should create the directory
    const exists = await fs.stat(path.join(TEST_DATA_DIR, 'sessions')).then(() => true).catch(() => false);
    if (exists) {
      console.log('   ✅ 디렉토리가 자동으로 생성됨');
      passed++;
    } else {
      console.log('   ❌ 디렉토리 생성 실패');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error}`);
    failed++;
  }

  // Test 2: 세션 저장
  console.log('\n2️⃣ 세션 저장 테스트');
  try {
    const adapter = new FilePersistenceAdapter(TEST_DATA_DIR);
    const testState: SerializedState = {
      sessionId: 'test-session-001',
      currentStage: 'idea_building',
      researchTopic: '인공지능 연구 윤리',
      data: {
        research_idea: '연구 아이디어 내용',
        custom_data: { key: 'value' },
      },
      timestamp: Date.now(),
    };

    await adapter.save('test-session-001', testState);

    const filePath = path.join(TEST_DATA_DIR, 'sessions', 'test-session-001.json');
    const exists = await fs.stat(filePath).then(() => true).catch(() => false);

    if (exists) {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.researchTopic === '인공지능 연구 윤리') {
        console.log('   ✅ 세션이 JSON 파일로 저장됨');
        console.log(`   📄 파일: ${filePath}`);
        passed++;
      } else {
        console.log('   ❌ 저장된 데이터가 일치하지 않음');
        failed++;
      }
    } else {
      console.log('   ❌ 파일이 생성되지 않음');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error}`);
    failed++;
  }

  // Test 3: 세션 로드
  console.log('\n3️⃣ 세션 로드 테스트');
  try {
    const adapter = new FilePersistenceAdapter(TEST_DATA_DIR);
    const loaded = await adapter.load('test-session-001');

    if (loaded && loaded.researchTopic === '인공지능 연구 윤리') {
      console.log('   ✅ 세션이 정상적으로 로드됨');
      console.log(`   📋 연구 주제: ${loaded.researchTopic}`);
      passed++;
    } else {
      console.log('   ❌ 세션 로드 실패');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error}`);
    failed++;
  }

  // Test 4: 존재하지 않는 세션 로드
  console.log('\n4️⃣ 존재하지 않는 세션 로드 테스트');
  try {
    const adapter = new FilePersistenceAdapter(TEST_DATA_DIR);
    const loaded = await adapter.load('non-existent-session');

    if (loaded === null) {
      console.log('   ✅ 존재하지 않는 세션은 null 반환');
      passed++;
    } else {
      console.log('   ❌ null이 아닌 값이 반환됨');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error}`);
    failed++;
  }

  // Test 5: 세션 목록
  console.log('\n5️⃣ 세션 목록 테스트');
  try {
    const adapter = new FilePersistenceAdapter(TEST_DATA_DIR);

    // 추가 세션 저장
    await adapter.save('test-session-002', {
      sessionId: 'test-session-002',
      currentStage: 'literature_search',
      researchTopic: '머신러닝 최적화',
      data: {},
      timestamp: Date.now(),
    });

    const sessions = await adapter.list();

    if (sessions.includes('test-session-001') && sessions.includes('test-session-002')) {
      console.log('   ✅ 세션 목록 조회 성공');
      console.log(`   📋 세션 수: ${sessions.length}`);
      passed++;
    } else {
      console.log('   ❌ 세션 목록이 불완전함');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error}`);
    failed++;
  }

  // Test 6: 세션 삭제
  console.log('\n6️⃣ 세션 삭제 테스트');
  try {
    const adapter = new FilePersistenceAdapter(TEST_DATA_DIR);
    await adapter.delete('test-session-002');

    const loaded = await adapter.load('test-session-002');

    if (loaded === null) {
      console.log('   ✅ 세션 삭제 성공');
      passed++;
    } else {
      console.log('   ❌ 세션이 삭제되지 않음');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error}`);
    failed++;
  }

  // Test 7: StateManager와 통합
  console.log('\n7️⃣ StateManager 통합 테스트');
  try {
    const adapter = new FilePersistenceAdapter(TEST_DATA_DIR);
    const stateManager = new StateManager(adapter);

    const session = await stateManager.createSession('integration-test');
    session.researchTopic = '통합 테스트 주제';
    session.set('custom_key', { nested: 'data' });

    await stateManager.persist('integration-test');

    // 새로운 StateManager로 세션 복원
    const newStateManager = new StateManager(adapter);
    const restored = await newStateManager.createSession('integration-test');

    if (restored.researchTopic === '통합 테스트 주제') {
      console.log('   ✅ StateManager 통합 성공');
      console.log(`   📋 복원된 주제: ${restored.researchTopic}`);
      passed++;
    } else {
      console.log('   ❌ 세션 복원 실패');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error}`);
    failed++;
  }

  // Test 8: 경로 순회 방지 (보안)
  console.log('\n8️⃣ 경로 순회 방지 테스트 (보안)');
  try {
    const adapter = new FilePersistenceAdapter(TEST_DATA_DIR);
    const maliciousId = '../../../malicious';
    await adapter.save(maliciousId, {
      sessionId: maliciousId,
      currentStage: 'idea_building',
      researchTopic: 'test',
      data: {},
      timestamp: Date.now(),
    });

    // 파일이 TEST_DATA_DIR 외부에 생성되지 않아야 함
    const maliciousPath = path.resolve(TEST_DATA_DIR, '..', '..', '..', 'malicious.json');
    const existsOutside = await fs.stat(maliciousPath).then(() => true).catch(() => false);

    // 세션 목록으로 확인 - 경로가 sanitize되어 저장되어야 함
    const sessions = await adapter.list();
    const sanitizedExists = sessions.some(s => s.includes('malicious'));

    if (!existsOutside && sanitizedExists) {
      console.log('   ✅ 경로 순회 공격 방지됨');
      console.log(`   📋 Sanitized 세션: ${sessions.find(s => s.includes('malicious'))}`);
      passed++;
    } else if (!existsOutside) {
      console.log('   ✅ 경로 순회 공격 방지됨 (외부 파일 없음)');
      passed++;
    } else {
      console.log('   ❌ 보안 취약점 발견');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ 오류: ${error}`);
    failed++;
  }

  // 정리
  await cleanup();

  // 결과 출력
  console.log('\n========================================');
  console.log('📊 테스트 결과');
  console.log('========================================');
  console.log(`   ✅ 통과: ${passed}`);
  console.log(`   ❌ 실패: ${failed}`);
  console.log(`   📈 성공률: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log(`\n최종: ${failed === 0 ? '✅ 모든 테스트 통과!' : '❌ 일부 테스트 실패'}\n`);
}

runTests().catch(console.error);
