import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminApi } from '../api/admin';

interface LoginProps {
  showRegister?: boolean;
}

export default function Login({ showRegister = true }: LoginProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLoginMode) {
        const success = await login(username, password);
        if (success) {
          const role = sessionStorage.getItem('role');
          
          if (role === 'ADMIN' && showRegister) {
            setError('관리자는 관리자 페이지에서 로그인해주세요.');
            await adminApi.logout();
            window.dispatchEvent(new Event('auth-change'));
            setLoading(false);
            return;
          }
          
          if (role === 'ADMIN') {
            navigate('/admin', { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        } else {
          setError('로그인에 실패했습니다.');
        }
      } else {
        if (!usernameChecked || !usernameAvailable) {
          setError('아이디 중복확인을 해주세요.');
          setLoading(false);
          return;
        }
        
        if (!emailChecked || !emailAvailable) {
          setError('이메일 중복확인을 해주세요.');
          setLoading(false);
          return;
        }
        
        if (password !== passwordConfirm) {
          setError('비밀번호가 일치하지 않습니다.');
          setLoading(false);
          return;
        }
        
        const success = await adminApi.register(username, email, password, fullName, company);
        if (success) {
          setIsLoginMode(true);
          // 회원가입 성공 후 폼 초기화
          setUsername('');
          setEmail('');
          setPassword('');
          setPasswordConfirm('');
          setFullName('');
          setCompany('');
          setError('');
          setSuccess('');
          setUsernameChecked(false);
          setUsernameAvailable(false);
          setEmailChecked(false);
          setEmailAvailable(false);
          alert('회원가입이 완료되었습니다. 로그인해주세요.');
        } else {
          setError('회원가입에 실패했습니다.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-8 bg-primary-dark/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-r from-primary to-accent rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isLoginMode ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            )}
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-beige">
          {isLoginMode ? '로그인' : '회원가입'}
        </h2>
        <p className="text-primary-light mt-2">
          {isLoginMode ? 'CloudDoctor에 오신 것을 환영합니다' : '새로운 계정을 만들어보세요'}
        </p>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border-l-4 border-red-500 rounded-r-lg text-red-400 text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-900/20 border-l-4 border-green-500 rounded-r-lg text-green-400 text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          {!isLoginMode ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameChecked(false);
                  setUsernameAvailable(false);
                }}
                placeholder="사용자명"
                className="flex-1 p-3 bg-primary-dark/50 border-2 border-primary text-beige rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-primary-light"
                required
              />
              <button
                type="button"
                onClick={async () => {
                  if (!username.trim()) {
                    setError('사용자명을 입력해주세요.');
                    return;
                  }
                  const exists = await adminApi.checkUsername(username);
                  setUsernameChecked(true);
                  if (exists) {
                    setUsernameAvailable(false);
                    setSuccess('');
                    setError('이미 사용 중인 아이디입니다.');
                  } else {
                    setUsernameAvailable(true);
                    setError('');
                    setSuccess('사용 가능한 아이디입니다.');
                  }
                }}
                className="px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary-light hover:to-accent transition-all shadow-md hover:shadow-lg whitespace-nowrap font-medium"
              >
                중복확인
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용자명"
              className="w-full p-3 bg-primary-dark/50 border-2 border-primary text-beige rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-primary-light"
              required
            />
          )}
        </div>
        {!isLoginMode && (
          <>
            <div className="mb-4">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="이름"
                className="w-full p-3 bg-primary-dark/50 border-2 border-primary text-beige rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-primary-light"
                required
              />
            </div>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailChecked(false);
                    setEmailAvailable(false);
                  }}
                  placeholder="이메일"
                  className="flex-1 p-3 bg-primary-dark/50 border-2 border-primary text-beige rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-primary-light"
                  required
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!email.trim() || !email.includes('@')) {
                      setError('올바른 이메일을 입력해주세요.');
                      return;
                    }
                    const exists = await adminApi.checkEmail(email);
                    setEmailChecked(true);
                    if (exists) {
                      setEmailAvailable(false);
                      setSuccess('');
                      setError('이미 사용 중인 이메일입니다.');
                    } else {
                      setEmailAvailable(true);
                      setError('');
                      setSuccess('사용 가능한 이메일입니다.');
                    }
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-primary-light hover:to-accent transition-all shadow-md hover:shadow-lg whitespace-nowrap font-medium"
                >
                  중복확인
                </button>
              </div>
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="회사명 (선택)"
                className="w-full p-3 bg-primary-dark/50 border-2 border-primary text-beige rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-primary-light"
              />
            </div>
          </>
        )}
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full p-3 bg-primary-dark/50 border-2 border-primary text-beige rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-primary-light"
            required
          />
        </div>
        {!isLoginMode && (
          <div className="mb-6">
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 확인"
              className="w-full p-3 bg-primary-dark/50 border-2 border-primary text-beige rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-primary-light"
              required
            />
          </div>
        )}
        {isLoginMode && <div className="mb-6"></div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-accent text-white p-4 rounded-lg hover:from-primary-light hover:to-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              처리 중...
            </span>
          ) : isLoginMode ? '로그인' : '회원가입'}
        </button>
      </form>

      {showRegister && (
        <div className="mt-6 text-center">
          <p className="text-primary-light mb-2">
            {isLoginMode ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
          </p>
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              // 모든 폼 필드 초기화
              setUsername('');
              setEmail('');
              setPassword('');
              setPasswordConfirm('');
              setFullName('');
              setCompany('');
              setError('');
              setSuccess('');
              setUsernameChecked(false);
              setUsernameAvailable(false);
              setEmailChecked(false);
              setEmailAvailable(false);
            }}
            className="text-accent hover:text-primary-light font-semibold hover:underline transition-colors"
          >
            {isLoginMode ? '회원가입하기' : '로그인하기'}
          </button>
        </div>
      )}
    </div>
  );
}
