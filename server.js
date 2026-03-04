/**
 * KNUT OBFUSCATOR - Serveur Express
 * Version: 3.0.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API d'obfuscation (pour version serveur)
app.post('/api/obfuscate', (req, res) => {
    try {
        const { code, options } = req.body;
        
        // Ici vous pouvez implémenter l'obfuscation côté serveur
        // Pour l'instant, on renvoie simplement un accusé de réception
        
        res.json({ 
            success: true, 
            message: 'API prête',
            timestamp: new Date().toISOString(),
            received: {
                codeLength: code?.length || 0,
                options: options || {}
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API pour vérifier le statut
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        version: '3.0.0',
        name: 'KNUT OBFUSCATOR',
        timestamp: new Date().toISOString()
    });
});

// 404 - Rediriger vers index.html (pour SPA)
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error('⌘ Erreur serveur:', err);
    res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
    });
});

// Démarrage
app.listen(PORT, () => {
    console.log(`
╔═════════════════════════════╗
║      KNUT OBFUSCATOR SERVER        
╠═════════════════════════════╣
║  ◈ Status:    ✅ ONLINE            
║  ◈ Port:      ${PORT}                      
║  ◈ URL:       http://localhost:${PORT}  
║  ◈ Version:   1.0.0         
╚═════════════════════════════╝
    `);
});