const axios = require('axios');
const FormData = require('form-data');
const formidable = require('formidable');
const fs = require('fs');

// Wajib di Vercel: Nonaktifkan bodyParser bawaan agar kita bisa mengelola file upload
exports.config = {
    api: {
        bodyParser: false,
    },
};

module.exports = async (req, res) => {
    // Set Header CORS agar bisa diakses oleh frontend HTML kita
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Tangani preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // API Key Private Kamu
    const apiKey = 'cov_live_314930b1b64028814a58824196082a79937cc86d57c883ae';

    // Parsing form-data menggunakan formidable
    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ message: 'Gagal membaca file upload' });
        }

        try {
            // Menyesuaikan struktur data formidable terbaru
            let file = files.file;
            if (Array.isArray(file)) file = file[0];
            
            let resolution = fields.resolution;
            if (Array.isArray(resolution)) resolution = resolution[0];

            if (!file) {
                return res.status(400).json({ message: 'File gambar tidak ditemukan!' });
            }

            // Membangun FormData baru untuk dikirim ke Covenant API
            const formData = new FormData();
            formData.append('file', fs.createReadStream(file.filepath), file.originalFilename || 'image.jpg');
            formData.append('resolution', resolution || '4k');

            // Eksekusi API
            const response = await axios.post('https://api.covenant.sbs/api/ai/upscale', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'x-api-key': apiKey
                }
            });

            // Kirim respons sukses ke web
            res.status(200).json(response.data);
            
        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message;
            res.status(500).json({ status: false, message: errorMsg });
        }
    });
};
