import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  BookOpen,
  Layers,
  Check,
  ChevronRight,
  BarChart3,
  Users,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  METHODOLOGY_CATALOG,
  recommendMethodologies,
  type MethodologyMetadata,
  type MethodologyRecommendation,
  type MethodologyCategory,
} from '../data/methodologies';
import { createResearch } from '../services/firestoreService';

// 워크플로우 타입 정의
interface WorkflowConfig {
  id: string;
  name: string;
  type: 'sequential' | 'parallel' | 'hybrid';
  description: string;
  agentCount: number;
  skipsExperimentDesign: boolean;
}

// 문헌 기반 연구방법론 목록 (실험설계 단계 생략)
const LITERATURE_BASED_METHODS = [
  'systematic-review',
  'meta-analysis',
  'scoping-review',
  'narrative-review',
  'integrative-review',
  'rapid-review',
  'umbrella-review',
  'realist-review',
  'critical-review',
  'qualitative-systematic-review',
];

// 워크플로우 선택 함수
function selectWorkflowForMethodology(methodology: MethodologyMetadata): WorkflowConfig {
  // 문헌 기반 연구 → 문헌고찰 전용 워크플로우
  if (LITERATURE_BASED_METHODS.includes(methodology.id)) {
    return {
      id: 'literature-review',
      name: '문헌고찰 워크플로우',
      type: 'sequential',
      description: '문헌검색 중심의 연구 (실험설계 단계 생략, 5단계)',
      agentCount: 5,
      skipsExperimentDesign: true,
    };
  }

  // 일반 연구 워크플로우
  const workflows: Record<MethodologyCategory, WorkflowConfig> = {
    quantitative: {
      id: 'quantitative-research',
      name: '양적 연구 워크플로우',
      type: 'sequential',
      description: '설문조사, 실험연구, 상관연구 등 (6단계)',
      agentCount: 6,
      skipsExperimentDesign: false,
    },
    qualitative: {
      id: 'qualitative-research',
      name: '질적 연구 워크플로우',
      type: 'sequential',
      description: '근거이론, 현상학, 사례연구 등 (6단계)',
      agentCount: 6,
      skipsExperimentDesign: false,
    },
    mixed: {
      id: 'mixed-methods-research',
      name: '혼합 연구 워크플로우',
      type: 'hybrid',
      description: '순차적/동시적 혼합연구 등 (6단계)',
      agentCount: 6,
      skipsExperimentDesign: false,
    },
  };

  return workflows[methodology.category] || workflows.quantitative;
}

// 단계 정의
type Step = 'input' | 'methodology' | 'options';

export function NewResearch() {
  const navigate = useNavigate();

  // 현재 단계
  const [currentStep, setCurrentStep] = useState<Step>('input');

  // Step 1: 기본 입력
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');

  // Step 2: 연구방법론
  const [recommendations, setRecommendations] = useState<MethodologyRecommendation[]>([]);
  const [selectedMethodology, setSelectedMethodology] = useState<MethodologyMetadata | null>(null);
  const [showAllMethodologies, setShowAllMethodologies] = useState(false);
  const [filterCategory, setFilterCategory] = useState<MethodologyCategory | 'all'>('all');

  // Step 3: 옵션
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoApprove, setAutoApprove] = useState({
    experimentDesign: false,
    paperDraft: false,
    formatting: false,
  });
  const [notifications, setNotifications] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 추천 로직 실행
  useEffect(() => {
    if (title.length > 5 || abstract.length > 10) {
      const recs = recommendMethodologies(title, abstract, undefined, 5);
      setRecommendations(recs);
    } else {
      setRecommendations([]);
    }
  }, [title, abstract]);

  const handleNextStep = () => {
    if (currentStep === 'input' && (title.trim() || abstract.trim())) {
      setCurrentStep('methodology');
    } else if (currentStep === 'methodology' && selectedMethodology) {
      setCurrentStep('options');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'methodology') {
      setCurrentStep('input');
    } else if (currentStep === 'options') {
      setCurrentStep('methodology');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !selectedMethodology) return;

    setIsSubmitting(true);

    try {
      const workflow = selectWorkflowForMethodology(selectedMethodology);

      // 실제 데이터 저장
      const newWorkflow = await createResearch({
        title: title.trim(),
        abstract: abstract.trim(),
        methodologyId: selectedMethodology.id,
        methodologyName: selectedMethodology.name.ko,
        workflowId: workflow.id,
        workflowName: workflow.name,
        workflowType: workflow.type,
        agentCount: workflow.agentCount,
        skipsExperimentDesign: workflow.skipsExperimentDesign,
        options: {
          autoApprove,
          notifications,
        },
      });

      // 생성된 워크플로우 페이지로 이동
      navigate(`/workflow/${newWorkflow.id}`);
    } catch (error) {
      console.error('연구 생성 실패:', error);
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: MethodologyCategory) => {
    switch (category) {
      case 'quantitative':
        return <BarChart3 size={16} />;
      case 'qualitative':
        return <Users size={16} />;
      case 'mixed':
        return <Layers size={16} />;
    }
  };

  const getCategoryColor = (category: MethodologyCategory) => {
    switch (category) {
      case 'quantitative':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'qualitative':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'mixed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredMethodologies = filterCategory === 'all'
    ? METHODOLOGY_CATALOG
    : METHODOLOGY_CATALOG.filter(m => m.category === filterCategory);

  return (
    <div>
      <Header title="새 연구 시작" subtitle="AI 에이전트와 함께 연구를 시작하세요" />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {(['input', 'methodology', 'options'] as Step[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-medium transition-colors ${
                  currentStep === step
                    ? 'bg-primary-600 text-white'
                    : index < ['input', 'methodology', 'options'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {index < ['input', 'methodology', 'options'].indexOf(currentStep) ? (
                  <Check size={20} />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === step ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {step === 'input' && '연구 정보'}
                {step === 'methodology' && '연구방법론'}
                {step === 'options' && '옵션 설정'}
              </span>
              {index < 2 && (
                <ChevronRight className="mx-4 text-gray-400" size={20} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Input */}
        {currentStep === 'input' && (
          <Card>
            <CardContent>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  연구 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: CRISPR 기반 유전자 치료의 효율성 분석"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  연구 요약 / 개요
                </label>
                <textarea
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="연구의 배경, 목적, 연구 질문, 예상 결과 등을 간략히 작성해주세요. 입력 내용을 바탕으로 적합한 연구방법론을 추천해드립니다."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* 실시간 추천 미리보기 */}
              {recommendations.length > 0 && (
                <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={18} className="text-primary-600" />
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                      추천 연구방법론 미리보기
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.slice(0, 3).map((rec) => (
                      <span
                        key={rec.methodology.id}
                        className="px-3 py-1 text-sm bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                      >
                        {rec.methodology.name.ko}
                        <span className="ml-1 text-xs text-primary-600">
                          {rec.score}점
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNextStep}
                  disabled={!title.trim() && !abstract.trim()}
                  rightIcon={<ChevronRight size={20} />}
                >
                  다음: 연구방법론 선택
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Methodology Selection */}
        {currentStep === 'methodology' && (
          <div className="space-y-6">
            {/* AI 추천 섹션 */}
            {recommendations.length > 0 && (
              <Card className="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800">
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                      <Sparkles size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        AI 추천 연구방법론
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        입력하신 연구 내용을 분석하여 추천합니다
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <MethodologyCard
                        key={rec.methodology.id}
                        methodology={rec.methodology}
                        isSelected={selectedMethodology?.id === rec.methodology.id}
                        onSelect={() => setSelectedMethodology(rec.methodology)}
                        recommendation={rec}
                        rank={index + 1}
                        getCategoryIcon={getCategoryIcon}
                        getCategoryColor={getCategoryColor}
                        getComplexityColor={getComplexityColor}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 전체 방법론 목록 */}
            <Card>
              <CardContent>
                <button
                  onClick={() => setShowAllMethodologies(!showAllMethodologies)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-gray-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      전체 연구방법론 목록
                    </span>
                    <span className="text-sm text-gray-500">
                      ({METHODOLOGY_CATALOG.length}개)
                    </span>
                  </div>
                  {showAllMethodologies ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>

                {showAllMethodologies && (
                  <div className="mt-4">
                    {/* 카테고리 필터 */}
                    <div className="flex gap-2 mb-4">
                      {(['all', 'quantitative', 'qualitative', 'mixed'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFilterCategory(cat)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterCategory === cat
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {cat === 'all' && '전체'}
                          {cat === 'quantitative' && '양적 연구'}
                          {cat === 'qualitative' && '질적 연구'}
                          {cat === 'mixed' && '혼합 연구'}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {filteredMethodologies.map((methodology) => (
                        <MethodologyCard
                          key={methodology.id}
                          methodology={methodology}
                          isSelected={selectedMethodology?.id === methodology.id}
                          onSelect={() => setSelectedMethodology(methodology)}
                          compact
                          getCategoryIcon={getCategoryIcon}
                          getCategoryColor={getCategoryColor}
                          getComplexityColor={getComplexityColor}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 선택된 방법론 상세 */}
            {selectedMethodology && (
              <Card className="border-green-200 dark:border-green-800">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Check size={20} className="text-green-600" />
                        <span className="text-sm font-medium text-green-600">선택된 연구방법론</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedMethodology.name.ko}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedMethodology.name.en}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedMethodology.category)}`}>
                      {selectedMethodology.category === 'quantitative' && '양적 연구'}
                      {selectedMethodology.category === 'qualitative' && '질적 연구'}
                      {selectedMethodology.category === 'mixed' && '혼합 연구'}
                    </span>
                  </div>

                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {selectedMethodology.description.ko}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">강점</h4>
                      <ul className="space-y-1">
                        {selectedMethodology.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">고려사항</h4>
                      <ul className="space-y-1">
                        {selectedMethodology.limitations.map((l, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-yellow-500 mt-1">•</span>
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        예상 기간: {selectedMethodology.typicalDuration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className={getComplexityColor(selectedMethodology.complexity)} />
                      <span className={`text-sm ${getComplexityColor(selectedMethodology.complexity)}`}>
                        복잡도: {selectedMethodology.complexity === 'low' ? '낮음' : selectedMethodology.complexity === 'medium' ? '중간' : '높음'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between">
              <Button variant="ghost" onClick={handlePrevStep}>
                이전
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextStep}
                disabled={!selectedMethodology}
                rightIcon={<ChevronRight size={20} />}
              >
                다음: 옵션 설정
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Options */}
        {currentStep === 'options' && (
          <Card>
            <CardContent>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
                워크플로우 옵션 설정
              </h3>

              {/* 선택 요약 */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">연구 제목</span>
                    <p className="font-medium text-gray-900 dark:text-white">{title || '(미입력)'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">선택한 연구방법론</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedMethodology?.name.ko}
                    </p>
                  </div>
                </div>

                {/* 자동 선택된 워크플로우 */}
                {selectedMethodology && (() => {
                  const workflow = selectWorkflowForMethodology(selectedMethodology);
                  return (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-500">적용될 워크플로우</span>
                      <div className="flex items-center gap-3 mt-2">
                        <div className={`p-2 rounded-lg ${
                          workflow.skipsExperimentDesign
                            ? 'bg-amber-100 dark:bg-amber-900/30'
                            : 'bg-primary-100 dark:bg-primary-900/30'
                        }`}>
                          {workflow.skipsExperimentDesign ? (
                            <BookOpen size={20} className="text-amber-600" />
                          ) : (
                            <Layers size={20} className="text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {workflow.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {workflow.description}
                          </p>
                          {workflow.skipsExperimentDesign && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              ⚡ 문헌 기반 연구: 실험설계 단계 생략
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            workflow.type === 'sequential'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {workflow.type === 'sequential' ? '순차 실행' : '혼합 실행'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {workflow.agentCount}개 에이전트
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 고급 옵션 */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  고급 옵션
                </button>

                {showAdvanced && (
                  <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4">
                    <div className="flex items-start gap-3">
                      <Info size={16} className="text-gray-400 mt-0.5" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        자동 승인을 활성화하면 해당 단계에서 사람의 검토 없이 다음 단계로 진행됩니다.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={autoApprove.experimentDesign}
                          onChange={(e) =>
                            setAutoApprove({ ...autoApprove, experimentDesign: e.target.checked })
                          }
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          실험/연구 설계 자동 승인
                        </span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={autoApprove.paperDraft}
                          onChange={(e) =>
                            setAutoApprove({ ...autoApprove, paperDraft: e.target.checked })
                          }
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          논문 초안 자동 승인
                        </span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={autoApprove.formatting}
                          onChange={(e) =>
                            setAutoApprove({ ...autoApprove, formatting: e.target.checked })
                          }
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          포맷팅 검토 자동 승인
                        </span>
                      </label>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        승인 필요 시 알림 받기
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="ghost" onClick={handlePrevStep}>
                  이전
                </Button>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => navigate('/')}>
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Rocket size={20} />}
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    disabled={!title.trim() || !selectedMethodology}
                  >
                    연구 시작
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// 방법론 카드 컴포넌트
interface MethodologyCardProps {
  methodology: MethodologyMetadata;
  isSelected: boolean;
  onSelect: () => void;
  recommendation?: MethodologyRecommendation;
  rank?: number;
  compact?: boolean;
  getCategoryIcon: (category: MethodologyCategory) => React.ReactNode;
  getCategoryColor: (category: MethodologyCategory) => string;
  getComplexityColor: (complexity: string) => string;
}

function MethodologyCard({
  methodology,
  isSelected,
  onSelect,
  recommendation,
  rank,
  compact = false,
  getCategoryIcon,
  getCategoryColor,
  getComplexityColor,
}: MethodologyCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {rank && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold">
                {rank}
              </span>
            )}
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {methodology.name.ko}
            </h4>
          </div>
          {!compact && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {methodology.description.ko}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {recommendation && (
            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">
              {recommendation.score}점
            </span>
          )}
          <span className={`p-1.5 rounded-lg ${getCategoryColor(methodology.category)}`}>
            {getCategoryIcon(methodology.category)}
          </span>
        </div>
      </div>

      {!compact && recommendation && recommendation.reasons.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <ul className="space-y-1">
            {recommendation.reasons.slice(0, 2).map((reason, i) => (
              <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
                <span className="text-primary-500">✓</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {compact && (
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{methodology.typicalDuration}</span>
          <span className={getComplexityColor(methodology.complexity)}>
            {methodology.complexity === 'low' ? '낮음' : methodology.complexity === 'medium' ? '중간' : '높음'}
          </span>
        </div>
      )}
    </div>
  );
}
