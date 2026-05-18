/**
 * 日本ご当地ピカチュウ データ
 *
 * 資料來源：使用者自行整理的清單 (2026/05)
 *
 * stores: 販售地點（含 Pokémon Center / Store / Cafe / 海外）
 * plushes: 各地限定皮卡丘絨毛娃娃
 *
 * 欄位說明：
 *   id           - 唯一 ID
 *   storeId      - 對應 stores 的 id
 *   nameZh       - 中文名（來自使用者清單）
 *   nameJa       - 日文名（推測 / 官方）
 *   priceText    - 顯示用價格字串
 *   priceJPY     - 用於篩選的數值（NT$ 已換算為 JPY，匯率 1:4.5）
 *   currency     - 'JPY' / 'TWD'
 *   type         - 「常駐」/「暫駐」/「活動」
 *   image        - 圖檔路徑（images/image-N.png）
 *   collected    - 使用者目前是否已收服（首次載入會寫入 localStorage）
 */

const STORES = [
  // ========== 北海道・東北 ==========
  {
    id: 'tohoku',
    region: 'tohoku',
    name: '東北寶可夢中心',
    nameJa: 'ポケモンセンタートウホク',
    address: '宮城県仙台市青葉区中央1-2-3 仙台パルコ本館 9F',
    lat: 38.2607,
    lng: 140.8825,
    gmaps: 'https://maps.google.com/?q=ポケモンセンタートウホク'
  },

  // ========== 關東 ==========
  {
    id: 'tokyo-dx',
    region: 'kanto',
    name: '東京DX寶可夢中心',
    nameJa: 'ポケモンセンタートウキョーDX',
    address: '東京都中央区日本橋2-11-2 日本橋高島屋S.C. 東館 5F',
    lat: 35.6822,
    lng: 139.7745,
    gmaps: 'https://maps.google.com/?q=ポケモンセンタートウキョーDX'
  },
  {
    id: 'skytree',
    region: 'kanto',
    name: '晴空塔寶可夢中心',
    nameJa: 'ポケモンセンタースカイツリータウン',
    address: '東京都墨田区押上1-1-2 東京スカイツリータウン・ソラマチ 4F',
    lat: 35.7100,
    lng: 139.8107,
    gmaps: 'https://maps.google.com/?q=ポケモンセンタースカイツリータウン'
  },
  {
    id: 'tokyo-station',
    region: 'kanto',
    name: '東京車站寶可夢商店',
    nameJa: 'ポケモンストアトーキョーステーション',
    address: '東京都千代田区丸の内1-9-1 東京駅一番街 B1F いちばんプラザ',
    lat: 35.6796,
    lng: 139.7670,
    gmaps: 'https://maps.google.com/?q=ポケモンストア+東京駅'
  },
  {
    id: 'tokyo-bay',
    region: 'kanto',
    name: '東京灣寶可夢中心',
    nameJa: 'ポケモンセンタートウキョーベイ',
    address: '千葉県船橋市浜町2-1-1 ららぽーとTOKYO-BAY 北館 2F',
    lat: 35.6863,
    lng: 139.9931,
    gmaps: 'https://maps.google.com/?q=ポケモンセンタートウキョーベイ'
  },

  // ========== 中部和北陸 ==========
  {
    id: 'kanazawa',
    region: 'chubu',
    name: '金澤寶可夢中心',
    nameJa: 'ポケモンセンターカナザワ',
    address: '石川県金沢市堀川新町3-1 金沢フォーラス 1F',
    lat: 36.5779,
    lng: 136.6491,
    gmaps: 'https://maps.google.com/?q=ポケモンセンターカナザワ'
  },
  {
    id: 'gotemba',
    region: 'chubu',
    name: '寶可夢商店 御殿場店',
    nameJa: 'ポケモンストア ゴテンバプレミアム・アウトレット店',
    address: '静岡県御殿場市深沢1312 御殿場プレミアム・アウトレット ヒルサイド 2350',
    lat: 35.2873,
    lng: 138.9095,
    gmaps: 'https://maps.google.com/?q=ポケモンストア+御殿場プレミアム・アウトレット'
  },

  // ========== 關西 ==========
  {
    id: 'kyoto',
    region: 'kansai',
    name: '京都寶可夢中心',
    nameJa: 'ポケモンセンターキョウト',
    address: '京都府京都市下京区四条通河原町西入真町52 京都高島屋S.C. T8 5F',
    lat: 35.0036,
    lng: 135.7689,
    gmaps: 'https://maps.google.com/?q=ポケモンセンターキョウト'
  },

  // ========== 中國和四國 ==========
  {
    id: 'hiroshima',
    region: 'chugoku-shikoku',
    name: '廣島寶可夢中心',
    nameJa: 'ポケモンセンターヒロシマ',
    address: '広島県広島市中区基町6-27 そごう広島店本館 9F',
    lat: 34.3984,
    lng: 132.4596,
    gmaps: 'https://maps.google.com/?q=ポケモンセンターヒロシマ'
  },
  {
    id: 'kagawa',
    region: 'chugoku-shikoku',
    name: '香川寶可夢中心',
    nameJa: 'ポケモンセンターカガワ',
    address: '香川県高松市丸亀町1-1 高松丸亀町壱番街東館 3F',
    lat: 34.3434,
    lng: 134.0494,
    gmaps: 'https://maps.google.com/?q=ポケモンセンターカガワ'
  },

  // ========== 九州、沖繩 ==========
  {
    id: 'fukuoka',
    region: 'kyushu-okinawa',
    name: '福岡寶可夢中心',
    nameJa: 'ポケモンセンターフクオカ',
    address: '福岡県福岡市博多区博多駅中央街1-1 JR博多シティ アミュプラザ博多 8F',
    lat: 33.5902,
    lng: 130.4205,
    gmaps: 'https://maps.google.com/?q=ポケモンセンターフクオカ'
  },
  {
    id: 'okinawa',
    region: 'kyushu-okinawa',
    name: '沖繩寶可夢中心',
    nameJa: 'ポケモンセンターオキナワ',
    address: '沖縄県中頭郡北中城村ライカム1番地 イオンモール沖縄ライカム 3F',
    lat: 26.3306,
    lng: 127.8201,
    gmaps: 'https://maps.google.com/?q=ポケモンセンターオキナワ'
  },

  // ========== 餐廳（咖啡廳） ==========
  {
    id: 'cafe-tokyo',
    region: 'cafe',
    name: '寶可夢咖啡廳 日本橋本店',
    nameJa: 'ポケモンカフェ 日本橋本店',
    address: '東京都中央区日本橋2-11-2 日本橋高島屋S.C. 東館 5F',
    lat: 35.6820,
    lng: 139.7748,
    gmaps: 'https://maps.google.com/?q=ポケモンカフェ+日本橋'
  },

  // ========== 機場 ==========
  {
    id: 'narita',
    region: 'airport',
    name: '成田機場寶可夢商店',
    nameJa: 'ポケモンストア成田空港店',
    address: '千葉県成田市古込字古込1-1 成田国際空港 第2旅客ターミナル 4F',
    lat: 35.7720,
    lng: 140.3929,
    gmaps: 'https://maps.google.com/?q=ポケモンストア+成田空港'
  },

  // ========== 海外 ==========
  {
    id: 'taipei',
    region: 'overseas',
    name: '台北寶可夢中心',
    nameJa: 'Pokémon Center TAIPEI',
    address: '台北市信義區松智路17號 微風南山 4F',
    lat: 25.0394,
    lng: 121.5664,
    gmaps: 'https://maps.google.com/?q=Pokemon+Center+Taipei'
  },
  {
    id: 'hsinchu',
    region: 'overseas',
    name: '新竹巨城（皮卡丘 DINER 快閃）',
    nameJa: 'BIG CITY 新竹（期間限定）',
    address: '新竹市東區中央路229號 巨城購物中心',
    lat: 24.8074,
    lng: 120.9707,
    gmaps: 'https://maps.google.com/?q=新竹巨城'
  }
];

const PLUSHES = [
  // ========== 北海道・東北（東北寶可夢中心） ==========
  {
    id: 'tanabata',
    storeId: 'tohoku',
    nameZh: '七夕祭皮卡丘',
    nameJa: '仙台七夕まつりピカチュウ',
    priceText: '¥3,520', priceJPY: 3520, currency: 'JPY',
    type: '常駐',
    image: 'images/image-32.png',
    collected: false
  },
  {
    id: 'sansa',
    storeId: 'tohoku',
    nameZh: '三颯舞皮卡丘',
    nameJa: '岩手さんさ踊りピカチュウ',
    priceText: '¥3,520', priceJPY: 3520, currency: 'JPY',
    type: '常駐',
    image: 'images/image-3.png',
    collected: false
  },
  {
    id: 'kanto-matsuri',
    storeId: 'tohoku',
    nameZh: '竿燈祭皮卡丘',
    nameJa: '秋田竿燈まつりピカチュウ',
    priceText: '¥3,520', priceJPY: 3520, currency: 'JPY',
    type: '常駐',
    image: 'images/image-12.png',
    collected: false
  },
  {
    id: 'hanagasa',
    storeId: 'tohoku',
    nameZh: '花笠祭皮卡丘',
    nameJa: '山形花笠まつりピカチュウ',
    priceText: '¥3,520', priceJPY: 3520, currency: 'JPY',
    type: '常駐',
    image: 'images/image-5.png',
    collected: false
  },
  {
    id: 'waraji',
    storeId: 'tohoku',
    nameZh: '草鞋祭皮卡丘',
    nameJa: '福島わらじまつりピカチュウ',
    priceText: '¥3,520', priceJPY: 3520, currency: 'JPY',
    type: '常駐',
    image: 'images/image-0.png',
    collected: false
  },
  {
    id: 'nebuta',
    storeId: 'tohoku',
    nameZh: '睡魔祭皮卡丘',
    nameJa: '青森ねぶた祭ピカチュウ',
    priceText: '¥3,520', priceJPY: 3520, currency: 'JPY',
    type: '常駐',
    image: 'images/image-25.png',
    collected: false
  },

  // ========== 關東 - 東京DX ==========
  {
    id: 'sakura-afro',
    storeId: 'tokyo-dx',
    nameZh: '櫻花頭皮卡丘',
    nameJa: '桜アフロのピカチュウ',
    priceText: '¥2,750', priceJPY: 2750, currency: 'JPY',
    type: '常駐',
    image: 'images/image-10.png',
    collected: false
  },
  {
    id: 'ninja',
    storeId: 'tokyo-dx',
    nameZh: '忍者姿皮卡丘',
    nameJa: '忍者ピカチュウ',
    priceText: '¥2,750', priceJPY: 2750, currency: 'JPY',
    type: '常駐',
    image: 'images/image-21.png',
    collected: false
  },
  {
    id: 'kabuki',
    storeId: 'tokyo-dx',
    nameZh: '歌舞伎風皮卡丘',
    nameJa: '歌舞伎ピカチュウ',
    priceText: '¥2,750', priceJPY: 2750, currency: 'JPY',
    type: '常駐',
    image: 'images/image-36.png',
    collected: false
  },

  // ========== 關東 - 晴空塔 ==========
  {
    id: 'kanto-pikachu',
    storeId: 'skytree',
    nameZh: '關東皮卡丘',
    nameJa: '関東ピカチュウ',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-27.png',
    collected: true
  },

  // ========== 關東 - 東京車站 ==========
  {
    id: 'stationmaster',
    storeId: 'tokyo-station',
    nameZh: '站長皮卡丘',
    nameJa: '駅長ピカチュウ',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-13.png',
    collected: true
  },
  {
    id: 'train',
    storeId: 'tokyo-station',
    nameZh: '電車皮卡丘',
    nameJa: '電車ピカチュウ',
    priceText: '¥2,970', priceJPY: 2970, currency: 'JPY',
    type: '暫駐',
    image: 'images/image-29.png',
    collected: false
  },

  // ========== 關東 - 東京灣 ==========
  {
    id: 'casual',
    storeId: 'tokyo-bay',
    nameZh: '休閒風皮卡丘',
    nameJa: 'カジュアルピカチュウ',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-24.png',
    collected: false
  },

  // ========== 中部和北陸 - 金澤 ==========
  {
    id: 'kanazawa',
    storeId: 'kanazawa',
    nameZh: '金澤皮卡丘',
    nameJa: '加賀友禅ピカチュウ',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-28.png',
    collected: false
  },

  // ========== 中部和北陸 - 御殿場 ==========
  {
    id: 'fujisan',
    storeId: 'gotemba',
    nameZh: '富士山皮卡丘',
    nameJa: '富士山ピカチュウ',
    priceText: '¥2,613', priceJPY: 2613, currency: 'JPY',
    type: '常駐',
    image: 'images/image-9.png',
    collected: false
  },

  // ========== 關西 - 京都 ==========
  {
    id: 'sado-male',
    storeId: 'kyoto',
    nameZh: '和服茶道 皮卡丘公',
    nameJa: '茶道ピカチュウ（男の子）',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-37.png',
    collected: false
  },
  {
    id: 'sado-female',
    storeId: 'kyoto',
    nameZh: '和服茶道 皮卡丘母',
    nameJa: '茶道ピカチュウ（女の子）',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-31.png',
    collected: false
  },

  // ========== 中國和四國 - 廣島 ==========
  {
    id: 'koinobori',
    storeId: 'hiroshima',
    nameZh: '鯉魚旗皮卡丘',
    nameJa: 'こいのぼりピカチュウ',
    priceText: '¥2,750', priceJPY: 2750, currency: 'JPY',
    type: '常駐',
    image: 'images/image-20.png',
    collected: false
  },
  {
    id: 'red-gyarados',
    storeId: 'hiroshima',
    nameZh: '紅色暴鯉龍皮卡丘',
    nameJa: '赤いギャラドスピカチュウ',
    priceText: '¥3,520', priceJPY: 3520, currency: 'JPY',
    type: '常駐',
    image: 'images/image-23.png',
    collected: false
  },

  // ========== 中國和四國 - 香川 ==========
  {
    id: 'udon',
    storeId: 'kagawa',
    nameZh: '烏龍麵皮卡丘',
    nameJa: 'うどんピカチュウ',
    priceText: '¥2,750', priceJPY: 2750, currency: 'JPY',
    type: '常駐',
    image: 'images/image-16.png',
    collected: false
  },
  {
    id: 'yadon',
    storeId: 'kagawa',
    nameZh: '呆呆獸皮卡丘',
    nameJa: 'ヤドンピカチュウ',
    priceText: '¥4,400', priceJPY: 4400, currency: 'JPY',
    type: '常駐',
    image: 'images/image-19.png',
    collected: false
  },

  // ========== 九州、沖繩 - 福岡 ==========
  {
    id: 'hakata-niwaka',
    storeId: 'fukuoka',
    nameZh: '博多面具皮卡丘',
    nameJa: '博多にわかピカチュウ',
    priceText: '¥2,750', priceJPY: 2750, currency: 'JPY',
    type: '常駐',
    image: 'images/image-18.png',
    collected: true
  },
  {
    id: 'ramen',
    storeId: 'fukuoka',
    nameZh: '拉麵皮卡丘',
    nameJa: 'ラーメンピカチュウ',
    priceText: '¥2,750', priceJPY: 2750, currency: 'JPY',
    type: '常駐',
    image: 'images/image-1.png',
    collected: true
  },
  {
    id: 'latios-latias',
    storeId: 'fukuoka',
    nameZh: '拉帝亞斯兄妹皮卡丘',
    nameJa: 'ラティオス＆ラティアスピカチュウ',
    priceText: '¥4,400', priceJPY: 4400, currency: 'JPY',
    type: '常駐',
    image: 'images/image-35.png',
    collected: true
  },

  // ========== 九州、沖繩 - 沖繩 ==========
  {
    id: 'windie',
    storeId: 'okinawa',
    nameZh: '風速狗皮卡丘',
    nameJa: 'ウインディピカチュウ',
    priceText: '¥4,950', priceJPY: 4950, currency: 'JPY',
    type: '常駐',
    image: 'images/image-8.png',
    collected: false
  },
  {
    id: 'ryukyu',
    storeId: 'okinawa',
    nameZh: '琉舞皮卡丘',
    nameJa: '琉球舞踊ピカチュウ',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-40.png',
    collected: false
  },
  {
    id: 'eisa',
    storeId: 'okinawa',
    nameZh: '哎薩皮卡丘',
    nameJa: 'エイサーピカチュウ',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-34.png',
    collected: false
  },

  // ========== 餐廳（咖啡廳） ==========
  {
    id: 'chef',
    storeId: 'cafe-tokyo',
    nameZh: '主廚皮卡丘',
    nameJa: 'シェフピカチュウ',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-2.png',
    collected: true
  },
  {
    id: 'maid',
    storeId: 'cafe-tokyo',
    nameZh: '女侍皮卡丘',
    nameJa: 'ウェイトレスピカチュウ',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-33.png',
    collected: true
  },
  {
    id: 'patissier',
    storeId: 'cafe-tokyo',
    nameZh: '糕點師傅皮卡丘',
    nameJa: 'パティシエピカチュウ',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-22.png',
    collected: true
  },
  {
    id: 'sweets-master',
    storeId: 'cafe-tokyo',
    nameZh: '甜點師皮卡丘',
    nameJa: 'スイーツピカチュウ',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-7.png',
    collected: true
  },
  {
    id: 'sweets-male',
    storeId: 'cafe-tokyo',
    nameZh: '皮卡丘Sweets公',
    nameJa: 'ピカチュウスイーツ（男の子）',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-39.png',
    collected: true
  },
  {
    id: 'sweets-female',
    storeId: 'cafe-tokyo',
    nameZh: '皮卡丘Sweets母',
    nameJa: 'ピカチュウスイーツ（女の子）',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-6.png',
    collected: true
  },

  // ========== 機場 ==========
  {
    id: 'pilot-1',
    storeId: 'narita',
    nameZh: '機長皮卡丘(一代)',
    nameJa: '機長ピカチュウ（初代）',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-38.png',
    collected: false
  },
  {
    id: 'pilot-2',
    storeId: 'narita',
    nameZh: '機長皮卡丘(二代)',
    nameJa: '機長ピカチュウ（二代目）',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-4.png',
    collected: true
  },
  {
    id: 'ca-1',
    storeId: 'narita',
    nameZh: '空姐皮卡丘(一代)',
    nameJa: 'CAピカチュウ（初代）',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-17.png',
    collected: false
  },
  {
    id: 'ca-2',
    storeId: 'narita',
    nameZh: '空姐皮卡丘(二代)',
    nameJa: 'CAピカチュウ（二代目）',
    priceText: '¥2,640', priceJPY: 2640, currency: 'JPY',
    type: '常駐',
    image: 'images/image-26.png',
    collected: true
  },
  {
    id: 'airplane',
    storeId: 'narita',
    nameZh: '飛機皮卡丘',
    nameJa: 'ひこうきピカチュウ',
    priceText: '¥2,970', priceJPY: 2970, currency: 'JPY',
    type: '暫駐',
    image: 'images/image-11.png',
    collected: true
  },

  // ========== 海外 - 台北 ==========
  {
    id: 'taipei',
    storeId: 'taipei',
    nameZh: '台北皮卡丘',
    nameJa: '台北ピカチュウ',
    priceText: 'NT$760', priceJPY: 3420, currency: 'TWD',
    type: '常駐',
    image: 'images/image-15.png',
    collected: true
  },
  {
    id: 'flying',
    storeId: 'taipei',
    nameZh: '飛翔皮卡丘',
    nameJa: 'そらとぶピカチュウ',
    priceText: 'NT$760', priceJPY: 3420, currency: 'TWD',
    type: '暫駐',
    image: 'images/image-14.png',
    collected: true
  },

  // ========== 海外 - 新竹 ==========
  {
    id: 'pika-diner',
    storeId: 'hsinchu',
    nameZh: '皮卡丘 DINER',
    nameJa: 'ピカチュウ DINER',
    priceText: 'NT$930', priceJPY: 4185, currency: 'TWD',
    type: '活動',
    image: 'images/image-30.png',
    collected: true
  }
];

const REGIONS = [
  { id: 'all',             label: '全部',         color: '#1A1A2E' },
  { id: 'tohoku',          label: '北海道・東北', color: '#5B9BD5' },
  { id: 'kanto',           label: '關東',         color: '#EE1515' },
  { id: 'chubu',           label: '中部・北陸',   color: '#4CAF50' },
  { id: 'kansai',          label: '關西',         color: '#FF7043' },
  { id: 'chugoku-shikoku', label: '中國・四國',   color: '#00ACC1' },
  { id: 'kyushu-okinawa',  label: '九州・沖繩',   color: '#26C6DA' },
  { id: 'cafe',            label: '餐廳',         color: '#8D6E63' },
  { id: 'airport',          label: '機場',        color: '#03A9F4' },
  { id: 'overseas',        label: '海外',         color: '#E91E63' }
];

const TYPES = [
  { id: 'all',   label: '全部', color: '#1A1A2E' },
  { id: '常駐',  label: '常駐', color: '#4CAF50' },
  { id: '暫駐',  label: '暫駐', color: '#FF9800' },
  { id: '活動',  label: '活動', color: '#E91E63' }
];

// Export
window.STORES = STORES;
window.PLUSHES = PLUSHES;
window.REGIONS = REGIONS;
window.TYPES = TYPES;
