Write-Host "🔧 Restoring User Balances..." -ForegroundColor Green
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3005/api/admin/fix-user-balances" -Method POST -ContentType "application/json"
    
    Write-Host "✅ Success! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "📊 Balance Restoration Results:" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "Message: $($data.message)" -ForegroundColor White
    Write-Host "Users Processed: $($data.summary.usersProcessed)" -ForegroundColor White
    Write-Host "Total Deposits Processed: `$$($data.summary.totalDepositsProcessed)" -ForegroundColor White
    Write-Host "Timestamp: $($data.summary.timestamp)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📋 Individual User Results:" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    
    foreach ($user in $data.results) {
        Write-Host "$($user.username):" -ForegroundColor Yellow
        Write-Host "   Previous Balance: `$$($user.previousBalance)" -ForegroundColor Gray
        Write-Host "   New Balance: `$$($user.newBalance)" -ForegroundColor Green
        Write-Host "   Confirmed Deposits: $($user.confirmedDeposits)" -ForegroundColor White
        Write-Host "   Total Deposit Amount: `$$($user.totalDepositAmount)" -ForegroundColor White
        Write-Host "   Has Deposited: $($user.previousHasDeposited) to $($user.newHasDeposited)" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "🎉 All user balances have been restored successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorContent = $reader.ReadToEnd()
            Write-Host "Error Response: $errorContent" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error response" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure the backend server is running on port 3005" -ForegroundColor White
    Write-Host "2. Check if the /api/admin/fix-user-balances endpoint exists" -ForegroundColor White
    Write-Host "3. Verify MongoDB connection is working" -ForegroundColor White
}
