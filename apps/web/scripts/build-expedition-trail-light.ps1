# Offline GAME-07F lighting layers. Does not modify expedition-map.png / .webp.
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
$src = "public/images/decoration/expedition-map.png"
$s = "scripts"
$out = "public/images/expedition"

function Build-TrailLight([string]$corridor, [string]$stem) {
  magick $src -colorspace sRGB -channel RGB -separate +channel -fx "u[0]>0.74 && u[1]>0.45 && u[0]>u[2]+0.22 && u[1]>u[2]+0.10" -threshold 50% "$s/tmp-07f-gold.png"
  magick $corridor -background black -alpha off PNG8:"$s/tmp-07f-corridor.png"
  magick "$s/tmp-07f-gold.png" "$s/tmp-07f-corridor.png" -compose Multiply -composite -threshold 38% -morphology Close Disk:2 -morphology Open Disk:1 "$s/tmp-07f-gold-clip.png"
  magick "$s/tmp-07f-gold-clip.png" -blur 0x1.0 "$s/tmp-07f-alpha.png"
  magick "$s/tmp-07f-gold-clip.png" -blur 0x2.0 -level 15%,88% "$s/tmp-07f-halo-a.png"
  magick $src -modulate 152,90,101 "$s/tmp-07f-alpha.png" -alpha off -compose CopyOpacity -composite PNG32:"$s/tmp-07f-path.png"
  magick -size 1672x941 xc:"#efc36a" "$s/tmp-07f-halo-a.png" -alpha off -compose CopyOpacity -composite -channel A -evaluate Multiply 0.14 +channel PNG32:"$s/tmp-07f-halo.png"
  magick "$s/tmp-07f-halo.png" "$s/tmp-07f-path.png" -compose Over -composite PNG32:"$out/$stem.png"
  magick "$out/$stem.png" -quality 80 "$out/$stem.webp"
}

Build-TrailLight "$s/expedition-trail-neuro-corridor.svg" "trail-neuro-light"
Build-TrailLight "$s/expedition-trail-processes-corridor.svg" "trail-processes-light"
Remove-Item -Force "$s/tmp-07f-*.png" -ErrorAction SilentlyContinue
Write-Output "wrote $out/trail-*-light.{png,webp}"
