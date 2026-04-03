import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser, setCurrentUser, initializeData } from '../utils/localStorage';
import { SignIn, Barcode, Warning } from 'phosphor-react';
import { useEffect } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    initializeData();
  }, []); // initializeData is from localStorage utility, safe to omit

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const user = authenticateUser(username, password);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'WORKER') {
        navigate('/sell');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex">
      {/* Left Panel - Image */}
      <div 
        className="hidden lg:block lg:w-1/2 relative bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1736773999645-2d85a5e8562a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZGFyayUyMHNsYXRlJTIwZ2VvbWV0cmljJTIwcGF0dGVybnxlbnwwfHx8fDE3NzUwNzYyMDF8MA&ixlib=rb-4.1.0&q=85)' 
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Barcode size={80} weight="duotone" className="text-[#B4846C] mx-auto mb-4" />
            <h1 className="font-['Clash_Display'] text-5xl text-white tracking-tight mb-2">WholeSale</h1>
            <p className="font-['Manrope'] text-[#9CA3AF] text-lg">Management System</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <Barcode size={40} weight="duotone" className="text-[#B4846C]" />
              <h1 className="font-['Clash_Display'] text-3xl text-white tracking-tight">WholeSale</h1>
            </div>
            <h2 className="font-['Clash_Display'] text-3xl text-white tracking-tight mb-2">Welcome Back</h2>
            <p className="font-['Manrope'] text-[#9CA3AF]">Sign in to manage your wholesale business</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[rgba(225,29,72,0.1)] border border-[#E11D48]/30 rounded-md flex items-center gap-3" data-testid="login-error">
              <Warning size={20} className="text-[#E11D48]" weight="fill" />
              <p className="text-[#E11D48] font-['Manrope'] text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="username-input"
                className="w-full bg-[#151A22] border border-[#262B35] text-white px-4 py-3 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
                className="w-full bg-[#151A22] border border-[#262B35] text-white px-4 py-3 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              data-testid="login-button"
              className="w-full bg-[#B4846C] text-[#0B0E14] font-semibold px-6 py-3 rounded-md hover:bg-[#C8957A] transition-colors flex items-center justify-center gap-2 font-['Manrope'] mt-6"
            >
              <SignIn size={20} weight="bold" />
              Sign In
            </button>
          </form>

          <div className="mt-8 p-4 bg-[#151A22] border border-[#262B35] rounded-md">
            <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-3">Demo Credentials</p>
            <div className="space-y-2 font-['JetBrains_Mono'] text-xs text-[#9CA3AF]">
              <div className="flex justify-between">
                <span>Owner:</span>
                <span className="text-white">owner / 1234</span>
              </div>
              <div className="flex justify-between">
                <span>Manager:</span>
                <span className="text-white">manager / 1234</span>
              </div>
              <div className="flex justify-between">
                <span>Worker:</span>
                <span className="text-white">worker / 1234</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
