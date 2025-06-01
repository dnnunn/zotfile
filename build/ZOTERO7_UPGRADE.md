# ZotFile Upgrade for Zotero 7 Compatibility

This document outlines the changes made to upgrade ZotFile from Zotero 6 overlay-based architecture to Zotero 7 bootstrap-based architecture.

## Summary of Changes

### 1. Core Architecture Changes

- **Replaced `install.rdf` with `manifest.json`**: Modern WebExtension-style manifest
- **Replaced XUL overlays with `bootstrap.js`**: Bootstrapped plugin architecture
- **Removed `chrome.manifest`**: Using runtime chrome registration instead
- **Added `prefs.js`**: Default preferences in plugin root for Zotero 7

### 2. File Changes

#### New Files
- `manifest.json` - WebExtension-style manifest for Zotero 7
- `bootstrap.js` - Bootstrap plugin lifecycle management
- `prefs.js` - Default preferences for Zotero 7
- `update.json` - JSON update manifest (replaces RDF)
- `chrome/content/zotfile/preferences.xhtml` - Modern preferences pane
- `chrome/content/zotfile/preferences.js` - Preferences logic
- `chrome/content/zotfile/progressWindow.xhtml` - XHTML progress window
- `locale/en-US/zotfile.ftl` - Fluent localization

#### Removed Files
- `chrome/content/zotfile/overlay.xul` - No longer needed with bootstrap
- `chrome.manifest` - Using runtime registration
- `chrome/content/zotfile/progressWindow.xul` - Replaced with XHTML

#### Modified Files
- `chrome/content/zotfile/include.js` - Removed window event listeners (now in bootstrap)

### 3. Architecture Changes

#### From Overlay to Bootstrap
- **Old**: XUL overlays injected into existing windows
- **New**: Bootstrap lifecycle hooks with programmatic DOM manipulation

#### Menu Registration
- **Old**: Static XUL overlay definitions
- **New**: Dynamic menu creation in `onMainWindowLoad()`

#### Preference System
- **Old**: XUL prefwindow with `<preference>` tags
- **New**: Modern preference pane using `Zotero.PreferencePanes.register()`

#### Chrome Registration
- **Old**: Static `chrome.manifest` file
- **New**: Runtime registration using `aomStartup.registerChrome()`

### 4. Compatibility Notes

#### Zotero Version Support
- **Minimum**: Zotero 7.0.0
- **Maximum**: Zotero 7.*
- **Note**: This version is NOT compatible with Zotero 6

#### Key API Changes
- Uses `Zotero.uiReadyPromise` for proper initialization timing
- Uses `Components.classes` instead of `Cc` shorthand for compatibility
- Uses `Components.interfaces` instead of `Ci` shorthand for compatibility
- Proper async/await handling in startup function

### 5. Testing Requirements

Before deploying, ensure:
1. Plugin loads correctly in Zotero 7
2. All menu items appear and function
3. Preferences pane opens and saves settings
4. Core ZotFile functionality works (file attachment, renaming, tablet sync)
5. PDF annotation extraction works
6. No console errors during operation

### 6. Installation Notes

1. **Zotero 6 users**: Must remove old ZotFile version before upgrading to Zotero 7
2. **Settings migration**: User preferences should carry over automatically
3. **Tablet files**: Users with files on tablet should use the transition tool before upgrading

### 7. Development Notes

#### Bootstrap Lifecycle
- `startup()`: Initialize plugin, register chrome, load scripts, register preferences
- `shutdown()`: Clean up all resources, unregister components
- `onMainWindowLoad()`: Set up menus and event listeners for each window
- `onMainWindowUnload()`: Clean up window-specific resources

#### Error Handling
- All menu operations wrapped in try-catch blocks
- Graceful degradation if ZotFile objects not available
- Proper cleanup to prevent memory leaks

### 8. Future Considerations

- Consider migrating DTD/properties to Fluent localization completely
- Evaluate modern UI patterns for better Zotero 7 integration
- Consider using zotero-plugin-toolkit for enhanced functionality
- Monitor Mozilla platform changes for future Zotero updates

## Technical Implementation Details

### Bootstrap.js Structure
```javascript
// Lifecycle hooks
async function startup({ id, version, resourceURI, rootURI })
function shutdown()
function install()
function uninstall()

// Window hooks (Zotero 7)
function onMainWindowLoad({ window })
function onMainWindowUnload({ window })
```

### Chrome Registration
```javascript
chromeHandle = aomStartup.registerChrome(manifestURI, [
    ["content", "zotfile", rootURI + "chrome/content/zotfile/"],
    ["locale", "zotfile", "en-US", rootURI + "chrome/locale/en-US/"],
    // ... other registrations
]);
```

### Preferences Registration
```javascript
Zotero.PreferencePanes.register({
    pluginID: id,
    src: rootURI + 'chrome/content/zotfile/preferences.xhtml',
    label: 'ZotFile',
    image: rootURI + 'chrome/skin/default/zotfile/zotfile-48.png',
    scripts: [rootURI + 'chrome/content/zotfile/preferences.js']
});
```

This upgrade maintains all core ZotFile functionality while ensuring compatibility with Zotero 7's modern plugin architecture. 