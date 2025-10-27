# Hướng dẫn Tái cấu trúc Git Repository

Tài liệu này hướng dẫn chạy script tự động để tái cấu trúc repository theo trunk-based development.

## Script có sẵn

- `restructure-git.ps1` - Cho Windows PowerShell
- `restructure-git.sh` - Cho Linux/Mac/Git Bash

## Chức năng

Script sẽ tự động:

1. ✅ Fetch tất cả branches từ remote
2. ✅ Đảm bảo branch `main` tồn tại (tạo nếu chưa có)
3. ✅ Merge code từ `develop` vào `main` (nếu có)
4. ✅ Xoá branch `develop` (không cần trong trunk-based)
5. ✅ Merge/xoá branch `Manh_JOB` theo lựa chọn
6. ✅ Xử lý branch `feature/testing-setup` (merge hoặc giữ lại)
7. ✅ Hiển thị hướng dẫn sử dụng workflow mới

## Cách chạy

### Windows (PowerShell)

```powershell
# Cho phép chạy script (chỉ cần 1 lần)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Chạy script
.\scripts\restructure-git.ps1
```

### Linux/Mac/Git Bash

```bash
# Cho phép execute
chmod +x scripts/restructure-git.sh

# Chạy script
./scripts/restructure-git.sh
```

## Script sẽ hỏi bạn

- Merge develop vào main? (y/n)
- Xoá branch develop? (y/n)
- Giữ code từ Manh_JOB? (y/n)
- Merge feature/testing-setup vào main? (y/n)
- Giữ lại feature/testing-setup? (y/n)

## Khuyến nghị

**Trước khi chạy:**

1. Commit tất cả thay đổi đang có
2. Push tất cả branches quan trọng lên remote
3. Backup local nếu cần (clone thêm 1 bản)

**Khi chạy:**

- Merge develop → main: **y** (giữ lại code)
- Xoá develop: **y** (không cần nữa)
- Merge Manh_JOB: **n** (branch test, không quan trọng)
- Merge feature/testing-setup → main: **y** (code CI/CD quan trọng)
- Giữ lại feature/testing-setup: **n** (đã merge rồi)

**Sau khi chạy:**

1. Kiểm tra branch `main` có đầy đủ code
2. Test CI/CD bằng cách push test commit
3. Xem tài liệu tại `docs/pipelineCICD/README.md`

## Rollback (nếu cần)

Nếu có sự cố, các branch đã xoá vẫn tồn tại trong reflog 30 ngày:

```bash
# Xem lịch sử xoá
git reflog

# Khôi phục branch đã xoá
git checkout -b branch-name <commit-hash>
git push origin branch-name
```

## Kết quả mong đợi

Sau khi chạy script:

- ✅ Branch `main` là branch duy nhất dài hạn
- ✅ CI chạy trên `main` và `feature/**`
- ✅ Staging deploy bằng workflow_dispatch (manual)
- ✅ Production deploy khi push tag `v*.*.*`
- ✅ Workflow rõ ràng, đơn giản cho solo dev

## Support

Nếu gặp lỗi:

1. Đọc thông báo lỗi trong console
2. Xem `docs/pipelineCICD/README.md` để hiểu workflow mới
3. Rollback theo hướng dẫn trên nếu cần
