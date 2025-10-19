#!/usr/bin/env node

/**
 * Fix Auth Imports Script
 * Updates all components to use useSimpleAuth instead of useAuth
 */

const fs = require('fs');
const path = require('path');

// Files that need to be updated
const filesToUpdate = [
  'src/components/forms/MdrForm.tsx',
  'src/components/forms/ClabsiForm.tsx',
  'src/components/forms/CautiForm.tsx',
  'src/components/admin/UserManagement.tsx',
  'src/components/forms/ClabsiBundleForm.tsx',
  'src/components/profile/ProfileSection.tsx',
  'src/components/layout/DashboardLayout.tsx'
];

function updateAuthImports() {
  console.log('🔧 Updating auth imports in all components...\n');

  for (const filePath of filesToUpdate) {
    const fullPath = path.join(__dirname, '..', filePath);

    try {
      if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Replace the import statement
        const oldImport = "import { useAuth } from '@/components/auth/AuthProvider'";
        const newImport = "import { useSimpleAuth } from '@/components/auth/SimpleAuthProvider'";

        if (content.includes(oldImport)) {
          content = content.replace(oldImport, newImport);
          console.log(`✅ Updated import in: ${filePath}`);
        }

        // Replace useAuth calls with useSimpleAuth
        const oldHook = /const\s*{\s*([^}]+)\s*}\s*=\s*useAuth\(\)/g;
        content = content.replace(oldHook, 'const { $1 } = useSimpleAuth()');

        // Write the updated content back
        fs.writeFileSync(fullPath, content, 'utf8');

      } else {
        console.log(`⚠️  File not found: ${filePath}`);
      }
    } catch (error) {
      console.log(`❌ Error updating ${filePath}: ${error.message}`);
    }
  }

  console.log('\n🎉 Auth import updates complete!');
  console.log('All components should now use the new SimpleAuth system.');
}

updateAuthImports();