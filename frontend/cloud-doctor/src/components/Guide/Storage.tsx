import GuidelineDisplay from '../GuidelineDisplay';

export default function Storage() {
  return (
    <div className="p-6">
      <GuidelineDisplay />
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">스토리지 및 디스크 보안</h1>
        <div className="prose max-w-none">
          <h2>개요</h2>
          <p>스토리지 보안은 데이터 저장 및 관리의 핵심입니다.</p>
          
          <h2>주요 보안 원칙</h2>
          <ul>
            <li>데이터 암호화</li>
            <li>접근 제어 및 권한 관리</li>
            <li>정기적인 백업</li>
            <li>데이터 유출 방지</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
