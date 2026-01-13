import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function Annotate({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [qualityScale, setQualityScale] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [observations, setObservations] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (selectedOrgan) {
      fetchRecords();
    }
  }, [selectedOrgan]);

  const fetchData = async () => {
    try {
      const [modelRes, qualityRes] = await Promise.all([
        api.get(`/models/${id}`),
        api.get('/countries/quality-scale')
      ]);
      
      setModel(modelRes.data);
      setQualityScale(qualityRes.data);
      
      if (modelRes.data.organs.length > 0) {
        setSelectedOrgan(modelRes.data.organs[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await api.get(`/records/model/${id}`, {
        params: { organId: selectedOrgan.id }
      });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCountry || !selectedQuality) {
      alert('Por favor seleccione un país y una valoración');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/records', {
        organ_id: selectedOrgan.id,
        country_id: selectedCountry.id,
        quality_id: selectedQuality.id,
        observations: observations.trim() || null
      });
      
      // Reset form
      setSelectedCountry(null);
      setSelectedQuality(null);
      setObservations('');
      
      // Refresh records
      fetchRecords();
      
      alert('Intervención registrada exitosamente');
    } catch (error) {
      alert(error.response?.data?.error || 'Error al guardar intervención');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('¿Está seguro de eliminar esta acción?')) {
      try {
        await api.delete(`/records/${recordId}`);
        fetchRecords();
      } catch (error) {
        alert(error.response?.data?.error || 'Error al eliminar acción');
      }
    }
  };

  const getFlagPath = (countryName) => {
    const flagMap = {
      'Estados Unidos': '/flags/US.png',
      'Reino Unido': '/flags/UK.png',
      'Francia': '/flags/FR.png',
      'Federacion Rusa': '/flags/RU.png',
      'China': '/flags/CN.png',
      'Emiratos Arabes Unidos': '/flags/AE.png',
      'Afganistán': '/flags/AF.png',
      'Argentina': '/flags/AR.png',
      'Australia': '/flags/AU.png',
      'Brasil': '/flags/BR.png',
      'Canadá': '/flags/CA.png',
      'Rep Dem del Congo': '/flags/CD.png',
      'Rep Centrofricana': '/flags/CF.png',
      'Colombia': '/flags/CO.png',
      'Cuba': '/flags/CU.png',
      'Dinamarca': '/flags/DK.png',
      'Argelia': '/flags/DZ.png',
      'Egipto': '/flags/EG.png',
      'Etiopía': '/flags/ET.png',
      'Grecia': '/flags/GR.png',
      'Guyana': '/flags/GY.png',
      'Haiti': '/flags/HT.png',
      'Israel': '/flags/IL.png',
      'Iran': '/flags/IR.png',
      'Kenia': '/flags/KE.png',
      'Libia': '/flags/LY.png',
      'Marruecos': '/flags/MA.png',
      'Nicaragua': '/flags/NI.png',
      'Rep Pop y Dem de Corea': '/flags/KP.png',
      'Pakistán': '/flags/PK.png',
      'Perú': '/flags/PE.png',
      'Polonia': '/flags/PL.png',
      'Aut Nac Palestina': '/flags/PS.png',
      'Paraquay': '/flags/PY.png',
      'Rumania': '/flags/RO.png',
      'Sudán': '/flags/SD.png',
      'Sierra Leona': '/flags/SL.png',
      'Eslovenia': '/flags/SI.png',
      'Somalia': '/flags/SO.png',
      'Venezuela': '/flags/VE.png',
      'Sudan del Sur': '/flags/ZA.png',
      'Santa Sede': '/flags/VA.png',
      'Alemania': '/flags/DE.png',
      'India': '/flags/IN.png',
      'Italia': '/flags/IT.png',
      'Japón': '/flags/JP.png',
      'México': '/flags/MX.png',
      'Nigeria': '/flags/NG.png',
      'Sudáfrica': '/flags/ZA.png',
      'Republica de Corea': '/flags/KR.png',
      'España': '/flags/ES.png',
      'Turkiye': '/flags/TR.png'
    };
    return flagMap[countryName] || null;
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

  const currentOrganData = model.organs.find(o => o.id === selectedOrgan?.id);
  const countries = currentOrganData?.countries || [];
  const isSecurityCouncil = selectedOrgan?.name === 'Consejo de Seguridad';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">{model.name}</h1>
              <p className="text-sm text-gray-600 mt-1">Anotar Intervención</p>
            </div>
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin-models' : '/models')}
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
                value={selectedOrgan?.id || ''}
                onChange={(e) => {
                  const organ = model.organs.find(o => o.id === parseInt(e.target.value));
                  setSelectedOrgan(organ);
                  setSelectedCountry(null);
                }}
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

          {/* Selector de País */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Seleccionar País</h2>
            <div className={`grid gap-4 ${
              isSecurityCouncil 
                ? 'grid-cols-5' 
                : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
            }`}>
              {countries.sort((a, b) => a.name.localeCompare(b.name)).map((country) => {
                const flagPath = getFlagPath(country.name);
                return (
                  <button
                    key={country.id}
                    onClick={() => setSelectedCountry(country)}
                    className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                      selectedCountry?.id === country.id
                        ? 'bg-blue-600 border-blue-600 shadow-lg'
                        : 'bg-white border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {flagPath ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                          <img 
                            src={flagPath} 
                            alt={country.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          selectedCountry?.id === country.id ? 'text-white' : 'text-gray-700'
                        }`}>
                          {country.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-2xl">🏴</span>
                        </div>
                        <span className={`text-xs font-medium ${
                          selectedCountry?.id === country.id ? 'text-white' : 'text-gray-700'
                        }`}>
                          {country.name}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulario de Anotación */}
          {selectedCountry && (
            <div className="border-t pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Intervención de: {selectedCountry.name}
                </h3>
              </div>

              {/* Valoración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valoración *
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {qualityScale.map((quality) => (
                    <button
                      key={quality.id}
                      type="button"
                      onClick={() => setSelectedQuality(quality)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedQuality?.id === quality.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{quality.value}</div>
                        <div className="text-xs">{quality.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Comentarios adicionales sobre la intervención..."
                />
              </div>

              {/* Botón Guardar */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
              >
                {submitting ? 'Guardando...' : 'Guardar Intervención'}
              </button>
            </div>
          )}

          {/* Historial de mis acciones */}
          <div className="border-t mt-8 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mis Anotaciones</h2>
            {records.length > 0 ? (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">{record.country.name}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {record.quality.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(record.created_at).toLocaleString('es-AR')}
                        </span>
                      </div>
                      {record.observations && (
                        <p className="text-sm text-gray-600">{record.observations}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay anotaciones registradas aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Annotate;
