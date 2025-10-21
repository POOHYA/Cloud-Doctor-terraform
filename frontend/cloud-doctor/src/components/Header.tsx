import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ContactModal from "./ContactModal";
import { adminApi } from "../api/admin";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem('username');

  const handleLogout = async () => {
    await adminApi.logout();
    window.scrollTo(0, 0);
    window.location.reload();
  };
  return (
    <header className="fixed w-full top-0 left-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* 로고 */}
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-beige to-primary-light bg-clip-text text-transparent"
        >
          CloudDoctor
        </Link>

        {/* 내비게이션 */}
        <div className="hidden md:flex items-center gap-6">
          <nav>
            <ul className="flex gap-6">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className={`relative py-2 px-1 transition-all duration-300 group align-baseline inline-block ${
                    location.pathname === "/about"
                      ? "text-rose-400"
                      : "text-slate-300 hover:text-rose-400"
                  }`}
                >
                  개요
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-rose-500 to-pink-600 transform transition-transform duration-300 ${
                      location.pathname === "/about"
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/guide')}
                  className={`relative py-2 px-1 transition-all duration-300 group align-baseline inline-block ${
                    location.pathname === "/guide"
                      ? "text-cyan-400"
                      : "text-slate-300 hover:text-cyan-400"
                  }`}
                >
                  가이드
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 transform transition-transform duration-300 ${
                      location.pathname === "/guide"
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/prowler')}
                  className={`relative py-2 px-1 transition-all duration-300 group align-baseline inline-block ${
                    location.pathname === "/prowler"
                      ? "text-emerald-400"
                      : "text-slate-300 hover:text-emerald-400"
                  }`}
                >
                  Prowler
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 transform transition-transform duration-300 ${
                      location.pathname === "/prowler"
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/checklist')}
                  className={`relative py-2 px-1 transition-all duration-300 group align-baseline inline-block ${
                    location.pathname === "/checklist"
                      ? "text-violet-400"
                      : "text-slate-300 hover:text-violet-400"
                  }`}
                >
                  체크리스트
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-purple-600 transform transition-transform duration-300 ${
                      location.pathname === "/checklist"
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      navigate('/auditcheck');
                    } else {
                      alert('로그인이 필요한 서비스입니다.');
                      navigate('/login');
                    }
                  }}
                  className={`relative py-2 px-1 transition-all duration-300 group align-baseline inline-block ${
                    location.pathname === "/auditcheck"
                      ? "text-amber-400"
                      : "text-slate-300 hover:text-amber-400"
                  }`}
                >
                  보안 점검
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 transform transition-transform duration-300 ${
                      location.pathname === "/auditcheck"
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </button>
              </li>
            </ul>
          </nav>
          <div className="flex gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  to="/mypage"
                  onClick={() => window.scrollTo(0, 0)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:from-primary-light hover:to-accent shadow-md transition-all"
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => window.scrollTo(0, 0)}
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        {/* 모바일 햄버거 메뉴 */}
        <div className="block md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 border border-slate-600 rounded-md hover:bg-slate-700"
            aria-label="메뉴 열기"
          >
            <svg
              className="w-6 h-6 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 shadow-lg">
          <nav className="px-6 py-4">
            <ul className="space-y-4">
              <li>
                <Link
                  to="/about"
                  className="block text-rose-400 hover:text-rose-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  개요
                </Link>
              </li>
              <li>
                <Link
                  to="/guide"
                  className="block text-cyan-400 hover:text-cyan-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  가이드
                </Link>
              </li>
              <li>
                <Link
                  to="/prowler"
                  className="block text-emerald-400 hover:text-emerald-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prowler
                </Link>
              </li>
              <li>
                <Link
                  to="/checklist"
                  className="block text-violet-400 hover:text-violet-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  체크리스트
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      navigate('/auditcheck');
                    } else {
                      alert('로그인이 필요한 서비스입니다.');
                      navigate('/login');
                    }
                    setIsMenuOpen(false);
                  }}
                  className="block text-amber-400 hover:text-amber-300 transition-colors cursor-pointer w-full text-left"
                >
                  보안 점검
                </button>
              </li>
              {isLoggedIn ? (
                <>
                  <li>
                    <Link
                      to="/mypage"
                      className="block text-primary-light"
                      onClick={() => {
                        window.scrollTo(0, 0);
                        setIsMenuOpen(false);
                      }}
                    >
                      마이페이지
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block text-slate-300 w-full text-left"
                    >
                      로그아웃
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="block text-slate-300"
                    onClick={() => {
                      window.scrollTo(0, 0);
                      setIsMenuOpen(false);
                    }}
                  >
                    로그인
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </header>
  );
};

export default Header;
