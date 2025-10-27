# Script restructure Git branches to Trunk-based Development (Lite)
# For solo dev project - simplified but professional

Write-Host "=== Git Branch Restructure ===" -ForegroundColor Cyan
Write-Host ""

# Check git repository
if (-not (Test-Path .git)) {
    Write-Host "ERROR: Not a git repository. Run script from project root." -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Fetch all branches from remote..." -ForegroundColor Yellow
git fetch --all --prune

Write-Host ""
Write-Host "Step 2: Check current branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Green

# Ensure main branch exists
Write-Host ""
Write-Host "Step 3: Ensure 'main' branch exists..." -ForegroundColor Yellow
$mainExists = git branch -r | Select-String "origin/main"
if (-not $mainExists) {
    Write-Host "WARNING: Branch 'main' does not exist on remote." -ForegroundColor Red
    $createMain = Read-Host "Create 'main' branch from current branch? (y/n)"
    if ($createMain -eq "y") {
        git checkout -b main
        git push -u origin main
        Write-Host "SUCCESS: Created branch 'main'" -ForegroundColor Green
    } else {
        Write-Host "Cancelled. Need 'main' branch to continue." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "SUCCESS: Branch 'main' exists" -ForegroundColor Green
}

# Switch to main as base
Write-Host ""
Write-Host "Step 4: Switch to 'main' branch..." -ForegroundColor Yellow
git checkout main
git pull origin main
Write-Host "SUCCESS: Updated branch 'main'" -ForegroundColor Green

# Handle develop branch (if exists)
Write-Host ""
Write-Host "Step 5: Handle 'develop' branch (if exists)..." -ForegroundColor Yellow
$developExists = git branch -r | Select-String "origin/develop"
if ($developExists) {
    Write-Host "Branch 'develop' exists." -ForegroundColor Yellow
    $mergeDevelop = Read-Host "Merge develop into main to keep code? (y/n)"
    if ($mergeDevelop -eq "y") {
        git merge origin/develop -m "chore: merge develop into main before restructure"
        git push origin main
        Write-Host "SUCCESS: Merged develop into main" -ForegroundColor Green
    }
    
    $deleteDevelop = Read-Host "Delete branch 'develop' (not needed in trunk-based)? (y/n)"
    if ($deleteDevelop -eq "y") {
        # Delete local if exists
        $localDevelop = git branch | Select-String "develop"
        if ($localDevelop) {
            git branch -D develop
        }
        # Delete remote
        git push origin --delete develop
        Write-Host "SUCCESS: Deleted branch 'develop'" -ForegroundColor Green
    }
} else {
    Write-Host "SUCCESS: No 'develop' branch" -ForegroundColor Green
}

# Handle Manh_JOB branch
Write-Host ""
Write-Host "Step 6: Handle 'Manh_JOB' branch..." -ForegroundColor Yellow
$manhJobExists = git branch -r | Select-String "origin/Manh_JOB"
if ($manhJobExists) {
    Write-Host "Branch 'Manh_JOB' exists." -ForegroundColor Yellow
    $saveManhJob = Read-Host "Keep code from Manh_JOB? (y: merge to main, n: delete)"
    if ($saveManhJob -eq "y") {
        git merge origin/Manh_JOB -m "chore: merge Manh_JOB into main before cleanup"
        git push origin main
        Write-Host "SUCCESS: Merged Manh_JOB into main" -ForegroundColor Green
    }
    
    # Delete branch
    $localManhJob = git branch | Select-String "Manh_JOB"
    if ($localManhJob) {
        git branch -D Manh_JOB
    }
    git push origin --delete Manh_JOB
    Write-Host "SUCCESS: Deleted branch 'Manh_JOB'" -ForegroundColor Green
} else {
    Write-Host "SUCCESS: No 'Manh_JOB' branch" -ForegroundColor Green
}

# Handle feature/testing-setup
Write-Host ""
Write-Host "Step 7: Handle 'feature/testing-setup' branch..." -ForegroundColor Yellow
$testingSetupExists = git branch -r | Select-String "origin/feature/testing-setup"
if ($testingSetupExists) {
    Write-Host "Branch 'feature/testing-setup' exists (current CI/CD setup branch)." -ForegroundColor Yellow
    $mergeTestingSetup = Read-Host "Merge feature/testing-setup into main? (y/n)"
    if ($mergeTestingSetup -eq "y") {
        git merge origin/feature/testing-setup -m "feat: merge CI/CD setup from feature/testing-setup"
        git push origin main
        Write-Host "SUCCESS: Merged feature/testing-setup into main" -ForegroundColor Green
    }
    
    $keepFeatureBranch = Read-Host "Keep branch feature/testing-setup? (y: keep, n: delete)"
    if ($keepFeatureBranch -eq "n") {
        $localTestingSetup = git branch | Select-String "feature/testing-setup"
        if ($localTestingSetup) {
            git branch -D feature/testing-setup
        }
        git push origin --delete feature/testing-setup
        Write-Host "SUCCESS: Deleted branch 'feature/testing-setup'" -ForegroundColor Green
    }
} else {
    Write-Host "SUCCESS: No 'feature/testing-setup' branch" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "SUCCESS: Main branch: main" -ForegroundColor Green
Write-Host "SUCCESS: Structure: Trunk-based Development (Lite)" -ForegroundColor Green
Write-Host ""
Write-Host "Remaining branches on remote:" -ForegroundColor Yellow
git branch -r

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Create new feature branch from main:" -ForegroundColor White
Write-Host "   git checkout -b feature/your-feature" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Push to trigger CI:" -ForegroundColor White
Write-Host "   git push origin feature/your-feature" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Create PR to main and merge after CI passes" -ForegroundColor White
Write-Host ""
Write-Host "4. Release production with tag:" -ForegroundColor White
Write-Host "   git tag v1.0.0" -ForegroundColor Gray
Write-Host "   git push origin v1.0.0" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Deploy staging manually via GitHub Actions > Deploy to Staging" -ForegroundColor White
Write-Host ""
Write-Host "See details at: docs/pipelineCICD/README.md" -ForegroundColor Green
