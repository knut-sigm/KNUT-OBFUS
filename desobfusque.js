/**
 * KNUT DESOBFUSCATOR - Moteur de désobfuscation JavaScript
 * Version: 1.0.0
 * Auteur: KNUT XMD
 * 
 * Ce moteur permet de désobfusquer du code JavaScript obfusqué
 * en restaurant la lisibilité tout en préservant la logique
 */

class KnutDeobfuscator {
    constructor() {
        this.originalCode = '';
        this.currentZip = null;
        this.zipFiles = [];
        this.deobfuscatedZip = null;
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

    // =================== MOTEUR DE DÉSOBFUSCATION ===================

    /**
     * Désobfusque du code JavaScript
     * @param {string} code - Le code obfusqué à désobfusquer
     * @param {object} options - Options de désobfuscation
     * @returns {string} - Code désobfusqué
     */
    deobfuscateJavaScript(code, options = {}) {
        if (!code) return '';
        
        let deobfuscated = code;
        const defaultOptions = {
            beautify: true,
            decodeStrings: true,
            renameVariables: true,
            removeDeadCode: true,
            removeProtections: true,
            formatCode: true
        };
        
        const config = { ...defaultOptions, ...options };

        try {
            // ÉTAPE 1: Supprimer les protections anti-debug
            if (config.removeProtections) {
                deobfuscated = this.removeAntiDebug(deobfuscated);
                deobfuscated = this.removeSelfDefending(deobfuscated);
                deobfuscated = this.removeConsoleDisable(deobfuscated);
            }

            // ÉTAPE 2: Supprimer le code mort
            if (config.removeDeadCode) {
                deobfuscated = this.removeDeadFunctions(deobfuscated);
            }

            // ÉTAPE 3: Décode les strings encodées
            if (config.decodeStrings) {
                deobfuscated = this.decodeStringArrays(deobfuscated);
                deobfuscated = this.decodeBase64Strings(deobfuscated);
                deobfuscated = this.decodeHexStrings(deobfuscated);
                deobfuscated = this.decodeUnicodeStrings(deobfuscated);
            }

            // ÉTAPE 4: Renomme les variables pour les rendre lisibles
            if (config.renameVariables) {
                deobfuscated = this.renameHexVariables(deobfuscated);
            }

            // ÉTAPE 5: Formate le code pour le rendre lisible
            if (config.formatCode) {
                deobfuscated = this.beautifyCode(deobfuscated);
            }

            // ÉTAPE 6: Beautify final
            if (config.beautify) {
                deobfuscated = this.addSpacing(deobfuscated);
            }

            return deobfuscated;
        } catch (error) {
            console.error('⌘ Erreur de désobfuscation:', error);
            return code;
        }
    }

    /**
     * Supprime les protections anti-debug
     */
    removeAntiDebug(code) {
        // Supprime les boucles infinies avec debugger
        let result = code.replace(/setInterval\s*\(\s*function\s*\(\s*\)\s*\{\s*debugger\s*;\s*\}\s*,\s*\d+\s*\)\s*;?/g, '');
        
        // Supprime les vérifications de temps d'exécution
        result = result.replace(/\(\s*function\s*\(\s*\)\s*\{\s*var\s+\w+\s*=\s*new\s+Date\s*\(\s*\)\s*;\s*debugger\s*;\s*var\s+\w+\s*=\s*new\s+Date\s*\(\s*\)\s*;\s*if\s*\(\s*\w+\s*-\s*\w+\s*>\s*\d+\s*\)\s*\{\s*setInterval\s*\(\s*function\s*\(\s*\)\s*\{\s*debugger\s*;\s*\}\s*,\s*\d+\s*\)\s*;\s*\}\s*\}\s*\)\s*\(\s*\)\s*;?/g, '');
        
        return result;
    }

    /**
     * Supprime les protections self-defending
     */
    removeSelfDefending(code) {
        // Supprime les vérifications d'intégrité du code
        let result = code.replace(/\(\s*function\s*\(\s*\)\s*\{\s*var\s+\w+\s*=\s*arguments\.callee\.toString\s*\(\s*\)\s*;\s*setInterval\s*\(\s*function\s*\(\s*\)\s*\{\s*if\s*\(\s*\w+\s*!==\s*arguments\.callee\.toString\s*\(\s*\)\s*\)\s*\{\s*throw\s+new\s+Error\s*\(\s*['"][^'"]*['"]\s*\)\s*;\s*\}\s*\}\s*,\s*\d+\s*\)\s*;\s*\}\s*\)\s*\(\s*\)\s*;?/g, '');
        
        return result;
    }

    /**
     * Supprime la désactivation de la console
     */
    removeConsoleDisable(code) {
        // Supprime les overrides de console
        let result = code.replace(/\(\s*function\s*\(\s*\)\s*\{\s*var\s+\w+\s*=\s*\[\s*['"]log['"]\s*,\s*['"]info['"]\s*,\s*['"]warn['"]\s*,\s*['"]error['"]\s*,\s*['"]debug['"]\s*\]\s*;\s*for\s*\(\s*var\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*\w+\.length\s*;\s*\w+\+\+\s*\)\s*\{\s*console\s*\[\s*\w+\[\s*\w+\s*\]\s*\]\s*=\s*function\s*\(\s*\)\s*\{\s*\}\s*;\s*\}\s*\}\s*\)\s*\(\s*\)\s*;?/g, '');
        
        return result;
    }

    /**
     * Supprime les fonctions mortes (code inutile)
     */
    removeDeadFunctions(code) {
        let result = code;
        
        // Supprime les fonctions qui ne sont jamais appelées
        const functionPattern = /function\s+(_0x[a-f0-9]+|[\u4e00-\u9fff]+)\s*\([^)]*\)\s*\{[^}]+\}/g;
        const functionCalls = new Set();
        const functions = [];
        let match;
        
        // Trouve toutes les fonctions définies
        while ((match = functionPattern.exec(code)) !== null) {
            functions.push({
                name: match[1],
                full: match[0]
            });
        }
        
        // Trouve tous les appels de fonctions
        const callPattern = /\b(_0x[a-f0-9]+|[\u4e00-\u9fff]+)\s*\(/g;
        while ((match = callPattern.exec(code)) !== null) {
            functionCalls.add(match[1]);
        }
        
        // Supprime les fonctions non appelées
        functions.forEach(func => {
            if (!functionCalls.has(func.name)) {
                result = result.replace(func.full, '');
            }
        });
        
        return result;
    }

    /**
     * Décode les tableaux de strings
     */
    decodeStringArrays(code) {
        let result = code;
        
        // Trouve les déclarations de tableaux de strings
        const arrayPattern = /var\s+(_0x[a-f0-9]+)\s*=\s*\[\s*((?:['"][^'"]*['"]\s*,?\s*)+)\s*\]\s*;/g;
        const arrays = [];
        let match;
        
        while ((match = arrayPattern.exec(code)) !== null) {
            arrays.push({
                name: match[1],
                content: match[2]
            });
        }
        
        // Remplace les références au tableau par les strings réelles
        arrays.forEach(array => {
            const strings = array.content.match(/['"][^'"]*['"]/g) || [];
            strings.forEach((str, index) => {
                const regex = new RegExp(array.name + '\\[' + index + '\\]', 'g');
                result = result.replace(regex, str);
            });
            // Supprime la déclaration du tableau
            result = result.replace(new RegExp('var\\s+' + array.name + '\\s*=\\s*\\[.*?\\]\\s*;', 'g'), '');
        });
        
        return result;
    }

    /**
     * Décode les strings en base64
     */
    decodeBase64Strings(code) {
        let result = code;
        const base64Pattern = /atob\s*\(\s*['"]([A-Za-z0-9+/=]+)['"]\s*\)/g;
        
        result = result.replace(base64Pattern, (match, base64) => {
            try {
                const decoded = atob(base64);
                return `"${decoded}"`;
            } catch (e) {
                return match;
            }
        });
        
        return result;
    }

    /**
     * Décode les strings hexadécimales
     */
    decodeHexStrings(code) {
        let result = code;
        const hexPattern = /['"](\\x[a-f0-9]{2})+['"]/g;
        
        result = result.replace(hexPattern, (match) => {
            try {
                const hex = match.replace(/['"]/g, '');
                const decoded = hex.replace(/\\x([a-f0-9]{2})/g, (_, hex) => 
                    String.fromCharCode(parseInt(hex, 16))
                );
                return `"${decoded}"`;
            } catch (e) {
                return match;
            }
        });
        
        return result;
    }

    /**
     * Décode les strings unicode
     */
    decodeUnicodeStrings(code) {
        let result = code;
        const unicodePattern = /\\u([a-f0-9]{4})/g;
        
        result = result.replace(unicodePattern, (match, hex) => {
            try {
                return String.fromCharCode(parseInt(hex, 16));
            } catch (e) {
                return match;
            }
        });
        
        return result;
    }

    /**
     * Renomme les variables hexadécimales en noms lisibles
     */
    renameHexVariables(code) {
        let result = code;
        const varCounter = {};
        const hexVarPattern = /\b(_0x[a-f0-9]+)\b/g;
        const hexVars = new Set();
        let match;
        
        // Trouve toutes les variables hexadécimales
        while ((match = hexVarPattern.exec(code)) !== null) {
            hexVars.add(match[1]);
        }
        
        // Renomme chaque variable
        const varList = Array.from(hexVars);
        varList.forEach((hex, index) => {
            const newName = this.getReadableVarName(index);
            const regex = new RegExp('\\b' + hex + '\\b', 'g');
            result = result.replace(regex, newName);
        });
        
        return result;
    }

    /**
     * Génère un nom de variable lisible
     */
    getReadableVarName(index) {
        const prefixes = ['var', 'val', 'tmp', 'data', 'item', 'elem', 'obj', 'arr', 'func', 'res'];
        const suffix = Math.floor(index / prefixes.length);
        const prefix = prefixes[index % prefixes.length];
        return suffix === 0 ? prefix : prefix + suffix;
    }

    /**
     * Formate le code pour le rendre lisible
     */
    beautifyCode(code) {
        let result = code;
        
        // Ajoute des sauts de ligne après les points-virgules
        result = result.replace(/;/g, ';\n');
        
        // Ajoute des indentations pour les blocs
        let indent = 0;
        const lines = result.split('\n');
        const formattedLines = [];
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.includes('}')) {
                indent = Math.max(0, indent - 1);
            }
            
            formattedLines.push('  '.repeat(indent) + trimmed);
            
            if (trimmed.includes('{') && !trimmed.includes('}')) {
                indent++;
            }
        });
        
        return formattedLines.join('\n');
    }

    /**
     * Ajoute des espaces pour améliorer la lisibilité
     */
    addSpacing(code) {
        let result = code;
        
        // Ajoute des espaces autour des opérateurs
        result = result.replace(/([=<>+*\/\-!&|])(?=[^\s=])/g, '$1 ');
        result = result.replace(/([^\s=])([=<>+*\/\-!&|])/g, '$1 $2');
        
        // Ajoute des espaces après les virgules
        result = result.replace(/,([^\s])/g, ', $1');
        
        // Ajoute des espaces après les mots-clés
        const keywords = ['if', 'else', 'for', 'while', 'do', 'switch', 'catch', 'finally', 'try'];
        keywords.forEach(keyword => {
            const regex = new RegExp('\\b' + keyword + '\\(', 'g');
            result = result.replace(regex, keyword + ' (');
        });
        
        return result;
    }

    // =================== FONCTIONS PUBLIQUES ===================

    // Désobfusquer le code
    deobfuscateCode() {
        const input = document.getElementById('deobfuscateInput');
        const output = document.getElementById('deobfuscateOutput');
        
        if (!input || !input.value.trim()) {
            alert('⌘ Veuillez entrer du code à désobfusquer');
            return;
        }
        
        this.originalCode = input.value;
        
        const options = {
            beautify: document.getElementById('deobfuscateBeautify')?.checked || true,
            decodeStrings: document.getElementById('deobfuscateDecodeStrings')?.checked || true,
            renameVariables: document.getElementById('deobfuscateRenameVars')?.checked || true,
            removeDeadCode: document.getElementById('deobfuscateRemoveDead')?.checked || true,
            removeProtections: document.getElementById('deobfuscateRemoveProtections')?.checked || true,
            formatCode: document.getElementById('deobfuscateFormat')?.checked || true
        };
        
        output.value = this.deobfuscateJavaScript(input.value, options);
        
        this.updateStats('deobfuscateInput', 'deobfuscateInputStats');
        this.updateStats('deobfuscateOutput', 'deobfuscateOutputStats');
    }

    // Effacer le code
    clearDeobfuscate() {
        const input = document.getElementById('deobfuscateInput');
        const output = document.getElementById('deobfuscateOutput');
        if (input) input.value = '';
        if (output) output.value = '';
        this.updateStats('deobfuscateInput', 'deobfuscateInputStats');
        this.updateStats('deobfuscateOutput', 'deobfuscateOutputStats');
    }

    // Copier dans le presse-papier
    async copyDeobfuscated() {
        const output = document.getElementById('deobfuscateOutput');
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
    downloadDeobfuscated() {
        const output = document.getElementById('deobfuscateOutput');
        if (!output || !output.value) {
            alert('⌘ Aucun code à télécharger');
            return;
        }
        
        const blob = new Blob([output.value], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deobfuscated.js';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Charger un fichier
    loadDeobfuscateFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.js,.txt';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('deobfuscateInput').value = e.target.result;
                    this.updateStats('deobfuscateInput', 'deobfuscateInputStats');
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    // Afficher l'aide
    showDeobfuscateHelp() {
        const helpText = `🔓 GUIDE DE DÉSOBFUSCATION

Ce module vous aide à rendre un code obfusqué plus lisible.

OPTIONS DISPONIBLES:

✅ Beautifier - Formate le code avec des indentations
✅ Décoder les strings - Décode base64, hex, unicode
✅ Renommer les variables - Remplace _0x... par des noms lisibles
✅ Supprimer code mort - Enlève les fonctions inutiles
✅ Supprimer protections - Enlève anti-debug et self-defending
✅ Formater - Ajoute des espaces et sauts de ligne

LIMITATIONS:
- La désobfuscation parfaite n'existe pas
- Certaines techniques avancées peuvent résister
- Le code peut nécessiter des ajustements manuels

ASTUCE: Essayez différentes combinaisons d'options pour de meilleurs résultats !`;

        alert(helpText);
    }

    // =================== GESTION DES FICHIERS ZIP ===================

    // Gérer le fichier ZIP
    async handleZipFile(file) {
        const fileName = document.getElementById('deobfuscateFileName');
        const fileSize = document.getElementById('deobfuscateFileSize');
        const fileInfo = document.getElementById('deobfuscateFileInfo');
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
        if (fileInfo) fileInfo.style.display = 'block';
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const zip = await JSZip.loadAsync(e.target.result);
                this.currentZip = zip;
                this.zipFiles = [];
                
                const fileList = document.getElementById('deobfuscateFileList');
                const jsCountSpan = document.getElementById('deobfuscateJsCount');
                const zipStats = document.getElementById('deobfuscateZipStats');
                
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
                                <span>${isJs ? '📜 JS' : '📁 Autre'}</span>
                            `;
                            fileList.appendChild(item);
                        }
                    }
                });
                
                if (jsCountSpan) jsCountSpan.textContent = jsCount;
                if (zipStats) zipStats.innerHTML = `${jsCount} fichier(s) JS trouvé(s) sur ${this.zipFiles.length} total`;
                
                const deobfuscateBtn = document.getElementById('deobfuscateZipBtn');
                if (deobfuscateBtn) deobfuscateBtn.disabled = false;
                
            } catch (error) {
                alert('⌘ Erreur ZIP: ' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // Désobfusquer le ZIP
    async deobfuscateZip() {
        if (!this.currentZip) {
            alert('⌘ Veuillez d\'abord charger un fichier ZIP');
            return;
        }
        
        const progressFill = document.getElementById('deobfuscateProgressFill');
        const deobfuscateBtn = document.getElementById('deobfuscateZipBtn');
        const downloadBtn = document.getElementById('deobfuscateDownloadZipBtn');
        const zipStats = document.getElementById('deobfuscateZipStats');
        
        if (deobfuscateBtn) {
            deobfuscateBtn.disabled = true;
            deobfuscateBtn.innerHTML = '⏳ Désobfuscation...';
        }
        
        const options = {
            beautify: true,
            decodeStrings: true,
            renameVariables: true,
            removeDeadCode: true,
            removeProtections: true,
            formatCode: true
        };
        
        const newZip = new JSZip();
        let processed = 0;
        
        for (const file of this.zipFiles) {
            try {
                const content = await this.currentZip.file(file.path).async('string');
                
                if (file.isJs) {
                    const deobfuscated = this.deobfuscateJavaScript(content, options);
                    newZip.file(file.path, deobfuscated);
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
        
        this.deobfuscatedZip = content;
        
        if (deobfuscateBtn) {
            deobfuscateBtn.innerHTML = '🔓 Désobfusquer ZIP';
            deobfuscateBtn.disabled = false;
        }
        
        if (downloadBtn) downloadBtn.style.display = 'inline-flex';
        if (zipStats) zipStats.innerHTML = '✅ Terminé ! ' + processed + ' fichiers traités';
    }

    // Télécharger le ZIP désobfusqué
    downloadDeobfuscatedZip() {
        if (!this.deobfuscatedZip) {
            alert('⌘ Aucun ZIP désobfusqué disponible');
            return;
        }
        
        saveAs(this.deobfuscatedZip, 'deobfuscated.zip');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.deobfuscator = new KnutDeobfuscator();
});
