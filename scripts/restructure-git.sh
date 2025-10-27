# Script tái cấu trúc Git branches - Phiên bản Bash
# Dành cho Linux/Mac hoặc Git Bash trên Windows

#!/bin/bash

echo "=== Tái cấu trúc Git Branches ==="
echo ""

# Kiểm tra git repository
if [ ! -d .git ]; then
    echo "ERROR: Không phải git repository. Chạy script trong thư mục root của project."
    exit 1
fi

echo "Step 1: Fetch tất cả branches từ remote..."
git fetch --all --prune

echo ""
echo "Step 2: Kiểm tra branch hiện tại..."
currentBranch=$(git branch --show-current)
echo "Branch hiện tại: $currentBranch"

# Đảm bảo main branch tồn tại
echo ""
echo "Step 3: Đảm bảo branch 'main' tồn tại..."
if ! git branch -r | grep -q "origin/main"; then
    echo "WARNING: Branch 'main' không tồn tại trên remote."
    read -p "Tạo branch 'main' từ branch hiện tại? (y/n) " createMain
    if [ "$createMain" = "y" ]; then
        git checkout -b main
        git push -u origin main
        echo "✓ Đã tạo branch 'main'"
    else
        echo "Huỷ bỏ. Cần branch 'main' để tiếp tục."
        exit 1
    fi
else
    echo "✓ Branch 'main' đã tồn tại"
fi

# Chuyển sang main để làm base
echo ""
echo "Step 4: Chuyển sang branch 'main'..."
git checkout main
git pull origin main
echo "✓ Đã cập nhật branch 'main'"

# Xử lý branch develop (nếu có)
echo ""
echo "Step 5: Xử lý branch 'develop' (nếu có)..."
if git branch -r | grep -q "origin/develop"; then
    echo "Branch 'develop' tồn tại."
    read -p "Merge develop vào main để giữ lại code? (y/n) " mergeDevelop
    if [ "$mergeDevelop" = "y" ]; then
        git merge origin/develop -m "chore: merge develop into main before restructure"
        git push origin main
        echo "✓ Đã merge develop vào main"
    fi
    
    read -p "Xoá branch 'develop' (không cần nữa trong trunk-based)? (y/n) " deleteDevelop
    if [ "$deleteDevelop" = "y" ]; then
        # Xoá local nếu có
        git branch -D develop 2>/dev/null
        # Xoá remote
        git push origin --delete develop
        echo "✓ Đã xoá branch 'develop'"
    fi
else
    echo "✓ Không có branch 'develop'"
fi

# Xử lý branch Manh_JOB
echo ""
echo "Step 6: Xử lý branch 'Manh_JOB'..."
if git branch -r | grep -q "origin/Manh_JOB"; then
    echo "Branch 'Manh_JOB' tồn tại."
    read -p "Giữ lại code từ Manh_JOB? (y: merge vào main, n: xoá luôn) " saveManhJob
    if [ "$saveManhJob" = "y" ]; then
        git merge origin/Manh_JOB -m "chore: merge Manh_JOB into main before cleanup"
        git push origin main
        echo "✓ Đã merge Manh_JOB vào main"
    fi
    
    # Xoá branch
    git branch -D Manh_JOB 2>/dev/null
    git push origin --delete Manh_JOB
    echo "✓ Đã xoá branch 'Manh_JOB'"
else
    echo "✓ Không có branch 'Manh_JOB'"
fi

# Xử lý feature/testing-setup
echo ""
echo "Step 7: Xử lý branch 'feature/testing-setup'..."
if git branch -r | grep -q "origin/feature/testing-setup"; then
    echo "Branch 'feature/testing-setup' tồn tại (branch hiện tại setup CI/CD)."
    read -p "Merge feature/testing-setup vào main? (y/n) " mergeTestingSetup
    if [ "$mergeTestingSetup" = "y" ]; then
        git merge origin/feature/testing-setup -m "feat: merge CI/CD setup from feature/testing-setup"
        git push origin main
        echo "✓ Đã merge feature/testing-setup vào main"
    fi
    
    read -p "Giữ lại branch feature/testing-setup? (y: giữ, n: xoá) " keepFeatureBranch
    if [ "$keepFeatureBranch" = "n" ]; then
        git branch -D feature/testing-setup 2>/dev/null
        git push origin --delete feature/testing-setup
        echo "✓ Đã xoá branch 'feature/testing-setup'"
    fi
else
    echo "✓ Không có branch 'feature/testing-setup'"
fi

# Tổng kết
echo ""
echo "=== Tổng kết ==="
echo "✓ Branch chính: main"
echo "✓ Cấu trúc: Trunk-based Development (Lite)"
echo ""
echo "Các branch còn lại trên remote:"
git branch -r

echo ""
echo "=== Hướng dẫn tiếp theo ==="
echo "1. Tạo feature branch mới từ main:"
echo "   git checkout -b feature/your-feature"
echo ""
echo "2. Push lên để trigger CI:"
echo "   git push origin feature/your-feature"
echo ""
echo "3. Tạo PR vào main và merge sau khi CI pass"
echo ""
echo "4. Release production bằng tag:"
echo "   git tag v1.0.0"
echo "   git push origin v1.0.0"
echo ""
echo "5. Deploy staging thủ công qua GitHub Actions > Deploy to Staging"
echo ""
echo "Xem chi tiết tại: docs/pipelineCICD/README.md"
