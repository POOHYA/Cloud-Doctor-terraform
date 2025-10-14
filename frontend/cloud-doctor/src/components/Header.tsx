import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ContactModal from './ContactModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const location = useLocation();
  return (
    <header className="fixed w-full top-0 left-0 z-50 bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* 로고 */}
        <Link to="/" className="text-2xl font-bold text-gray-800">
          CloudDoctor
        </Link>

        {/* 내비게이션 */}
        <nav className="hidden md:block">
          <ul className="flex gap-6">
            <li>
              <Link 
                to="/guide" 
                className={`relative py-2 px-1 transition-all duration-300 group ${
                  location.pathname === '/guide' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                가이드
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform transition-transform duration-300 ${
                  location.pathname === '/guide' 
                    ? 'scale-x-100' 
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </Link>
            </li>
            <li>
              <Link 
                to="/prowler" 
                className={`relative py-2 px-1 transition-all duration-300 group ${
                  location.pathname === '/prowler' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Prowler
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 to-blue-600 transform transition-transform duration-300 ${
                  location.pathname === '/prowler' 
                    ? 'scale-x-100' 
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </Link>
            </li>
            <li>
              <Link 
                to="/checklist" 
                className={`relative py-2 px-1 transition-all duration-300 group ${
                  location.pathname === '/checklist' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                체크리스트
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-red-600 transform transition-transform duration-300 ${
                  location.pathname === '/checklist' 
                    ? 'scale-x-100' 
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* 버튼 */}
        <div className="hidden md:block">
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            데모 신청
          </button>
        </div>

        {/* 모바일 햄버거 메뉴 */}
        <div className="block md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="px-6 py-4">
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/guide" 
                  className="block text-blue-600 underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  가이드
                </Link>
              </li>
              <li>
                <Link 
                  to="/prowler" 
                  className="block text-blue-600 underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prowler
                </Link>
              </li>
              <li>
                <Link 
                  to="/checklist" 
                  className="block text-blue-600 underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  체크리스트
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsContactModalOpen(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-center"
                >
                  데모 신청
                </button>
              </li>
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
