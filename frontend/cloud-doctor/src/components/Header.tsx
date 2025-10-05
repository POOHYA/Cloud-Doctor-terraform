import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="fixed w-full top-0 left-0 z-50 bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* 로고 */}
        <a href="/" className="text-2xl font-bold text-gray-800">
          CloudDoctor
        </a>

        {/* 내비게이션 */}
        <nav className="hidden md:block">
          <ul className="flex gap-6">
            <li>
                <Link to="/guide" className="text-blue-600 underline">
                    가이드
                </Link>
            </li>
            <li>
                <Link to="/prowler" className="text-blue-600 underline">
                    Prowler
                </Link>
            </li>
            <li>
                <Link to="/checklist" className="text-blue-600 underline">
                체크리스트
                </Link>
            </li>
          </ul>
        </nav>

        {/* 버튼 */}
        <div className="hidden md:block">
          <a
            href="#solution"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            상담하기
          </a>
        </div>

        {/* 모바일 햄버거 메뉴 (필요 시) */}
        <div className="md:hidden">
          {/* 여기에 모바일 메뉴 버튼 넣을 수 있음 */}
        </div>
      </div>
    </header>
  );
};

export default Header;
