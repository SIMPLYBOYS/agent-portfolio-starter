# Agent Portfolio Starter

**線上版**：<https://agent-portfolio-starter.ferrari828.workers.dev/>

Aaron 的「浮世・造境」作品集：浮世繪探索遊戲，以及 Web3 × AI Agent 工程作品。參考 [Kaori 的作品集](https://portfolio.kaori-dododo.com/) 的影片式入口，改為墨色、暖金與朱紅的電影感構圖；沒有複製對方的人物、影片或圖片。

2026-09-25 改版：首頁以清親專案既有的〈今戸夏月〉AI 重繪影片取代 CSS 像素辦公室。這是實際 MP4 影片，不是即時 3D 場景，也沒有引入 WebGL。原畫封面與來源記錄納入本站，但未複製完整遊戲或更動五個來源專案。

## 本機啟動

需要 Node.js 22.9 以上。無第三方套件，不必安裝 dependencies。

```sh
cd /Users/mac/Documents/OpenSourceProjects/agent-portfolio-starter
npm run dev
```

開啟 http://127.0.0.1:4173 。在終端機按 Ctrl+C 停止。修改檔案後重新整理瀏覽器即可，不含熱更新。

已建立本機 `.env`，若要改連接埠可修改 `PORT`。`.env` 不納入版控；日後從 Git 取得專案時，可由 `.env.example` 複製，或直接使用預設值啟動。預設只綁定本機；不需要任何 API key，請勿將付款私鑰、Typesafe key 或其他秘密放進 `public/`。

## 已有功能

- 電影式首頁：10 支靜音影片隨機播放、暗幕與大字構圖，另有完整影像觀看視窗。
- 五款浮世繪遊戲、cogito-agent、immerse 與三張既有工程／研究卡，共十張作品卡。
- 五個篩選入口（含全部）、系列快捷導覽、原生 dialog 案例詳情。
- 履歷補強的關於、精選職涯、可展開早期經歷、四類技術能力、工程原則與聯絡區塊。
- 鍵盤導覽、跳至作品、對話框焦點還原、系統減少動畫設定與手動暫停。
- 影片失敗退回海報、離開首頁或切到背景分頁時暫停。初次開啟即採減少動畫設定時，不請求影片。
- 遊戲的線上入口、GitHub、README 連結，以及公開的影像與素材出處頁。空連結不產生假按鈕。

這是作品集網站，不是付款 Demo 或遊戲本體。畫面沒有發送 x402 請求、操作錢包或查詢鏈上交易；遊玩入口另開原專案網站。遊戲卡的封面是原畫，不是實機截圖。

## 修改入口

| 檔案 | 用途 |
| --- | --- |
| `public/content.js` | 個人名稱、聯絡方式、作品內容、Demo／GitHub／案例連結、首頁影片 |
| `public/ukiyoe.js` | 五款浮世繪遊戲介紹、封面、公開遊玩／GitHub／README 入口 |
| `public/index.html` | 首頁與關於文案、頁面結構、SEO description |
| `public/styles.css` | 色彩、排版、CSS 場景、響應式與動畫 |
| `public/cinema.css` | 電影式首頁、浮世繪系列、改版色彩與手機版調整 |
| `public/career.css` | 履歷區塊、職涯列表、技術能力與導覽列的手機版調整 |
| `public/app.js` | 作品篩選、案例視窗、聯絡連結 |
| `public/project-media.js` | 作品卡片預覽、詳情影片／截圖切換、各專案來源標示、播放清理與失敗提示 |
| `public/cinema.js` | 影片播放、完整觀看、暫停與失敗備援 |
| `public/films.js` | 10 組片頭影片、海報、名稱與來源／重繪差異的清單 |
| `public/film-queue.js` | 每輪洗牌、不連續重複的播放順序 |
| `public/credits.html` | 可從頁尾與影片標示進入的素材出處、AI 重繪差異 |
| `public/assets/` | 10 支影片與海報、五幅封面；來源在 credits.html |
| `server.mjs` | 本機預覽用靜態伺服器；僅提供 `public/`，支援影片 byte ranges |
| `.env.example` | 本機 HOST／PORT 範例；複製成 `.env` 後自動載入 |

GitHub、公開履歷與 Cake 個人頁已設定；`profile.email`、`linkedin` 仍空白，未猜測聯絡資訊。請按真實進度更新作品的 `status`、`evidence`、`demo`、`repo`、`caseStudy`。連結支援 HTTPS 網址或根目錄相對路徑。品牌字樣、關於／職涯文字與 SEO 仍需在 HTML 一併修改。

### 履歷內容來源

2026-09-25 依 [Aaron Chou 的精簡履歷](https://simplyboys.github.io/resume/) 更新姓名、專業定位、17 年以上經驗、FIO／ewe technology／Coolbitx 精選經歷、可展開的早期經歷、技能與學歷。數據沿用本人公開履歷，不是本站獨立驗證的效能基準；4–6 小時至 10 分鐘內指 FIO 碳專案報告流程，沒有擴張為所有 AI 工作的成效。

cogito-agent 最初依履歷整理，後續已用公開 README、安全模型與展示素材更新（見下方）；immerse 仍依履歷整理，GitHub 入口核對本機專案的 origin。本次未重新審查其程式碼。immerse 保留「個人單人使用」，Agent Payment Authority 保留設計／開發中，沒有把個人實驗或 POC 寫成企業正式上線。未複製企業內部素材，也未將未列在履歷中的 Email／LinkedIn 補成猜測值。

付款專案與研究筆記目前刻意標示設計／待整理狀態。上線前必須按實際成果校對，不要把範例文案當作已完成的履歷。

### 更換開場影片

1. 在 `public/assets/` 放入你有權公開的壓縮 MP4 或 WebM。
2. 修改 `public/films.js` 的 `id`、`video`、`poster`、`title`、`artist`、`credit` 及來源欄位。`profile.introFilms` 引用這份清單。
3. 同步調整 `index.html` 的 poster 預載、初始圖片、影片標題、說明與 `credits.html`。避免影片已換、出處卻仍顯示清親。
4. 保持靜音、`playsinline`、手動暫停與失敗備援。影片採等比完整顯示，避免裁掉原框與生成標記。

片頭選用清親專案的 70、14、17、19、20、36、43、52、58、68，共 10 支未重剪 MP4；海報擷取各片第 2 秒。原有 70 號資產保留原檔名，新增九組位於 `public/assets/films/`。這個版本利用既有動態版畫，並非新生成的 3D 人物或展館影片。

播放規則：首次進站隨機選片，播完換下一支；每輪洗牌，十支各播一次，下一輪第一支不與上一輪最後一支相同。重新整理會重新洗牌，不保留跨頁進度。「換一景」可手動切換，並同步更新名稱、海報、完整觀看與出處。暫停或系統減少動畫時，手動換景只更新海報，不自動播放／下載影片。完整觀看會暫停背景，關閉後繼續背景；影片載入失敗停在海報，可重試。

新增媒體可用 `node import-films.mjs /absolute/path/to/kiyochika-pixel` 重建九支影片與海報（需要 ffmpeg；70 號沿用既有資產）。腳本只讀取來源專案，不會修改它；日常啟動不需要 ffmpeg。

`npm run check` 另含三組測試，驗證十組素材存在、每輪無重複、跨輪不連播同片，以及空清單／單片邊界。瀏覽器驗收也檢查播畢自動換片、手動走完一輪與對應標示。

未附帶 LimeZu 原始／衍生素材檔、背景音樂、受限的中山道鳥瞰圖或整包遊戲素材。Pixel Office 展示錄影與截圖中可見 LimeZu 美術，僅限展示該專案，不屬於 MIT。保留「AI 重繪・非原作」標示與出處連結。各封面按來源資料挑選，不能由本次選圖推論整個遊戲素材包均可再散佈。

### Pixel Office 展示素材

2026-09-25 將 Pixel Office 的預留卡片改為實際作品介紹：Unity、FastAPI、WebSocket、任務看板與 HITL。內容依本機 README、第三方聲明與既有展示整理，未重新驗收三種 Agent 引擎，也未將它描述為已完成 x402 支付的 Demo。

- 卡片封面：`public/assets/pixel-office/shell.png`，來自 `.playwright-mcp/shell_full.png`。
- 卡片預覽：`office-preview.mp4`，來自 `brag-output/composition/assets/office_multi.mp4`；約 8 秒、靜音。滑鼠移入或鍵盤聚焦才載入播放，離開、開啟對話框或背景分頁時暫停；減少動畫／手動暫停時不啟動預覽。手機點擊直接開啟詳情。
- 詳情可選短片或 `demo.mp4` 完整導覽，均手動播放、預設靜音；關閉會停止並卸載影片。完整導覽來自 `docs/media/pixel-office-demo.mp4`，保留原檔，不含背景配樂。
- 兩張 JPG 海報分別擷取短片第 3 秒與完整導覽第 7 秒。影片等比顯示；沒有加入浮世繪片頭的十片播放佇列。
- 約 0:14 協作看板、0:19 HITL 審批為重建示意，已在影片說明、作品證據與 `credits.html#pixel-office` 標示。本站只展示錄影，不連接執行後端。
- 保留 LimeZu 署名與來源授權連結；沒有複製原始圖集、裁切角色幀、私人任務看板或整個製作資料夾。

更換素材時同步更新 `content.js` 的 `image`、`preview`、`media` 和 `credits.html`。錄影／截圖不得隨網站程式碼一併宣告為 MIT。

### cogito-agent 展示素材

2026-09-25 以 Firecrawl 核對 GitHub 公開 README，並比對本機既有素材，更新原本的 CSS 終端機預留視覺：

- `public/assets/cogito-agent/cover.png` 來自 `docs/logo/social.png`，保留原有像素字標。
- `demo.mp4` 來自 `docs/brag.mp4`，19 秒、約 862 KiB，沒有音軌；卡片移入／聚焦時預覽，詳情手動播放，不混入十支浮世繪片頭。海報取第 12 秒，避開場景轉換時的字幕重疊。
- 詳情增加 Runs、Metrics、Policy 三張公開截圖的切換與原尺寸連結。只複製 `docs/dashboard/` 已公開素材，未讀取私人 session store、API key 或執行 Agent。
- 短片標為剪輯式功能示意，截圖數字不作為成本基準。Docker 為可選 bash executor；不把工作區圍堵、命令審批與防 prompt injection 混為一談。
- 新增 README、設計取捨、安全模型與評估限制連結；沒有把小樣本評測數據直接寫成作品成效。
- `credits.html#cogito-agent` 記錄所有來源，`assets/cogito-agent/LICENSE` 保留來源 MIT 授權全文。Pixel Office 的 LimeZu 署名仍獨立保留。

`content.js` 的 `mediaCredit` 讓各專案使用自己的素材說明；`media[].loop` 可覆寫循環設定，`gallery` 定義截圖／替代文字／說明，`references` 定義額外閱讀連結。

## 驗證與部署

```sh
npm run check
```

`check` 檢查 JavaScript 語法與影片佇列，不代表完整瀏覽器測試。人工驗收：桌機／手機、分類、十張作品詳情、履歷連結、職涯展開、Escape 關閉、Tab 焦點、暫停與完整觀看、減少動畫模式。

另附 `browser-check.mjs`。若開發環境已有 Playwright 與 Chromium，先啟動預覽，再執行 `node browser-check.mjs`。此工具不是網站執行依賴；會測試分類、對話框、焦點、影片播放／暫停、減少動畫不請求影片、影片故障備援、360～1440px 橫向溢出、HTTP byte ranges、靜態路由及 `.env` 不被提供。截圖輸出至 `/tmp/agent-portfolio-cinema-hero.png`、`/tmp/agent-portfolio-desktop.png` 與 `/tmp/agent-portfolio-mobile.png`。未替五個外部遊戲做全關卡驗收，也不以 Chromium 測試代表實機 iOS Safari 已驗證。

部署時只發布 `public/`，不需要 build。可使用支援靜態目錄的託管服務；本站使用 `/styles.css` 等根路徑，預設部署於網域根目錄。若放在 `/portfolio/` 子路徑，需同步調整 HTML 資源路徑及內容中的根相對連結。

`server.mjs` 僅作本機預覽；正式影片建議由靜態託管／CDN 提供。發布前填入真實聯絡方式、刪除編輯提示、校對作品狀態。

## 授權

程式碼採 [MIT](LICENSE)。`public/assets/` 底下的影像、影片、錄影與截圖不在 MIT 範圍內，範圍說明見 [ASSETS.md](ASSETS.md)，各自的來源與條款見 `public/credits.html`。
