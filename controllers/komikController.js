const db = require('../models');
const komik = require('../models/komik');

async function getAllKomik(req, res) {
    const hasPagination = req.query.limit !== undefined || req.query.offset !== undefined;
    const options = {};

    if (hasPagination) {
        const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
        const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
        if (
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100 ||
            !Number.isInteger(offset) ||
            offset < 0
        ) {
            return res.status(400).json({
                error: 'limit harus 1-100 dan offset harus bilangan bulat non-negatif',
            });
        }
        options.limit = limit;
        options.offset = offset;
    }

    try{
        const komik = hasPagination
            ? await db.Komik.findAll(options)
            : await db.Komik.findAll();
        res.status(200).json(komik);
    } catch(err){
        console.error('Error fetching komik:', err.message);
        res.status(500).json({error: 'Failed to fetch komik'});
    }
}

async function getKomikById(req, res) {
    const {id} = req.params;
    try{
        const komik = await db.Komik.findByPk(id);
        if(!komik){
            return res.status(404).json({error: 'Komik not found'});
        }
        res.status(200).json(komik);
    } catch(err){
        console.error('Error fetching komik by ID:', err.message);
        res.status(500).json({error: 'Failed to fetch komik by ID'});
    }
}

async function createKomik(req, res) {
    const { title, description, author } = req.body;
    try{
        const newKomik = await db.Komik.create({ title, description, author });
        res.status(201).json(newKomik);
    } catch(err){
        console.error('Error creating komik:', err.message);
        res.status(500).json({error: 'Failed to create komik'});
    }
}

async function updateKomik(req, res) {
    const {id} = req.params
    const { title, description, author } = req.body;
    try{
        const komik = await db.Komik.findByPk(id);
        if(!komik){
            return res.status(404).json({error: 'Komik not found'});
        }
        komik.title = title;
        komik.description = description;
        komik.author = author;
        await komik.save();
        res.status(200).json(komik);
    } catch(err){
        console.error('Error updating komik:', err.message);
        res.status(500).json({error: 'Failed to update komik'});
    }
}
async function deleteKomik(req, res) {
    const {id} = req.params
    try{
        const komik = await db.Komik.findByPk(id);
        if(!komik){
            return res.status(404).json({error: 'Komik not found'});
        }
        await komik.destroy();
        res.status(200).json({message: 'Komik deleted successfully'});
    } catch(err){
        console.error('Error deleting komik:', err.message);
        res.status(500).json({error: 'Failed to delete komik'});
    }
}

module.exports = {getAllKomik, getKomikById, createKomik, updateKomik, deleteKomik};