'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/api';
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
// En login/page.tsx

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  try {
    const data = await loginUser({ email, password });
    localStorage.setItem('jwt_token', data.token);
    alert('¡Inicio de sesión exitoso!');
    router.push('/');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-4">Bienvenido de Vuelta</h1>
        <p className="text-gray-400 text-center mb-8">Inicia sesión en SetterMind AI.</p>
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
          {error && <div className="bg-red-500 text-white p-3 rounded-md mb-6 text-center">{error}</div>}
          <div className="mb-4">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
          </div>
          <div className="mb-6">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg">
            {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-8">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">Regístrate aquí</Link>
        </p>
      </div>
    </main>
  );
}