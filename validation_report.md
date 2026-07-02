# RF Academy GitHub Pages 404 修正驗證

驗證日期：2026-07-02

## 修正內容

- 根目錄原有 `day001.json` 至 `day065.json` 共 65 份，已全部移至 `data/lessons/`。
- 根目錄 `dayXXX.json` 數量為 0。
- `debug-cases.json` 與 `interviews.json` 亦移至程式實際讀取的 `data/`。
- 課程 fetch 使用 `./data/lessons/dayXXX.json`，沒有使用 `/data/lessons/` 根絕對路徑。
- 新增 `data/lessons/index.json`，包含連續 65 筆課程索引。
- Service Worker 快取版本升級為 `rf-academy-v1.1.0`，預快取 Day001、課程索引與共用資料。
- UI 與進度上限由不存在的 180 天改為實際 65 天，避免 Day066 之後再次 404。
- GitHub Pages workflow 已移至 `.github/workflows/pages.yml`，發布經驗證的 `dist/`。

## Build 結果

`npm run build` 通過：

- 65 份 `dayXXX.json` 全部合法、連號且 metadata 正確。
- 根目錄沒有殘留課程 JSON。
- `dist/data/lessons/day001.json` 至 `day065.json` 全部存在。
- manifest、service worker、icons、課程與共用資料均位於正式部署包。

## GitHub Pages 子路徑測試

以 `/rf-academy-pro-V1.1/` 模擬部署：

- 首頁：HTTP 200
- `data/lessons/day001.json`：HTTP 200
- `data/lessons/day065.json`：HTTP 200
- `data/lessons/index.json`：HTTP 200
- `data/debug-cases.json`：HTTP 200
- `data/interviews.json`：HTTP 200
- `service-worker.js`：HTTP 200
- `manifest.json`：HTTP 200
- 錯誤的根絕對路徑 `/data/lessons/day001.json`：HTTP 404，應用程式未使用此路徑。

390 × 844 手機 viewport 顯示正常，首頁載入 Day001，Day065 可顯示 10 張詞彙卡，課程選單只有連續 65 天，沒有前端 404。

## 發布前線上基準

修正前：

- GitHub Pages 首頁：HTTP 200
- `https://huangyichieh79-alt.github.io/rf-academy-pro-V1.1/data/lessons/day001.json`：HTTP 404
- GitHub `main/day001.json`：HTTP 200
- GitHub `main/data/lessons/day001.json`：HTTP 404

推送後應由 GitHub Pages／Actions 更新指定網址為 HTTP 200。
