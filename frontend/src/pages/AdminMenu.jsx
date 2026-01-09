import { useNavigate } from 'react-router-dom';

function AdminMenu({ onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl p-12 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-12">
          Panel de Administración
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/users')}
            className="bg-blue-600 text-white py-8 px-6 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 text-2xl font-semibold shadow-lg"
          >
            Usuarios
          </button>
          
          <button
            onClick={() => navigate('/admin-models')}
            className="bg-blue-600 text-white py-8 px-6 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 text-2xl font-semibold shadow-lg"
          >
            Modelos
          </button>
        </div>
        
        <button
          onClick={onLogout}
          className="mt-8 w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default AdminMenu;
