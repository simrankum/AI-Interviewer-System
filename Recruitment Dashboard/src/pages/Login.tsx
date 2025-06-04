import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [values, setValues] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  function handleChange(e:any) {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }));
  }
  
  function handleSubmit(e:any) {
    e.preventDefault();
    navigate('/dashboard');
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-2 bg-gradient-to-br from-slate-50 via-slate-100 to-orange-50 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: `linear-gradient(to right, #475569 1px, transparent 1px), 
                             linear-gradient(to bottom, #475569 1px, transparent 1px)`, 
          backgroundSize: '80px 80px'
        }}></div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-orange-500 rounded-full filter blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-600 rounded-full filter blur-[150px] opacity-10 translate-y-1/4 -translate-x-1/4"></div>
        
        {/* Dynamic elements: curved lines suggestive of growth and talent progression */}
        <svg className="absolute w-full h-full opacity-[0.08]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,30 50,50 T100,50" stroke="#334155" fill="none" strokeWidth="0.5" />
          <path d="M0,70 Q25,50 50,70 T100,70" stroke="#334155" fill="none" strokeWidth="0.5" />
          <path d="M0,30 Q25,10 50,30 T100,30" stroke="#334155" fill="none" strokeWidth="0.5" />
        </svg>
      </div>
      
      {/* Login card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10 border border-slate-200 relative z-10">
        <div className="flex flex-col items-center">
          <div className="mb-2 w-40 h-auto">
            <img 
              src="https://itkonekt.com/media/2022/09/Grid_Dynamics_transparent.png" 
              alt="Grid Dynamics Logo" 
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-sm text-gray-500">Login to the Talent Acquisition Dashboard</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <Input type="email" name="email" autoComplete="username" value={values.email} required onChange={handleChange} placeholder="Enter your email" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <Input type="password" name="password" autoComplete="current-password" value={values.password} required onChange={handleChange} placeholder="••••••••"/>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-2 rounded-md shadow-md transition-all duration-200">Login</Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:text-indigo-700 font-semibold hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}