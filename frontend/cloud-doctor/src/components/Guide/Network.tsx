import GuidelineDisplay from '../GuidelineDisplay';

export default function Network() {
  return (
    <div className="p-6">
      <GuidelineDisplay />
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">네트워크 및 보안</h1>
        <div className="prose max-w-none">
          <h2>개요</h2>
          <p>네트워크 보안은 클라우드 인프라 보호의 기초입니다.</p>
          
          <h2>주요 보안 원칙</h2>
          <ul>
            <li>방화벽 및 보안 그룹 설정</li>
            <li>VPN 및 암호화된 통신</li>
            <li>네트워크 모니터링</li>
            <li>침입 탐지 시스템</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
