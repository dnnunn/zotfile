/* global Components, Services */
"use strict";

if (typeof Zotero == "undefined") {
  var Zotero = Components.classes["@zotero.org/Zotero;1"]
    .getService(Components.interfaces.nsISupports).wrappedJSObject;
}

var chromeHandle;

async function startup({ id, version, resourceURI, rootURI = resourceURI.spec }) {
    await Zotero.uiReadyPromise;
    
    Zotero.debug("ZotFile: Starting up");

    // Register chrome package
    var aomStartup = Components.classes[
        "@mozilla.org/addons/addon-manager-startup;1"
    ].getService(Components.interfaces.amIAddonManagerStartup);
    var manifestURI = Services.io.newURI(rootURI + "manifest.json");
    chromeHandle = aomStartup.registerChrome(manifestURI, [
        ["content", "zotfile", rootURI + "chrome/content/zotfile/"],
        ["locale", "zotfile", "en-US", rootURI + "chrome/locale/en-US/"],
        ["locale", "zotfile", "de-DE", rootURI + "chrome/locale/de-DE/"],
        ["locale", "zotfile", "fr-FR", rootURI + "chrome/locale/fr-FR/"],
        ["locale", "zotfile", "it-IT", rootURI + "chrome/locale/it-IT/"]
    ]);

    // Load plugin code
    Services.scriptloader.loadSubScript(
        rootURI + "chrome/content/zotfile/include.js",
        {}
    );
    
    Zotero.debug("ZotFile: Initialized");
}

function shutdown() {
    Zotero.debug("ZotFile: Shutting down");
    
    // Clean up ZotFile
    if (Zotero.ZotFile) {
        if (Zotero.ZotFile.notifierID) {
            Zotero.Notifier.unregisterObserver(Zotero.ZotFile.notifierID);
            Zotero.ZotFile.notifierID = null;
        }
    }

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