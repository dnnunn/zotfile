# ZotFile Makefile for Zotero 7
# Updated for bootstrap architecture

PLUGIN_NAME = zotfile
VERSION = 5.1.4-zotero7
XPI_NAME = $(PLUGIN_NAME)-$(VERSION).xpi
BUILD_DIR = build

# Source files for the plugin
CORE_FILES = manifest.json bootstrap.js prefs.js update.json
DIRS = chrome locale
DOCS = readme.md ZOTERO7_UPGRADE.md

.PHONY: all clean build install test help

# Default target
all: build

help:
	@echo "ZotFile Build System for Zotero 7"
	@echo ""
	@echo "Available targets:"
	@echo "  build     - Create XPI package"
	@echo "  clean     - Remove build artifacts"
	@echo "  install   - Build and show installation instructions"
	@echo "  test      - Build and show testing checklist"
	@echo "  help      - Show this help message"
	@echo ""
	@echo "Output: $(XPI_NAME)"

build: clean
	@echo "🔨 Building ZotFile $(VERSION) for Zotero 7..."
	@mkdir -p $(BUILD_DIR)
	
	@echo "📋 Copying core files..."
	@cp $(CORE_FILES) $(BUILD_DIR)/
	
	@echo "📁 Copying directories..."
	@cp -r $(DIRS) $(BUILD_DIR)/
	
	@echo "📚 Copying documentation..."
	@cp $(DOCS) $(BUILD_DIR)/
	
	@echo "📦 Creating XPI package..."
	@cd $(BUILD_DIR) && zip -r ../$(XPI_NAME) . -x "*.DS_Store" "*.git*" "*~" "*.bak"
	
	@echo "✅ Build complete: $(XPI_NAME)"
	@ls -lh $(XPI_NAME)

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)
	@rm -f *.xpi

install: build
	@echo ""
	@echo "📝 Installation Instructions:"
	@echo "1. Open Zotero 7"
	@echo "2. Go to Tools > Add-ons"
	@echo "3. Click the gear icon > Install Add-on From File..."
	@echo "4. Select: $$(pwd)/$(XPI_NAME)"
	@echo "5. Restart Zotero"
	@echo ""
	@echo "⚠️  Remove any existing ZotFile installation first!"

test: build
	@echo ""
	@echo "🧪 Testing Checklist for $(XPI_NAME):"
	@echo ""
	@echo "Basic Functionality:"
	@echo "  [ ] Plugin loads without errors in Zotero 7"
	@echo "  [ ] No console errors during startup"
	@echo "  [ ] ZotFile appears in Tools > Add-ons"
	@echo ""
	@echo "Menu Integration:"
	@echo "  [ ] Right-click item menu shows ZotFile options"
	@echo "  [ ] 'Attach New File' option appears"
	@echo "  [ ] 'Manage Attachments' submenu appears"
	@echo "  [ ] Collection context menu shows tablet options"
	@echo ""
	@echo "Preferences:"
	@echo "  [ ] ZotFile preferences pane opens from Add-ons"
	@echo "  [ ] Settings can be modified and saved"
	@echo "  [ ] Folder selection dialogs work"
	@echo ""
	@echo "Core Features:"
	@echo "  [ ] File attachment from source directory"
	@echo "  [ ] Automatic file renaming"
	@echo "  [ ] PDF annotation extraction"
	@echo "  [ ] Tablet sync (if enabled)"
	@echo ""
	@echo "Error Handling:"
	@echo "  [ ] Graceful handling of missing files"
	@echo "  [ ] Proper error messages to user"
	@echo "  [ ] No crashes during heavy usage"

# Legacy target for backward compatibility
zotfile.xpi: build

# Development helpers
debug: build
	@echo "📋 Package contents:"
	@unzip -l $(XPI_NAME)

validate: build
	@echo "🔍 Validating package structure..."
	@unzip -t $(XPI_NAME) > /dev/null && echo "✅ Package structure valid" || echo "❌ Package corrupted"
	@test -f $(BUILD_DIR)/manifest.json && echo "✅ manifest.json present" || echo "❌ manifest.json missing"
	@test -f $(BUILD_DIR)/bootstrap.js && echo "✅ bootstrap.js present" || echo "❌ bootstrap.js missing"
	@test -f $(BUILD_DIR)/prefs.js && echo "✅ prefs.js present" || echo "❌ prefs.js missing"
