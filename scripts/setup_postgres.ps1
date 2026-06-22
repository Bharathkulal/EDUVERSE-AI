# PowerShell helper to run the DB setup SQL using psql if available
# Usage: Open PowerShell as an admin (or a user with psql in PATH) and run:
# .\scripts\setup_postgres.ps1

function ExitWith($msg){ Write-Host $msg -ForegroundColor Red; exit 1 }

# Check for psql
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  ExitWith "psql not found in PATH. Install PostgreSQL or add psql to PATH and retry. See https://www.postgresql.org/download/windows/"
}

# Defaults
$adminUser = Read-Host "Postgres superuser (default: postgres)"
if (-not $adminUser) { $adminUser = 'postgres' }
$confirm = Read-Host "This will run backend/setup_db.sql on localhost as user '$adminUser'. Continue? (y/N)"
if ($confirm.ToLower() -ne 'y') { ExitWith "Aborted by user." }

# Ask for admin password (optional) — if left blank psql will prompt
$adminPass = Read-Host -AsSecureString "Password for $adminUser (leave blank to be prompted by psql)"
$env:PGPASSWORD = $null
if ($adminPass.Length -gt 0) {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPass)
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  $env:PGPASSWORD = $plain
}

# Run the SQL
Write-Host "Running backend/setup_db.sql as user $adminUser against localhost..." -ForegroundColor Yellow
& psql -U $adminUser -h localhost -f backend/setup_db.sql

if ($LASTEXITCODE -ne 0) { ExitWith "psql returned exit code $LASTEXITCODE. Check output above for errors." }
Write-Host "Database setup complete. Update backend/.env to use the new connection string if needed." -ForegroundColor Green
