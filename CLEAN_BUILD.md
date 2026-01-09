# Fixing Next.js Build Cache Issues

If you encounter module not found errors like:
- `Cannot find module './chunks/vendor-chunks/next.js'`
- `Cannot find module 'D:\...\.next\server\pages\sessions.js'`

Follow these steps:

## Quick Fix (Recommended)

1. **Stop the development server** (Ctrl+C)

2. **Delete the .next folder**:
   ```powershell
   Remove-Item -Path ".next" -Recurse -Force
   ```

3. **Restart the development server**:
   ```powershell
   npm run dev
   ```

## Complete Clean (If above doesn't work)

1. **Stop the development server**

2. **Delete build artifacts**:
   ```powershell
   Remove-Item -Path ".next" -Recurse -Force
   Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
   ```

3. **Restart the server**:
   ```powershell
   npm run dev
   ```

## Why This Happens

These errors typically occur when:
- The `.next` build cache becomes corrupted
- Files are modified while the dev server is running
- There's a mismatch between source files and compiled output
- The build process is interrupted

The `.next` folder contains compiled Next.js output and can be safely deleted - it will be regenerated on the next build/run.
