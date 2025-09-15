
## ArduinoCli assignment verwijderd, gebruik alleen $ArduinoCli variabele hieronder
# Controleer beschikbare boards en versies

$boards = & "C:\Users\reven\Documents\Arduino\arduino-cli\arduino-cli.exe" board listall
#Write-Host $boards
# Board type (Heltec WiFi LoRa 32 V3)
# $FQBN = "esp32:esp32:heltec_wifi_lora_32_S3"
$FQBN = "Heltec-esp32:esp32:heltec_wifi_lora_32_V3"

# Controleer of $FQBN in de beschikbare boards zit
$fqbnFound = $false
foreach ($line in $boards) {
    if ($line -match $FQBN) {
        $fqbnFound = $true
        break
    }
}
if ($fqbnFound) {
    Write-Host "Board $FQBN gevonden in beschikbare boards."
} else {
    Write-Host "WAARSCHUWING: Board $FQBN NIET gevonden in beschikbare boards!"
}


# Controleer geinstalleerde libraries
Write-Host "Geinstalleerde Arduino libraries:" 
$libs = & "C:\Users\reven\Documents\Arduino\arduino-cli\arduino-cli.exe" lib list
Write-Host $libs

# Controleer of alle includes uit de hoofdsketch in de libraries zitten
if ($inoFile) {
    $inoContent = Get-Content $inoFile.FullName
    $includeLines = $inoContent | Select-String -Pattern "^#include" | ForEach-Object { $_.Line }
    $missingLibs = @()
    foreach ($inc in $includeLines) {
        if ($inc -match '#include\s+[<"]([^>"]+)[>"]') {
            $header = $matches[1]
            $found = $false
            foreach ($lib in $libs) {
                if ($lib -match $header) {
                    $found = $true
                    break
                }
            }
            if (-not $found) {
                $missingLibs += $header
            }
        }
    }
    if ($missingLibs.Count -gt 0) {
        Write-Host "FOUT: De volgende includes ontbreken in de geïnstalleerde libraries:"
        foreach ($m in $missingLibs) { Write-Host "  $m" }
        Write-Host "Installeer de ontbrekende libraries en probeer opnieuw."
    }
}

# Controleer of setup() en loop() bestaan in hoofdsketch
$inoFile = Get-ChildItem -Path $ProjectDir -Filter "*.ino" | Select-Object -First 1
if ($inoFile) {
    $inoContent = Get-Content $inoFile.FullName
    if ($inoContent -match 'void\s+setup\s*\(') {
        Write-Host "setup() gevonden in $($inoFile.Name)"
    } else {
        Write-Host "setup() NIET gevonden in $($inoFile.Name)"
    }
    if ($inoContent -match 'void\s+loop\s*\(') {
        Write-Host "loop() gevonden in $($inoFile.Name)"
    } else {
        Write-Host "loop() NIET gevonden in $($inoFile.Name)"
    }
} else {
    Write-Host "Geen .ino bestand gevonden in $ProjectDir"
}
# build.ps1 - Compile Arduino project to .bin, flash Heltec WiFi LoRa 32 V3, en open seriele monitor

# Pad naar arduino-cli.exe (pas aan indien nodig)
$ArduinoCli = "C:\Users\reven\Documents\Arduino\arduino-cli\arduino-cli.exe"

# Projectmap
$ProjectDir = "C:\Users\reven\Documents\Arduino\radio"

# Buildmap
$BuildDir = "$ProjectDir\build"

# Zoek beschikbare COM-poort (COM3, COM4, COM5)
$Port = $null
foreach ($tryPort in @("COM3", "COM4", "COM5")) {
    if (Get-WmiObject Win32_SerialPort | Where-Object { $_.DeviceID -eq $tryPort }) {
        $Port = $tryPort
        break
    }
}

# Baudrate seriële monitor
$Baud = 115200

Write-Host "Compileren van project in $ProjectDir ..."
$compileCmd = "$ArduinoCli compile --fqbn $FQBN --output-dir $BuildDir $ProjectDir"
Write-Host "[build.ps1] Compile commando: $compileCmd"
$process = Start-Process -FilePath $ArduinoCli -ArgumentList @("compile", "--fqbn", $FQBN, "--output-dir", $BuildDir, $ProjectDir) -NoNewWindow -RedirectStandardOutput "$BuildDir\compile.log" -RedirectStandardError "$BuildDir\compile.err" -PassThru
$process.WaitForExit()
Write-Host "[build.ps1] Compile-uitvoer:"
if (Test-Path "$BuildDir\compile.log") {
    Get-Content "$BuildDir\compile.log" | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "compile.log niet gevonden."
}
if (Test-Path "$BuildDir\compile.err") {
    Write-Host "[build.ps1] Compile-fouten:"
    Get-Content "$BuildDir\compile.err" | ForEach-Object { Write-Host $_ }
}

if ($LASTEXITCODE -eq 0) {
    # Maak de buildmap aan als deze niet bestaat
    if (!(Test-Path $BuildDir)) {
        New-Item -ItemType Directory -Path $BuildDir | Out-Null
    }
    # Toon alle .bin-bestanden in de buildmap
    $BinFiles = Get-ChildItem -Path $BuildDir -Filter "*.bin" | Sort-Object LastWriteTime -Descending
    Write-Host "Gevonden .bin-bestanden in ${BuildDir}:"
    foreach ($file in $BinFiles) {
        Write-Host "  $($file.Name) ($($file.LastWriteTime))"
    }

    # Gebruik radio.ino.bin als firmware
    $BinFile = $BinFiles | Where-Object { $_.Name -eq "radio.ino.bin" } | Select-Object -First 1

    if ($BinFile) {
        mkdir -Force -p "$ProjectDir\bin"
        $TargetFile = "$ProjectDir\bin\firmware.bin"
    Copy-Item -Path $BinFile.FullName -Destination $TargetFile -Force
    Write-Host "Build gelukt!"
    Write-Host "radio.ino.bin gekopieerd naar $TargetFile"

    if ($Port) {
        # Flashen met esptool.py
        Write-Host "Flashen naar $Port ..."
        # Flash alle relevante .bin bestanden voor ESP32-S3
        $Bootloader = "$BuildDir\radio.ino.bootloader.bin"
        $Partitions = "$BuildDir\radio.ino.partitions.bin"
        $Firmware   = "$BuildDir\radio.ino.bin"
        if (Test-Path $Bootloader -and Test-Path $Partitions -and Test-Path $Firmware) {
            Write-Host "Flashen van bootloader, partitions en firmware..."
            python -m esptool --chip esp32s3 --port $Port --baud 115200 write_flash -z 0x0 $Bootloader 0x8000 $Partitions 0x10000 $Firmware
        } else {
            Write-Host "Niet alle benodigde .bin bestanden gevonden. Flash alleen firmware.bin."
            python -m esptool --chip esp32s3 --port $Port --baud 115200 write_flash -z 0x0 $TargetFile
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Host "Flash succesvol afgerond!"
            # Seriële monitor starten
            Write-Host "Starten van seriele monitor op $Port met $Baud baud..."
            python -m serial.tools.miniterm $Port $Baud
        } else {
            Write-Host "Flashen mislukt"
            Write-Host "Seriële monitor wordt niet gestart."
        }
    } else {
        Write-Host "Geen ESP32 COM-poort gevonden (COM3, COM4, COM5). Upload wordt overgeslagen."
    }
    } else {
    Write-Host "Geen .bin bestand gevonden in $BuildDir"
    }
} else {
    Write-Host "Compilatie mislukt"
    if (Test-Path "$BuildDir\compile.err") {
        $errContent = Get-Content "$BuildDir\compile.err"
        if ($errContent) {
            Write-Host "Inhoud van compile.err:"
            $errContent | ForEach-Object { Write-Host $_ }
        } else {
            Write-Host "compile.err is leeg. Controleer compile.log voor meer details."
            # Zoek naar veelvoorkomende foutmeldingen in compile.log
            $logContent = Get-Content "$BuildDir\compile.log"
            $errorLines = $logContent | Select-String -Pattern "error|undefined|fatal|failed|missing|not found|cannot|no such" -CaseSensitive
            if ($errorLines) {
                Write-Host "Automatisch gevonden foutregels in compile.log:"
                $errorLines | ForEach-Object { Write-Host $_ }
            } else {
                Write-Host "Geen duidelijke foutregels gevonden in compile.log."
            }
        }
    }
}
