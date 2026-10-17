/** 純資料。關卡推進不寫在這個檔案。 */

export const timerMs = 60000;

export const items = {
  needle: "寒鐵銀針",
  letter: "泛黃的密信",
  scale: "配藥秤",
  pill: "解毒丹",
  acid_smear: "碗底餘膏",
  blade: "短刃"
};

export const trigrams = [
  { id: "qian", label: "乾" },
  { id: "dui", label: "兌" },
  { id: "li", label: "離" },
  { id: "zhen", label: "震" },
  { id: "xun", label: "巽" },
  { id: "kan", label: "坎" },
  { id: "gen", label: "艮" },
  { id: "kun", label: "坤" }
];

export const acupoints = [
  { id: "shanzhong", label: "膻中" },
  { id: "jiuwei", label: "鳩尾" },
  { id: "qihai", label: "氣海" }
];

export const elements = [
  { id: "metal", label: "金" },
  { id: "wood", label: "木" },
  { id: "water", label: "水" },
  { id: "fire", label: "火" },
  { id: "earth", label: "土" }
];

export const herbs = [
  { id: "hongre", name: "鶴頂紅", tag: "紅熱" },
  { id: "hanyin", name: "相思子", tag: "寒引" },
  { id: "xuelian", name: "雪蓮花", tag: "可解" },
  { id: "qingre", name: "斷腸草", tag: "青熱" }
];

export const verses = {
  lineA: "冤沉閣底劍光寒",
  lineB: "有恨難平不共天",
  lineC: "頭白方知恩是刃",
  lineD: "在此一別問青天"
};

export const puzzles = {
  bagua: {
    phase: 1,
    length: 3,
    answer: ["zhen", "dui", "kan"],
    grant: ["needle"],
    failLine: "bagua.fail",
    stepLine: "bagua.step",
    successLine: "bagua.success"
  },
  acupoint: {
    phase: 2,
    requires: ["needle"],
    answer: ["shanzhong", "jiuwei", "qihai"],
    grant: [],
    blockedLine: "acupoint.blocked",
    failLine: "acupoint.fail",
    stepLine: "acupoint.step",
    successLine: "acupoint.success"
  },
  wuxing: {
    phase: 3,
    answer: ["wood", "earth", "water", "fire"],
    trap: ["metal"],
    grant: [],
    failLine: "wuxing.fail",
    stepLine: "wuxing.step",
    successLine: "wuxing.success"
  },
  ko: {
    phase: 4,
    options: ["ko", "eye", "snapback", "seki"],
    answer: "ko",
    grant: ["letter", "scale"],
    failLine: "ko.fail",
    successLine: "ko.success"
  }
};

export const brew = {
  phase: 5,
  requires: ["scale"],
  recipe: { hongre: 2, hanyin: 1, qingre: 0, xuelian: 0 },
  blockedLine: "brew.noscale",
  failLine: "brew.fail",
  successLine: "brew.success",
  askLine: "brew.askSmear"
};

export const sword = {
  phase: 6,
  answer: ["lineA", "lineB", "lineC", "lineD"],
  initial: ["lineB", "lineD", "lineA", "lineC"],
  failLine: "sword.fail",
  successLine: "sword.success"
};

export const endingNames = {
  wolf: "孤狼飲血",
  flee: "獨行出閣",
  sever: "斬斷因果",
  ember: "薪火未熄",
  buried: "埋骨空山"
};

/** 每則最多四行，每行最多十八字。測試會檢查。 */
export const lines = {
  "bagua.intro": [
    "石壁上的八卦積了青苔。",
    "詩要你先東，再西，再北。",
    "離火那一格不是生路。"
  ],
  "bagua.fail": ["這一步不對，凹槽全部彈回。"],
  "bagua.step": ["凹槽陷下一格。"],
  "bagua.success": ["暗格彈開，裡頭是寒鐵銀針。"],
  "compass.inspect": [
    "震在東，兌在西。",
    "離在南，坎在北。",
    "其餘四卦，壁上沒有路。"
  ],
  "bagua.poem": [
    "日出東方震雷響，",
    "日落西山兌澤長。",
    "不向離火尋生路，",
    "反自坎水覓微光。"
  ],
  "acupoint.blocked": ["指尖按不進銅孔。"],
  "acupoint.fail": ["穴序不對，銅孔重新闔上。"],
  "acupoint.step": ["銀針沒入一孔。"],
  "acupoint.success": ["底座旋開，地面露出五行磚。"],
  "bronze.inspect": [
    "最上是膻中，在胸前。",
    "中間是鳩尾，在胸腹間。",
    "最下是氣海，在腹上。",
    "殘句要你由上卸到下。"
  ],
  "wuxing.fail": ["暗箭擦過袖口，地磚彈回。"],
  "wuxing.step": ["這一磚沉了下去。"],
  "wuxing.success": ["鐵柵下沉，前面是一盤殘局。"],
  "wuxing.poem": [
    "木困荒土，土逢寒水。",
    "水遏熾火，火爍頑金。"
  ],
  "ko.hint": [
    "兩子輪提，提完再落就是劫。",
    "此處不叫做眼，也不叫倒撲。"
  ],
  "ko.fail": ["棋子歸位，還可以再選。"],
  "ko.success": ["棋盤翻開，密信和配藥秤在裡。"],
  "letter.body": [
    "滅門那夜，另有朝廷權貴。",
    "他們脅我動手，我頂下罵名。",
    "我這樣做，是為了留你一命。",
    "你既讀到這裡，冤就有了頭。"
  ],
  "scale.inspect": ["這是一桿配藥秤。"],
  "needle.inspect": ["寒鐵銀針，又細又冷。"],
  "brew.scroll": ["紅熱二，寒引一。", "可解別置。青熱棄之。"],
  "brew.herbs": [
    "鶴頂紅是紅熱，相思子是寒引。",
    "雪蓮花可解，斷腸草是青熱。"
  ],
  "brew.noscale": ["沒有配藥秤，份數無從量起。"],
  "brew.fail": ["藥碗報廢，毒架還能再取。"],
  "brew.success": ["鎖鏈融斷，那份腐鐵用不回。"],
  "brew.askSmear": ["要不要刮起碗底的餘膏？"],
  "brew.smearYes": ["餘膏刮起，收進囊中。"],
  "brew.smearNo": ["你放下藥碗，餘膏就此放乾。"],
  "sword.fail": ["順序不對，四句彈回原位。"],
  "sword.success": ["暗門滑開，香還沒有開始燒。"],
  "blade.ask": ["屏風旁掛著一柄短刃。"],
  "blade.yes": ["你取下短刃。"],
  "blade.no": ["短刃留在原處。"],
  "blade.inspect": ["短刃很輕，刃口仍亮。"],
  "pill.inspect": ["雪蓮別置後收成的解毒丹。"],
  "smear.inspect": ["碗底刮起的一點餘膏。"],
  "ending.intro": [
    "長老被鐵鏈鎖在石床上。",
    "他雙目已盲，只問你可曾讀信。",
    "青龍石開門，白虎石引地火。",
    "香火將盡，閣就要塌了。"
  ],
  "ending.wolf.unread": [
    "白虎石沉，地火吞沒石床。",
    "你逃出石閣，晨曦刺眼。",
    "密信還未拆，人已經不在。"
  ],
  "ending.wolf.read": [
    "白虎石沉，地火吞沒石床。",
    "你逃出石閣，晨曦刺眼。",
    "信你早已讀過，仍砍了他。"
  ],
  "ending.flee": [
    "青龍門開，你一個人走出去。",
    "長老仍鎖在即將塌下的閣裡。",
    "丹若還在身上，你也沒留下。"
  ],
  "ending.sever": [
    "你把丹放在他手邊，轉身離開。",
    "這一夜沒有再殺，也沒有和解。",
    "恩與怨都停在這道門。"
  ],
  "ending.ember": [
    "餘膏化開鐵鏈，你們一起衝出。",
    "信上那個權貴，還在深宮裡。",
    "私仇到此為止，火種還在。"
  ],
  "ending.buried": [
    "引信燃盡，萬斤巨石砸下。",
    "人、信、恨，一起埋進廢墟。"
  ],
  "ending.placePill": ["你把解毒丹放在他手邊。"],
  "ending.freeChains": ["餘膏塗上鐵鏈，鏈節鬆開。"],
  "ending.locked": ["開場還沒完，石頭按了沒反應。"],
  "letter.closed": ["信已合上，石頭還在。"]
};
