
Write-Host "Setting up EduERP Environment Variables..." -ForegroundColor Cyan

$publishableKey = Read-Host "Enter your Clerk Publishable Key (pk_test_...)"
$secretKey = Read-Host "Enter your Clerk Secret Key (sk_test_...)"

$envContent = "DATABASE_URL=`"postgresql://user:password@127.0.0.1:5432/mydb?schema=public`""
$envContent += "`nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY==pk_test_ZXF1YWwtbHlueC04OS5jbGVyay5hY2NvdW50cy5kZXYk"
$envContent += "`nCLERK_SECRET_KEY==sk_test_YRUWAio5tOm3vxqwn0iNcg7TdT6QGlxjvvCKZ3IQqF"
$envContent += "`nNEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in"
$envContent += "`nNEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up"

Set-Content -Path "apps/web/.env.local" -Value $envContent

Write-Host "Success! apps/web/.env.local has been updated." -ForegroundColor Green
Write-Host "Please wait for the web server to reload (or restart it if it doesn't)." -ForegroundColor Yellow
