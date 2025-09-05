import { useState, useEffect } from 'react';
import './VehiculeForm.css';

const baseUri = import.meta.env.VITE_API_BASE_URL;

const VehiculeForm = ({ initialData = {}, onSuccess, mode = 'new' }) => {
    const [form, setForm] = useState({
        immatriculation: initialData.immatriculation || '',
        marque: initialData.marque || '',
        modele: initialData.modele || '',
        annee: initialData.annee || '',
        client_id: initialData.client_id || ''
    });
    const [clients, setClients] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch(baseUri + 'api/clients', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setClients(data);
                }
            } catch (err) {
                console.error('Erreur lors du chargement des clients', err);
            }
        };
        fetchClients();
    }, []);

    useEffect(() => {
        setForm({
            immatriculation: initialData.immatriculation || '',
            marque: initialData.marque || '',
            modele: initialData.modele || '',
            annee: initialData.annee || '',
            client_id: initialData.client_id || ''
        });
    }, [initialData]);

    
    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const res = await fetch(baseUri + 'api/csrf', {
                    method: 'GET',
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log("Token CSRF récupéré :", data.token);
                    setCsrfToken(data.token);
                }
            } catch (err) {
                console.error('Erreur lors de la récupération du token CSRF', err);
            }
        };
        fetchCsrfToken();
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const url =
                mode === 'edit'
                    ? baseUri + `api/vehicules/${initialData.id}`
                    : baseUri + 'api/vehicules';
            const method = mode === 'edit' ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ ...form, token: csrfToken })
            });

            if (res.status === 401 || res.status === 403) {
                setError('Non autorisé');
                return;
            }
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Erreur lors de l\'enregistrement');
            } else {
                setSuccess(
                    mode === 'edit'
                        ? 'Véhicule modifié avec succès !'
                        : 'Véhicule ajouté avec succès !'
                );
                if (onSuccess) onSuccess();
                if (mode === 'new') {
                    setForm({
                        immatriculation: '',
                        marque: '',
                        modele: '',
                        annee: '',
                        client_id: ''
                    });
                }
            }
        } catch (err) {
            setError('Erreur réseau');
        }
    };

    return (
        <form className="vehicule-form" onSubmit={handleSubmit}>
            <input
                type="text"
                name="immatriculation"
                placeholder="Immatriculation"
                value={form.immatriculation}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="marque"
                placeholder="Marque"
                value={form.marque}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="modele"
                placeholder="Modèle"
                value={form.modele}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="annee"
                placeholder="Année"
                value={form.annee}
                onChange={handleChange}
                required
            />
            <select
                name="client_id"
                value={form.client_id}
                onChange={handleChange}
            >
                <option value="">-- Sélectionner un client (optionnel) --</option>
                {clients.map(client => (
                    <option key={client.id} value={client.id}>
                        {client.firstname} {client.lastname}
                    </option>
                ))}
            </select>
            <button type="submit">
                {mode === 'edit' ? 'Modifier' : 'Ajouter'}
            </button>
            {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
            {success && <p style={{ color: 'green', marginTop: 10 }}>{success}</p>}
        </form>
    );
};

export default VehiculeForm;