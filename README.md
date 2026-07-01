# RF Academy Pro V1.1 Complete

可直接上傳 GitHub Pages 的 RF / EMC / Safety / Certification / Interview 英文訓練 PWA。

## 功能
- 180 天課程資料
- 每天 10 個專業單字
- 工程師例句、情境對話、Debug Case、面試題
- 瀏覽器英文 TTS 發音與慢速播放
- localStorage 進度保存
- PWA 離線快取
- 手機版 RWD UI

## GitHub Pages 上傳
1. 解壓縮 ZIP
2. 進入資料夾內層，確認看到 index.html
3. 將所有檔案拖到 GitHub Repository
4. Settings → Pages → Deploy from branch → main → /root

## 本機測試
直接雙擊 index.html 可開啟。若要測試 PWA 快取，建議用：

```bash
python -m http.server 8000
```

再開啟 http://localhost:8000
