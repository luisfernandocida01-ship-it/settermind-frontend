// frontend/src/components/useAuth.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Al cargar, intentamos leer el token del localStorage.
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const logout = () => {
    // Borramos el token y redirigimos al login.
    localStorage.removeItem('jwt_token');
    setToken(null);
    router.push('/login');
  };

  return { token, logout };
}