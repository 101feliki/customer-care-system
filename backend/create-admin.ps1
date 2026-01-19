# create-admin.ps1 - Create admin user in database

Write-Host "👑 Creating admin user..." -ForegroundColor Cyan

# Check if bcrypt is available
try {
    $bcrypt = Get-Command node -ErrorAction Stop
    Write-Host "✅ Node.js is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Generate bcrypt hash for 'admin123'
Write-Host "`n🔑 Generating password hash..." -ForegroundColor Yellow
$hash = node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('admin123', 10));"
Write-Host "Hash generated: $hash" -ForegroundColor Gray

# Create SQL file
Write-Host "`n📝 Creating SQL script..." -ForegroundColor Yellow
$sqlContent = @"
-- Create admin user if not exists
INSERT INTO users (
    id, 
    email, 
    password, 
    name, 
    role, 
    "isVerified", 
    "createdAt", 
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    'admin@birdview.com',
    '$hash',
    'System Administrator',
    'admin',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify user was created
SELECT '✅ Admin user created/verified' as status, 
       email, 
       name, 
       role,
       "isVerified"
FROM users 
WHERE email = 'admin@birdview.com';
"@

# Save SQL to file
$sqlContent | Out-File -FilePath "create_admin.sql" -Encoding UTF8
Write-Host "✅ SQL file created: create_admin.sql" -ForegroundColor Green

# Execute SQL
Write-Host "`n🚀 Executing SQL..." -ForegroundColor Yellow
npx prisma db execute --file "create_admin.sql"

# Clean up
Remove-Item "create_admin.sql" -ErrorAction SilentlyContinue
Write-Host "`n🧹 Cleaned up temporary files" -ForegroundColor Gray

Write-Host "`n✅ Done! You can now login with:" -ForegroundColor Green
Write-Host "   📧 Email: admin@birdview.com" -ForegroundColor Cyan
Write-Host "   🔑 Password: admin123" -ForegroundColor Cyan
Write-Host "`n🔗 Login URL: http://localhost:5173/login" -ForegroundColor Yellow