import React, { useState } from 'react';
import { Layers, ArrowLeft, Mail, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';

enum AuthStep {
  LOGIN,
  FORGOT_PASSWORD,
  OTP
}

interface AuthPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export default function AuthPage({ onLoginSuccess, onBack }: AuthPageProps) {
  const [step, setStep] = useState<AuthStep>(AuthStep.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    login(email, password)
      .then(onLoginSuccess)
      .catch((err) => {
        setError(err?.message || 'Unable to sign in');
      })
      .finally(() => setIsLoading(false));
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(AuthStep.OTP);
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Background FX */}
       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
       <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

       <div className="w-full max-w-md relative z-10 animate-slide-up">
         {/* Logo */}
         <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 bg-primary rounded-xl rotate-3 flex items-center justify-center shadow-[0_0_20px_rgba(109,40,217,0.5)]">
                  <Layers className="text-white w-6 h-6 -rotate-3" />
               </div>
               <span className="text-2xl font-bold font-display tracking-tight text-white">StockMaster</span>
            </div>
         </div>

         <GlassCard className="p-8 md:p-10 backdrop-blur-2xl border-white/10">
            {step === AuthStep.LOGIN && (
              <form onSubmit={handleLoginSubmit}>
                 <div className="text-center mb-8">
                   <h2 className="text-2xl font-bold font-display mb-2 text-white">Welcome Back</h2>
                   <p className="text-gray-400 text-sm">Enter your credentials to access the ledger.</p>
                 </div>

                 <div className="space-y-4 mb-6">
                   <div>
                     <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                     <div className="relative">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                       <input 
                         type="email" 
                         className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-600"
                         placeholder="admin@stockmaster.com"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         required
                       />
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between mb-1.5">
                       <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                       <button type="button" onClick={() => setStep(AuthStep.FORGOT_PASSWORD)} className="text-xs text-primary hover:text-primaryLight transition-colors">Forgot Password?</button>
                     </div>
                     <div className="relative">
                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                       <input 
                         type="password" 
                         className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-600"
                         placeholder="••••••••"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                       />
                     </div>
                   </div>
                 </div>

                 {error && <p className="text-sm text-red-400 mb-3 text-center">{error}</p>}

                 <button 
                   disabled={isLoading}
                   className="w-full py-3 bg-primary hover:bg-primaryLight text-white rounded-lg font-medium transition-all shadow-[0_0_20px_-5px_rgba(109,40,217,0.5)] hover:shadow-[0_0_30px_-5px_rgba(109,40,217,0.7)] hover:-translate-y-0.5 flex justify-center items-center gap-2"
                 >
                   {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Sign In'}
                 </button>
                 
                 <div className="mt-6 text-center">
                   <p className="text-sm text-gray-500">Don't have an account? <button type="button" className="text-white hover:text-primary transition-colors font-medium">Contact Sales</button></p>
                 </div>
              </form>
            )}

            {step === AuthStep.FORGOT_PASSWORD && (
              <form onSubmit={handleForgotSubmit}>
                 <button type="button" onClick={() => setStep(AuthStep.LOGIN)} className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back to Login
                 </button>
                 <div className="mb-8">
                   <h2 className="text-2xl font-bold font-display mb-2 text-white">Reset Password</h2>
                   <p className="text-gray-400 text-sm">Enter your email and we'll send you a One-Time-Password (OTP) to reset your access.</p>
                 </div>

                 <div className="mb-6">
                   <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                     <input 
                       type="email" 
                       className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-600"
                       placeholder="admin@stockmaster.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                     />
                   </div>
                 </div>

                 <button 
                   disabled={isLoading}
                   className="w-full py-3 bg-primary hover:bg-primaryLight text-white rounded-lg font-medium transition-all shadow-[0_0_20px_-5px_rgba(109,40,217,0.5)] flex justify-center items-center"
                 >
                   {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Send Verification Code'}
                 </button>
              </form>
            )}

            {step === AuthStep.OTP && (
              <form onSubmit={handleOtpSubmit}>
                 <button type="button" onClick={() => setStep(AuthStep.FORGOT_PASSWORD)} className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back
                 </button>
                 <div className="mb-8 text-center">
                   <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                     <CheckCircle2 size={24} />
                   </div>
                   <h2 className="text-2xl font-bold font-display mb-2 text-white">Enter Code</h2>
                   <p className="text-gray-400 text-sm">We sent a 4-digit code to <span className="text-white">{email || 'your email'}</span>.</p>
                 </div>

                 <div className="flex justify-center gap-3 mb-8">
                    {[1, 2, 3, 4].map((_, i) => (
                      <input 
                        key={i}
                        type="text"
                        maxLength={1}
                        className="w-14 h-16 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white/10 outline-none transition-all"
                      />
                    ))}
                 </div>

                 <button 
                   disabled={isLoading}
                   className="w-full py-3 bg-primary hover:bg-primaryLight text-white rounded-lg font-medium transition-all shadow-[0_0_20px_-5px_rgba(109,40,217,0.5)] flex justify-center items-center gap-2"
                 >
                   {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <>Verify & Login <ChevronRight size={16} /></>}
                 </button>
                 
                 <div className="mt-4 text-center">
                   <button type="button" className="text-xs text-gray-500 hover:text-white transition-colors">Resend Code</button>
                 </div>
              </form>
            )}
         </GlassCard>

         <div className="text-center mt-8">
           <button onClick={onBack} className="text-sm text-gray-500 hover:text-white transition-colors">Back to Home</button>
         </div>
       </div>
    </div>
  );
}
