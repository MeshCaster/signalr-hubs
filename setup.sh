#!/bin/bash

# CI/CD Setup Script for MeshCaster SignalR Package

set -e

echo "🚀 Setting up CI/CD for @meshcaster/signalr-hubs"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Create .github directory structure
echo "📁 Creating .github directory structure..."
mkdir -p .github/workflows

# Create CI workflow
echo "✅ Creating CI workflow..."
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Test & Build
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint --if-present

      - name: Type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test --if-present

      - name: Build package
        run: npm run build

      - name: Check build output
        run: |
          if [ ! -d "dist" ]; then
            echo "❌ Build failed"
            exit 1
          fi
          echo "✅ Build successful"

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        if: matrix.node-version == '20.x'
        with:
          name: dist
          path: dist/
          retention-days: 7
EOF

# Create Publish workflow
echo "✅ Creating Publish workflow..."
cat > .github/workflows/publish.yml << 'EOF'
name: Publish Package

on:
  release:
    types: [published]

jobs:
  publish:
    name: Publish to GitHub Packages
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@meshcaster'

      - run: npm ci
      - run: npm test --if-present
      - run: npm run build

      - name: Publish
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
EOF

# Create Version Bump workflow
echo "✅ Creating Version Bump workflow..."
cat > .github/workflows/version-bump.yml << 'EOF'
name: Version Bump

on:
  workflow_dispatch:
    inputs:
      version-type:
        description: 'Version bump type'
        required: true
        default: 'patch'
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  bump-version:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Bump version
        run: npm version ${{ github.event.inputs.version-type }}

      - name: Push changes
        run: |
          git push
          git push --tags
EOF

# Create Dependabot config
echo "✅ Creating Dependabot configuration..."
cat > .github/dependabot.yml << 'EOF'
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
EOF

# Update package.json scripts if needed
if ! grep -q '"lint"' package.json; then
    echo ""
    echo "⚠️  Note: Add these scripts to package.json:"
    echo ""
    echo -e "${YELLOW}  \"lint\": \"eslint src/**/*.{ts,tsx}\",${NC}"
    echo -e "${YELLOW}  \"lint:fix\": \"eslint src/**/*.{ts,tsx} --fix\",${NC}"
    echo -e "${YELLOW}  \"test\": \"echo \\\"No tests yet\\\" && exit 0\"${NC}"
    echo ""
fi

# Create ESLint config if it doesn't exist
if [ ! -f .eslintrc.json ]; then
    echo "✅ Creating ESLint configuration..."
    cat > .eslintrc.json << 'EOF'
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": ["@typescript-eslint"],
  "env": {
    "node": true,
    "es6": true
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
EOF
fi

# Check if ESLint is installed
if ! npm list eslint > /dev/null 2>&1; then
    echo ""
    echo "⚠️  ESLint not installed. Install with:"
    echo -e "${YELLOW}npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser${NC}"
    echo ""
fi

# Show status
echo ""
echo -e "${GREEN}✅ CI/CD setup complete!${NC}"
echo ""
echo "📁 Created files:"
echo "  ├── .github/"
echo "  │   ├── workflows/"
echo "  │   │   ├── ci.yml"
echo "  │   │   ├── publish.yml"
echo "  │   │   └── version-bump.yml"
echo "  │   └── dependabot.yml"
echo "  └── .eslintrc.json"
echo ""
echo "📝 Next steps:"
echo "  1. Review the workflow files"
echo "  2. Commit and push:"
echo "     git add .github/"
echo "     git commit -m 'ci: add CI/CD workflows'"
echo "     git push"
echo ""
echo "  3. To publish a new version:"
echo "     - Create a release on GitHub"
echo "     - Or run: gh release create v1.0.0"
echo ""
echo "🎉 Your CI/CD pipeline is ready!"