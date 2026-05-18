# 日本ご当地ピカチュウマップ 🗾⚡

日本各地寶可夢中心限定皮卡丘絨毛娃娃地圖。可以在地圖上點選店鋪、查看商品、勾選蒐集進度。

## 資料統計

- **41 款**地區限定皮卡丘
- **19 家**販售地點（寶可夢中心 / 商店 / 咖啡廳 / 機場 / 海外）
- **9 個**分類區域（北海道・東北、關東、中部・北陸、關西、中國・四國、九州・沖繩、餐廳、機場、海外）

## 功能

- 🗺️ 互動式地圖（含日本本土 + 台灣海外點）
- 📍 19 個販售地點（從北海道到沖繩 + 台北、新竹）
- 🔍 多重篩選：搜尋 / 地區 / 類型（常駐 / 暫駐 / 活動）/ 價格範圍
- ✅ 「我蒐集過了」勾選清單（存 localStorage，重整不丟）
- 📊 即時進度條 + 數量統計
- 🗺️ 每個店鋪有 Google Maps 連結

## 部署到 GitHub Pages

1. 把整個資料夾推到 GitHub repo
2. 進入 repo 的 **Settings → Pages**
3. Source 選 `Deploy from a branch`
4. Branch 選 `main` / `/ (root)`
5. 等待 1～2 分鐘，網頁就會在 `https://你的帳號.github.io/你的repo名/` 上線

## 檔案結構

```
.
├── index.html              主頁面
├── css/
│   └── styles.css          樣式（寶可夢紅黃配色）
├── js/
│   ├── data.js             店鋪 + 皮卡丘商品資料
│   └── app.js              地圖邏輯、篩選、蒐集追蹤
├── images/                 商品圖片資料夾（image-0.png ~ image-40.png）
└── README.md
```

## 修改 / 新增商品

打開 `js/data.js`：

- `STORES` 陣列：店鋪資料
- `PLUSHES` 陣列：商品資料
- 新增商品時，把圖片放進 `images/` 並指定 `image` 欄位
- `collected: true` 會在首次載入時自動勾選為已蒐集

## 重置蒐集進度

在瀏覽器 console 執行：
```js
localStorage.removeItem('pika-map-collected-v2');
localStorage.removeItem('pika-map-seeded-v2');
location.reload();
```
這會清除本機進度，並重新匯入 `data.js` 中標記為 `collected: true` 的項目。

## License

商品圖片版權屬於 ©Nintendo / Creatures Inc. / GAME FREAK Inc. / The Pokémon Company。
本網頁僅作為玩家蒐集記錄之用，不販售任何商品、不代表官方。
