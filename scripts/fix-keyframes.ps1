<#
.SYNOPSIS
    Re-encodes videos that have only a single keyframe (at t=0) so they become
    seekable in the browser player. Fixed copies are written to an "output"
    subfolder using the SAME filename; originals are never modified.

.DESCRIPTION
    Some downloaded files are encoded with an effectively infinite GOP (one
    keyframe at the start). The browser can only begin decoding at a keyframe,
    so every seek resolves back to t=0 and the player freezes. The only fix is
    to re-encode the video track with regularly spaced keyframes. Audio is
    stream-copied (no quality loss).

    For each video directly inside -InputDir (non-recursive), the script:
      1. Counts keyframes in the first 30s (skipped when -Force).
      2. Re-encodes only files with <= 1 keyframe (unless -Force).
      3. Preserves the source codec family (H.264 -> libx264, HEVC -> libx265).
      4. Writes <InputDir>\output\<same-name> and verifies the result.

.PARAMETER InputDir
    Folder containing the videos to fix. Defaults to the current directory.

.PARAMETER Crf
    Quality (lower = better/larger). 18-23 is the useful range. Default 20.

.PARAMETER Preset
    x264/x265 speed-vs-size preset. Default "medium".

.PARAMETER KeyframeInterval
    Seconds between forced keyframes. Default 2.

.PARAMETER Force
    Re-encode every file regardless of its current keyframe count.

.PARAMETER Overwrite
    Overwrite an existing fixed copy in the output folder (default: skip it).

.EXAMPLE
    .\fix-keyframes.ps1 -InputDir "D:\Videos\thatsite"
#>
[CmdletBinding()]
param(
    [string]$InputDir = (Get-Location).Path,
    [int]$Crf = 20,
    [string]$Preset = "medium",
    [double]$KeyframeInterval = 2,
    [switch]$Force,
    [switch]$Overwrite
)

$ErrorActionPreference = "Stop"

# --- Preflight -------------------------------------------------------------
foreach ($tool in @("ffmpeg", "ffprobe")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Error "'$tool' was not found on PATH. Install ffmpeg and try again."
        exit 1
    }
}

if (-not (Test-Path -LiteralPath $InputDir -PathType Container)) {
    Write-Error "Input folder not found: $InputDir"
    exit 1
}
$InputDir = (Resolve-Path -LiteralPath $InputDir).Path

# "output" folder lives inside the containing folder; create if missing.
$OutputDir = Join-Path $InputDir "output"
if (-not (Test-Path -LiteralPath $OutputDir -PathType Container)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "Created output folder: $OutputDir"
}

$videoExtensions = @(".mp4", ".mkv", ".mov", ".m4v", ".webm", ".avi", ".wmv", ".ts", ".flv")

# --- Helpers ---------------------------------------------------------------

# Count keyframes within the first 30s of the video stream. Fast because
# -skip_frame nokey avoids decoding non-key frames.
function Get-KeyframeCount {
    param([string]$Path)
    $out = & ffprobe -loglevel error -select_streams v:0 -skip_frame nokey `
        -show_entries frame=pts_time -of csv=p=0 -read_intervals "%+30" -- "$Path"
    if (-not $out) { return 0 }
    return (@($out | Where-Object { $_.Trim() -ne "" })).Count
}

function Get-VideoCodec {
    param([string]$Path)
    $codec = & ffprobe -v error -select_streams v:0 `
        -show_entries stream=codec_name -of csv=p=0 -- "$Path"
    if ($codec) { return $codec.Trim() } else { return "" }
}

# --- Main ------------------------------------------------------------------
$files = Get-ChildItem -LiteralPath $InputDir -File |
    Where-Object { $videoExtensions -contains $_.Extension.ToLower() } |
    Sort-Object Name

if ($files.Count -eq 0) {
    Write-Host "No video files found in: $InputDir"
    exit 0
}

Write-Host ""
Write-Host "Input folder : $InputDir"
Write-Host "Output folder: $OutputDir"
Write-Host "Files found  : $($files.Count)"
Write-Host ("-" * 60)

$fixed = 0; $skipped = 0; $failed = 0

foreach ($file in $files) {
    $name = $file.Name
    $outPath = Join-Path $OutputDir $name

    Write-Host ""
    Write-Host "=> $name"

    if ((Test-Path -LiteralPath $outPath) -and (-not $Overwrite)) {
        Write-Host "   Output already exists, skipping (use -Overwrite to redo)."
        $skipped++
        continue
    }

    # Decide whether this file needs fixing.
    if (-not $Force) {
        $kf = Get-KeyframeCount -Path $file.FullName
        if ($kf -gt 1) {
            Write-Host "   $kf keyframes in first 30s - already seekable, skipping."
            $skipped++
            continue
        }
        Write-Host "   $kf keyframe(s) detected - needs fixing."
    }

    # Preserve codec family.
    $srcCodec = Get-VideoCodec -Path $file.FullName
    if ($srcCodec -eq "hevc" -or $srcCodec -eq "h265") {
        $vcodec = "libx265"
    } else {
        $vcodec = "libx264"
    }
    Write-Host "   Source codec: $srcCodec -> encoding with $vcodec (crf $Crf, keyframe every ${KeyframeInterval}s)"

    # Build ffmpeg arguments as an array (safe with spaces/special chars).
    $ffArgs = @(
        "-hide_banner", "-loglevel", "warning", "-stats",
        "-i", $file.FullName,
        "-map", "0:v:0", "-map", "0:a?",
        "-c:v", $vcodec,
        "-crf", "$Crf",
        "-preset", $Preset,
        "-force_key_frames", "expr:gte(t,n_forced*$KeyframeInterval)",
        "-c:a", "copy",
        "-y"
    )
    # +faststart only applies to mp4/mov-family containers.
    if (@(".mp4", ".mov", ".m4v") -contains $file.Extension.ToLower()) {
        $ffArgs += @("-movflags", "+faststart")
    }
    $ffArgs += $outPath

    & ffmpeg @ffArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ffmpeg FAILED (exit $LASTEXITCODE)." -ForegroundColor Red
        if (Test-Path -LiteralPath $outPath) { Remove-Item -LiteralPath $outPath -Force }
        $failed++
        continue
    }

    # Verify the fix actually took.
    $newKf = Get-KeyframeCount -Path $outPath
    if ($newKf -gt 1) {
        Write-Host "   OK - fixed copy has $newKf keyframes in first 30s." -ForegroundColor Green
        $fixed++
    } else {
        Write-Host "   WARNING - output still has $newKf keyframe(s); inspect manually." -ForegroundColor Yellow
        $fixed++
    }
}

Write-Host ""
Write-Host ("-" * 60)
Write-Host "Done. Fixed: $fixed  Skipped: $skipped  Failed: $failed"
