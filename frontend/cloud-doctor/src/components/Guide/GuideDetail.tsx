import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { userApi } from "../../api/user";

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
  links?: Array<{ title: string; url: string }>;
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
    links: item.links || [],
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
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [zoomState, setZoomState] = useState<{
    scale: number;
    x: number;
    y: number;
  }>({ scale: 1, x: 0, y: 0 });

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

          <div className="p-5 bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-2xl shadow-md border border-emerald-600/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                💡 조치 방안
              </h4>
              <button
                onClick={() => setShowImageModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                title="캡쳐가이드라인"
              >
                🌌 캡쳐
              </button>
            </div>
            <ul className="space-y-2 text-slate-300">
              {data.remediation.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          {data.links && data.links.length > 0 && (
            <div className="p-5 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl shadow-md border border-purple-600/30">
              <h4 className="text-base font-bold text-purple-400 mb-3 flex items-center gap-2">
                🔗 침해사례 및 공격기법
              </h4>
              <ul className="space-y-2">
                {data.links.slice(0, 4).map((link, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-300 hover:text-purple-100 underline break-all flex-1"
                    >
                      {link.title || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.sideEffect && (
            <div className="p-5 bg-gradient-to-br from-amber-900/20 to-yellow-900/20 rounded-2xl shadow-md border border-amber-600/30">
              <h4 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-2">
                ⚡ Side Effect
              </h4>
              <p className="text-slate-300">{data.sideEffect}</p>
            </div>
          )}
        </aside>
      </section>

      {showImageModal &&
        createPortal(
          <div
            className="fixed top-[72px] left-0 right-0 bottom-0 z-[60] bg-black overflow-auto"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="fixed top-20 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-all"
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
            <div className="p-4" onClick={(e) => e.stopPropagation()}>
              {data.remediation.length > 0 && (
                <div className="mb-6 p-5 bg-gradient-to-br from-emerald-900 to-green-900/20 rounded-2xl shadow-md border border-emerald-600/30">
                  <h4 className="text-base font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    💡 조치 방안
                  </h4>
                  <ul className="space-y-2 text-slate-300">
                    {data.remediation.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <h3 className="text-red-400 font-bold text-lg mb-2">
                    ⚠️ 조치 전
                  </h3>
                </div>
                <div className="text-center">
                  <h3 className="text-green-400 font-bold text-lg mb-2">
                    ✅ 조치 후
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {[1, 2, 3].map((num) => (
                  <React.Fragment key={num}>
                    <img
                      src={`/img/guide/${data.id}.취약-${num}.png`}
                      alt={`조치 전 ${num}`}
                      className="w-full h-auto object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        setFullscreenImage(
                          `/img/guide/${data.id}.취약-${num}.png`
                        )
                      }
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <img
                      src={`/img/guide/${data.id}.양호-${num}.png`}
                      alt={`조치 후 ${num}`}
                      className="w-full h-auto object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        setFullscreenImage(
                          `/img/guide/${data.id}.양호-${num}.png`
                        )
                      }
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
      {fullscreenImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] bg-black flex items-center justify-center"
            onClick={() => {
              setFullscreenImage(null);
              setZoomState({ scale: 1, x: 0, y: 0 });
            }}
          >
            <button
              onClick={() => {
                setFullscreenImage(null);
                setZoomState({ scale: 1, x: 0, y: 0 });
              }}
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
            <img
              src={fullscreenImage}
              alt="전체 화면"
              className="max-w-full max-h-full object-contain p-4 cursor-zoom-in transition-transform duration-300"
              style={{
                transform: `scale(${zoomState.scale}) translate(${zoomState.x}px, ${zoomState.y}px)`,
                transformOrigin: "center center",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (zoomState.scale === 1) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width - 0.5) * -100;
                  const y = ((e.clientY - rect.top) / rect.height - 0.5) * -100;
                  setZoomState({ scale: 1.5, x, y });
                } else {
                  setZoomState({ scale: 1, x: 0, y: 0 });
                }
              }}
            />
          </div>,
          document.body
        )}
    </article>
  );
};

export default function GuideDetail() {
  const { service, id } = useParams<{ service: string; id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
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
        console.log("URL id param:", id);

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
        console.log(
          "Article IDs:",
          mapped.map((a: any) => a.id)
        );
        setArticles(mapped);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [service, id]);

  const categories = Array.from(new Set(articles.map((a) => a.category)));
  const filteredArticles = id
    ? articles.filter((a) => String(a.id) === String(id))
    : selectedCategory
    ? articles.filter((a) => a.category === selectedCategory)
    : articles;

  console.log("Filter - id param:", id);
  console.log("Filter - all articles:", articles.length);
  console.log("Filter - filtered articles:", filteredArticles.length);
  console.log(
    "Filter - filtered IDs:",
    filteredArticles.map((a) => a.id)
  );

  const scrollToArticle = (index: number, articleId: string) => {
    window.location.hash = articleId;
    setTimeout(() => {
      const element = document.getElementById(`article-${index}`);
      if (element) {
        const yOffset = -100;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 flex items-center justify-center">
        <div className="text-white text-xl space-y-4">
          <div>해당 서비스의 가이드라인이 준비 중입니다.</div>
          <div className="text-sm bg-red-900/50 p-4 rounded">
            <div>DEBUG INFO:</div>
            <div>Service: {service}</div>
            <div>ID param: {id || "none"}</div>
            <div>Total articles: {articles.length}</div>
            <div>Article IDs: {articles.map((a) => a.id).join(", ")}</div>
            <div>Looking for ID: {id}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto p-8">
        <button
          onClick={() => navigate("/guide")}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          가이드라인 목록
        </button>
      </div>
      <div className="flex gap-8 max-w-7xl mx-auto px-8">
        {!id && (
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">📑 목차</h3>
              <nav className="space-y-2">
                {filteredArticles.map((article, index) => (
                  <button
                    key={article.id}
                    onClick={() => scrollToArticle(index, article.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors text-sm text-slate-300 hover:text-cyan-400 font-medium"
                  >
                    {index + 1}. {article.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* 오른쪽 아티클 영역 */}
        <div className="flex-1 space-y-12">
          {!id && categories.length > 1 && (
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
