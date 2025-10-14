import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  loading: boolean;
}

export default function AdminLogin({ onLogin, loading }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('사용자명을 입력해주세요.');
      return;
    }
    
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    const success = await onLogin(username, password);
    if (success) {
      navigate('/admin', { replace: true });
    } else {
      setError('잘못된 관리자 정보입니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">관리자 로그인</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="사용자명"
            className="w-full p-3 border rounded-md placeholder-gray-400"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full p-3 border rounded-md placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

    </div>
  );
}