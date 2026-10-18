/** 純資料。關卡推進不寫在這個檔案。由 scripts/sync-content.mjs 從文案稿.md 同步 lines／hints。 */

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
  { id: "tiantu", label: "天突" },
  { id: "shanzhong", label: "膻中" },
  { id: "zhongwan", label: "中脘" },
  { id: "jiuwei", label: "鳩尾" },
  { id: "qihai", label: "氣海" },
  { id: "guanyuan", label: "關元" }
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
  { id: "pishuang", name: "砒霜", tag: "白寒" },
  { id: "xuelian", name: "雪蓮花", tag: "可解" },
  { id: "gouwen", name: "鉤吻", tag: "紫熱" },
  { id: "qingre", name: "斷腸草", tag: "青熱" },
  { id: "langdu", name: "狼毒", tag: "苦寒" }
];

export const koMoves = [
  { id: "take", label: "提子" },
  { id: "seize", label: "提劫" },
  { id: "retake", label: "對方提回" },
  { id: "pass", label: "虛手" },
  { id: "elsewhere", label: "別處落子" },
  { id: "stick", label: "粘回" },
  { id: "fill", label: "填回原點" }
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
    readyFlag: "needleReady",
    answer: ["qihai", "shanzhong", "jiuwei"],
    grant: [],
    blockedLine: "acupoint.blocked",
    unreadyLine: "acupoint.sheathed",
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
    answer: ["take", "retake", "elsewhere", "fill"],
    grant: ["letter", "scale"],
    failLine: "ko.fail",
    stepLine: "ko.step",
    successLine: "ko.success"
  }
};

export const brew = {
  phase: 5,
  requires: ["scale"],
  recipe: { hongre: 2, hanyin: 1, qingre: 0, xuelian: 0, pishuang: 0, gouwen: 0, langdu: 0 },
  asideCorrect: "xuelian",
  blockedLine: "brew.fail.scale",
  failQing: "brew.fail.qing",
  failSnow: "brew.fail.snow",
  failExtra: "brew.fail.extra",
  failRatio: "brew.fail.ratio",
  asideChoices: ["xuelian", "langdu", "qingre"],
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

/** 每一則代號是一頁。 */
export const passages = {
  prologue: ["prologue.1", "prologue.2", "prologue.3", "prologue.4"],
  enter: {
    1: ["enter.1.a", "enter.1.b", "enter.1.c"],
    2: ["enter.2.a", "enter.2.b", "enter.2.c"],
    3: ["enter.3.a", "enter.3.b"],
    4: ["enter.4.a", "enter.4.b"],
    5: ["enter.5.a", "enter.5.b", "enter.5.c"],
    6: ["enter.6.a", "enter.6.b"],
    7: ["enter.7.a", "enter.7.b", "enter.7.c", "enter.7.d", "enter.7.e", "enter.7.f"]
  },
  clear: {
    1: ["clear.1.a", "clear.1.b", "clear.1.c"],
    2: ["clear.2.a", "clear.2.b"],
    3: ["clear.3.a", "clear.3.b"],
    4: ["clear.4.a", "clear.4.b", "clear.4.c"],
    5: {
      with: ["clear.5.with.a", "clear.5.with.b", "clear.5.with.c"],
      none: ["clear.5.none.a", "clear.5.none.b", "clear.5.none.c"]
    },
    6: ["clear.6.a", "clear.6.b", "clear.6.c"]
  },
  letter: ["letter.1", "letter.2", "letter.3", "letter.4"]
};

export const hints = {
  passage: "",
  letter: "信還攤著。合上，香才再燒。",
  smear: "碗底那一點，不刮就冷了。",
  blade: "短刃可以取，也可以留在這裡。",
  bagua: "詩在壁上。方位，你再看一眼。",
  needleMissing: "袖裡沒有針。",
  needleSheathed: "針還在囊裡。",
  needleReady: "六個孔。底座那句才算數。",
  wuxing: "五塊裡只走四步。詩在壁上。",
  ko: "盤側舊刻，別被後添的字帶走。",
  brew: "殘卷為準。假籤、假批，都有。",
  sword: "四句還沒站到一起。",
  finaleLocked: "",
  finale: "白的是火，青的是門。囊裡那些，是你自己的事。"
};

export const lines = {
  "prologue.1": [
    "天絕閣門在背後闔上，聲很輕。滅門那夜，院子裡只餘你一個活口。"
  ],
  "prologue.2": [
    "劍在你腰上，冷得像初秋的河。恨醒得更早，卡在喉嚨，許多年了。"
  ],
  "prologue.3": [
    "你要找的人還在閣裡。你只記得他有一頭白髮，你便把這一生的任務，都押在那個影子上。"
  ],
  "prologue.4": [
    "你沒帶同伴。舊信在背包裡，封口沒動。今晚你只想讓他見血，門闔上了，外頭的風進不來。"
  ],
  "enter.1.a": [
    "壁上有詩，也有八卦。詩上指著一條路；其餘的卦，凹槽一碰就彈回。"
  ],
  "enter.1.b": [
    "方位是一份，詩是另一份。最順手的那一卦，未必是詩裡的一步。需要你仔細推敲。"
  ],
  "enter.1.c": [
    "掌心按上青苔，冰得指骨發疼。這感覺不像滅門那夜的熱，是乾的、靜的。點錯了，人還站在原處。"
  ],
  "clear.1.a": [
    "暗格彈開。絨布裡有一枚銀針，細得像一句沒說完的話。你把它拈進袖裡。"
  ],
  "clear.1.b": [
    "這針似乎有人算準你會走到這裡，先把它留在暗處。"
  ],
  "clear.1.c": [
    "銅人立在前面，你懷疑這針有用。"
  ],
  "enter.2.a": [
    "眼前的銅人矮你半個頭，身上有六個孔。穴名刻在旁邊，有的字口新些。"
  ],
  "enter.2.b": [
    "胸口那行「由上至下」被人刮壞了。硃砂另寫「先刺天突」——那行墨色最新，像故意留的。"
  ],
  "enter.2.c": [
    "底座寫著：先開丹田之海，再啟胸前之門，針停於兩者之間。關元旁也刻了海字，別被它騙。"
  ],
  "clear.2.a": [
    "最後一孔吞進針，底座應了一聲。地面裂開，五塊磚露出來。"
  ],
  "clear.2.b": [
    "針還在袖裡。這間屋子的孔用完了。磚上是金、木、水、火、土，最硬的那塊很顯眼。"
  ],
  "enter.3.a": [
    "五塊都亮著。壁上的詩只帶出了四步。金那一塊最硬，也最像正路。"
  ],
  "enter.3.b": [
    "這閣裡，硬的往往先斷。你先去看了壁上那幾句，想著如何決定落哪一腳。"
  ],
  "clear.3.a": [
    "第四步落下，鐵柵沉進地裡。袖口還很熱，像有人剛從暗處掠過，而裡面是一盤沒下完的棋。"
  ],
  "clear.3.b": [
    "仇人沒有坐在對面，這盤卻把路擋住了。"
  ],
  "enter.4.a": [
    "棋盤側邊寫著：兩子輪流提，提完不能立刻填回。後頭又被人添了「提劫亦算」——筆跡不同。"
  ],
  "enter.4.b": [
    "罐底另刻粘回可破，虛手那格是後來補的。要先在別處落一子，再回到原點——盤側這句，才像原來的。"
  ],
  "clear.4.a": [
    "最後一手落下，棋盤翻開。底下有一封發黃的信，還有一桿秤。信還合著，紙角有著異樣的溫度。"
  ],
  "clear.4.b": [
    "拆不拆，都是你能自己決定的事，前面有藥味鑽進來，像遠山起霧。"
  ],
  "clear.4.c": [
    "秤如果還擱在囊裡，份數就只是猜，猜的東西，或許不適合倒進碗裡。"
  ],
  "enter.5.a": [
    "架上有七味，名字都很兇。標籤有的舊、有的新，殘卷與架籤未必同聲。"
  ],
  "enter.5.b": [
    "份數在殘卷上。秤還在囊裡，沒稱過的碗，你能放心?"
  ],
  "enter.5.c": [
    "雪蓮若要別置，就不需要在碗裡。有人旁批「苦寒亦可別置」——那行是後加的。青熱不該留下。配錯了，這碗就作廢。"
  ],
  "clear.5.with.a": [
    "藥碰上了鎖，鏈節就這樣開了。雪蓮留在碗外，像把一句話留在唇邊。掌心多了一枚丹。"
  ],
  "clear.5.with.b": [
    "這丹不是給你提神的。似乎是留給某個人的。"
  ],
  "clear.5.with.c": [
    "碗底還黏著一點。"
  ],
  "clear.5.none.a": [
    "鏈節開了。雪蓮進了碗，和藥一起耗盡。掌心空空的。"
  ],
  "clear.5.none.b": [
    "沒有丹，能留什麼給他人。"
  ],
  "clear.5.none.c": [
    "碗底還黏著一點。讓它就在這裡慢慢冷掉嗎?"
  ],
  "enter.6.a": [
    "藥味還在袖口。四扇屏風各寫一句，被人排錯了。"
  ],
  "enter.6.b": [
    "四句各自像一句詩。合在一起，才像一件事。你先不替它取名字。"
  ],
  "clear.6.a": [
    "暗門滑開。一縷香剛點上，煙還是直的，細得像銀針。香盡之前，還有一點時間。"
  ],
  "clear.6.b": [
    "旁邊掛著一柄短刃。很輕，刃口卻亮。你拿了，就是一條很快、會流血的路。"
  ],
  "clear.6.c": [
    "門後有兩塊石頭。白的引火，青的開門。你若要人活著出去，那就不能選擇刀。"
  ],
  "enter.7.a": [
    "石床上鎖著一個人。白髮，盲眼，正是你要找的那張臉。他開口先問了你，那封信看過沒有。"
  ],
  "enter.7.b": [
    "他說，白虎是地火。按下就能讓他解脫。而刀也是這條路，或許能讓他更痛快。"
  ],
  "enter.7.c": [
    "他說，青龍可以讓門打開，你想一個人走嗎?"
  ],
  "enter.7.d": [
    "你想清楚了嗎? 都放著嗎? 似乎沒有太多時間了。"
  ],
  "enter.7.e": [
    "你心想，那這餘膏又能如何? 誰在背後呢?"
  ],
  "enter.7.f": [
    "香已經斜了。煙不再直。香盡你還沒選，這閣會塌下來。你聽著，沒有接話。"
  ],
  "letter.1": [
    "孩子。我不等你原諒。"
  ],
  "letter.2": [
    "滅門那夜另有朝廷的人。他們要我動手。我頂下罵名，換你一條命。"
  ],
  "letter.3": [
    "你若要殺的是我，就來吧，刀可以落，我能承擔。這封信不是密碼，我也從不替自己開脫。"
  ],
  "letter.4": [
    "恨放在我身上，由你自己決定，我只把事實留在紙上。"
  ],
  "bagua.fail": [
    "石壁哼了一聲，凹槽彈回。這一手不是詩裡的。"
  ],
  "bagua.step": [
    "凹槽吃進一格。像點了頭。"
  ],
  "bagua.success": [
    "暗格彈開。裡頭是一枚寒鐵銀針。"
  ],
  "compass.inspect": [
    "震在東，兌在西。離在南，坎在北。其餘四卦，壁上沒有路。"
  ],
  "bagua.poem": [
    "日出東方震雷響，日落西山兌澤長。不向離火尋生路，反自坎水覓微光。"
  ],
  "acupoint.blocked": [
    "指尖按不進去。銀針不在囊裡。"
  ],
  "acupoint.sheathed": [
    "針還收著。空手按上去，孔不會開。"
  ],
  "acupoint.fail": [
    "舊訣已經被刮掉了。孔又闔上。"
  ],
  "acupoint.step": [
    "針沒入。銅人沒有出聲。"
  ],
  "acupoint.success": [
    "底座旋開。地下是五行磚。"
  ],
  "bronze.inspect": [
    "氣海在腹上，是丹田之海。膻中在胸前，是胸前之門。鳩尾在兩者之間。天突、中脘、關元也開著孔——底座沒點它們的名。"
  ],
  "wuxing.fail": [
    "暗箭擦過袖口。這一腳不是詩裡的下一步。"
  ],
  "wuxing.step": [
    "這一磚沉了。暗箭沒響。"
  ],
  "wuxing.success": [
    "鐵柵下沉。前面是一盤殘局。"
  ],
  "wuxing.poem": [
    "木困荒土，土逢寒水。水遏熾火，火爍頑金。"
  ],
  "ko.hint": [
    "盤側舊刻：兩子輪流提，提完不可立刻填回，先在別處落一子，再回來。提劫、粘回、虛手——像後人添的。"
  ],
  "ko.fail": [
    "這一手不對。棋子歸位了。"
  ],
  "ko.step": [
    "這一手落下。還沒完。"
  ],
  "ko.success": [
    "棋盤翻開。裡面是信，還有一桿秤。"
  ],
  "letter.inspect": [
    "還沒攤開。紙角摸起來很燙。"
  ],
  "letter.closed": [
    "信合上了。他寫的那些，不會跟著紙一起闔住。香還在。"
  ],
  "scale.inspect": [
    "桿很直。到了藥碗前面，你得先用它稱一稱。"
  ],
  "scale.ready": [
    "秤在手裡了。這碗你稱得準。"
  ],
  "scale.again": [
    "已經稱過了。"
  ],
  "scale.useless": [
    "這裡沒有要稱的東西。"
  ],
  "needle.inspect": [
    "不是你的舊兵器。有人留在暗格裡。到了銅人前面，得先把它拈出來。"
  ],
  "needle.ready": [
    "針在指間了。孔這才肯開。"
  ],
  "needle.spent": [
    "這根針沒有第二處可扎。"
  ],
  "needle.useless": [
    "眼下沒有等它的孔。"
  ],
  "pill.inspect": [
    "留給鎖裡那個人的。不是給你自己吞的。"
  ],
  "pill.early": [
    "那個人還沒在眼前。丹先留著。"
  ],
  "smear.inspect": [
    "還熱著。這樣一點，鐵鏈吃得下。"
  ],
  "smear.early": [
    "眼前沒有要化開的鎖。"
  ],
  "blade.inspect": [
    "很輕。它和白虎是同一條路。"
  ],
  "blade.early": [
    "還不是拔刀的時候。"
  ],
  "use.none": [
    "手裡什麼都沒有。"
  ],
  "brew.scroll": [
    "紅熱二，寒引一。可解唯雪蓮可別置，不要倒進碗。青熱棄之。白寒、紫熱、苦寒皆勿入。旁批「苦寒亦可別置」是後加的。"
  ],
  "brew.herbs": [
    "鶴頂紅紅熱，相思子寒引，雪蓮可解，斷腸青熱。砒霜白寒，鉤吻紫熱，狼毒苦寒——狼毒旁另貼一張可解，墨色最新。"
  ],
  "brew.fail.scale": [
    "秤還擱在囊裡。這碗你稱不準。"
  ],
  "brew.fail.qing": [
    "青熱不該留在碗裡。碗廢了，還能再取。"
  ],
  "brew.fail.snow": [
    "可解要放在碗外。倒進去，碗就廢了。"
  ],
  "brew.fail.extra": [
    "碗裡多了不該有的味。碗廢了，還能再取。"
  ],
  "brew.fail.ratio": [
    "紅熱和寒引對不上。碗廢了，還能再取。"
  ],
  "brew.success": [
    "鎖鏈融開。那份腐鐵用不回去。"
  ],
  "brew.askSmear": [
    "碗底還黏著一點。刮起來，以後化得開鐵。不刮，它就乾在這裡。"
  ],
  "brew.smearYes": [
    "餘膏刮起來了。還熱著。"
  ],
  "brew.smearNo": [
    "你放下碗。這一點從此冷了。"
  ],
  "sword.fail": [
    "還沒讀順。四句彈回原處。"
  ],
  "sword.success": [
    "暗門開了。香還沒有斜。"
  ],
  "blade.ask": [
    "這柄刃很輕。取下，便是和白虎一樣快的路。不取，也還有別的走法。"
  ],
  "blade.yes": [
    "你取下短刃。輕得像一個太快的念頭。"
  ],
  "blade.no": [
    "短刃留在原處。你把最快的那條留在門這邊。"
  ],
  "ending.placePill": [
    "丹放在他手邊。人沒醒，門也沒開。"
  ],
  "ending.freeChains": [
    "鏈鬆了。他還坐著。"
  ],
  "ending.locked": [
    "話還沒聽完。石頭沒有應。"
  ],
  "inspect.barren": [
    "這裡沒有新的字。要看的，在囊裡，或在眼前兩塊石頭上。"
  ],
  "cheat.joke": [
    "你把字捏大三下，又捏回三下，再捏小三下。暗門沒練過這套，只好讓路。"
  ],
  "finale.hold": [
    "白的是火，青的是門。"
  ],
  "finale.ask.baihu": [
    "白虎是地火。按下，他死，你走。要按嗎?"
  ],
  "finale.ask.qinglong": [
    "青龍開門。你一個人走，他還鎖著。要按嗎?"
  ],
  "finale.ask.qinglong.pill": [
    "丹已在他手邊。按下青龍，你仍是一個人走。要按嗎?"
  ],
  "finale.ask.qinglong.chains": [
    "鏈已經開了。按下青龍，兩個人出去。要按嗎?"
  ],
  "finale.ask.blade": [
    "短刃和白虎是同一條路。要拔嗎?"
  ],
  "finale.ask.pill": [
    "把丹留在他手邊。要放嗎?"
  ],
  "finale.ask.smear": [
    "餘膏化開鐵鏈。要化嗎?"
  ],
  "ending.kicker.wolf": [
    "深宮無雨"
  ],
  "ending.kicker.flee": [
    "門在背後"
  ],
  "ending.kicker.sever": [
    "丹冷袖溫"
  ],
  "ending.kicker.ember": [
    "兩影出山"
  ],
  "ending.kicker.buried": [
    "無人問骨"
  ],
  "ending.wolf.unread.a": [
    "白虎沉下去。地火湧上來，熱浪撲面。他沒有出聲。"
  ],
  "ending.wolf.unread.b": [
    "你撞出石閣，晨曦刺得眼疼。信還封在囊裡，封口一樣乾淨。"
  ],
  "ending.wolf.unread.c": [
    "山外有鳥叫，閣裡卻靜了。你還是一個人。恨還在，只是不知道該指向誰。"
  ],
  "ending.wolf.read.a": [
    "白虎沉下去。信你早就讀過——你知道他頂罪，是為了留你一條命。"
  ],
  "ending.wolf.read.b": [
    "你還是讓他死在這閣裡。刀或白虎，沒有分別。袖裡的紙角，從此再不用拆。"
  ],
  "ending.wolf.read.c": [
    "晨曦照在劍上，像一層薄霜。深宮裡那個人還在。你知道。"
  ],
  "ending.flee.a": [
    "青龍門開。你一個人走出去。身後鐵鏈還在響，像雨點打在舊瓦上。"
  ],
  "ending.flee.b": [
    "袖裡沒有丹。也沒有誰在門口等你。仇沒報完，恩也沒還。"
  ],
  "ending.flee.b.pill": [
    "丹還在袖裡，你沒有留下。門在背後闔上，聲音和進閣時一樣輕。"
  ],
  "ending.flee.c": [
    "以後的路還長。山風從指縫過去，什麼都不肯替你記住。"
  ],
  "ending.flee.c.letter": [
    "以後的路還長。你讀過那封信，卻仍選擇一個人走。山風過袖，像誰歎了一聲。"
  ],
  "ending.sever.a": [
    "丹留在他手邊。你沒有叫醒他，也沒有抱拳。"
  ],
  "ending.sever.b": [
    "這一夜沒有再殺，也沒有和解。你走出門，沒有回頭。門闔了，像把話闔在唇裡。"
  ],
  "ending.sever.c": [
    "天將明未明。閣外的雲壓得很低。你帶走的只有自己的腳步聲。"
  ],
  "ending.sever.c.letter": [
    "天將明未明。信裡的事你記得，這一夜你沒有還，也沒有討。雲壓山脊，像一闔未開的信。"
  ],
  "ending.ember.a": [
    "鏈開了。他抓著你的袖，兩個人在塌下來之前衝出去。塵土嗆進肺裡，你卻想笑——又不敢笑。"
  ],
  "ending.ember.b": [
    "你沒有原諒他。下令的人還在深宮。你只是沒讓這座閣把話說死。"
  ],
  "ending.ember.b.letter": [
    "你沒有原諒他。信上那個名字你還記得。你只是沒讓這座閣把話說死。"
  ],
  "ending.ember.c": [
    "兩道影子投在山道上，一長一短。遠處的城還在睡。雨還沒下，天已經灰了。"
  ],
  "ending.buried.a": [
    "香盡了。你還站在兩塊石頭之間，沒有選。煙斷了，像銀針落地，沒有聲。"
  ],
  "ending.buried.b": [
    "巨石砸下來。人、信、恨，都留在門裡。山外沒有人知道。"
  ],
  "ending.buried.b.blade": [
    "巨石砸下來。短刃還在腰上，你沒有拔。最快的路，和這閣一起埋了。"
  ],
  "ending.buried.c": [
    "許多年後，路過的人只當這裡是塌過的一截山。不會有人來問，那夜誰活、誰死。"
  ],
  "ending.buried.c.letter": [
    "許多年後，路過的人只當這裡是塌過的一截山。信從未出閣，像從未寫過。"
  ],
  "hints.passage": [
    "（敘事拍留白，此則不用。）"
  ],
  "hints.letter": [
    "信還攤著。合上，香才再燒。"
  ],
  "hints.smear": [
    "碗底那一點，不刮就冷了。"
  ],
  "hints.blade": [
    "短刃可以取，也可以留在這裡。"
  ],
  "hints.bagua": [
    "詩在壁上。方位，你再看一眼。"
  ],
  "hints.needleMissing": [
    "袖裡沒有針。"
  ],
  "hints.needleSheathed": [
    "針還在囊裡。"
  ],
  "hints.needleReady": [
    "六個孔。底座那句才算數。"
  ],
  "hints.wuxing": [
    "五塊裡只走四步。詩在壁上。"
  ],
  "hints.ko": [
    "盤側舊刻，別被後添的字帶走。"
  ],
  "hints.brew": [
    "殘卷為準。假籤、假批，都有。"
  ],
  "hints.sword": [
    "四句還沒站到一起。"
  ],
  "hints.finaleLocked": [
    "（長老還在說時留白，此則不用。）"
  ],
  "hints.finale": [
    "白的是火，青的是門。囊裡那些，是你自己的事。"
  ]
};
