// frontend/src/app/conversations/page.tsx - VERSIÓN COMPLETA Y FUNCIONAL

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/useAuth';
// Importamos las nuevas funciones de nuestra API
import { getOutboxItems, markOutboxItemAsSent, getConversations, updateConversation, exportLead } from '@/lib/api';
// --- Tipos de Datos (para claridad con TypeScript) ---
interface OutboxItem {
  id: string;
  post_url: string;
  prospect_username: string;
  prospect_comment: string;
  selected_opener: string;
  score: string;
}

interface Conversation {
  id: string;
  lead_data: {
    username: string;
    comment: string;
    pain_point: string;
    score: string;
    opener: string;
    post_url: string;
  };
  status: string;
  notes: string;
}

// --- Componente de la Tarjeta de "Bandeja de Salida" (sin cambios) ---
const OutboxCard = ({ item, onSent }: { item: OutboxItem; onSent: (id: string) => void }) => {
    // ... (este componente se queda exactamente igual que antes)
    const handleSend = async () => {
        window.open(item.post_url, '_blank');
        try {
            await navigator.clipboard.writeText(item.selected_opener);
            alert('✅ ¡Opener copiado al portapapeles!\n\nPégalo como respuesta al comentario en la nueva pestaña.');
            onSent(item.id);
        } catch (err) {
            alert("Error al copiar al portapapeles.");
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex justify-between items-start mb-3">
                <p className="font-bold text-lg text-white">@{item.prospect_username}</p>
                {item.score && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">{item.score}</span>}
            </div>
            <blockquote className="border-l-4 border-gray-600 pl-4 my-4">
                <p className="italic text-gray-400">"{item.prospect_comment}"</p>
            </blockquote>
            <div className="bg-gray-900 p-4 rounded-md mb-4">
                <p className="font-mono text-sm text-gray-300">{item.selected_opener}</p>
            </div>
            <button
                onClick={handleSend}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
            >
                🚀 Enviar (Abrir y Copiar)
            </button>
        </div>
    );
};

const ConversationCard = ({ convo, onCardClick }: { convo: Conversation; onCardClick: (convo: Conversation) => void; }) => {
    return (
        <button 
            onClick={() => onCardClick(convo)}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-left hover:border-purple-500 transition-all"
        >
            <div className="flex justify-between items-center">
                <p className="font-bold text-white truncate">@{convo.lead_data.username}</p>
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full flex-shrink-0">{convo.status}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">"{convo.lead_data.comment}"</p>
        </button>
    );
};

// --- Componente Principal de la Página (REFACTORIZADO) ---
export default function ConversationsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  
  const [outboxItems, setOutboxItems] = useState<OutboxItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [modalNotes, setModalNotes] = useState('');
  const [modalStatus, setModalStatus] = useState('');

// Reemplaza handlePushToCrm con esta función
const handleExportLead = async (convoId: string) => {
    try {
        await exportLead(convoId); // Llamamos a la nueva función
        alert('✅ ¡Prospecto exportado exitosamente!');
        handleCloseModal();
        await fetchData(); // Recargamos para ver el nuevo estado "exportado"
    } catch (error: any) {
        console.error("Error al exportar el lead:", error);
        alert(`No se pudo exportar el prospecto: ${error.message}`);
    }
};

  // --- FUNCIÓN CENTRALIZADA PARA CARGAR DATOS ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Hacemos las dos llamadas a la API en paralelo para más eficiencia
      const [outboxData, convosData] = await Promise.all([
        getOutboxItems(),
        getConversations()
      ]);
      setOutboxItems(outboxData);
      setConversations(convosData);
    } catch (error) {
      console.error("Error al cargar los datos de la bandeja:", error);
      alert("No se pudieron cargar los datos. Intenta recargar la página.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('jwt_token')) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const handleItemSent = async (itemId: string) => {
    try {
      await markOutboxItemAsSent(itemId);
      // --- ¡AQUÍ ESTÁ LA SINCRONIZACIÓN! ---
      // Después de enviar, volvemos a cargar TODOS los datos para reflejar el cambio.
      await fetchData(); 
    } catch (error) {
      console.error("Error al marcar el item como enviado:", error);
      alert("Hubo un error al actualizar el estado del opener. Por favor, recarga la página.");
    }
  };

const handleOpenModal = (convo: Conversation) => {
  setSelectedConvo(convo);
  setModalNotes(convo.notes || '');
  setModalStatus(convo.status);
  setIsModalOpen(true);
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedConvo(null);
};

const handleSaveChanges = async () => {
  if (!selectedConvo) return;

  try {
    await updateConversation(selectedConvo.id, {
      notes: modalNotes,
      status: modalStatus,
    });
    handleCloseModal();
    await fetchData(); // Recargamos todo para ver los cambios al instante
  } catch (error: any) {
    console.error("Error al guardar los cambios:", error);
    alert(`No se pudieron guardar los cambios: ${error.message}`);
  }
};

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-8">
        <nav className="w-full max-w-7xl mb-12 flex justify-between items-center">
            <div className="flex items-center space-x-8">
                <h1 className="text-3xl font-bold">SetterMind AI</h1>
                <Link href="/" className="text-gray-300 hover:text-white">Dashboard</Link>
                <Link href="/conversations" className="text-white font-bold">Bandeja</Link>
                <Link href="/prospect" className="text-gray-300 hover:text-white">Prospectar</Link>
            </div>
            <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Cerrar Sesión</button>
        </nav>

        {isLoading ? (
            <p>Cargando bandeja...</p>
        ) : (
            <div className="w-full max-w-4xl space-y-12">
                <div>
                    <h2 className="text-3xl font-bold mb-6 border-b-2 border-blue-500 pb-2">Bandeja de Salida ({outboxItems.length} Pendientes)</h2>
                    {outboxItems.length > 0 ? (
                        <div className="space-y-6">
                            {outboxItems.map(item => (
                                <OutboxCard key={item.id} item={item} onSent={handleItemSent} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center bg-gray-800 p-8 rounded-lg">
                            <p className="text-gray-400">¡Todo listo! No tienes openers pendientes de envío.</p>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-3xl font-bold mb-6 border-b-2 border-gray-700 pb-2">Conversaciones en Seguimiento ({conversations.length} Activas)</h2>
                    {conversations.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {conversations.map(convo => (
                                <ConversationCard key={convo.id} convo={convo} onCardClick={handleOpenModal} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center bg-gray-800 p-8 rounded-lg">
                           <p className="text-gray-500">Cuando envíes un opener, la conversación aparecerá aquí para que puedas hacerle seguimiento.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
  {/* --- ¡NUEVO MODAL AQUÍ! --- */}
  {isModalOpen && selectedConvo && (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-700">
        <h3 className="text-2xl font-bold mb-4">Gestionar Conversación</h3>
        <p className="font-semibold text-white">@{selectedConvo.lead_data.username}</p>
        <p className="text-sm text-gray-400 mb-4 italic">"{selectedConvo.lead_data.comment}"</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <select
              id="status"
              value={modalStatus}
              onChange={(e) => setModalStatus(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
            >
              <option>iniciado</option>
              <option>respondió</option>
              <option>interesado</option>
              <option>agendado</option>
              <option>cerrado (ganado)</option>
              <option>cerrado (perdido)</option>
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notas</label>
            <textarea
              id="notes"
              rows={5}
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg w-full p-2.5"
              placeholder="Añade tus notas de seguimiento aquí..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={handleCloseModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
            Cancelar
          </button>
          <button onClick={handleSaveChanges} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg">
            Guardar Cambios
          </button>

          <button onClick={handleSaveChanges} className="bg-purple-600 hover:bg-purple-500 ...">
            Guardar Cambios
          </button>
          <button onClick={() => handleExportLead(selectedConvo.id)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">
            Exportar Lead
        </button>
       </div>
      </div>
    </div>
  )}
    </main>
  );
}