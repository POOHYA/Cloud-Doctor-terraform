import React, { useState, useEffect } from "react";
import { userApi } from "../api/user";

type ChecklistItem = {
  id: number;
  guidelineId: number;
  title: string;
  description: string;
  serviceListName?: string;
  guideline?: {
    title: string;
    service: {
      name: string;
    };
  };
};

export default function Checklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const data = await userApi.getChecklists();
      setChecklist(data);
      const uniqueServices = Array.from(
        new Set(
          data
            .map(
              (c: ChecklistItem) =>
                c.serviceListName || c.guideline?.service.name
            )
            .filter(Boolean)
        )
      ) as string[];
      setServices(uniqueServices);
      setSelectedServices(uniqueServices);
    } catch (error) {
      console.error("체크리스트 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
      setAnswers({});
    } else {
      setSelectedServices([...selectedServices, service]);
      setAnswers({});
    }
  };

  const filteredChecklist = checklist.filter((item) =>
    selectedServices.includes(
      item.serviceListName || item.guideline?.service.name || ""
    )
  );

  const totalItems = filteredChecklist.length;
  const scorePerItem = totalItems > 0 ? 10 / totalItems : 0;
  const totalScore = filteredChecklist.reduce((score, item) => {
    return answers[item.id] === true ? score + scorePerItem : score;
  }, 0);
  const completedItems = filteredChecklist.filter(
    (item) => answers[item.id] !== undefined
  ).length;
  const completionRate =
    totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const resetAnswers = () => setAnswers({});

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-12 flex items-center justify-center">
        <div className="text-primary-light text-xl">로딩 중...</div>
      </section>
    );
  }

  return (
    <section
      id="Checklist"
      className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-dark py-12"
    >
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-beige to-primary-light bg-clip-text text-transparent">
          🛡️ AWS 보안 체크리스트
        </h1>

        {/* 서비스 선택 버튼 */}

        <div className="flex flex-wrap gap-2 mb-6">
          {services.map((service) => (
            <button
              key={service}
              className={`px-4 py-2 rounded-xl font-medium transition-colors duration-200 shadow-md border ${
                selectedServices.includes(service)
                  ? "bg-gradient-to-r from-primary to-accent text-white border-transparent"
                  : "bg-primary-dark/50 text-primary-light border-primary hover:border-accent"
              }`}
              onClick={() => toggleService(service)}
            >
              {service}
            </button>
          ))}
        </div>

        {/* Select All / Clear */}
        <div className="flex gap-2 mb-6">
          <button
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-medium hover:from-green-600 hover:to-green-600 shadow-lg transition-all"
            onClick={() => {
              setSelectedServices(services);
              setAnswers({});
            }}
          >
            Select All
          </button>
          <button
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 shadow-lg transition-all"
            onClick={() => {
              setSelectedServices([]);
              setAnswers({});
            }}
          >
            Clear
          </button>
        </div>
        {/* 총점 - 고정 */}
        <div className="sticky top-20 z-10 mb-8 p-6 bg-gradient-to-r from-primary to-accent rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm opacity-90">현재 점수</p>
              <p className="text-5xl font-bold">
                {totalScore.toFixed(1)}
                <span className="text-2xl">/10</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm opacity-90">진행률</p>
                <p className="text-3xl font-bold">
                  {completionRate.toFixed(0)}%
                </p>
              </div>
              <button
                onClick={resetAnswers}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all hover:rotate-180 duration-500"
                title="답변 초기화"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 체크리스트 테이블 */}
        <div className="bg-primary-dark/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-primary">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr className="bg-primary-dark/50 text-primary-light">
                <th className="border border-primary p-4 text-left font-semibold">
                  서비스
                </th>
                <th className="border border-primary p-4 text-left font-semibold">
                  항목
                </th>
                <th className="border border-primary p-4 text-center font-semibold">
                  체크
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredChecklist.map((item) => {
                const answer = answers[item.id];
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-primary-dark/30 transition-colors"
                  >
                    <td className="border border-primary p-4 text-primary-light">
                      {item.serviceListName}
                    </td>
                    <td className="border border-primary p-4 text-beige">
                      {item.title}
                    </td>
                    <td className="border border-primary p-4 text-center flex justify-center gap-2">
                      {/* O 버튼 */}
                      <button
                        className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                          answer === true
                            ? "bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg scale-110"
                            : "bg-primary-dark/50 text-surface border-2 border-primary hover:border-green-500 hover:text-green-400 hover:scale-105"
                        }`}
                        onClick={() =>
                          setAnswers({ ...answers, [item.id]: true })
                        }
                      >
                        O
                      </button>
                      {/* X 버튼 */}
                      <button
                        className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                          answer === false
                            ? "bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-lg scale-110"
                            : "bg-slate-700/50 text-slate-400 border-2 border-slate-600 hover:border-rose-500 hover:text-rose-400 hover:scale-105"
                        }`}
                        onClick={() =>
                          setAnswers({ ...answers, [item.id]: false })
                        }
                      >
                        X
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
