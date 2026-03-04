

class KnutObfuscator {
    constructor() {
        this.originalCode = '';
        this.currentZip = null;
        this.zipFiles = [];
        this.obfuscatedZip = null;
        this.variableMap = new Map();
        this.stringMap = new Map();
        this.counter = 0;
        
        this.initEventListeners();
    }

    // Initialisation des événements
    initEventListeners() {
        // Stats pour les textareas
        const inputCode = document.getElementById('inputCode');
        const outputCode = document.getElementById('outputCode');
        
        if (inputCode) {
            inputCode.addEventListener('input', () => {
                this.updateStats('inputCode', 'codeStats');
            });
        }

        if (outputCode) {
            outputCode.addEventListener('input', () => {
                this.updateStats('outputCode', 'obfuscatedStats');
            });
        }

        // Drag & drop pour le ZIP
        const uploadArea = document.querySelector('.upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#0066cc';
                uploadArea.style.background = 'rgba(0, 102, 204, 0.1)';
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#003366';
                uploadArea.style.background = 'transparent';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#003366';
                uploadArea.style.background = 'transparent';
                
                const file = e.dataTransfer.files[0];
                if (file && file.name.endsWith('.zip')) {
                    this.handleZipFile(file);
                } else {
                    alert('⌘ Veuillez déposer un fichier ZIP valide');
                }
            });
        }

        // Upload de fichier
        const zipInput = document.getElementById('zipInput');
        if (zipInput) {
            zipInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleZipFile(file);
                }
            });
        }
    }

    // =================== UTILITAIRES ===================

    // Mettre à jour les statistiques
    updateStats(textareaId, statsId) {
        const textarea = document.getElementById(textareaId);
        const stats = document.getElementById(statsId);
        if (textarea && stats) {
            const text = textarea.value;
            const chars = text.length;
            const lines = text.split('\n').length;
            const size = (chars / 1024).toFixed(2);
            stats.innerHTML = `Caractères: ${chars} | Taille: ${size} KB | Lignes: ${lines}`;
        }
    }

    // Générer un nom de variable aléatoire
    generateVarName() {
        const prefixes = ['_0x', '_0x', '_0x'];
        const chars = 'abcdef0123456789';
        let name = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        const length = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < length; i++) {
            name += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return name;
    }

    // Encoder une string en base64
    encodeBase64(str) {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (e) {
            return btoa(str);
        }
    }

    // =================== MOTEUR D'OBFUSCATION ===================

    /**
     * Obfusque du code JavaScript avec des techniques avancées
     * @param {string} code - Le code source à obfusquer
     * @param {object} options - Options d'obfuscation
     * @returns {string} - Code obfusqué
     */
    obfuscateJavaScript(code, options = {}) {
        if (!code) return '';
        
        let obfuscated = code;
        const defaultOptions = {
            compact: true,
            selfDefending: true,
            stringArray: true,
            debugProtection: false,
            disableConsole: false,
            unicodeEscape: false,
            deadCode: true,
            renameVariables: true
        };
        
        const config = { ...defaultOptions, ...options };

        try {
            // 1. Supprimer les commentaires
            obfuscated = obfuscated
                .replace(/\/\/.*$/gm, '')
                .replace(/\/\*[\s\S]*?\*\//g, '');

            // 2. Renommer les variables
            if (config.renameVariables) {
                obfuscated = this.renameVariables(obfuscated);
            }

            // 3. Encoder les strings
            if (config.stringArray) {
                obfuscated = this.encodeStrings(obfuscated);
            }

            // 4. Ajouter du code mort
            if (config.deadCode) {
                obfuscated = this.addDeadCode(obfuscated);
            }

            // 5. Compactage
            if (config.compact) {
                obfuscated = obfuscated
                    .replace(/\s+/g, ' ')
                    .replace(/\s*([{};=<>+*\/\-!,|&])\s*/g, '$1')
                    .replace(/;\s*}/g, '}')
                    .trim();
            }

            // 6. Protection anti-debug
            if (config.debugProtection) {
                obfuscated = this.addDebugProtection(obfuscated);
            }

            // 7. Désactivation console
            if (config.disableConsole) {
                obfuscated = this.disableConsole(obfuscated);
            }

            // 8. Self-defending
            if (config.selfDefending) {
                obfuscated = this.addSelfDefending(obfuscated);
            }

            // 9. Unicode escape
            if (config.unicodeEscape) {
                obfuscated = this.unicodeEscape(obfuscated);
            }

            return obfuscated;
        } catch (error) {
            console.error('⌘ Erreur obfuscation:', error);
            return code;
        }
    }

    /**
     * Renomme les variables avec des noms obfusqués
     */
    renameVariables(code) {
        let result = code;
        const varPattern = /\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=;]/g;
        const varNames = [];
        let match;
        
        while ((match = varPattern.exec(code)) !== null) {
            varNames.push(match[2]);
        }
        
        // Créer un Map pour les remplacements
        const renameMap = new Map();
        varNames.forEach(name => {
            if (!renameMap.has(name)) {
                renameMap.set(name, this.generateVarName());
            }
        });
        
        // Remplacer les noms de variables
        renameMap.forEach((newName, oldName) => {
            const regex = new RegExp('\\b' + oldName + '\\b', 'g');
            result = result.replace(regex, newName);
        });
        
        return result;
    }

    /**
     * Encode les strings dans un tableau
     */
    encodeStrings(code) {
        const stringPattern = /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/g;
        const strings = [];
        let match;
        
        while ((match = stringPattern.exec(code)) !== null) {
            strings.push(match[0]);
        }
        
        if (strings.length === 0) return code;
        
        // Créer un tableau de strings unique
        const uniqueStrings = [...new Set(strings)];
        const arrayName = this.generateVarName();
        
        // Construire le tableau
        let arrayCode = `var ${arrayName}=[`;
        uniqueStrings.forEach((str, index) => {
            arrayCode += str;
            if (index < uniqueStrings.length - 1) arrayCode += ',';
        });
        arrayCode += '];';
        
        // Remplacer les strings par des références
        let result = arrayCode + '\n' + code;
        uniqueStrings.forEach((str, index) => {
            const escapedStr = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedStr, 'g');
            result = result.replace(regex, `${arrayName}[${index}]`);
        });
        
        return result;
    }

    /**
     * Ajoute du code mort (fonctions inutiles)
     */
    addDeadCode(code) {
        const deadFunctions = [];
        const count = 2 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < count; i++) {
            const funcName = this.generateVarName();
            const value = Math.floor(Math.random() * 1000);
            deadFunctions.push(`function ${funcName}(){return ${value};}`);
        }
        
        return deadFunctions.join('\n') + '\n' + code;
    }

    /**
     * Ajoute une protection anti-debug
     */
    addDebugProtection(code) {
        const protection = `
            (function() {
                var start = new Date();
                debugger;
                var end = new Date();
                if (end - start > 100) {
                    setInterval(function() { debugger; }, 50);
                }
            })();
        `;
        return protection + '\n' + code;
    }

    /**
     * Désactive la console
     */
    disableConsole(code) {
        const disable = `
            (function() {
                var methods = ['log', 'info', 'warn', 'error', 'debug'];
                for(var i = 0; i < methods.length; i++) {
                    console[methods[i]] = function() {};
                }
            })();
        `;
        return disable + '\n' + code;
    }

    /**
     * Ajoute une protection self-defending
     */
    addSelfDefending(code) {
        const selfDefend = `
            (function() {
                var self = arguments.callee.toString();
                setInterval(function() {
                    if (self !== arguments.callee.toString()) {
                        throw new Error('⌘ Code modifié');
                    }
                }, 1000);
            })();
        `;
        return selfDefend + '\n' + code;
    }

    /**
     * Échappe les caractères en unicode
     */
    unicodeEscape(code) {
        return code.split('').map(char => {
            if (char.charCodeAt(0) > 127 || Math.random() > 0.8) {
                return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
            }
            return char;
        }).join('');
    }

    // =================== FONCTIONS PUBLIQUES ===================

    // Changer d'onglet
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        if (tab === 'code') {
            document.querySelectorAll('.tab-btn')[0].classList.add('active');
            document.getElementById('tab-code').classList.add('active');
        } else {
            document.querySelectorAll('.tab-btn')[1].classList.add('active');
            document.getElementById('tab-zip').classList.add('active');
        }
    }

    // Obfusquer le code
    obfuscateCode() {
        const input = document.getElementById('inputCode');
        const output = document.getElementById('outputCode');
        
        if (!input || !input.value.trim()) {
            alert('⌘ Veuillez entrer du code à obfusquer');
            return;
        }
        
        this.originalCode = input.value;
        
        const options = {
            compact: document.getElementById('compact')?.checked || true,
            selfDefending: document.getElementById('selfDefending')?.checked || true,
            stringArray: document.getElementById('stringArray')?.checked || true,
            debugProtection: document.getElementById('debugProtection')?.checked || false,
            disableConsole: document.getElementById('disableConsole')?.checked || false,
            unicodeEscape: document.getElementById('unicodeEscape')?.checked || false
        };
        
        output.value = this.obfuscateJavaScript(input.value, options);
        
        this.updateStats('inputCode', 'codeStats');
        this.updateStats('outputCode', 'obfuscatedStats');
    }

    // Effacer le code
    clearCode() {
        const input = document.getElementById('inputCode');
        const output = document.getElementById('outputCode');
        if (input) input.value = '';
        if (output) output.value = '';
        this.originalCode = '';
        this.updateStats('inputCode', 'codeStats');
        this.updateStats('outputCode', 'obfuscatedStats');
    }

    // Copier dans le presse-papier
    async copyToClipboard() {
        const output = document.getElementById('outputCode');
        if (!output || !output.value) {
            alert('⌘ Aucun code à copier');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(output.value);
            alert('⌘ Code copié !');
        } catch (err) {
            output.select();
            document.execCommand('copy');
            alert('⌘ Code copié !');
        }
    }

    // Télécharger le code
    downloadCode() {
        const output = document.getElementById('outputCode');
        if (!output || !output.value) {
            alert('⌘ Aucun code à télécharger');
            return;
        }
        
        const blob = new Blob([output.value], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'knut-obfuscated.js';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Voir le code original
    showOriginal() {
        if (!this.originalCode) {
            alert('⌘ Aucun code original disponible');
            return;
        }
        
        const display = document.getElementById('originalCodeDisplay');
        if (display) {
            display.textContent = this.originalCode;
        }
        
        const modal = document.getElementById('originalModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    // Fermer le modal
    closeModal() {
        const modal = document.getElementById('originalModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // =================== GESTION DES FICHIERS ZIP ===================

    // Gérer le fichier ZIP
    async handleZipFile(file) {
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const fileInfo = document.getElementById('fileInfo');
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
        if (fileInfo) fileInfo.style.display = 'block';
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const zip = await JSZip.loadAsync(e.target.result);
                this.currentZip = zip;
                this.zipFiles = [];
                
                const fileList = document.getElementById('fileList');
                const jsCountSpan = document.getElementById('jsCount');
                const zipStats = document.getElementById('zipStats');
                
                if (fileList) fileList.innerHTML = '';
                
                let jsCount = 0;
                
                zip.forEach((relativePath, zipEntry) => {
                    if (!zipEntry.dir) {
                        const isJs = relativePath.endsWith('.js');
                        if (isJs) jsCount++;
                        
                        this.zipFiles.push({
                            path: relativePath,
                            isJs: isJs
                        });
                        
                        if (fileList) {
                            const item = document.createElement('div');
                            item.className = 'file-item';
                            item.innerHTML = `
                                <span class="${isJs ? 'js' : ''}">${relativePath}</span>
                                <span>${isJs ? '⌗ JS' : '◈ Autre'}</span>
                            `;
                            fileList.appendChild(item);
                        }
                    }
                });
                
                if (jsCountSpan) jsCountSpan.textContent = jsCount;
                if (zipStats) zipStats.innerHTML = `${jsCount} fichier(s) JS trouvé(s) sur ${this.zipFiles.length} total`;
                
                const obfuscateBtn = document.getElementById('obfuscateZipBtn');
                if (obfuscateBtn) obfuscateBtn.disabled = false;
                
            } catch (error) {
                alert('⌘ Erreur ZIP: ' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // Obfusquer le ZIP
    async obfuscateZip() {
        if (!this.currentZip) {
            alert('⌘ Veuillez d\'abord charger un fichier ZIP');
            return;
        }
        
        const progressFill = document.getElementById('progressFill');
        const obfuscateBtn = document.getElementById('obfuscateZipBtn');
        const downloadBtn = document.getElementById('downloadZipBtn');
        const zipStats = document.getElementById('zipStats');
        
        if (obfuscateBtn) {
            obfuscateBtn.disabled = true;
            obfuscateBtn.innerHTML = '⟳ Obfuscation...';
        }
        
        const options = {
            compact: document.getElementById('zipCompact')?.checked || true,
            selfDefending: document.getElementById('zipSelfDefending')?.checked || true,
            stringArray: document.getElementById('zipStringArray')?.checked || true,
            debugProtection: document.getElementById('zipDebugProtection')?.checked || false
        };
        
        const newZip = new JSZip();
        let processed = 0;
        
        for (const file of this.zipFiles) {
            try {
                const content = await this.currentZip.file(file.path).async('string');
                
                if (file.isJs) {
                    const obfuscated = this.obfuscateJavaScript(content, options);
                    newZip.file(file.path, obfuscated);
                } else {
                    newZip.file(file.path, content);
                }
                
                processed++;
                if (progressFill) {
                    progressFill.style.width = (processed / this.zipFiles.length * 100) + '%';
                }
            } catch (e) {
                console.error('⌘ Erreur sur', file.path, e);
            }
        }
        
        const content = await newZip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE'
        });
        
        this.obfuscatedZip = content;
        
        if (obfuscateBtn) {
            obfuscateBtn.innerHTML = '⌘ Obfusquer le ZIP';
            obfuscateBtn.disabled = false;
        }
        
        if (downloadBtn) downloadBtn.style.display = 'inline-flex';
        if (zipStats) zipStats.innerHTML = '✓ Terminé ! ' + processed + ' fichiers traités';
    }

    // Télécharger le ZIP obfusqué
    downloadZip() {
        if (!this.obfuscatedZip) {
            alert('⌘ Aucun ZIP obfusqué disponible');
            return;
        }
        
        saveAs(this.obfuscatedZip, 'knut-obfuscated.zip');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.obfuscator = new KnutObfuscator();
});