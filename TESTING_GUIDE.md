# ZotFile for Zotero 7 - Testing Guide

## Installation

1. **Backup your Zotero data** before testing
2. **Remove any existing ZotFile installation**:
   - Go to Tools > Add-ons
   - Find ZotFile and click "Remove"
   - Restart Zotero
3. **Install the new version**:
   - Download: `zotfile-5.1.4-zotero7.xpi`
   - Go to Tools > Add-ons
   - Click gear icon > Install Add-on From File...
   - Select the XPI file
   - Restart Zotero

## Critical Test Cases

### 🔍 **1. Basic Loading & Integration**
- [ ] Plugin appears in Tools > Add-ons
- [ ] No error messages in Browser Console (Tools > Developer Tools > Browser Console)
- [ ] ZotFile menu items appear in item right-click context menu
- [ ] ZotFile options appear in collection right-click menu
- [ ] "ZotFile Preferences" accessible from Tools menu

### 📁 **2. File Attachment**
- [ ] "Attach New File" appears in item context menu
- [ ] Can attach file from source directory
- [ ] File appears as attachment in Zotero
- [ ] File is properly linked/copied based on settings

### 🔄 **3. File Renaming**
- [ ] "Rename Attachments" works on single file
- [ ] Batch rename works on multiple files
- [ ] Custom renaming format applies correctly
- [ ] Renaming rules work (authors, title, year)
- [ ] Special characters handled properly

### ⚙️ **4. Preferences**
- [ ] Preferences pane opens without errors
- [ ] Can set source folder and browse for directory
- [ ] Can set destination folder
- [ ] File type restrictions work
- [ ] Renaming format preview works
- [ ] Settings save and persist after restart

### 📱 **5. Tablet Features** (if used)
- [ ] Can enable tablet functionality
- [ ] Can set tablet folder location
- [ ] "Send to Tablet" works
- [ ] "Get from Tablet" works
- [ ] Modified file detection works
- [ ] Tablet status indicators show correctly

### 📑 **6. PDF Features**
- [ ] "Extract Annotations" works
- [ ] PDF annotations appear as Zotero notes
- [ ] "Get PDF Outline" works
- [ ] PDF processing doesn't crash

### 🌐 **7. Localization**
- [ ] Menu items display in correct language
- [ ] Preferences show in correct language
- [ ] Error messages localized

## Performance Tests

### 📊 **Large Libraries**
- [ ] Works with 1000+ items
- [ ] Batch operations complete without hanging
- [ ] Memory usage reasonable
- [ ] No significant slowdown in Zotero

### 🏃 **Speed Tests**
- [ ] Plugin startup is fast
- [ ] File operations complete in reasonable time
- [ ] UI remains responsive during operations

## Error Scenarios

### 🚨 **Error Handling**
- [ ] Graceful handling of missing source folder
- [ ] Proper error when destination folder not writable
- [ ] Good user feedback for failed operations
- [ ] No silent failures

### 🔧 **Edge Cases**
- [ ] Very long file names
- [ ] Files with special characters
- [ ] Duplicate file names
- [ ] Network drives (if applicable)
- [ ] Large PDF files (>100MB)

## Browser Console Monitoring

Monitor for these types of errors:
```javascript
// Good - These are expected
"ZotFile: Starting up"
"ZotFile: Installed"

// Bad - These indicate problems
"TypeError"
"ReferenceError" 
"Error loading"
"Permission denied"
```

## Common Issues & Solutions

### ❌ **Plugin doesn't load**
- Check Zotero version (must be 7.0+)
- Remove old ZotFile first
- Check Browser Console for errors

### ❌ **Menus don't appear**
- Restart Zotero completely
- Check if plugin is enabled in Add-ons

### ❌ **Preferences don't open**
- Check console for errors
- Try disabling other plugins

### ❌ **File operations fail**
- Check folder permissions
- Verify paths exist
- Check file locks

## Regression Testing

If updating from a working version:
- [ ] All previous functionality still works
- [ ] No new errors introduced
- [ ] Performance hasn't degraded
- [ ] User settings preserved

## Reporting Issues

When reporting issues, include:
1. Zotero version
2. Operating system
3. Steps to reproduce
4. Error messages from Browser Console
5. ZotFile settings (if relevant)

## Clean Uninstall (if needed)

1. Disable ZotFile in Add-ons
2. Remove plugin files
3. Restart Zotero
4. Clear any leftover preferences:
   - Go to Config Editor (Settings > Advanced > Config Editor)
   - Search for "zotfile"
   - Reset any remaining preferences

## Success Criteria

✅ **Plugin is ready for release when:**
- All critical test cases pass
- No errors in console during normal operation
- Performance is acceptable
- All user-facing features work as expected
- Proper error handling and user feedback
- Settings persist correctly

---

**Note**: This version is specifically for Zotero 7.x and will NOT work with Zotero 6. 