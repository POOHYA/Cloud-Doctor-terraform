interface Props {
  onDemoClick: () => void;
}

const Footer: React.FC<Props> = ({ onDemoClick }) => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          {/* 로고 & 설명 */}
          <div className="mb-8 md:mb-0 md:w-1/3">
            <span className="text-2xl font-bold text-white">CloudDoctor</span>
            <p className="mt-2 text-gray-400 leading-relaxed">
              AWS 클라우드 인프라, 보안 관리의 새로운 기준,
              <br />
              CloudDoctor로 시작하는 스마트 CaC
            </p>
          </div>

          {/* 링크 */}
          <div className="flex flex-col sm:flex-row gap-8 md:w-2/3">
            <div>
              <h4 className="font-semibold mb-2 text-white">서비스</h4>
              <ul className="space-y-1">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    주요 기능
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    이용 방법
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-white">CloudDoctor</h4>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={onDemoClick}
                    className="text-left hover:text-white transition-colors"
                  >
                    CloudDoctor 데모 신청
                  </button>
                </li>
                <li>
                  <button className="text-left hover:text-white transition-colors">
                    문의하기
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className="border-t border-gray-700 pt-4 text-center text-gray-500 text-sm">
          © 2025 CloudDoctor. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;