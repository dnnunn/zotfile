/* global Components, Services */
"use strict";

if (typeof Zotero == "undefined") {
  var Zotero = Components.classes["@zotero.org/Zotero;1"]
    .getService(Components.interfaces.nsISupports).wrappedJSObject;
}

var chromeHandle;
var ZotFileMenuItems = [];

/**
 * Bootstrap Plugin Lifecycle Hooks
 */

async function startup({ id, version, resourceURI, rootURI = resourceURI.spec }) {
    await Zotero.uiReadyPromise;
    
    Zotero.debug("ZotFile: Starting up");

    // Register chrome resources
    var aomStartup = Components.classes["@mozilla.org/addons/addon-manager-startup;1"]
        .getService(Components.interfaces.amIAddonManagerStartup);
    var manifestURI = Services.io.newURI(rootURI + "manifest.json");
    chromeHandle = aomStartup.registerChrome(manifestURI, [
        ["content", "zotfile", rootURI + "chrome/content/zotfile/"],
        ["locale", "zotfile", "en-US", rootURI + "chrome/locale/en-US/"],
        ["locale", "zotfile", "de-DE", rootURI + "chrome/locale/de-DE/"],
        ["locale", "zotfile", "fr-FR", rootURI + "chrome/locale/fr-FR/"],
        ["locale", "zotfile", "it-IT", rootURI + "chrome/locale/it-IT/"],
        ["skin", "zotfile", "default", rootURI + "chrome/skin/default/zotfile/"]
    ]);

    // Load ZotFile scripts
    var zotfileLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                    .getService(Components.interfaces.mozIJSSubScriptLoader);
    
    // Load include.js first which sets up ZotFile namespace and loads other scripts
    zotfileLoader.loadSubScript(rootURI + 'chrome/content/zotfile/include.js');

    // Register preferences pane
    Zotero.PreferencePanes.register({
        pluginID: id,
        src: rootURI + 'chrome/content/zotfile/preferences.xhtml',
        label: 'ZotFile',
        image: rootURI + 'chrome/skin/default/zotfile/zotfile-48.png',
        scripts: [rootURI + 'chrome/content/zotfile/preferences.js']
    });

    // Initialize ZotFile after everything is loaded
    if (Zotero.ZotFile) {
        await Zotero.ZotFile.init();
    }
}

function shutdown() {
    Zotero.debug("ZotFile: Shutting down");
    
    // Unregister preferences pane
    try {
        Zotero.PreferencePanes.unregister('zotfile@columbia.edu');
    } catch (e) {
        // Ignore errors during shutdown
    }

    // Clean up ZotFile
    if (Zotero.ZotFile) {
        if (Zotero.ZotFile.notifierID) {
            Zotero.Notifier.unregisterObserver(Zotero.ZotFile.notifierID);
            Zotero.ZotFile.notifierID = null;
        }
    }

    // Remove menu items from all windows
    var windows = Zotero.getMainWindows();
    for (let win of windows) {
        removeMenuItems(win);
    }
    
    // Clear menu items array
    ZotFileMenuItems = [];

    // Deregister chrome resources
    if (chromeHandle) {
        chromeHandle.destruct();
        chromeHandle = null;
    }

    // Clear ZotFile from global scope
    if (typeof Zotero !== 'undefined' && Zotero.ZotFile) {
        delete Zotero.ZotFile;
    }
}

function install() {
    Zotero.debug("ZotFile: Installed");
}

function uninstall() {
    Zotero.debug("ZotFile: Uninstalled");
}

/**
 * Window Hooks for Zotero 7
 */

function onMainWindowLoad({ window }) {
    // Wait for window to be ready
    window.addEventListener('load', function(e) {
        initZotFileMenus(window);
    }, { once: true });
}

function onMainWindowUnload({ window }) {
    removeMenuItems(window);
}

/**
 * Helper Functions
 */

function initZotFileMenus(window) {
    if (!window.ZoteroPane) return;
    
    var doc = window.document;
    
    // Add ZotFile menus to item context menu
    var itemMenu = doc.getElementById('zotero-itemmenu');
    if (itemMenu) {
        addZotFileItemMenu(doc, itemMenu);
        itemMenu.addEventListener('popupshowing', function() {
            if (Zotero.ZotFile && Zotero.ZotFile.UI) {
                Zotero.ZotFile.UI.showMenu();
            }
        }, false);
    }
    
    // Add ZotFile menus to collection context menu
    var collectionMenu = doc.getElementById('zotero-collectionmenu');
    if (collectionMenu) {
        addZotFileCollectionMenu(doc, collectionMenu);
        collectionMenu.addEventListener('popupshowing', function() {
            if (Zotero.ZotFile && Zotero.ZotFile.UI) {
                Zotero.ZotFile.UI.showCollectionMenu();
            }
        }, false);
    }
    
    // Add ZotFile options to tools menu
    var toolsMenu = doc.getElementById('menu_ToolsPopup');
    if (toolsMenu) {
        addZotFileToolsMenu(doc, toolsMenu);
    }
    
    // Add ZotFile options to Zotero actions popup
    var actionsPopup = doc.getElementById('zotero-tb-actions-popup');
    if (actionsPopup) {
        addZotFileActionsMenu(doc, actionsPopup);
    }
    
    // Add event listener for collection tree clicks (tablet search updates)
    var collectionsTree = doc.getElementById('zotero-collections-tree');
    if (collectionsTree) {
        collectionsTree.addEventListener('click', function() {
            if (Zotero.ZotFile && Zotero.ZotFile.Tablet) {
                Zotero.ZotFile.Tablet.updateModifiedAttachmentsSearch();
            }
        }, false);
    }
    
    // Add event listener for items tree selection (tablet status updates)
    var itemsTree = doc.getElementById('zotero-items-tree');
    if (itemsTree && Zotero.ZotFile && Zotero.ZotFile.getPref('tablet')) {
        itemsTree.removeEventListener('select', function() {
            if (Zotero.ZotFile.UI) {
                Zotero.ZotFile.UI.attboxUpdateTabletStatus();
            }
        });
        itemsTree.addEventListener('select', function() {
            if (Zotero.ZotFile.UI) {
                Zotero.ZotFile.UI.attboxUpdateTabletStatus();
            }
        });
    }
}

function addZotFileItemMenu(doc, parentMenu) {
    // Create separator
    var separator = doc.createXULElement('menuseparator');
    separator.id = 'id-zotfile-separator';
    parentMenu.appendChild(separator);
    ZotFileMenuItems.push(separator);
    
    // Create attach file menu item
    var attachFileItem = doc.createXULElement('menuitem');
    attachFileItem.id = 'id-zotfile-attach-file';
    attachFileItem.setAttribute('label', 'Attach New File');
    attachFileItem.setAttribute('oncommand', 'Zotero.ZotFile.attachFileFromSourceDirectory();');
    parentMenu.appendChild(attachFileItem);
    ZotFileMenuItems.push(attachFileItem);
    
    // Create manage attachments menu
    var manageMenu = doc.createXULElement('menu');
    manageMenu.id = 'id-zotfile-manage-attachments';
    manageMenu.setAttribute('label', 'Manage Attachments');
    
    var managePopup = doc.createXULElement('menupopup');
    managePopup.id = 'id-zotfile-menu';
    managePopup.setAttribute('onpopupshowing', 'Zotero.ZotFile.UI.buildZotFileMenu();');
    
    // Add submenu items
    var items = [
        { id: '', label: 'WARNING: Read manual before use!', disabled: true },
        { id: 'rename', label: 'Rename Attachments', command: 'Zotero.ZotFile.renameSelectedAttachments();' },
        { id: 'extract', label: 'Extract Annotations', command: 'Zotero.ZotFile.pdfAnnotations.getAnnotations();' },
        { id: 'outline', label: 'Get PDF Outline', command: 'Zotero.ZotFile.pdfOutline.getOutline();' },
        { separator: true },
        { id: '', label: 'WARNING: Read manual before use!', disabled: true },
        { id: 'send', label: 'Send to Tablet', command: 'Zotero.ZotFile.Tablet.sendSelectedAttachmentsToTablet();' },
        { id: 'update', label: 'Update Modified Time', command: 'Zotero.ZotFile.Tablet.updateSelectedTabletAttachments();' },
        { id: 'get', label: 'Get from Tablet', command: 'Zotero.ZotFile.Tablet.getSelectedAttachmentsFromTablet();' },
        { separator: true },
        { id: '', label: 'Send to subfolder on tablet:', disabled: true, style: 'font-size: 80%' },
        { id: '', label: 'WARNING: Read manual before use!', disabled: true }
    ];
    
    items.forEach(item => {
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
    
    // Add subfolder menu items (hidden by default)
    for (let i = 1; i <= 15; i++) {
        var subfolderItem = doc.createXULElement('menuitem');
        subfolderItem.id = 'id-push2reader-' + (i < 10 ? '0' + i : i);
        subfolderItem.setAttribute('hidden', 'true');
        subfolderItem.setAttribute('label', 'menu' + i);
        subfolderItem.setAttribute('oncommand', 'Zotero.ZotFile.Tablet.sendSelectedAttachmentsToTablet(' + (i-1) + ');');
        managePopup.appendChild(subfolderItem);
    }
    
    // Add configure subfolders item
    var configItem = doc.createXULElement('menuitem');
    configItem.id = 'id-push2reader-configure';
    configItem.setAttribute('label', 'Change Subfolders');
    configItem.setAttribute('oncommand', 'Zotero.ZotFile.openSubfolderWindow();');
    managePopup.appendChild(configItem);
    
    manageMenu.appendChild(managePopup);
    parentMenu.appendChild(manageMenu);
    ZotFileMenuItems.push(manageMenu);
}

function addZotFileCollectionMenu(doc, parentMenu) {
    // Create separator
    var separator = doc.createXULElement('menuseparator');
    separator.id = 'id-zotfile-collection-separator';
    parentMenu.appendChild(separator);
    ZotFileMenuItems.push(separator);
    
    // Create show all item
    var showAllItem = doc.createXULElement('menuitem');
    showAllItem.id = 'id-zotfile-collection-showall';
    showAllItem.setAttribute('label', 'Show All Tablet Files');
    showAllItem.setAttribute('oncommand', 'Zotero.ZotFile.Tablet.restrictTabletSearch(-1);');
    parentMenu.appendChild(showAllItem);
    ZotFileMenuItems.push(showAllItem);
    
    // Create restrict menu
    var restrictMenu = doc.createXULElement('menu');
    restrictMenu.id = 'id-zotfile-collection-restrict';
    restrictMenu.setAttribute('label', 'Show Files on Tablet by Subfolder');
    
    var restrictPopup = doc.createXULElement('menupopup');
    restrictPopup.id = 'id-zotfile-collection-menu';
    restrictPopup.setAttribute('onpopupshowing', 'Zotero.ZotFile.UI.buildZotFileCollectionMenu();');
    
    // Add base folder item
    var baseFolderItem = doc.createXULElement('menuitem');
    baseFolderItem.id = 'id-zotfile-collection-subfolder-00';
    baseFolderItem.setAttribute('label', 'Base Folder');
    baseFolderItem.setAttribute('hidden', 'true');
    baseFolderItem.setAttribute('oncommand', 'Zotero.ZotFile.Tablet.restrictTabletSearch(0);');
    restrictPopup.appendChild(baseFolderItem);
    
    restrictPopup.appendChild(doc.createXULElement('menuseparator'));
    
    // Add subfolder note
    var noteItem = doc.createXULElement('menuitem');
    noteItem.id = 'id-zotfile-collection-ui-note';
    noteItem.setAttribute('label', 'Restrict to Subfolder');
    noteItem.setAttribute('disabled', 'true');
    noteItem.setAttribute('style', 'font-size: 80%');
    restrictPopup.appendChild(noteItem);
    
    // Add subfolder items (hidden by default)
    for (let i = 1; i <= 15; i++) {
        var subfolderItem = doc.createXULElement('menuitem');
        subfolderItem.id = 'id-zotfile-collection-subfolder-' + (i < 10 ? '0' + i : i);
        subfolderItem.setAttribute('hidden', 'true');
        subfolderItem.setAttribute('label', 'menu' + i);
        subfolderItem.setAttribute('oncommand', 'Zotero.ZotFile.Tablet.restrictTabletSearch(' + i + ');');
        restrictPopup.appendChild(subfolderItem);
    }
    
    restrictMenu.appendChild(restrictPopup);
    parentMenu.appendChild(restrictMenu);
    ZotFileMenuItems.push(restrictMenu);
}

function addZotFileToolsMenu(doc, parentMenu) {
    // Find the preferences menu item to insert after
    var prefsItem = doc.getElementById('menu_preferences');
    
    // Create transition menu item
    var transitionItem = doc.createXULElement('menuitem');
    transitionItem.id = 'zotfile-zotero7transition';
    transitionItem.setAttribute('label', 'ZotFile Transition to Zotero 7');
    transitionItem.setAttribute('oncommand', 'Zotero.ZotFile.zotero7transition();');
    
    if (prefsItem && prefsItem.nextSibling) {
        parentMenu.insertBefore(transitionItem, prefsItem.nextSibling);
    } else {
        parentMenu.appendChild(transitionItem);
    }
    ZotFileMenuItems.push(transitionItem);
    
    // Create options menu item
    var optionsItem = doc.createXULElement('menuitem');
    optionsItem.id = 'zotfile-options-tools';
    optionsItem.setAttribute('label', 'ZotFile Preferences...');
    optionsItem.setAttribute('oncommand', 'Zotero.ZotFile.openPreferenceWindow();');
    
    if (transitionItem.nextSibling) {
        parentMenu.insertBefore(optionsItem, transitionItem.nextSibling);
    } else {
        parentMenu.appendChild(optionsItem);
    }
    ZotFileMenuItems.push(optionsItem);
}

function addZotFileActionsMenu(doc, parentMenu) {
    // Find the preferences menu item to insert after
    var prefsItem = doc.getElementById('zotero-tb-actions-prefs');
    
    // Create options menu item
    var optionsItem = doc.createXULElement('menuitem');
    optionsItem.id = 'zotfile-options-actions';
    optionsItem.setAttribute('label', 'ZotFile Preferences...');
    optionsItem.setAttribute('oncommand', 'Zotero.ZotFile.openPreferenceWindow();');
    
    if (prefsItem && prefsItem.nextSibling) {
        parentMenu.insertBefore(optionsItem, prefsItem.nextSibling);
    } else {
        parentMenu.appendChild(optionsItem);
    }
    ZotFileMenuItems.push(optionsItem);
}

function removeMenuItems(window) {
    if (!window || !window.document) return;
    
    ZotFileMenuItems.forEach(item => {
        try {
            if (item && item.parentNode) {
                item.parentNode.removeChild(item);
            }
        } catch (e) {
            // Ignore errors when removing items
        }
    });
} 