// Only create main object once
if (!Zotero.ZotFile) {
    var zotfileLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                    .getService(Components.interfaces.mozIJSSubScriptLoader);
    var scripts = ['zotfile', 'pdfAnnotations', 'pdfOutline', 'wildcards', 'tablet', 'utils', 'notifier', 'ui'];
    
    // Get the chrome://zotfile/ root URL to load scripts
    var chromeDir = 'chrome://zotfile/content/';
    scripts.forEach(s => zotfileLoader.loadSubScript(chromeDir + s + '.js'));
}

// Create ZotFile menus in existing windows
function createZotFileMenus() {
    var windows = Zotero.getMainWindows();
    for (let win of windows) {
        if (win.ZoteroPane && win.document) {
            addZotFileMenuToWindow(win.document);
        }
    }
}

// Add ZotFile menu to a specific window
function addZotFileMenuToWindow(doc) {
    // Add to item context menu
    var itemMenu = doc.getElementById('zotero-itemmenu');
    if (itemMenu && !doc.getElementById('id-zotfile-separator')) {
        // Create the same menu structure that ZotFile's UI code expects
        
        // Separator
        var separator = doc.createXULElement('menuseparator');
        separator.id = 'id-zotfile-separator';
        itemMenu.appendChild(separator);
        
        // Attach new file menu item
        var attachFileItem = doc.createXULElement('menuitem');
        attachFileItem.id = 'id-zotfile-attach-file';
        attachFileItem.setAttribute('label', 'Attach New File');
        attachFileItem.setAttribute('oncommand', 'Zotero.ZotFile.attachFileFromSourceDirectory();');
        itemMenu.appendChild(attachFileItem);
        
        // Main manage attachments menu
        var manageMenu = doc.createXULElement('menu');
        manageMenu.id = 'id-zotfile-manage-attachments';
        manageMenu.setAttribute('label', 'Manage Attachments');
        
        var managePopup = doc.createXULElement('menupopup');
        managePopup.id = 'id-zotfile-menu';
        managePopup.setAttribute('onpopupshowing', 'if (Zotero.ZotFile && Zotero.ZotFile.UI) Zotero.ZotFile.UI.buildZotFileMenu();');
        
        // Create all the menu items that buildZotFileMenu expects
        var menuItems = [
            { id: '', label: 'WARNING: Read manual before use!', disabled: true },
            { id: 'rename', label: 'Rename Attachments', command: 'Zotero.ZotFile.renameSelectedAttachments();' },
            { id: 'extractanno', label: 'Extract Annotations', command: 'Zotero.ZotFile.pdfAnnotations.getAnnotations();' },
            { id: 'getoutline', label: 'Get PDF Outline', command: 'Zotero.ZotFile.pdfOutline.getOutline();' },
            { separator: true },
            { id: '', label: 'WARNING: Read manual before use!', disabled: true },
            { id: 'push2reader', label: 'Send to Tablet', command: 'Zotero.ZotFile.Tablet.sendSelectedAttachmentsToTablet();' },
            { id: 'updatefile', label: 'Update Modified Time', command: 'Zotero.ZotFile.Tablet.updateSelectedTabletAttachments();' },
            { id: 'pullreader', label: 'Get from Tablet', command: 'Zotero.ZotFile.Tablet.getSelectedAttachmentsFromTablet();' },
            { separator: true },
            { id: 'tablet', label: 'Send to subfolder on tablet:', disabled: true, style: 'font-size: 80%' },
            { id: '', label: 'WARNING: Read manual before use!', disabled: true }
        ];
        
        menuItems.forEach((item, index) => {
            if (item.separator) {
                managePopup.appendChild(doc.createXULElement('menuseparator'));
            } else {
                var menuItem = doc.createXULElement('menuitem');
                if (item.id) menuItem.id = 'id-zotfile-' + item.id;
                menuItem.setAttribute('label', item.label);
                if (item.disabled) menuItem.setAttribute('disabled', 'true');
                if (item.style) menuItem.setAttribute('style', item.style);
                if (item.command) menuItem.setAttribute('oncommand', item.command);
                managePopup.appendChild(menuItem);
            }
        });
        
        // Add subfolder menu items (15 items, hidden by default)
        for (let i = 1; i <= 15; i++) {
            var subfolderItem = doc.createXULElement('menuitem');
            subfolderItem.id = 'id-push2reader-' + (i < 10 ? '0' + i : i);
            subfolderItem.setAttribute('hidden', 'true');
            subfolderItem.setAttribute('label', 'menu' + i);
            subfolderItem.setAttribute('oncommand', 'Zotero.ZotFile.Tablet.sendSelectedAttachmentsToTablet(' + (i-1) + ');');
            managePopup.appendChild(subfolderItem);
        }
        
        // Add separator
        managePopup.appendChild(doc.createXULElement('menuseparator'));
        
        // Configure subfolders item
        var configItem = doc.createXULElement('menuitem');
        configItem.id = 'id-menuConfigure';
        configItem.setAttribute('label', 'Change Subfolders');
        configItem.setAttribute('oncommand', 'Zotero.ZotFile.openSubfolderWindow();');
        managePopup.appendChild(configItem);
        
        manageMenu.appendChild(managePopup);
        itemMenu.appendChild(manageMenu);
        
        // Add popupshowing event to show/hide items
        itemMenu.addEventListener('popupshowing', function() {
            if (Zotero.ZotFile && Zotero.ZotFile.UI) {
                Zotero.ZotFile.UI.showMenu();
            }
        });
        
        Zotero.debug("ZotFile: Added menus to window");
    }
}

// Set up window listener for new windows
if (Zotero.addMainWindowListener) {
    Zotero.addMainWindowListener({
        onWindowLoad: function(win) {
            if (win.ZoteroPane && win.document) {
                addZotFileMenuToWindow(win.document);
            }
        }
    });
}

// Create menus in existing windows after a short delay to ensure everything is loaded
if (typeof Zotero.ZotFile !== 'undefined') {
    setTimeout(createZotFileMenus, 100);
}

// Note: Window-specific initialization is now handled by bootstrap.js
// The menu items and event listeners are set up when each window loads
