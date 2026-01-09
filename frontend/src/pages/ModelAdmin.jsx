import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api';

function ModelAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [records, setRecords] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelData();
  }, [id]);

  useEffect(() => {
    if (selectedOrgan) {
      fetchRecords();
      fetchRanking();
    }
  }, [selectedOrgan]);

  const fetchModelData = async () => {
    try {
      const response = await api.get(`/models/${id}`);
      setModel(response.data);
      if (response.data.organs.length > 0) {
        setSelectedOrgan(response.data.organs[0].id);
      }
    } catch (error) {
      console.error('Error fetching model:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await api.get(`/records/model/${id}`, {
        params: { organId: selectedOrgan }
      });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const fetchRanking = async () => {
    try {
      const response = await api.get(`/records/ranking/${id}`, {
        params: { organId: selectedOrgan }
      });
      setRanking(response.data);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('¿Está seguro de eliminar esta acción?')) {
      try {
        await api.delete(`/records/${recordId}`);
        fetchRecords();
        fetchRanking();
      } catch (error) {
        alert(error.response?.data?.error || 'Error al eliminar acción');
      }
    }
  };

  const handleDeleteModel = async () => {
    if (window.confirm('¿Está seguro de eliminar este modelo? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/models/${id}`);
        navigate('/admin-models');
      } catch (error) {
        alert(error.response?.data?.error || 'Error al eliminar modelo');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Modelo no encontrado</div>
      </div>
    );
  }

  const chartData = ranking.map(item => ({
    name: item.country.name,
    puntuación: item.totalScore,
    intervenciones: item.interventions
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900">{model.name}</h1>
            <button
              onClick={() => navigate('/admin-models')}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Volver
            </button>
          </div>
          
          {/* Selector de Órgano */}
          {model.organs.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Órgano
              </label>
              <select
                value={selectedOrgan || ''}
                onChange={(e) => setSelectedOrgan(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {model.organs.map((organ) => (
                  <option key={organ.id} value={organ.id}>
                    {organ.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Ranking */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ranking de Países</h2>
            {ranking.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="puntuación" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No hay datos de ranking disponibles</p>
            )}
          </div>
          
          {/* Historial de Acciones */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Historial de Acciones</h2>
            {records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        País
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Valoración
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Observaciones
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {new Date(record.created_at).toLocaleString('es-AR')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {record.user.username}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {record.country.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {record.quality.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {record.observations || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No hay acciones registradas</p>
            )}
          </div>
          
          {/* Botón de Eliminar Modelo */}
          <div className="border-t pt-6">
            <button
              onClick={handleDeleteModel}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Eliminar Modelo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelAdmin;
