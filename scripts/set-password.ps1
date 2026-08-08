param([string]$Password)

if ([string]::IsNullOrEmpty($Password)) {
    $securePassword = Read-Host "New password" -AsSecureString
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    try {
        $Password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
}

if ([string]::IsNullOrEmpty($Password)) {
    throw "Password cannot be empty."
}

$authFile = Join-Path $PSScriptRoot "..\static\auth.js"
$authFile = [System.IO.Path]::GetFullPath($authFile)
$source = [System.IO.File]::ReadAllText($authFile)

$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$saltBytes = New-Object byte[] 16
$rng.GetBytes($saltBytes)
$iterations = 210000
$derive = New-Object System.Security.Cryptography.Rfc2898DeriveBytes(
    $Password,
    $saltBytes,
    $iterations,
    [System.Security.Cryptography.HashAlgorithmName]::SHA256
)

$salt = [Convert]::ToBase64String($saltBytes)
$verifier = [Convert]::ToBase64String($derive.GetBytes(32))
$source = [regex]::new('salt: "[^"]+"').Replace($source, "salt: `"$salt`"", 1)
$source = [regex]::new('verifier: "[^"]+"').Replace($source, "verifier: `"$verifier`"", 1)
[System.IO.File]::WriteAllText($authFile, $source, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Password verifier updated in static/auth.js."
