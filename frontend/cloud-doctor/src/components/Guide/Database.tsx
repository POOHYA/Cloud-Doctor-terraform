import GuidelineDisplay from '../GuidelineDisplay';

export default function Database() {
  return (
      <section id="Guide">
        <div className="p-6">
          <GuidelineDisplay />
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-6">데이터베이스 보안</h1>
            <div className="prose max-w-none">
              <h2>개요</h2>
              <p>데이터베이스 보안은 데이터 보호의 핵심입니다.</p>
              
              <h2>주요 보안 원칙</h2>
              <ul>
                <li>데이터 암호화 (저장 시 및 전송 시)</li>
                <li>데이터베이스 접근 제어</li>
                <li>정기적인 백업 및 복구 테스트</li>
                <li>감사 로그 활성화</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
  );
}