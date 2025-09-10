$API_URL = "http://localhost:8000/api"

# Function to test server health
function Test-ServerHealth {
    Write-Host "Testing server health..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/healthcheck" -Method Get
        Write-Host "Server health check: $($response.status)" -ForegroundColor Green
    } catch {
        Write-Host "Server health check failed: $_" -ForegroundColor Red
    }
}

# Function to test file upload
function Test-FileUpload {
    param (
        [string]$FilePath
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "File not found: $FilePath" -ForegroundColor Red
        return
    }
    
    Write-Host "Testing file upload with $FilePath..." -ForegroundColor Cyan
    
    try {
        $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
        $fileName = [System.IO.Path]::GetFileName($FilePath)
        
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"files`"; filename=`"$fileName`"",
            "Content-Type: application/octet-stream$LF",
            [System.Text.Encoding]::UTF8.GetString($fileBytes),
            "--$boundary--$LF"
        )
        
        $body = [System.String]::Join($LF, $bodyLines)
        
        $response = Invoke-RestMethod -Uri "$API_URL/upload" -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $body
        
        Write-Host "Upload response: $($response.message)" -ForegroundColor Green
        Write-Host "Uploaded files: $($response.files | ConvertTo-Json)" -ForegroundColor Green
    } catch {
        Write-Host "Upload failed: $_" -ForegroundColor Red
    }
}

# Function to test chat
function Test-Chat {
    param (
        [string]$Message,
        [bool]$UseWebSearch = $false
    )
    
    Write-Host "Testing chat with message: '$Message' (Web search: $UseWebSearch)..." -ForegroundColor Cyan
    
    $body = @{
        text = $Message
        use_web_search = $UseWebSearch
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$API_URL/chat" -Method Post -ContentType "application/json" -Body $body
        
        Write-Host "Chat response:" -ForegroundColor Green
        Write-Host $response.reply -ForegroundColor White
        
        if ($response.sources -and $response.sources.Count -gt 0) {
            Write-Host "Sources:" -ForegroundColor Yellow
            foreach ($source in $response.sources) {
                Write-Host "- $($source.content.Substring(0, [Math]::Min(100, $source.content.Length)))..." -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "Chat failed: $_" -ForegroundColor Red
    }
}

# Main test script
Write-Host "RAG Backend API Test Script" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta

# Test server health
Test-ServerHealth

# Uncomment these lines and modify to test with your own files
# Test-FileUpload -FilePath "C:\path\to\your\test.pdf"
# Test-Chat -Message "What's in the document I just uploaded?" -UseWebSearch $false
# Test-Chat -Message "What's the latest news about AI?" -UseWebSearch $true
