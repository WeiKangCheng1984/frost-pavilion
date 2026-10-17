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

/** 可翻頁的段落。每一頁對應 lines 裡的一則，每則最多四行。 */
export const passages = {
  prologue: ["prologue.1", "prologue.2", "prologue.3", "prologue.4"],
  enter: {
    1: ["enter.1.a", "enter.1.b"],
    2: ["enter.2.a", "enter.2.b"],
    3: ["enter.3.a", "enter.3.b"],
    4: ["enter.4.a", "enter.4.b"],
    5: ["enter.5.a", "enter.5.b"],
    6: ["enter.6.a", "enter.6.b"],
    7: ["enter.7.a", "enter.7.b"]
  },
  clear: {
    1: ["clear.1.a", "clear.1.b"],
    2: ["clear.2.a", "clear.2.b"],
    3: ["clear.3.a", "clear.3.b"],
    4: ["clear.4.a", "clear.4.b"],
    5: ["clear.5.a", "clear.5.b"],
    6: ["clear.6.a", "clear.6.b"]
  },
  letter: ["letter.1", "letter.2"]
};

/** 每則最多四行，每行最多十八字。測試會檢查。 */
export const lines = {
  "prologue.1": [
    "你摸黑進了天絕閣。",
    "滅門那夜，你是被留下的一個。",
    "劍在腰上，恨在喉嚨裡。",
    "閣門在你身後自己合上。"
  ],
  "prologue.2": [
    "仇家把這座石閣叫暗室。",
    "你要找的人，據說還在裡面。",
    "當年動手的，你只記得白髮。",
    "你認定那就是閣中長老。"
  ],
  "prologue.3": [
    "你沒帶第二個人。",
    "也沒拆過任何一封舊信。",
    "信若在閣裡，就讓它先躺著。",
    "今晚只要一個能償命的人。"
  ],
  "prologue.4": [
    "石壁先攔住你。",
    "青苔裡嵌著八個卦符。",
    "有人在壁上留了詩。",
    "先把詩讀懂，再伸手。"
  ],
  "enter.1.a": [
    "壁上的詩不是裝飾。",
    "它在教你走哪三個方位。",
    "其餘卦符會把凹槽彈回。",
    "方位在調查裡，詩在壁上。"
  ],
  "enter.1.b": [
    "你把掌心按上青苔。",
    "石粉冰得像仇人的姓。",
    "八個鈕都醒著。",
    "點錯只清空，人還在原地。"
  ],
  "clear.1.a": [
    "暗格彈開，寒氣先撲出來。",
    "一枚銀針躺在絨布裡。",
    "細得像一句沒說完的話。",
    "你把它拈進袖中。"
  ],
  "clear.1.b": [
    "針是冷的，不是你的舊物。",
    "有人算準你會走到這一格。",
    "前面石室裡站著一具銅人。",
    "針若有用，就用在它身上。"
  ],
  "enter.2.a": [
    "銅人矮你半頭，胸口三個孔。",
    "孔旁刻著穴名，不用背誦。",
    "殘句要由上卸到下。",
    "沒有針的人，孔也不肯開。"
  ],
  "enter.2.b": [
    "你把銀針在袖裡轉了一圈。",
    "這針原該刺向白髮那人。",
    "眼下它只肯進銅孔。",
    "由胸往腹，一孔一孔卸。"
  ],
  "clear.2.a": [
    "第三孔吞進針，底座應了一聲。",
    "地面裂開，五塊磚露出來。",
    "針還在袖裡，像用過的鑰匙。",
    "銅人重新闔眼，不再理你。"
  ],
  "clear.2.b": [
    "磚上是金、木、水、火、土。",
    "壁上有一首很短的詩。",
    "詩只肯帶你走四步。",
    "多出來的那塊，會咬人。"
  ],
  "enter.3.a": [
    "五塊磚都亮著，路只有四步。",
    "詩在壁上，不在江湖口訣裡。",
    "金那一塊看起來最硬。",
    "這閣裡，硬的常常是陷阱。"
  ],
  "enter.3.b": [
    "江湖人總愛把金放第一。",
    "這閣的主人顯然不吃這套。",
    "先去讀詩，再落腳。",
    "踩錯有暗箭，人還在原地。"
  ],
  "clear.3.a": [
    "第四步落下，鐵柵沉進地裡。",
    "暗箭沒再響，袖口還是熱的。",
    "裡面亮著一盤沒下完的棋。",
    "棋子少，像有人中途掀了桌。"
  ],
  "clear.3.b": [
    "你本不想下棋。",
    "仇人沒坐在棋盤對面。",
    "可這盤殘局擋住門。",
    "看懂它，門後才給東西。"
  ],
  "enter.4.a": [
    "棋盤小，只容四個答案。",
    "盤側寫著兩子怎樣輪提。",
    "你若沒下過棋，就照盤面認。",
    "別挑聽起來最狠的那個詞。"
  ],
  "enter.4.b": [
    "你蹲下去，膝頭撞到棋罐。",
    "罐子是空的。",
    "好棋手不把子留在盤外。",
    "這盤是留給後來的人的。"
  ],
  "clear.4.a": [
    "你點中那個詞，棋盤翻了身。",
    "底下是一封信，還有一桿秤。",
    "信紙發黃，秤星還亮。",
    "你先把兩樣都收進囊中。"
  ],
  "clear.4.b": [
    "信可以現在拆，也可以再等。",
    "它不是下一道密碼。",
    "秤卻是。前面有藥味。",
    "沒有秤，份數只是猜測。"
  ],
  "enter.5.a": [
    "藥架上四味，名字都很兇。",
    "殘卷不考藥性，只考標籤。",
    "紅熱、寒引、青熱、可解。",
    "份數只有零、一、二。"
  ],
  "enter.5.b": [
    "其中一味，卷上說要別置。",
    "別置不是放進碗裡。",
    "放錯，碗報廢，架上還能再取。",
    "鎖鏈在爐旁，等著這一碗。"
  ],
  "clear.5.a": [
    "藥碰上鎖，鏈節嘶地開了。",
    "這份腐鐵用不回，也不進囊。",
    "雪蓮若別置了，丹在掌心。",
    "你聞見又熱又冷的味道。"
  ],
  "clear.5.b": [
    "碗底還黏著一點。",
    "刮不刮，是另一個選擇。",
    "刮起來的，也許還開得了鎖。",
    "不刮，它就自己乾掉。"
  ],
  "enter.6.a": [
    "藥味還在袖口。",
    "暗門裡四扇屏風，各寫一句。",
    "四句被人故意排錯。",
    "你要把句子排回能讀的樣子。"
  ],
  "enter.6.b": [
    "四句各自像一句詩。",
    "合攏之後，才像一件事。",
    "先別急著替規律取名字。",
    "上下挪動，讀順了再交。"
  ],
  "clear.6.a": [
    "最後一句歸位，暗門滑開。",
    "門後沒有立刻塌下來。",
    "一縷香剛點上，煙還是直的。",
    "香盡之前，閣還給你時間。"
  ],
  "clear.6.b": [
    "屏風旁掛著一柄短刃。",
    "輕，刃口卻亮，像新磨過。",
    "拿不拿，等這段話說完。",
    "有些門後，刀比話更快。"
  ],
  "enter.7.a": [
    "石床上鎖著一個人。",
    "鐵鏈咬著他的手腕。",
    "白髮盲眼，正是你要的那張臉。",
    "他聞見你，先問信看過沒。"
  ],
  "enter.7.b": [
    "青龍石開門。白虎石引地火。",
    "袖裡有什麼，這時才用得上。",
    "香已斜了，閣快塌了。",
    "這一回，沒有重來。"
  ],
  "bagua.fail": ["石壁哼了一聲，凹槽全部彈回。"],
  "bagua.step": ["凹槽吃進一格，像點了頭。"],
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
  "acupoint.step": ["銀針沒入，銅人沒有叫。"],
  "acupoint.success": ["底座旋開，地面露出五行磚。"],
  "bronze.inspect": [
    "最上是膻中，在胸前。",
    "中間是鳩尾，在胸腹間。",
    "最下是氣海，在腹上。",
    "殘句要你由上卸到下。"
  ],
  "wuxing.fail": ["暗箭擦過袖口，地磚彈回。"],
  "wuxing.step": ["這一磚沉了，暗箭沒響。"],
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
  "letter.1": [
    "孩子，我不等你原諒。",
    "滅門那夜，另有朝廷的人。",
    "他們要我動手，我頂下罵名。",
    "我用這個罵名，換你一條命。"
  ],
  "letter.2": [
    "你若要殺的是我，刀可以落。",
    "下命令的那個人，還在深宮裡。",
    "這封信不是讓你替我開脫。",
    "恨放在哪，由你自己決定。"
  ],
  "scale.inspect": ["秤桿很直。份數會在上面現形。"],
  "needle.inspect": ["寒鐵銀針，冷得像沒出口的話。"],
  "brew.scroll": ["紅熱二，寒引一。", "可解別置。青熱棄之。"],
  "brew.herbs": [
    "鶴頂紅是紅熱，相思子是寒引。",
    "雪蓮花可解，斷腸草是青熱。"
  ],
  "brew.noscale": ["沒有配藥秤，份數無從量起。"],
  "brew.fail": ["藥碗報廢，毒架還能再取。"],
  "brew.success": ["鎖鏈融斷，那份腐鐵用不回。"],
  "brew.askSmear": [
    "碗底還黏著一點餘膏。",
    "刮起來，以後也許用得上。",
    "放著，它會自己乾掉。",
    "要刮嗎？"
  ],
  "brew.smearYes": ["餘膏刮起，收進囊中。"],
  "brew.smearNo": ["你放下藥碗，餘膏就此放乾。"],
  "sword.fail": ["順序不對，四句彈回原位。"],
  "sword.success": ["暗門滑開，香還沒有開始燒。"],
  "blade.ask": [
    "屏風旁掛著一柄短刃。",
    "拿了，門後多一個很快的選擇。",
    "不拿，你還有石頭和自己的手。",
    "要取下嗎？"
  ],
  "blade.yes": ["你取下短刃。"],
  "blade.no": ["短刃留在原處。"],
  "blade.inspect": ["短刃很輕。輕的刀，往往最快。"],
  "pill.inspect": ["雪蓮別置後收成的一枚解毒丹。"],
  "smear.inspect": ["碗底刮起的一點，還帶著熱。"],
  "ending.wolf.unread": [
    "白虎石沉下去，地火吞沒石床。",
    "你撞出石閣，晨曦刺得人眼疼。",
    "囊裡那封信還封著口。",
    "人已經不在，你才想起來拆。"
  ],
  "ending.wolf.read": [
    "白虎石沉下去，地火吞沒石床。",
    "你撞出石閣，晨風裡全是灰。",
    "信你早就讀過，每個字都在。",
    "你還是砍了他。晨曦不說話。"
  ],
  "ending.flee": [
    "青龍門開，你一個人走出去。",
    "身後鐵鏈還在響，香只剩一點。",
    "丹若在袖中，你沒有留下。",
    "門在你背後合上，像一句再見。"
  ],
  "ending.sever": [
    "你把丹放在他手邊，沒有叫醒他。",
    "這一夜沒有再殺，也沒有抱拳。",
    "恩與怨都停在這道門檻上。",
    "你走出門時，沒有再回頭。"
  ],
  "ending.ember": [
    "餘膏化開鐵鏈，他抓著你的袖。",
    "兩個人在塌下來之前衝出。",
    "信上那個權貴，還坐在深宮。",
    "私仇到這裡為止，火種還在。"
  ],
  "ending.buried": [
    "引信燃盡，你還站在兩石之間。",
    "萬斤巨石砸下來，連光一起埋。",
    "人、信、恨，都沒有走出這門。",
    "山外沒人知道閣裡的選擇。"
  ],
  "ending.placePill": ["你把解毒丹放在他手邊。"],
  "ending.freeChains": ["餘膏塗上鐵鏈，鏈節鬆開。"],
  "ending.locked": ["開場還沒完，石頭按了沒反應。"],
  "letter.closed": ["信已合上，石頭還在。"]
};
