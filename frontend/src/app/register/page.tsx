'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
// En register/page.tsx

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  try {
    await registerUser({ username, email, password });
    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
    router.push('/login');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-4">Crea tu Cuenta</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
          {error && <div className="bg-red-500 text-white p-3 rounded-md mb-6 text-center">{error}</div>}
          <div className="mb-4"><label htmlFor="username">Nombre de Usuario</label><input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" /></div>
          <div className="mb-4"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" /></div>
          <div className="mb-6"><label htmlFor="password">Contraseña</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" /></div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg">{isLoading ? 'Registrando...' : 'Crear Cuenta'}</button>
        </form>
      </div>
    </main>
  );
}