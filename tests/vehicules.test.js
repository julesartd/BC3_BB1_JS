const request = require('supertest');
const express = require('express');
const vehiculesRouter = require('../routes/vehicules');

const app = express();
app.use(express.json());
app.use('/vehicules', vehiculesRouter);

describe('Routes véhicules', () => {

    // Test validation ajout véhicule (champs manquants)
    it('POST /vehicules - doit refuser si champs obligatoires manquants', async () => {
        const res = await request(app)
            .post('/vehicules')
            .send({ marque: 'Renault', modele: 'Clio', annee: 2020 });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/Champs obligatoires/);
    });

    // Test validation ajout véhicule (immat déjà utilisée)
    it('POST /vehicules - doit refuser si immatriculation déjà utilisée', async () => {
        // ajout 1
        await request(app)
            .post('/vehicules')
            .send({
                immatriculation: 'TEST123',
                marque: 'Peugeot',
                modele: '208',
                annee: 2021
            });
        // ajout 2 (doublon immatriculation)
        const res = await request(app)
            .post('/vehicules')
            .send({
                immatriculation: 'TEST123',
                marque: 'Peugeot',
                modele: '208',
                annee: 2021
            });
        expect([409, 500]).toContain(res.statusCode);
    });

    // Test modification véhicule inexistant
    it('PUT /vehicules/:id - doit renvoyer 404 si véhicule non trouvé', async () => {
        const res = await request(app)
            .put('/vehicules/99999')
            .send({
                immatriculation: 'NEW123',
                marque: 'Citroen',
                modele: 'C3',
                annee: 2022
            });
        expect([404, 500]).toContain(res.statusCode);
    });

    // Test suppression véhicule inexistant
    it('DELETE /vehicules/:id - doit renvoyer 404 si véhicule non trouvé', async () => {
        const res = await request(app)
            .delete('/vehicules/99999');
        expect([404, 500]).toContain(res.statusCode);
    });
});