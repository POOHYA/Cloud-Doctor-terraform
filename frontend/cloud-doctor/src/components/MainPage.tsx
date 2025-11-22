import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    id: "home",
    title: "CloudDoctor",
    subtitle: "안전한 클라우드 환경을 위한 효용성있는 보안 가이드라인",
    description: "스크롤하여 다음 섹션으로 이동하세요.",
    bgColor: "bg-primary",
  },
  {
    id: "guide",
    title: "보안 가이드라인",
    subtitle: "실제 사례 기반의 AWS 보안 가이드라인",
    description: "체계적인 보안 가이드라인을 확인하세요.",
    bgColor: "bg-primary-dark",
    route: "/guide",
  },
  // {
  //   id: "prowler",
  //   title: "Prowler 스캔",
  //   subtitle: "자동화된 보안 검사",
  //   description: "클라우드 인프라의 보안 상태를 점검하세요.",
  //   bgColor: "bg-accent",
  //   route: "/prowler",
  // },
  {
    id: "checklist",
    title: "체크리스트",
    subtitle: "보안 점검 목록",
    description: "보안 가이드라인 기반의 필수 보안 항목들을 체크하세요.",
    bgColor: "bg-surface",
    route: "/checklist",
  },
  {
    id: "auditcheck",
    title: "보안 점검",
    subtitle: "클라우드 환경 보안 점검",
    description: "AWS 보안 항목들을 자동으로 점검하세요.",
    bgColor: "bg-accent",
    route: "/auditcheck",
  },
];

export default function MainPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [cloudsAnimated, setCloudsAnimated] = useState(false);
  const navigate = useNavigate();
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let isScrolling = false;
    let scrollAccumulator = 0;
    // 스크롤 민감도 조절
    const scrollThreshold = 200;

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling) return;

      scrollAccumulator += Math.abs(e.deltaY);

      if (scrollAccumulator >= scrollThreshold) {
        scrollAccumulator = 0;

        if (e.deltaY > 0 && currentSection < sections.length - 1) {
          isScrolling = true;
          setCurrentSection((prev) => prev + 1);
          // 스크롤 잠금 해제 시간 조절
          setTimeout(() => {
            isScrolling = false;
          }, 800);
        } else if (e.deltaY < 0 && currentSection > 0) {
          isScrolling = true;
          setCurrentSection((prev) => prev - 1);
          // 스크롤 잠금 해제 시간 조절
          setTimeout(() => {
            isScrolling = false;
          }, 800);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && currentSection < sections.length - 1) {
        setCurrentSection((prev) => prev + 1);
      } else if (e.key === "ArrowUp" && currentSection > 0) {
        setCurrentSection((prev) => prev - 1);
      } else if (e.key === "Enter") {
        if (currentSection === 0) {
          navigate("/about");
        } else if (sections[currentSection].route) {
          // 보안 점검 서비스는 로그인 확인
          if (sections[currentSection].id === "auditcheck") {
            const isLoggedIn = !!sessionStorage.getItem("username");
            if (!isLoggedIn) {
              alert("로그인이 필요한 서비스입니다.");
              navigate("/login");
              return;
            }
          }
          navigate(sections[currentSection].route!);
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSection < sections.length - 1) {
          isScrolling = true;
          setCurrentSection((prev) => prev + 1);
          // 자동 스크롤 잠금 해제 시간 조절 1000ms
          setTimeout(() => {
            isScrolling = false;
          }, 1000);
        } else if (diff < 0 && currentSection > 0) {
          isScrolling = true;
          setCurrentSection((prev) => prev - 1);
          // 자동 스크롤 잠금 해제 시간 조절 1000ms
          setTimeout(() => {
            isScrolling = false;
          }, 1000);
        }
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentSection, navigate]);

  // GSAP 스타일 구름 분산 애니메이션
  useEffect(() => {
    const cloudTimer = setTimeout(() => {
      setCloudsAnimated(true);
    }, 500);

    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);

    return () => {
      clearTimeout(cloudTimer);
      clearTimeout(introTimer);
    };
  }, []);

  useEffect(() => {
    if (showIntro) return;

    const interval = setInterval(() => {
      setCurrentSection((prev) => {
        if (prev < sections.length - 1) {
          return prev + 1;
        } else {
          return 0;
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [showIntro]);

  const handleSectionClick = () => {
    if (currentSection === 0) {
      navigate("/about");
    } else if (sections[currentSection].route) {
      // 보안 점검 서비스는 로그인 확인
      if (sections[currentSection].id === "auditcheck") {
        const isLoggedIn = !!sessionStorage.getItem("username");
        if (!isLoggedIn) {
          alert("로그인이 필요한 서비스입니다.");
          navigate("/login");
          return;
        }
      }
      navigate(sections[currentSection].route!);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* GSAP 스타일 구름 분산 인트로 애니메이션 */}
      {showIntro && (
        <div className="absolute inset-0 z-50 overflow-hidden">
          {/* 배경 그라데이션 */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, #344E68 0%, #52739A 50%, #F5EFEB 100%)",
            }}
          ></div>

          {/* 구름들 - 6개로 축소, 사이즈 확대 */}
          <div className="absolute inset-0">
            {/* 구름 1 - 상단 좌측 (대형) */}
            <div
              className="absolute transition-all duration-[14s] ease-out"
              style={{
                top: "5%",
                left: "8%",
                width: "320px",
                height: "220px",
                transform: cloudsAnimated
                  ? "translate(-250%, -200%) scale(5)"
                  : "translate(0%, 0%) scale(1)",
                opacity: cloudsAnimated ? 0 : 1,
              }}
            >
              <div className="relative w-full h-full">
                <div className="absolute bg-white rounded-full w-24 h-24 top-6 left-12 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-28 h-28 top-4 left-24 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-32 h-32 top-8 left-36 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-36 h-36 top-12 left-8 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-20 h-20 top-2 left-48 blur-sm"></div>
              </div>
            </div>

            {/* 구름 2 - 상단 우측 (중형) */}
            <div
              className="absolute transition-all duration-[16s] ease-out"
              style={{
                top: "8%",
                right: "12%",
                width: "280px",
                height: "180px",
                transform: cloudsAnimated
                  ? "translate(220%, -180%) scale(4.2)"
                  : "translate(0%, 0%) scale(1)",
                opacity: cloudsAnimated ? 0 : 1,
              }}
            >
              <div className="relative w-full h-full">
                <div className="absolute bg-white rounded-full w-22 h-22 top-4 left-10 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-26 h-26 top-6 left-20 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-30 h-30 top-8 left-32 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-28 h-28 top-2 left-28 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-36 h-36 top-12 left-8 blur-sm"></div>
              </div>
            </div>

            {/* 구름 3 - 중앙 좌측 (대형) */}
            <div
              className="absolute transition-all duration-[13s] ease-out"
              style={{
                top: "42%",
                left: "5%",
                width: "300px",
                height: "200px",
                transform: cloudsAnimated
                  ? "translate(-280%, -30%) scale(4.8)"
                  : "translate(0%, 0%) scale(1)",
                opacity: cloudsAnimated ? 0 : 1,
              }}
            >
              <div className="relative w-full h-full">
                <div className="absolute bg-white rounded-full w-26 h-26 top-5 left-8 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-30 h-30 top-7 left-20 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-24 h-24 top-3 left-32 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-34 h-34 top-9 left-6 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-28 h-28 top-1 left-24 blur-sm"></div>
              </div>
            </div>

            {/* 구름 4 - 중앙 우측 (중형) */}
            <div
              className="absolute transition-all duration-[17s] ease-out"
              style={{
                top: "35%",
                right: "8%",
                width: "260px",
                height: "170px",
                transform: cloudsAnimated
                  ? "translate(260%, 40%) scale(4.5)"
                  : "translate(0%, 0%) scale(1)",
                opacity: cloudsAnimated ? 0 : 1,
              }}
            >
              <div className="relative w-full h-full">
                <div className="absolute bg-white rounded-full w-20 h-20 top-6 left-10 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-24 h-24 top-4 left-20 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-28 h-28 top-8 left-30 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-32 h-32 top-10 left-8 blur-sm"></div>
              </div>
            </div>

            {/* 구름 5 - 하단 좌측 (대형) */}
            <div
              className="absolute transition-all duration-[15s] ease-out"
              style={{
                bottom: "15%",
                left: "15%",
                width: "340px",
                height: "240px",
                transform: cloudsAnimated
                  ? "translate(-200%, 220%) scale(5.2)"
                  : "translate(0%, 0%) scale(1)",
                opacity: cloudsAnimated ? 0 : 1,
              }}
            >
              <div className="relative w-full h-full">
                <div className="absolute bg-white rounded-full w-28 h-28 top-4 left-14 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-32 h-32 top-6 left-26 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-24 h-24 top-8 left-40 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-38 h-38 top-6 left-4 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-32 h-26 top-10 left-32 blur-sm"></div>
              </div>
            </div>

            {/* 구름 6 - 하단 우측 (중형) */}
            <div
              className="absolute transition-all duration-[18s] ease-out"
              style={{
                bottom: "12%",
                right: "18%",
                width: "240px",
                height: "160px",
                transform: cloudsAnimated
                  ? "translate(240%, 200%) scale(4.3)"
                  : "translate(0%, 0%) scale(1)",
                opacity: cloudsAnimated ? 0 : 1,
              }}
            >
              <div className="relative w-full h-full">
                <div className="absolute bg-white rounded-full w-22 h-22 top-5 left-12 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-26 h-26 top-7 left-22 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-20 h-20 top-3 left-32 blur-sm"></div>
                <div className="absolute bg-white rounded-full w-30 h-30 top-9 left-6 blur-sm"></div>
              </div>
            </div>
          </div>

          {/* CloudDoctor 로고 */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              className="text-center transform transition-all duration-1000"
              style={{
                opacity: cloudsAnimated ? 1 : 0,
                transform: cloudsAnimated ? "scale(1)" : "scale(0.3)",
              }}
            >
              <div className="text-6xl font-bold tracking-wider text-white drop-shadow-2xl">
                CloudDoctor
              </div>
              <div className="text-xl text-white/80 mt-4">
                클라우드 보안을 위한 완벽한 솔루션
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div
        className={`transition-opacity duration-1000 ${
          showIntro ? "opacity-0" : "opacity-100"
        }`}
      >
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`absolute inset-0 flex items-center justify-center text-white transition-all duration-1000 ease-in-out ${
              section.bgColor
            } ${
              index === currentSection
                ? "translate-y-0 scale-100 opacity-100"
                : index < currentSection
                ? "-translate-y-full scale-90 opacity-0"
                : "translate-y-full scale-90 opacity-0"
            }`}
            style={{
              zIndex: sections.length - Math.abs(index - currentSection),
            }}
          >
            <div
              className="text-center cursor-pointer transform transition-transform hover:scale-105"
              onClick={handleSectionClick}
            >
              <h1 className="text-6xl font-bold mb-4">{section.title}</h1>
              <h2 className="text-2xl mb-6 opacity-90">{section.subtitle}</h2>
              <p className="text-lg opacity-75 mb-8">{section.description}</p>

              {section.route && (
                <button className="px-8 py-3 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  시작하기
                </button>
              )}

              {index === 0 && (
                <div className="mt-12 animate-bounce">
                  <svg
                    className="w-8 h-8 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 섹션 인디케이터 */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50">
          {sections.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full mb-4 cursor-pointer transition-all ${
                index === currentSection ? "bg-white" : "bg-white/30"
              }`}
              onClick={() => setCurrentSection(index)}
            />
          ))}
        </div>

        {/* 하단 힌트 */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 text-sm z-50 text-center">
          스크롤/스와이프로 이동
          <br />
          Enter로 페이지 진입
        </div>
      </div>
    </div>
  );
}
