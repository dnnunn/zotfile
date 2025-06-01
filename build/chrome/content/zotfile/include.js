// Minimal ZotFile loader following working plugin pattern
if (!Zotero.ZotFile) {
    Zotero.ZotFile = {
        id: "zotfile@columbia.edu",
        name: "ZotFile",
        version: "5.1.4",
        initialized: false
    };

    (async function() {
        if (Zotero.ZotFile.initialized) {
            return;
        }
        
        Zotero.debug("ZotFile: Starting minimal initialization");
        
        // Basic initialization - create simple renaming functionality
        Zotero.ZotFile.initialized = true;
        Zotero.ZotFile.getPref = function(pref) {
            // Return safe defaults to avoid JSON errors
            if (pref === "wildcards.default") return "{}";
            if (pref === "wildcards.user") return "{}";
            return "";
        };
        
        // Simple attachment renaming function
        Zotero.ZotFile.renameSelectedAttachments = async function() {
            const ZP = Zotero.getActiveZoteroPane();
            const items = ZP.getSelectedItems();
            let attachmentCount = 0;
            let pdfCount = 0;
            let processedAttachments = [];
            
            Zotero.debug("ZotFile: Checking " + items.length + " selected items");
            
            for (const item of items) {
                Zotero.debug("ZotFile: Item " + item.id + " isAttachment: " + item.isAttachment() + " contentType: " + (item.isAttachment() ? item.attachmentContentType : 'N/A'));
                
                if (item.isAttachment()) {
                    // Direct attachment selection
                    attachmentCount++;
                    if (item.attachmentContentType === 'application/pdf') {
                        pdfCount++;
                        processedAttachments.push(item);
                    }
                } else {
                    // Parent item - check for child attachments
                    const childItems = item.getAttachments();
                    Zotero.debug("ZotFile: Parent item " + item.id + " has " + childItems.length + " child attachments");
                    
                    for (const childID of childItems) {
                        const childItem = Zotero.Items.get(childID);
                        if (childItem && childItem.isAttachment()) {
                            attachmentCount++;
                            Zotero.debug("ZotFile: Child attachment " + childID + " contentType: " + childItem.attachmentContentType);
                            if (childItem.attachmentContentType === 'application/pdf') {
                                pdfCount++;
                                processedAttachments.push(childItem);
                            }
                        }
                    }
                }
            }
            
            // Process the found PDF attachments
            for (const attachment of processedAttachments) {
                try {
                    const parentItem = attachment.parentItemID ? Zotero.Items.get(attachment.parentItemID) : null;
                    const title = parentItem ? parentItem.getField('title') : 'Untitled';
                    const cleanTitle = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
                    const newFilename = cleanTitle.substring(0, 50) + '.pdf';
                    
                    Zotero.debug(`ZotFile: Would rename ${attachment.attachmentFilename} to ${newFilename}`);
                } catch (e) {
                    Zotero.debug(`ZotFile: Error processing attachment: ${e}`);
                }
            }
            
            Services.prompt.alert(
                null, 
                "ZotFile", 
                `Found ${attachmentCount} attachments (${pdfCount} PDFs) in ${items.length} selected items.\n\nNote: This is a minimal version. Full rename functionality requires completing Zotero 7 migration.`
            );
        };
        
        // Simple annotation extraction placeholder
        Zotero.ZotFile.extractAnnotations = async function() {
            Services.prompt.alert(
                null, 
                "ZotFile", 
                "Annotation extraction temporarily disabled. Full functionality requires fixing Zotero.Browser deprecation."
            );
        };
        
        // Simple preferences function
        Zotero.ZotFile.openPreferences = function() {
            Services.prompt.alert(
                null, 
                "ZotFile", 
                "ZotFile preferences temporarily disabled. Working on Zotero 7 compatibility."
            );
        };
        
        // Create menu integration like working plugin
        const doc = Zotero.getMainWindow().document;
        
        // Clean up any old menu items first
        const oldItems = ['zotfile-menu-separator', 'zotfile-rename-menu', 'zotfile-extract-menu', 'zotfile-tablet-menu', 'zotfile-tools-menu'];
        oldItems.forEach(id => {
            const oldItem = doc.getElementById(id);
            if (oldItem) {
                oldItem.remove();
                Zotero.debug("ZotFile: Removed old menu item: " + id);
            }
        });
        
        const itemMenu = doc.getElementById('zotero-itemmenu');
        if (itemMenu && !doc.getElementById('zotfile-menu-separator')) {
            // Add separator
            const separator = doc.createXULElement('menuseparator');
            separator.id = 'zotfile-menu-separator';
            itemMenu.appendChild(separator);
            
            // Add ZotFile rename menu item
            const renameItem = doc.createXULElement('menuitem');
            renameItem.id = 'zotfile-rename-menu';
            renameItem.setAttribute('label', 'ZotFile: Rename Attachments (Basic)');
            renameItem.setAttribute('oncommand', 'Zotero.ZotFile.renameSelectedAttachments();');
            itemMenu.appendChild(renameItem);
            
            // Add extract annotations item
            const extractItem = doc.createXULElement('menuitem');
            extractItem.id = 'zotfile-extract-menu';
            extractItem.setAttribute('label', 'ZotFile: Extract Annotations (Disabled)');
            extractItem.setAttribute('oncommand', 'Zotero.ZotFile.extractAnnotations();');
            itemMenu.appendChild(extractItem);
        }
        
        // Add to Tools menu
        const toolsMenu = doc.getElementById('menu_ToolsPopup');
        if (toolsMenu && !doc.getElementById('zotfile-tools-menu')) {
            const toolsItem = doc.createXULElement('menuitem');
            toolsItem.id = 'zotfile-tools-menu';
            toolsItem.setAttribute('label', 'ZotFile Preferences (Disabled)');
            toolsItem.setAttribute('oncommand', 'Zotero.ZotFile.openPreferences();');
            toolsMenu.appendChild(toolsItem);
        }
        
        Zotero.debug("ZotFile: Minimal initialization completed");
    })();
}