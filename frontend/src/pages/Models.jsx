import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Models({ isAdmin }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await api.get('/models');
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900">Modelos</h1>
            <button
              onClick={() => navigate('/admin')}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Volver
            </button>
          </div>
          
          <button
            onClick={() => navigate('/create-model')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold mb-6"
          >
            + Agregar Modelo
          </button>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay modelos creados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => navigate(`/model/${model.id}/admin`)}
                  className="bg-blue-600 text-white py-6 px-4 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 text-xl font-semibold shadow-lg"
                >
                  {model.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Models;
