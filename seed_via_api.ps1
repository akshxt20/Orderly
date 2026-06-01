# Seeds the live API with demo data by calling the public endpoints.
# Needs ONLY your backend URL — no database access or Render Shell required.
#
# Run from PowerShell:
#   .\seed_via_api.ps1 -BaseUrl "https://orderly-api-dcga.onrender.com/api/v1"

param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl
)

$ErrorActionPreference = "Stop"

function Post($path, $body) {
  return Invoke-RestMethod -Uri "$BaseUrl$path" -Method Post -ContentType "application/json" -Body ($body | ConvertTo-Json)
}

Write-Host "Seeding customers..." -ForegroundColor Cyan
$customerDefs = @(
  @{ name = "Aarav Sharma";  email = "aarav.sharma@example.in";  phone = "+91 98765 43210"; address = "12 MG Road, Bengaluru, Karnataka" },
  @{ name = "Priya Patel";   email = "priya.patel@example.in";   phone = "+91 99820 11223"; address = "45 Satellite Road, Ahmedabad, Gujarat" },
  @{ name = "Rohan Gupta";   email = "rohan.gupta@example.in";   phone = "+91 90011 22334"; address = "8 Park Street, Kolkata, West Bengal" },
  @{ name = "Ananya Iyer";   email = "ananya.iyer@example.in";   phone = "+91 98401 55667"; address = "23 Anna Salai, Chennai, Tamil Nadu" },
  @{ name = "Vikram Singh";  email = "vikram.singh@example.in";  phone = "+91 99100 88776"; address = "67 Connaught Place, New Delhi" },
  @{ name = "Sneha Reddy";   email = "sneha.reddy@example.in";   phone = "+91 90300 44551"; address = "19 Banjara Hills, Hyderabad, Telangana" },
  @{ name = "Arjun Nair";    email = "arjun.nair@example.in";    phone = "+91 99461 33220"; address = "5 Marine Drive, Kochi, Kerala" },
  @{ name = "Diya Mehta";    email = "diya.mehta@example.in";    phone = "+91 98191 77665"; address = "31 Linking Road, Mumbai, Maharashtra" }
)
$customers = @()
foreach ($c in $customerDefs) { $customers += Post "/customers" $c; Write-Host "  + $($c.name)" }

Write-Host "Seeding products..." -ForegroundColor Cyan
$productDefs = @(
  @{ sku = "MOB-IPH-15";  name = "iPhone 15 (128GB)";          category = "Mobiles";     price = 79999; quantity = 18; description = "Apple iPhone 15, Black" },
  @{ sku = "MOB-SAM-M14"; name = "Samsung Galaxy M14 5G";      category = "Mobiles";     price = 13499; quantity = 40; description = "6GB RAM, 128GB" },
  @{ sku = "MOB-ONP-N3";  name = "OnePlus Nord 3";             category = "Mobiles";     price = 24999; quantity = 4;  description = "Low stock demo item" },
  @{ sku = "AUD-BOAT-141";name = "boAt Airdopes 141";          category = "Audio";       price = 1299;  quantity = 120; description = "TWS earbuds" },
  @{ sku = "AUD-SONY-XB"; name = "Sony WH-CH520 Headphones";   category = "Audio";       price = 3490;  quantity = 30; description = "Wireless over-ear" },
  @{ sku = "PWR-MI-20K";  name = "Mi Power Bank 3i (20000mAh)";category = "Power";       price = 1999;  quantity = 3;  description = "Low stock demo item" },
  @{ sku = "ACC-LOG-M331";name = "Logitech M331 Silent Mouse"; category = "Accessories"; price = 699;   quantity = 85; description = "Silent wireless mouse" },
  @{ sku = "LAP-DELL-15"; name = "Dell Inspiron 15";           category = "Laptops";     price = 54990; quantity = 12; description = "Core i5, 16GB RAM, 512GB SSD" }
)
$products = @()
foreach ($p in $productDefs) {
  $p.image_url = "https://placehold.co/600x600/0a0a0a/ffffff?text=" + [uri]::EscapeDataString($p.name)
  $products += Post "/products" $p
  Write-Host "  + $($p.name)"
}

Write-Host "Seeding sales..." -ForegroundColor Cyan
Post "/sales" @{ name = "Audio Fest"; discount_percent = 15; scope = "category"; category = "Audio" } | Out-Null
Post "/sales" @{ name = "iPhone Launch Offer"; discount_percent = 8; scope = "product"; product_id = $products[0].id } | Out-Null
Write-Host "  + 2 sales"

Write-Host "Seeding orders..." -ForegroundColor Cyan
$orderPlan = @(
  @{ customer = 0; items = @(@{ p = 0; q = 1 }, @{ p = 3; q = 2 }) },
  @{ customer = 1; items = @(@{ p = 1; q = 1 }) },
  @{ customer = 2; items = @(@{ p = 6; q = 3 }, @{ p = 4; q = 1 }) },
  @{ customer = 3; items = @(@{ p = 7; q = 1 }) },
  @{ customer = 5; items = @(@{ p = 3; q = 4 }) }
)
foreach ($o in $orderPlan) {
  $items = @($o.items | ForEach-Object { @{ product_id = $products[$_.p].id; quantity = $_.q } })
  Post "/orders" @{ customer_id = $customers[$o.customer].id; items = $items } | Out-Null
}
Write-Host "  + $($orderPlan.Count) orders"

Write-Host "`nDone. Refresh your site." -ForegroundColor Green
