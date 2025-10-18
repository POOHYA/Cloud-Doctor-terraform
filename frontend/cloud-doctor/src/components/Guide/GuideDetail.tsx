import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { userApi } from "../../api/user";

type ApiResponse = {
  id: number;
  title: string;
  serviceList: { displayName: string }[];
  importanceLevel: "LOW" | "MEDIUM" | "HIGH";
  whyDangerous: string;
  whatHappens: string;
  checkStandard: string;
  solutionText: string;
  sideEffects: string;
  note: string;
};

export type GuideItemProps = {
  id: string;
  category: string;
  importanceLevel: string;
  title: string;
  description: string;
  whatHappens: string;
  checkSteps: string;
  remediation: string[];
  sideEffect: string;
  note: string;
};

const mapApiToGuideItem = (item: any, serviceName?: string): GuideItemProps => {
  return {
    id: item.id?.toString() || "",
    category:
      serviceName ||
      item.serviceList?.[0]?.displayName ||
      item.serviceName ||
      "Unknown",
    importanceLevel: item.importanceLevel || "LOW",
    title: item.title || "",
    description: item.note || "",
    whatHappens: item.whatHappens || "",
    checkSteps: item.checkStandard || "",
    remediation: (item.solutionText || "")
      .split("\n")
      .filter((s: string) => s.trim()),
    sideEffect: item.sideEffects || "",
    note: item.whyDangerous || "",
  };
};

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = "bg-blue-600",
}) => (
  <span
    className={`inline-block px-2 py-0.5 text-sm font-medium text-white rounded ${color}`}
  >
    {children}
  </span>
);

const GuideItem: React.FC<{ data: GuideItemProps }> = ({ data }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <article className="p-8 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700">
      <header className="flex items-start justify-between gap-4 pb-6 border-b border-slate-700">
        <div>
          <h2 className="text-3xl font-bold text-white mb-3">{data.title}</h2>
          <div className="flex items-center gap-3">
            <Badge
              color={
                data.importanceLevel === "긴급"
                  ? "bg-red-500"
                  : data.importanceLevel === "확인요망"
                  ? "bg-orange-500"
                  : "bg-yellow-500"
              }
            >
              {data.importanceLevel === "긴급"
                ? "긴급"
                : data.importanceLevel === "확인요망"
                ? "중요"
                : "확인요망"}
            </Badge>
          </div>
        </div>

        <button
          onClick={() => setShowImageModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
          title="캡쳐가이드"
        >
          🌌 캡쳐가이드
        </button>
      </header>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-700/50 p-5 rounded-2xl shadow-md border border-slate-600">
            <h3 className="text-lg font-bold text-violet-400 mb-3 flex items-center gap-2">
              📌 왜 위험한가
            </h3>
            <p className="text-white leading-relaxed whitespace-pre-line">
              {data.note}
            </p>
          </div>

          <div className="bg-slate-700/50 p-5 rounded-2xl shadow-md border border-slate-600">
            <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
              ⚠️ 어떤 일이 벌어질까?
            </h3>
            <p className="text-white leading-relaxed whitespace-pre-line">
              {data.whatHappens}
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-5 rounded-2xl shadow-md border border-cyan-600/30">
            <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
              ✅ 점검 기준
            </h3>
            <pre className="bg-slate-900/50 p-4 rounded-xl text-sm text-slate-300 whitespace-pre-wrap shadow-sm border border-cyan-600/20">
              {data.checkSteps}
            </pre>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="p-5 bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-2xl shadow-md border border-emerald-600/30">
            <h4 className="text-base font-bold text-emerald-400 mb-3 flex items-center gap-2">
              💡 조치 방안
            </h4>
            <ul className="space-y-2 text-slate-300">
              {data.remediation.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-gradient-to-br from-amber-900/20 to-yellow-900/20 rounded-2xl shadow-md border border-amber-600/30">
            <h4 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-2">
              ⚡ Side Effect
            </h4>
            <p className="text-slate-300">{data.sideEffect}</p>
          </div>
        </aside>
      </section>

      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div
            className="w-full h-full flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`/img/guide/${data.id}.png`}
              alt="캡쳐 가이드"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/img/placeholder.png";
              }}
            />
          </div>
        </div>
      )}
    </article>
  );
};

export default function GuideDetail() {
  const { service } = useParams<{ service: string }>();
  const [articles, setArticles] = useState<GuideItemProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!service) {
          setArticles([]);
          setLoading(false);
          return;
        }

        const servicesData = await userApi.getServicesByProvider(1);
        console.log("Services:", servicesData);
        console.log("Looking for service:", service);

        const targetService = servicesData.find((s: any) => s.name === service);
        console.log("Target service:", targetService);

        if (!targetService) {
          console.log("Service not found");
          setArticles([]);
          setLoading(false);
          return;
        }

        const guidelines = await userApi.getGuidelinesByService(
          targetService.id
        );
        console.log("Guidelines:", guidelines);

        if (!Array.isArray(guidelines) || guidelines.length === 0) {
          console.log("No guidelines found");
          setArticles([]);
          setLoading(false);
          return;
        }

        const mapped = guidelines.map((g: any) =>
          mapApiToGuideItem(g, targetService.displayName)
        );
        console.log("Mapped articles:", mapped);
        setArticles(mapped);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [service]);

  const categories = Array.from(new Set(articles.map((a) => a.category)));
  const filteredArticles = selectedCategory
    ? articles.filter((a) => a.category === selectedCategory)
    : articles;

  const scrollToArticle = (index: number) => {
    const element = document.getElementById(`article-${index}`);
    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 flex items-center justify-center">
        <div className="text-white text-xl">
          해당 서비스의 가이드가 준비 중입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="flex gap-8 max-w-7xl mx-auto p-8">
        {/* 왼쪽 목차 - 고정 */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">📑 목차</h3>
            <nav className="space-y-2">
              {filteredArticles.map((article, index) => (
                <button
                  key={article.id}
                  onClick={() => scrollToArticle(index)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors text-sm text-slate-300 hover:text-cyan-400 font-medium"
                >
                  {index + 1}. {article.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 오른쪽 아티클 영역 */}
        <div className="flex-1 space-y-12">
          {/* 카테고리 필터 */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === null
                    ? "bg-cyan-600 text-white shadow-lg"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                }`}
              >
                전체
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-cyan-600 text-white shadow-lg"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {filteredArticles.map((article, index) => (
            <div key={article.id} id={`article-${index}`}>
              <GuideItem data={article} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
