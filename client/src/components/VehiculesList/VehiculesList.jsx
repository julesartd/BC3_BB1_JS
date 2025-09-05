import { useEffect, useState } from 'react';
import './VehiculesList.css';

const baseUri = import.meta.env.VITE_API_BASE_URL;

const VehiculesList = ({ onEdit }) => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchVehicules = async () => {
    try {
      const res = await fetch(baseUri + 'api/vehicules', { credentials: 'include' });
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setVehicules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(baseUri + `api/vehicules/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la suppression');
      } else {
        setSuccess('Véhicule supprimé avec succès');
        setVehicules(vehicules.filter(v => v.id !== id));
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

  return (
    <div className="vehicules-container">
      <header className="vehicules-header">
        <h2>Liste des véhicules</h2>
        <p>Retrouvez tous les véhicules enregistrés au garage</p>
      </header>
      {loading && <p>Chargement...</p>}
      {error && <p className="vehicules-error">{error}</p>}
      {success && <p style={{ color: 'green', marginTop: 10 }}>{success}</p>}
      {!loading && !error && (
        <table className="vehicules-table">
          <thead>
            <tr>
              <th>Immatriculation</th>
              <th>Marque</th>
              <th>Modèle</th>
              <th>Année</th>
              <th>Client</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicules.map(v => (
              <tr key={v.id}>
                <td>{v.immatriculation}</td>
                <td>{v.marque}</td>
                <td>{v.modele}</td>
                <td>{v.annee}</td>
                <td>
                  {v.firstname && v.lastname
                    ? `${v.firstname} ${v.lastname}`
                    : <span style={{ color: '#888' }}>Non associé</span>}
                </td>
                <td>
                  <button onClick={() => onEdit(v)}>Modifier</button>
                  <button
                    style={{ marginLeft: 8, background: '#c00' }}
                    onClick={() => handleDelete(v.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VehiculesList;