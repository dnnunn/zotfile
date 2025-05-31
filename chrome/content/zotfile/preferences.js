var ZotFilePreferences = {
    init: function() {
        // Initialize the preferences window
        this.updateUI();
        this.setupEventListeners();
    },

    updateUI: function() {
        // Update UI elements based on preferences
        this.updateFolderIcons();
        this.updateTabletUI();
        this.updateSubfolderUI();
    },

    setupEventListeners: function() {
        // Add event listeners for preference changes
        var tablet = document.getElementById('zotfile-tablet');
        if (tablet) {
            tablet.addEventListener('command', () => this.updateTabletUI());
        }

        var subfolder = document.getElementById('zotfile-subfolder');
        if (subfolder) {
            subfolder.addEventListener('command', () => this.updateSubfolderUI());
        }

        var tabletSubfolder = document.getElementById('zotfile-tablet-subfolder');
        if (tabletSubfolder) {
            tabletSubfolder.addEventListener('command', () => this.updateSubfolderUI());
        }
    },

    updateFolderIcons: function() {
        // Update folder validation icons
        this.validateFolder('source');
        this.validateFolder('dest');
        this.validateFolder('tablet');
    },

    validateFolder: function(type) {
        var prefName = type === 'source' ? 'extensions.zotfile.source_dir' :
                      type === 'dest' ? 'extensions.zotfile.dest_dir' :
                      'extensions.zotfile.tablet.dest_dir';
        
        var path = Zotero.Prefs.get(prefName);
        if (path && path.trim()) {
            // TODO: Add actual folder validation
            console.log('Validating folder:', path);
        }
    },

    updateTabletUI: function() {
        var tabletEnabled = Zotero.Prefs.get('extensions.zotfile.tablet');
        var tabletElements = document.querySelectorAll('#zotfile-tablet-location, #zotfile-tablet-options');
        
        tabletElements.forEach(element => {
            if (tabletEnabled) {
                element.removeAttribute('disabled');
            } else {
                element.setAttribute('disabled', 'true');
            }
        });
    },

    updateSubfolderUI: function() {
        var subfolderEnabled = Zotero.Prefs.get('extensions.zotfile.subfolder');
        var subfolderFormat = document.getElementById('zotfile-subfolder-format');
        if (subfolderFormat) {
            if (subfolderEnabled) {
                subfolderFormat.removeAttribute('disabled');
            } else {
                subfolderFormat.setAttribute('disabled', 'true');
            }
        }

        var tabletSubfolderEnabled = Zotero.Prefs.get('extensions.zotfile.tablet.subfolder');
        var tabletSubfolderFormat = document.getElementById('zotfile-tablet-subfolder-format');
        if (tabletSubfolderFormat) {
            if (tabletSubfolderEnabled) {
                tabletSubfolderFormat.removeAttribute('disabled');
            } else {
                tabletSubfolderFormat.setAttribute('disabled', 'true');
            }
        }
    },

    chooseSourceDirectory: function() {
        this.chooseDirectory('extensions.zotfile.source_dir');
    },

    chooseDestDirectory: function() {
        this.chooseDirectory('extensions.zotfile.dest_dir');
    },

    chooseTabletDirectory: function() {
        this.chooseDirectory('extensions.zotfile.tablet.dest_dir');
    },

    chooseDirectory: async function(prefName) {
        try {
            var { FilePicker } = ChromeUtils.importESModule('chrome://zotero/content/modules/filePicker.mjs');
            var fp = new FilePicker();
            fp.init(window, "Choose Directory", fp.modeGetFolder);
            
            var currentPath = Zotero.Prefs.get(prefName);
            if (currentPath) {
                try {
                    fp.displayDirectory = PathUtils.parent(currentPath);
                } catch (e) {
                    // Ignore errors with invalid paths
                }
            }

            var result = await fp.show();
            if (result === fp.returnOK) {
                Zotero.Prefs.set(prefName, fp.file);
                this.updateFolderIcons();
            }
        } catch (error) {
            Zotero.logError(error);
            alert('Error choosing directory: ' + error.message);
        }
    },

    showTabletFolder: function() {
        var path = Zotero.Prefs.get('extensions.zotfile.tablet.dest_dir');
        if (path && Zotero.ZotFile) {
            try {
                Zotero.ZotFile.showFolder(path);
            } catch (error) {
                alert('Cannot open folder: ' + path);
            }
        } else {
            alert('No tablet folder configured');
        }
    },

    openSubfolderWindow: function() {
        if (Zotero.ZotFile) {
            Zotero.ZotFile.openSubfolderWindow();
        }
    },

    updatePreview: function() {
        var previewField = document.getElementById('zotfile-preview');
        if (previewField && Zotero.ZotFile) {
            try {
                // Get the currently selected item for preview
                var items = Zotero.getActiveZoteroPane().getSelectedItems();
                if (items.length > 0) {
                    var filename = Zotero.ZotFile.getFilename(items[0]);
                    previewField.value = filename || 'No filename generated';
                } else {
                    previewField.value = 'Please select an item first';
                }
            } catch (error) {
                previewField.value = 'Error generating preview: ' + error.message;
            }
        }
    },

    downloadPDFTool: function() {
        if (Zotero.ZotFile && Zotero.ZotFile.pdfAnnotations) {
            try {
                Zotero.ZotFile.pdfAnnotations.downloadPDFTool();
            } catch (error) {
                alert('Error downloading PDF tool: ' + error.message);
            }
        }
    },

    createSavedSearch: function(searchType) {
        if (Zotero.ZotFile && Zotero.ZotFile.Tablet) {
            try {
                Zotero.ZotFile.Tablet.createSavedSearch(searchType);
            } catch (error) {
                alert('Error creating saved search: ' + error.message);
            }
        }
    }
}; 