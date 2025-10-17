import { useState } from "react";
import ContactModal from "./ContactModal";

interface Props {
  onDemoClick: () => void;
}

const Footer: React.FC<Props> = ({ onDemoClick }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  return (
    <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* 로고 & 설명 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-white font-bold text-xl">☁️</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CloudDoctor
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              AWS 클라우드 보안 관리의 새로운 기준
              <br />
              스마트한 CaC 솔루션으로 시작하세요
            </p>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
              <span className="text-cyan-400">■</span> 서비스
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/guide"
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-sm flex items-center gap-2"
                >
                  <span>→</span> 가이드
                </a>
              </li>
              <li>
                <a
                  href="/prowler"
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-sm flex items-center gap-2"
                >
                  <span>→</span> prowler
                </a>
              </li>
              <li>
                <a
                  href="/checklist"
                  className="text-slate-400 hover:text-cyan-400 transition-colors text-sm flex items-center gap-2"
                >
                  <span>→</span> 체크리스트
                </a>
              </li>
            </ul>
          </div>

          {/* 문의 */}
          <div>
            <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
              <span className="text-violet-400">■</span> 문의하기
            </h4>
            <ul className="space-y-2"></ul>
          </div>
        </div>

        {/* 하단 */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2025 CloudDoctor. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* GitHub 링크 - 나중에 주소 추가 */}
            <a
              href="https://github.com/"
              className="text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;
