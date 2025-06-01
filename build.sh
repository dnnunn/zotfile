#!/bin/bash

# ZotFile Build Script for Zotero 7
# Creates an XPI package ready for installation

set -e  # Exit on any error

# Configuration
PLUGIN_NAME="zotfile"
VERSION="5.1.4-zotero7"
BUILD_DIR="build"
XPI_NAME="${PLUGIN_NAME}-${VERSION}.xpi"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔨 Building ZotFile for Zotero 7${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo ""

# Clean previous build
if [ -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
    rm -rf "$BUILD_DIR"
fi

# Create build directory
echo -e "${YELLOW}📁 Creating build directory...${NC}"
mkdir -p "$BUILD_DIR"

# Copy files to build directory
echo -e "${YELLOW}📋 Copying plugin files...${NC}"

# Core files
cp manifest.json "$BUILD_DIR/"
cp bootstrap.js "$BUILD_DIR/"
cp prefs.js "$BUILD_DIR/"
cp update.json "$BUILD_DIR/"

# Chrome directory (content, skin, locale)
cp -r chrome "$BUILD_DIR/"

# Locale directory
cp -r locale "$BUILD_DIR/"

# Documentation (optional, but good to include)
cp readme.md "$BUILD_DIR/"
cp ZOTERO7_UPGRADE.md "$BUILD_DIR/"

# List files being included
echo -e "${BLUE}📦 Files included in build:${NC}"
find "$BUILD_DIR" -type f | sort

echo ""
echo -e "${YELLOW}🔧 Creating XPI package...${NC}"

# Create XPI (which is just a ZIP file)
cd "$BUILD_DIR"
zip -r "../$XPI_NAME" . -x "*.DS_Store" "*.git*" "*~" "*.bak"
cd ..

# Verify the package
if [ -f "$XPI_NAME" ]; then
    SIZE=$(du -h "$XPI_NAME" | cut -f1)
    echo -e "${GREEN}✅ Successfully created: $XPI_NAME ($SIZE)${NC}"
    echo ""
    echo -e "${BLUE}📋 Package contents:${NC}"
    unzip -l "$XPI_NAME" | head -20
    echo ""
    echo -e "${GREEN}🎉 Build complete!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Installation Instructions:${NC}"
    echo "1. Open Zotero 7"
    echo "2. Go to Tools > Add-ons"
    echo "3. Click the gear icon > Install Add-on From File..."
    echo "4. Select: $(pwd)/$XPI_NAME"
    echo "5. Restart Zotero"
    echo ""
    echo -e "${YELLOW}🧪 Testing Checklist:${NC}"
    echo "- ✓ Plugin loads without errors"
    echo "- ✓ ZotFile menu appears in right-click context menu"
    echo "- ✓ ZotFile preferences accessible via Tools > Add-ons"
    echo "- ✓ File attachment functionality works"
    echo "- ✓ Rename attachments works"
    echo "- ✓ PDF annotation extraction works (if applicable)"
    echo "- ✓ Tablet sync functionality works (if used)"
    echo ""
    echo -e "${RED}⚠️  Important:${NC}"
    echo "- This version is ONLY for Zotero 7.x"
    echo "- Remove any existing ZotFile installation first"
    echo "- Test thoroughly before deploying to users"
else
    echo -e "${RED}❌ Build failed - XPI file not created${NC}"
    exit 1
fi 