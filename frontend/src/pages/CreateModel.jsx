import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AVAILABLE_ORGANS = [
  'Consejo de Seguridad',
  'Asamblea General',
  'Consejo Económico y Social',
  'Consejo de DDHH',
  'Sala de Tratados',
  'OMS'
];

const SECURITY_COUNCIL_MEMBERS = [
  'Estados Unidos',
  'Reino Unido',
  'Francia',
  'Rusia',
  'China'
];

function CreateModel() {
  const [modelName, setModelName] = useState('');
  const [selectedOrgans, setSelectedOrgans] = useState([]);
  const [organCountries, setOrganCountries] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleOrgan = (organ) => {
    if (selectedOrgans.includes(organ)) {
      setSelectedOrgans(selectedOrgans.filter(o => o !== organ));
      const newOrganCountries = { ...organCountries };
      delete newOrganCountries[organ];
      setOrganCountries(newOrganCountries);
    } else {
      setSelectedOrgans([...selectedOrgans, organ]);
      if (organ === 'Consejo de Seguridad') {
        setOrganCountries({
          ...organCountries,
          [organ]: SECURITY_COUNCIL_MEMBERS.map(name => ({ name, iso_code: '' }))
        });
      } else {
        setOrganCountries({
          ...organCountries,
          [organ]: []
        });
      }
    }
  };

  const addCountry = (organ) => {
    const countryName = prompt('Ingrese el nombre del país:');
    if (countryName && countryName.trim()) {
      setOrganCountries({
        ...organCountries,
        [organ]: [
          ...(organCountries[organ] || []),
          { name: countryName.trim(), iso_code: '' }
        ]
      });
    }
  };

  const removeCountry = (organ, index) => {
    const updatedCountries = organCountries[organ].filter((_, i) => i !== index);
    setOrganCountries({
      ...organCountries,
      [organ]: updatedCountries
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!modelName.trim()) {
      alert('Por favor ingrese un nombre para el modelo');
      return;
    }
    
    if (selectedOrgans.length === 0) {
      alert('Por favor seleccione al menos un órgano');
      return;
    }
    
    for (const organ of selectedOrgans) {
      if (!organCountries[organ] || organCountries[organ].length === 0) {
        alert(`Por favor agregue países al órgano: ${organ}`);
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const organs = selectedOrgans.map(organName => ({
        name: organName,
        countries: organCountries[organName]
      }));
      
      await api.post('/models', {
        name: modelName,
        organs
      });
      
      navigate('/admin-models');
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear modelo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900">Crear Modelo</h1>
            <button
              onClick={() => navigate('/admin-models')}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Volver
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Modelo
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Modelo 2026"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Órganos
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_ORGANS.map((organ) => (
                  <button
                    key={organ}
                    type="button"
                    onClick={() => toggleOrgan(organ)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedOrgans.includes(organ)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {organ}
                  </button>
                ))}
              </div>
            </div>
            
            {selectedOrgans.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Países por Órgano</h3>
                
                {selectedOrgans.map((organ) => (
                  <div key={organ} className="border border-gray-300 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900">{organ}</h4>
                      <button
                        type="button"
                        onClick={() => addCountry(organ)}
                        className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 text-sm"
                      >
                        + Agregar País
                      </button>
                    </div>
                    
                    {organCountries[organ] && organCountries[organ].length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {organCountries[organ].map((country, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            <span>{country.name}</span>
                            <button
                              type="button"
                              onClick={() => removeCountry(organ, index)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No hay países agregados</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
              >
                {loading ? 'Creando...' : 'Crear Modelo'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin-models')}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateModel;
