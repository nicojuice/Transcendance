import './i18n';

const handleGoogleLogin = () => {
  
  localStorage.setItem("authMethod", "google"); 
  window.location.href = 'http://localhost:8095/api/auth/google';
};

(window as any).handleGoogleLogin = handleGoogleLogin;