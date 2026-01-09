# Seed data script for Windows PowerShell
# Make sure dev server is running first: npm run dev

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/dev/seed" -Method POST -ContentType "application/json"

Write-Host $response.Content
