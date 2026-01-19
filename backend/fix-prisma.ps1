# fix-prisma.ps1 - Run as Administrator

Write-Host "🔧 Fixing Prisma permissions..." -ForegroundColor Yellow

# Navigate to backend directory
Set-Location "C:\Users\PC\GIT NOTIFICATION\customer-care-system\backend"

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Cyan

# 1. Kill all Node processes that might be using Prisma files
Write-Host "`n🛑 Stopping Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object { 
    $_.ProcessName -match 'node|npm|npx' -or 
    ($_.Modules -and $_.Modules.FileName -like '*prisma*') -or
    ($_.Modules -and $_.Modules.FileName -like '*query_engine*')
}

if ($nodeProcesses) {
    foreach ($process in $nodeProcesses) {
        Write-Host "   Stopping: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Gray
        try {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "   Warning: Could not stop $($process.ProcessName)" -ForegroundColor DarkYellow
        }
    }
    Start-Sleep -Seconds 3
} else {
    Write-Host "   No Node processes found" -ForegroundColor Green
}

# 2. Clear Prisma cache and lock files
Write-Host "`n🧹 Cleaning Prisma files..." -ForegroundColor Yellow
$pathsToRemove = @(
    "node_modules\.prisma",
    "node_modules\@prisma\client",
    "node_modules\prisma",
    "package-lock.json",
    "yarn.lock",
    ".prisma"
)

foreach ($path in $pathsToRemove) {
    if (Test-Path $path) {
        Write-Host "   Removing: $path" -ForegroundColor Gray
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "   Warning: Could not remove $path" -ForegroundColor DarkYellow
        }
    }
}

# 3. Take ownership of node_modules if needed
Write-Host "`n🔐 Taking ownership of node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    try {
        $acl = Get-Acl "node_modules"
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
        $acl.SetAccessRule($rule)
        Set-Acl "node_modules" $acl -ErrorAction SilentlyContinue
        Write-Host "   Ownership updated" -ForegroundColor Green
    } catch {
        Write-Host "   Note: Could not update ownership" -ForegroundColor Gray
    }
}

# 4. Reinstall dependencies
Write-Host "`n📦 Reinstalling dependencies..." -ForegroundColor Yellow
npm cache clean --force
npm install

# 5. Generate Prisma client
Write-Host "`n⚙️  Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# 6. Push schema to new database
Write-Host "`n🚀 Pushing schema to database..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss

# 7. Initialize database
Write-Host "`n🏁 Initializing database..." -ForegroundColor Yellow
if (Test-Path "init-database.js") {
    node init-database.js
} else {
    Write-Host "   init-database.js not found, creating admin manually..." -ForegroundColor Yellow
    
    # Create a temporary SQL file
    $sqlContent = @"
-- Create admin user if not exists
INSERT INTO users (id, email, password, name, role, "isVerified", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'admin@birdview.com',
    '\$2b\$10\$N9qo8uLOickgx2ZMRZoMy.Mrq1V1zHaiB.wfvvUOO2p5eC55Qr7Ca', -- admin123
    'System Administrator',
    'admin',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

SELECT '✅ Admin user created' as message;
"@
    
    # Save SQL to file
    $sqlContent | Out-File -FilePath "create_admin.sql" -Encoding UTF8
    
    # Execute SQL
    npx prisma db execute --file "create_admin.sql"
    
    # Clean up
    Remove-Item "create_admin.sql" -ErrorAction SilentlyContinue
}

Write-Host "`n✅ All done! You can now run: npm run start:dev" -ForegroundColor Green
Write-Host "🔗 Login with: admin@birdview.com / admin123" -ForegroundColor Cyan