import GuideLayout from '../GuideLayout';

export default function Account() {
  return (
    <GuideLayout title="계정 및 접근 제어">
      <div className="prose max-w-none">
        <h2>개요</h2>
        <p>클라우드 환경에서 계정 및 접근 제어는 보안의 핵심 요소입니다.</p>
        
        <h2>주요 보안 원칙</h2>
        <ul>
          <li>최소 권한 원칙 적용</li>
          <li>다단계 인증(MFA) 활성화</li>
          <li>정기적인 접근 권한 검토</li>
          <li>강력한 비밀번호 정책 적용</li>
        </ul>
      </div>
    </GuideLayout>
  );
}
