# Sprawdź, czy Docker jest zainstalowany
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Output "Docker nie jest zainstalowany. Instalowanie Docker Desktop..."
    Invoke-WebRequest -Uri "https://desktop.docker.com/win/stable/Docker%20Desktop%20Installer.exe" -OutFile "DockerDesktopInstaller.exe"
    Start-Process -FilePath "DockerDesktopInstaller.exe" -ArgumentList "/quiet" -Wait
    Remove-Item "DockerDesktopInstaller.exe"
}

# Sprawdź, czy Docker Compose jest zainstalowany
$dockerComposeInstalled = Get-Command docker-compose -ErrorAction SilentlyContinue
if (-not $dockerComposeInstalled) {
    Write-Output "Docker Compose nie jest zainstalowany. Instalowanie Docker Compose..."
    Invoke-WebRequest -Uri "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-Windows-x86_64.exe" -OutFile "$Env:ProgramFiles\Docker\docker-compose.exe"
}

# Sprawdź, czy Git jest zainstalowany
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Output "Git nie jest zainstalowany. Instalowanie Git..."
    Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.33.0.windows.1/Git-2.33.0-64-bit.exe" -OutFile "GitInstaller.exe"
    Start-Process -FilePath "GitInstaller.exe" -ArgumentList "/VERYSILENT" -Wait
    Remove-Item "GitInstaller.exe"
}

# Sprawdź, czy aplikacja jest już pobrana
$repoUrl = "https://github.com/yourusername/your-repo.git"
$localPath = "$PSScriptRoot\app"
if (-not (Test-Path $localPath)) {
    Write-Output "Pobieranie aplikacji z GitHub..."
    git clone $repoUrl $localPath
}

# Przejdź do katalogu aplikacji
Set-Location $localPath

# Uruchom kontenery Docker
Write-Output "Uruchamianie kontenerów Docker..."
docker-compose up -d

# Sprawdź, czy kontenery są uruchomione
$containersRunning = docker ps -q
if (-not $containersRunning) {
    Write-Output "Kontenery Docker nie są uruchomione. Uruchamianie kontenerów..."
    docker-compose up -d
}

# Otwórz przeglądarkę z adresem localhost:3000
Start-Process "http://localhost:3000"