"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

function AuthModal({
  isOpen,
  onClose,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, register } = useAuth();

  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setNom("");
      setPrenom("");
      setTelephone("");
      setError("");
      setLoading(false);
      setShowPassword(false);
      setRememberMe(false);
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) setError(result.message || "حدث خطأ");
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }
    setLoading(true);
    const result = await register({
      email, password, nom, prenom,
      telephone: telephone || undefined,
    });
    if (!result.success) setError(result.message || "حدث خطأ");
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Overlay flou (aucun voile) */}
      <div className="absolute inset-0 backdrop-blur-[3px]" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[450px] overflow-hidden animate-modal-in border-t-4 border-[#D4AF37]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100">
          <h2 className="text-xl font-bold text-primary-500">
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary-100 rounded-xl transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">

            {/* Register fields */}
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-secondary-700 mb-1">الاسم الشخصي</label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                      placeholder="أحمد"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-secondary-700 mb-1">اسم العائلة</label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                      placeholder="العلوي"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary-700 mb-1">الهاتف</label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    placeholder="0612345678"
                  />
                </div>
              </>
            )}

            {/* Email (login & register) */}
            {mode === "login" && (
              <div>
                <label className="block text-xs font-medium text-secondary-700 mb-1">البريد الإلكتروني</label>
                <input
                  ref={firstInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  placeholder="email@exemple.com"
                />
              </div>
            )}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-secondary-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  placeholder="email@exemple.com"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-secondary-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow pl-12"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-secondary-700 mb-1">تأكيد كلمة المرور</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  placeholder="********"
                />
              </div>
            )}

            {/* Remember me (login only) */}
            {mode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="text-xs text-secondary-500">تذكرني</span>
                </label>
                <span className="text-xs text-secondary-300 cursor-default">نسيت كلمة المرور؟</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-medium 
                hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/25 
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                active:scale-[0.98] cursor-pointer text-base"
            >
              {loading ? "جاري المعالجة..." : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-5 text-center">
            <button
              onClick={() => onClose()}
              className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors cursor-pointer"
            >
              {mode === "login" ? "ليس لديك حساب؟ إنشاء حساب" : "لدي حساب — تسجيل الدخول"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Image de fond */}
      <img
        src="/images/background.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Contenu centré */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center gap-6 px-4 pt-[55vh]">
        {/* Logo */}
        

        {/* Grands boutons */}
        <button
          onClick={() => { setShowLogin(true); setShowRegister(false); }}
          className="w-72 py-4 bg-white/95 backdrop-blur text-primary-500 rounded-2xl shadow-xl 
            hover:shadow-2xl hover:scale-[1.03] hover:bg-white hover:border-[#D4AF37]/60
            transition-all duration-300 cursor-pointer border border-[#D4AF37]/20
            text-xl font-bold tracking-wide"
        >
          لدي حساب
          <span className="block text-xs font-normal text-secondary-400 mt-0.5">Connexion</span>
        </button>

        <button
          onClick={() => { setShowRegister(true); setShowLogin(false); }}
          className="w-72 py-4 bg-primary-500/95 backdrop-blur text-white rounded-2xl shadow-xl 
            hover:shadow-2xl hover:scale-[1.03] hover:bg-primary-600 hover:border-[#D4AF37]/80
            transition-all duration-300 cursor-pointer border border-[#D4AF37]/30
            text-xl font-bold tracking-wide"
        >
          إنشاء حساب
        </button>
      </div>

      {/* Modales */}
      <AuthModal
        isOpen={showLogin}
        onClose={() => { setShowLogin(false); setShowRegister(false); }}
        mode="login"
      />
      <AuthModal
        isOpen={showRegister}
        onClose={() => { setShowLogin(false); setShowRegister(false); }}
        mode="register"
      />
    </div>
  );
}
