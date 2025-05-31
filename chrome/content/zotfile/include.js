// Only create main object once
if (!Zotero.ZotFile) {
    var zotfileLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                    .getService(Components.interfaces.mozIJSSubScriptLoader);
    var scripts = ['zotfile', 'pdfAnnotations', 'pdfOutline', 'wildcards', 'tablet', 'utils', 'notifier', 'ui'];
    
    // Get the chrome://zotfile/ root URL to load scripts
    var chromeDir = 'chrome://zotfile/content/';
    scripts.forEach(s => zotfileLoader.loadSubScript(chromeDir + s + '.js'));
}

// Note: Window-specific initialization is now handled by bootstrap.js
// The menu items and event listeners are set up when each window loads
