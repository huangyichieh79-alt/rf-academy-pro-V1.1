# RF Academy Pro V1

RF Academy Pro 是一套手機優先、可安裝、可離線複習的 65 天工程英文 PWA。課程涵蓋 RF、EMC、Safety、FCC、CE、NCC、BSMI、UL、IEC、EN、ISO/IEC 17025、測試報告、實驗室溝通、客戶會議與工程師英文面試。

## 完整功能

- Day001–Day065，每天包含 10 個專業詞彙、5 句常用句、1 段情境對話、1 個 Debug Case、1 題 Interview Question 與 5 題混合測驗。
- 每個詞彙都有繁體中文、發音提示、分類、難度、工程例句與中文翻譯。
- Web Speech API 正常速度、慢速、單字、句子與聽力題播放。
- 五種測驗：英翻中、中翻英、填空、聽力、面試簡答；完成後顯示成績、錯題、正解與複習詞彙。
- 10 類工程師面試練習與規則式自然英文修整。
- 12 類 EMC、Safety、驗證與測試設定 Debug 案例。
- Dashboard、65 天進度地圖、連續學習日、測驗平均與複習清單。
- 深色與淺色模式、手機底部導覽、iPhone 安全區與桌面版側邊導覽。
- Service Worker 快取應用程式外殼；曾載入的課程會加入離線快取。

## 本機預覽

Service Worker、ES 模組與課程 JSON 需要 HTTP 環境，請勿直接雙擊 `index.html`。Windows 可直接執行：

```text
START_RF_ACADEMY.bat
```

啟動器會先確認 Day001–Day065；資料缺漏時會自動重新產生，再啟動 `http://127.0.0.1:8080/` 並開啟瀏覽器。

也可以在專案根目錄手動執行：

```powershell
python -m http.server 8080
```

若系統以 `py` 啟動 Python：

```powershell
py -m http.server 8080
```

瀏覽器開啟 `http://localhost:8080/`。建議使用手機 Chrome、iPhone Safari 或桌面 Chrome 測試。

## GitHub 上傳

```powershell
git init
git add .
git commit -m "Release RF Academy Pro V1"
git branch -M main
git remote add origin https://github.com/你的帳號/rf-academy-pro-V1.1.git
git push -u origin main
```

如果儲存庫已存在，只需在目前分支提交並推送檔案。專案使用相對路徑，可部署在 `https://帳號.github.io/rf-academy-pro-V1.1/` 子路徑。

## 啟用 GitHub Pages

專案已包含 `.github/workflows/pages.yml`。完成推送後：

1. 開啟 GitHub 儲存庫的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 選擇 **GitHub Actions**。
3. 開啟 **Actions → Deploy RF Academy to GitHub Pages**，確認工作流程通過。
4. Pages 顯示已發布網址後，以手機 Chrome 或 Safari 開啟該 HTTPS 網址。
5. 每次推送會先確認 Day001–Day065、執行全量驗證與 build，再發布網站。
6. 新 Service Worker 接管時頁面會自動重新載入一次，避免手機繼續使用舊版 JavaScript。

手機不執行 Windows 批次檔，也不要把專案檔案下載後直接開啟；正式入口永遠是 GitHub Pages 的 HTTPS 網址。

## 加入手機主畫面

### Android Chrome

開啟 GitHub Pages 網址，點右上角選單，選擇 **安裝應用程式** 或 **加到主畫面**，再確認安裝。

### iPhone Safari

以 Safari 開啟 GitHub Pages 網址，點下方 **分享**，選擇 **加入主畫面**，確認名稱後點 **加入**。

## 重新產生 65 天課程

需要 Node.js 18 或更新版本。在專案根目錄執行：

```powershell
node scripts/generate_lessons.js
```

或：

```powershell
npm run generate
```

產生器會重建 `data/lessons/day001.json` 至 `day065.json`、課程索引、8 份分類詞庫、面試題庫與 Debug 題庫。產生過程不需要網路或 API Key，結果可重現。

## 更新課程資料

1. 在 `scripts/generate_lessons.js` 編輯主題詞彙、難度階段、Debug 案例、面試題庫或句型。
2. 執行課程產生指令。
3. 執行完整驗證：

```powershell
node scripts/validate.js
```

4. 重新啟動本機 HTTP 伺服器，確認 Dashboard、課程、測驗、面試、Debug、進度與離線載入。
5. 提交產生器與所有更新後的 JSON，確保 GitHub Pages 上的資料和程式一致。

## 進度資料

學習進度保存在瀏覽器的 `localStorage`，包含完成天數、目前天數、已學詞彙、待複習詞彙、測驗成績、連續學習日、最後學習日期與主題模式。同一網站來源重新開啟後資料仍會保留；清除網站資料會同時清除本機進度。

## 專案結構

```text
index.html
manifest.json
service-worker.js
css/style.css
js/app.js
js/storage.js
js/tts.js
js/quiz.js
js/progress.js
js/interview.js
js/debug.js
data/lessons/day001.json ... day065.json
data/vocabulary/*.json
scripts/generate_lessons.js
scripts/validate.js
```
