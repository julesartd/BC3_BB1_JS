const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const csrf = require("csrf");
const secretTokenCSRF = 'OEKFNEZKkF78EZFH93';


const tokens = new csrf();


const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'garage_db'
};

const verifyCSRFToken = (req, res, next) => {
  const token = req.body.token;
  // secretTokenCSRF à remplacer par process.env.CSRF_TOKEN si .env
  if (!token || !tokens.verify(secretTokenCSRF, token)) {
    return res.status(403).send("Invalid CSRF Token");
  }
  next();
};

// Liste tous les véhicules
router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute(
            `SELECT v.*, u.lastname, u.firstname 
             FROM vehicules v 
             LEFT JOIN users u ON v.client_id = u.id`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur.' });
    } finally {
        if (conn) await conn.end();
    }
});

// Ajoute un véhicule
router.post('/', verifyCSRFToken, async (req, res) => {
    const { immatriculation, marque, modele, annee, client_id } = req.body;
    if (!immatriculation || !marque || !modele || !annee) {
        return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    }
    let conn;
    try {
        conn = await mysql.createConnection(dbConfig);
        await conn.execute(
            `INSERT INTO vehicules (immatriculation, marque, modele, annee, client_id) VALUES (?, ?, ?, ?, ?)`,
            [immatriculation, marque, modele, annee, client_id || null]
        );
        res.status(201).json({ message: 'Véhicule ajouté.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Immatriculation déjà utilisée.' });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    } finally {
        if (conn) await conn.end();
    }
});

// Modifie un véhicule
router.put('/:id', verifyCSRFToken, async (req, res) => {
    const { immatriculation, marque, modele, annee, client_id } = req.body;
    const { id } = req.params;
    let conn;
    try {
        conn = await mysql.createConnection(dbConfig);
        const [result] = await conn.execute(
            `UPDATE vehicules SET immatriculation=?, marque=?, modele=?, annee=?, client_id=? WHERE id=?`,
            [immatriculation, marque, modele, annee, client_id || null, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Véhicule non trouvé.' });
        }
        res.json({ message: 'Véhicule modifié.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Immatriculation déjà utilisée.' });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    } finally {
        if (conn) await conn.end();
    }
});

// Supprime un véhicule
router.delete('/:id', verifyCSRFToken, async (req, res) => {
    const { id } = req.params;
    let conn;
    try {
        conn = await mysql.createConnection(dbConfig);
        const [result] = await conn.execute(
            `DELETE FROM vehicules WHERE id=?`,
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Véhicule non trouvé.' });
        }
        res.json({ message: 'Véhicule supprimé.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur.' });
    } finally {
        if (conn) await conn.end();
    }
});

module.exports = router;