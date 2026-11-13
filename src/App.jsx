import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Heart,
  Info,
  MapPin,
  Plane,
  Search,
  Shuffle,
  Sparkles,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react";
import {
  campuses,
  dishes,
  filterTags,
  sourceNotes,
} from "./data";
import {
  LanguageContext,
  localizeCampus,
  localizeCanteen,
  localizeDish,
  localizeFilterTag,
  useLanguage,
} from "./i18n";

const BINDING_KEY = "buaa-food-binding-v1";
const FAVORITES_KEY = "buaa-food-favorites-v1";
const LANGUAGE_KEY = "buaa-food-language-v1";

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getMealMoment(hour, language = "zh") {
  const tr = (zh, en) => (language === "en" ? en : zh);
  if (hour >= 5 && hour < 10) {
    return {
      label: tr("早餐时间", "Breakfast"),
      time: "06:30 – 09:30",
      title: tr(
        "早起的人，先享受热气腾腾。",
        "Early birds deserve something warm.",
      ),
    };
  }
  if (hour >= 10 && hour < 14) {
    return {
      label: tr("午餐时间", "Lunchtime"),
      time: "10:30 – 13:30",
      title: tr("今天，想吃点什么？", "What are you craving today?"),
    };
  }
  if (hour >= 14 && hour < 17) {
    return {
      label: tr("下午加餐", "Afternoon bite"),
      time: "14:00 – 17:00",
      title: tr(
        "先垫一口，再继续出发。",
        "A quick bite before the next sprint.",
      ),
    };
  }
  if (hour >= 17 && hour < 21) {
    return {
      label: tr("晚餐时间", "Dinnertime"),
      time: "16:30 – 19:30",
      title: tr(
        "忙完一天，好好吃顿饭。",
        "You've done enough. Time for a good meal.",
      ),
    };
  }
  return {
    label: tr("夜宵时间", "Late night"),
    time: tr("北区学三营业至 23:00", "North Hall 3 open until 23:00"),
    title: tr(
      "晚归的人，也值得一顿热饭。",
      "Late returns still deserve a hot meal.",
    ),
  };
}

function formatDate(date, language) {
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function findCanteen(canteenId) {
  for (const campus of campuses) {
    const canteen = campus.canteens.find((item) => item.id === canteenId);
    if (canteen) return canteen;
  }
  return null;
}

function App() {
  const now = new Date();
  const storedBinding = readStorage(BINDING_KEY, null);
  const [language, setLanguage] = useState(() =>
    readStorage(LANGUAGE_KEY, "zh"),
  );
  const tr = (zh, en) => (language === "en" ? en : zh);
  const mealMoment = getMealMoment(now.getHours(), language);

  const [campusId, setCampusId] = useState(
    () => storedBinding?.campusId ?? "shahe",
  );
  const [selectedCanteens, setSelectedCanteens] = useState(() => {
    const initialCampus =
      campuses.find(
        (campus) => campus.id === (storedBinding?.campusId ?? "shahe"),
      ) ?? campuses[0];
    const validIds = new Set(
      initialCampus.canteens.map((canteen) => canteen.id),
    );
    const storedIds = (storedBinding?.canteenIds ?? []).filter((id) =>
      validIds.has(id),
    );
    return storedIds.length > 0 ? storedIds : null;
  });
  const [favorites, setFavorites] = useState(() => {
    const validDishIds = new Set(dishes.map((dish) => dish.id));
    return readStorage(FAVORITES_KEY, []).filter((id) =>
      validDishIds.has(id),
    );
  });
  const [view, setView] = useState("discover");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("全部");
  const [focusedCanteen, setFocusedCanteen] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [campusModalOpen, setCampusModalOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState(null);
  const [rouletteDish, setRouletteDish] = useState(null);
  const [drawCampusId, setDrawCampusId] = useState(campusId);
  const [toast, setToast] = useState("");
  const [draftCampusId, setDraftCampusId] = useState(campusId);
  const [draftCanteens, setDraftCanteens] = useState(
    selectedCanteens ?? [],
  );

  const dishSectionRef = useRef(null);
  const toastTimerRef = useRef(null);
  const rouletteIntervalRef = useRef(null);
  const rouletteTimeoutRef = useRef(null);

  const activeCampus =
    campuses.find((campus) => campus.id === campusId) ?? campuses[0];
  const boundCanteenIds = useMemo(
    () =>
      selectedCanteens ??
      activeCampus.canteens.map((item) => item.id),
    [activeCampus, selectedCanteens],
  );
  const campusDishes = dishes.filter(
    (dish) =>
      dish.campusId === campusId &&
      (boundCanteenIds.length === 0 ||
        boundCanteenIds.includes(dish.canteenId)),
  );

  const filteredDishes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return campusDishes.filter((dish) => {
      const canteen = findCanteen(dish.canteenId);
      const displayDish = localizeDish(dish, language);
      const displayCanteen = localizeCanteen(canteen, language);
      const searchable = [
        dish.name,
        dish.subtitle,
        dish.window,
        displayDish.name,
        displayDish.subtitle,
        displayDish.window,
        canteen?.name,
        canteen?.building,
        displayCanteen?.name,
        displayCanteen?.building,
        ...dish.tags,
        ...dish.meal,
        ...displayDish.tags,
        ...displayDish.meal,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesCanteen =
        !focusedCanteen || dish.canteenId === focusedCanteen;
      const matchesTag =
        activeTag === "全部" ||
        dish.tags.includes(activeTag) ||
        (activeTag === "省钱" && dish.price <= 20);

      return matchesQuery && matchesCanteen && matchesTag;
    });
  }, [
    activeTag,
    campusDishes,
    focusedCanteen,
    language,
    query,
  ]);

  const featuredDish = useMemo(() => {
    const preferredId =
      campusId === "shahe"
        ? "shahe-west1-mushroom-beef"
        : "xueyuan-first-douban-catfish";
    return (
      campusDishes.find((dish) => dish.id === preferredId) ??
      campusDishes.find((dish) => dish.tags.includes("招牌")) ??
      campusDishes[0]
    );
  }, [campusDishes, campusId]);

  const favoriteDishes = dishes.filter((dish) => favorites.includes(dish.id));
  const activeCanteen = focusedCanteen
    ? findCanteen(focusedCanteen)
    : null;

  useEffect(() => {
    window.localStorage.setItem(
      BINDING_KEY,
      JSON.stringify({
        campusId,
        canteenIds: boundCanteenIds,
      }),
    );
  }, [boundCanteenIds, campusId]);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem(
      LANGUAGE_KEY,
      JSON.stringify(language),
    );
    document.documentElement.lang =
      language === "en" ? "en" : "zh-CN";
    document.title =
      language === "en"
        ? "Bite BUAA · What should I eat at Beihang?"
        : "航味拾光 · 北航今天吃什么";
  }, [language]);

  useEffect(() => {
    const modalIsOpen =
      Boolean(selectedDish) ||
      campusModalOpen ||
      sourcesOpen ||
      drawOpen;
    document.body.style.overflow = modalIsOpen ? "hidden" : "";

    function handleKeyDown(event) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        document.querySelector(".search-box input")?.focus();
        return;
      }
      if (event.key !== "Escape") return;
      setSelectedDish(null);
      setCampusModalOpen(false);
      setSourcesOpen(false);
      setDrawOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [campusModalOpen, drawOpen, selectedDish, sourcesOpen]);

  useEffect(() => {
    return () => {
      window.clearInterval(rouletteIntervalRef.current);
      window.clearTimeout(rouletteTimeoutRef.current);
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(message) {
    window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2600);
  }

  function changeView(nextView) {
    setView(nextView);
    if (nextView !== "discover") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function openCampusModal() {
    setDraftCampusId(campusId);
    setDraftCanteens(boundCanteenIds);
    setCampusModalOpen(true);
  }

  function chooseDraftCampus(nextCampusId) {
    setDraftCampusId(nextCampusId);
    const nextCampus = campuses.find((campus) => campus.id === nextCampusId);
    setDraftCanteens(nextCampus.canteens.map((canteen) => canteen.id));
  }

  function toggleDraftCanteen(canteenId) {
    setDraftCanteens((current) =>
      current.includes(canteenId)
        ? current.filter((id) => id !== canteenId)
        : [...current, canteenId],
    );
  }

  function saveCampusBinding() {
    if (draftCanteens.length === 0) {
      showToast(
        tr(
          "至少选择一个食堂，再保存绑定",
          "Choose at least one dining hall before saving.",
        ),
      );
      return;
    }
    setCampusId(draftCampusId);
    setSelectedCanteens(draftCanteens);
    setFocusedCanteen(null);
    setCampusModalOpen(false);
    setView("discover");
    const nextCampus = campuses.find(
      (campus) => campus.id === draftCampusId,
    );
    showToast(
      tr(
        `已绑定${nextCampus.name} · ${draftCanteens.length} 个食堂`,
        `Saved ${localizeCampus(nextCampus, language).name} · ${draftCanteens.length} dining halls`,
      ),
    );
  }

  function toggleFavorite(dishId) {
    const exists = favorites.includes(dishId);
    setFavorites((current) =>
      current.includes(dishId)
        ? current.filter((id) => id !== dishId)
        : [...current, dishId],
    );
    showToast(
      exists
        ? tr("已从收藏中移除", "Removed from favorites")
        : tr("已加入你的食堂收藏", "Saved to your food list"),
    );
  }

  function inspectCanteen(canteenId) {
    setFocusedCanteen(canteenId);
    setActiveTag("全部");
    setQuery("");
    changeView("discover");
    window.setTimeout(() => {
      dishSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  }

  function drawDish(targetCampusId = campusId) {
    const targetCampus =
      campuses.find((campus) => campus.id === targetCampusId) ?? activeCampus;
    const pool =
      targetCampus.id === campusId && filteredDishes.length > 0
        ? filteredDishes
        : dishes.filter((dish) => dish.campusId === targetCampus.id);
    if (pool.length === 0) {
      showToast(
        tr(
          "当前筛选下没有菜品，换个条件再试",
          "No dishes match these filters. Try another combination.",
        ),
      );
      return;
    }

    window.clearInterval(rouletteIntervalRef.current);
    window.clearTimeout(rouletteTimeoutRef.current);
    setDrawCampusId(targetCampus.id);
    setDrawOpen(true);
    setIsDrawing(true);
    setDrawResult(null);
    setRouletteDish(pool[Math.floor(Math.random() * pool.length)]);

    rouletteIntervalRef.current = window.setInterval(() => {
      setRouletteDish(pool[Math.floor(Math.random() * pool.length)]);
    }, 72);

    rouletteTimeoutRef.current = window.setTimeout(() => {
      window.clearInterval(rouletteIntervalRef.current);
      const result = pool[Math.floor(Math.random() * pool.length)];
      setRouletteDish(result);
      setDrawResult(result);
      setIsDrawing(false);
    }, 1050);
  }

  function acceptDraw() {
    if (!drawResult) return;
    const nextDish = drawResult;
    setDrawOpen(false);
    setSelectedDish(nextDish);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    if (view !== "discover") setView("discover");
    window.setTimeout(() => {
      dishSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, tr }}>
      <div className="app-shell">
      <Sidebar
        activeCampus={activeCampus}
        boundCanteenCount={boundCanteenIds.length}
        view={view}
        favoriteCount={favorites.length}
        onChangeView={changeView}
        onOpenCampus={openCampusModal}
        onOpenSources={() => setSourcesOpen(true)}
      />

      <main className="main-shell">
        <Topbar
          query={query}
          onQueryChange={setQuery}
          onSearchSubmit={handleSearchSubmit}
          favoriteCount={favorites.length}
          activeCampus={activeCampus}
          onOpenFavorites={() => changeView("favorites")}
        />

        <div className="content-wrap">
          {view === "discover" && (
            <DiscoverView
              activeCampus={activeCampus}
              boundCanteenIds={boundCanteenIds}
              campusDishes={campusDishes}
              filteredDishes={filteredDishes}
              featuredDish={featuredDish}
              query={query}
              activeTag={activeTag}
              activeCanteen={activeCanteen}
              favorites={favorites}
              mealMoment={mealMoment}
              dishSectionRef={dishSectionRef}
              onClearCanteen={() => setFocusedCanteen(null)}
              onTagChange={setActiveTag}
              onInspectCanteen={inspectCanteen}
              onOpenCampus={openCampusModal}
              onOpenDish={setSelectedDish}
              onToggleFavorite={toggleFavorite}
              onDraw={drawDish}
              onDrawCampus={drawDish}
              onOpenSources={() => setSourcesOpen(true)}
              onResetFilters={() => {
                setActiveTag("全部");
                setFocusedCanteen(null);
                setQuery("");
              }}
            />
          )}

          {view === "canteens" && (
            <CanteensView
              activeCampus={activeCampus}
              campuses={campuses}
              selectedCanteens={boundCanteenIds}
              onSwitchCampus={(nextCampusId) => {
                const nextCampus = campuses.find(
                  (campus) => campus.id === nextCampusId,
                );
                setCampusId(nextCampusId);
                setSelectedCanteens(
                  nextCampus.canteens.map((canteen) => canteen.id),
                );
                setFocusedCanteen(null);
                setView("discover");
                showToast(
                  tr(
                    `已切换至${nextCampus.name}`,
                    `Switched to ${localizeCampus(nextCampus, language).name}`,
                  ),
                );
              }}
              onInspectCanteen={inspectCanteen}
              onOpenCampus={openCampusModal}
            />
          )}

          {view === "favorites" && (
            <FavoritesView
              favoriteDishes={favoriteDishes}
              favorites={favorites}
              onOpenDish={setSelectedDish}
              onToggleFavorite={toggleFavorite}
              onExplore={() => setView("discover")}
            />
          )}
        </div>
      </main>

      <MobileNav
        view={view}
        favoriteCount={favorites.length}
        onChangeView={changeView}
        onOpenSources={() => setSourcesOpen(true)}
      />

      {selectedDish && (
        <DishDetailModal
          dish={selectedDish}
          canteen={findCanteen(selectedDish.canteenId)}
          isFavorite={favorites.includes(selectedDish.id)}
          onToggleFavorite={() => toggleFavorite(selectedDish.id)}
          onClose={() => setSelectedDish(null)}
          onDraw={() => {
            setSelectedDish(null);
            drawDish(selectedDish.campusId);
          }}
        />
      )}

      {campusModalOpen && (
        <CampusBindingModal
          draftCampusId={draftCampusId}
          draftCanteens={draftCanteens}
          onChooseCampus={chooseDraftCampus}
          onToggleCanteen={toggleDraftCanteen}
          onSave={saveCampusBinding}
          onClose={() => setCampusModalOpen(false)}
        />
      )}

      {sourcesOpen && (
        <SourcesModal onClose={() => setSourcesOpen(false)} />
      )}

      {drawOpen && (
        <DrawModal
          dish={drawResult ?? rouletteDish}
          campusId={drawCampusId}
          isDrawing={isDrawing}
          hasResult={Boolean(drawResult)}
          onDrawAgain={() => drawDish(drawCampusId)}
          onSelectCampus={drawDish}
          onAccept={acceptDraw}
          onClose={() => setDrawOpen(false)}
        />
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <Check size={17} strokeWidth={2.5} />
          {toast}
        </div>
      )}
      </div>
    </LanguageContext.Provider>
  );
}

function Sidebar({
  activeCampus,
  boundCanteenCount,
  view,
  favoriteCount,
  onChangeView,
  onOpenCampus,
  onOpenSources,
}) {
  const { language, tr } = useLanguage();
  const displayCampus = localizeCampus(activeCampus, language);
  return (
    <aside className="sidebar">
      <button
        type="button"
        className="brand"
        onClick={() => onChangeView("discover")}
        aria-label={tr("回到首页", "Back to home")}
      >
        <span className="brand-mark">
          <Plane size={19} fill="currentColor" />
        </span>
        <span className="brand-copy">
          <strong>{tr("航味拾光", "Bite BUAA")}</strong>
          <small>{tr("北航食堂灵感簿", "CAMPUS FOOD GUIDE")}</small>
        </span>
      </button>

      <div className="sidebar-label">{tr("逛菜单", "EXPLORE")}</div>
      <nav className="side-nav" aria-label={tr("主导航", "Main navigation")}>
        <button
          type="button"
          className={view === "discover" ? "active" : ""}
          onClick={() => onChangeView("discover")}
        >
          <Compass size={19} />
          <span>{tr("今日灵感", "Discover")}</span>
          <i />
        </button>
        <button
          type="button"
          className={view === "canteens" ? "active" : ""}
          onClick={() => onChangeView("canteens")}
        >
          <MapPin size={19} />
          <span>{tr("食堂地图", "Dining map")}</span>
          <i />
        </button>
        <button
          type="button"
          className={view === "favorites" ? "active" : ""}
          onClick={() => onChangeView("favorites")}
        >
          <Heart size={19} />
          <span>{tr("我的收藏", "Favorites")}</span>
          {favoriteCount > 0 && <em>{favoriteCount}</em>}
          <i />
        </button>
        <button type="button" onClick={onOpenSources}>
          <BookOpen size={19} />
          <span>{tr("数据来源", "Data sources")}</span>
          <i />
        </button>
      </nav>

      <div className="sidebar-spacer" />

      <button
        type="button"
        className="campus-mini-card"
        onClick={onOpenCampus}
      >
        <span className="mini-card-orbit" />
        <span className="campus-mini-top">
          <span>MY CAMPUS</span>
          <span className="live-dot" />
        </span>
        <strong>{displayCampus.name}</strong>
        <span className="campus-mini-foot">
          {tr(
            `已绑定 ${boundCanteenCount} 个食堂`,
            `${boundCanteenCount} dining halls bound`,
          )}
          <ChevronRight size={15} />
        </span>
      </button>

      <p className="sidebar-note">
        {tr("菜品名来自公开报道", "Dishes from official reports")}
        <br />
        {tr("价格与窗口请以现场为准", "Check prices and stalls on site")}
      </p>
    </aside>
  );
}

function Topbar({
  query,
  onQueryChange,
  onSearchSubmit,
  favoriteCount,
  activeCampus,
  onOpenFavorites,
}) {
  const { language, setLanguage, tr } = useLanguage();
  const displayCampus = localizeCampus(activeCampus, language);
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <span className="brand-mark">
          <Plane size={18} fill="currentColor" />
        </span>
        <strong>{tr("航味拾光", "Bite BUAA")}</strong>
      </div>

      <form className="search-box" onSubmit={onSearchSubmit}>
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={tr(
            "搜索菜品、食堂或窗口...",
            "Search dishes, halls or stalls...",
          )}
          aria-label={tr("搜索菜品、食堂或窗口", "Search dishes, halls or stalls")}
        />
        <kbd>Ctrl K</kbd>
      </form>

      <div className="topbar-actions">
        <div className="language-toggle" aria-label="Language">
          <button
            type="button"
            className={language === "zh" ? "active" : ""}
            onClick={() => setLanguage("zh")}
          >
            中
          </button>
          <button
            type="button"
            className={language === "en" ? "active" : ""}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
        </div>
        <span className="date-pill">{formatDate(new Date(), language)}</span>
        <button
          type="button"
          className="icon-button top-favorite"
          onClick={onOpenFavorites}
          aria-label={tr(
            `打开收藏，共 ${favoriteCount} 项`,
            `Open favorites, ${favoriteCount} items`,
          )}
        >
          <Heart size={18} />
          {favoriteCount > 0 && <span>{favoriteCount}</span>}
        </button>
        <div className="profile-chip" title={displayCampus.name}>
          <span>{displayCampus.shortName.slice(0, 1)}</span>
          <div>
            <strong>{tr("北航同学", "Beihang student")}</strong>
            <small>{displayCampus.shortName}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

function DiscoverView({
  activeCampus,
  boundCanteenIds,
  campusDishes,
  filteredDishes,
  featuredDish,
  activeTag,
  activeCanteen,
  favorites,
  mealMoment,
  dishSectionRef,
  onClearCanteen,
  onTagChange,
  onInspectCanteen,
  onOpenCampus,
  onOpenDish,
  onToggleFavorite,
  onDraw,
  onDrawCampus,
  onOpenSources,
  onResetFilters,
}) {
  const { language, tr } = useLanguage();
  const displayCampus = localizeCampus(activeCampus, language);
  const displayFeaturedDish = featuredDish
    ? localizeDish(featuredDish, language)
    : null;
  const featuredCanteen = featuredDish
    ? localizeCanteen(findCanteen(featuredDish.canteenId), language)
    : null;
  const availableCanteens = activeCampus.canteens.filter((canteen) =>
    boundCanteenIds.includes(canteen.id),
  );
  const titleBreak = mealMoment.title.includes("，")
    ? mealMoment.title.indexOf("，")
    : mealMoment.title.indexOf(",");
  const heroTitleLead =
    titleBreak >= 0 ? mealMoment.title.slice(0, titleBreak + 1) : "";
  const heroTitleRest =
    titleBreak >= 0
      ? mealMoment.title.slice(titleBreak + 1, -1)
      : mealMoment.title.slice(0, -1);
  const heroTitlePunctuation = mealMoment.title.slice(-1);

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            {mealMoment.label} · {displayCampus.location}
          </div>
          <h1>
            <span>{heroTitleLead}</span>
            <span>
              {heroTitleRest}
              <em>{heroTitlePunctuation}</em>
            </span>
          </h1>
          <p className="hero-description">
            <span>{tr(
              `已绑定${displayCampus.name}的 ${availableCanteens.length} 个食堂，`,
              `${availableCanteens.length} dining halls bound at ${displayCampus.name}.`,
            )}</span>
            {" "}
            <br className="desktop-break" />
            <span>{tr("抽一顿刚刚好的饭。", "Let the app choose your next meal.")}</span>
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onDraw(activeCampus.id)}
            >
              <Shuffle size={18} />
              {tr("Roll 当前校区", "Roll this campus")}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                document
                  .querySelector(".canteen-strip")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {tr("逛逛食堂", "Explore halls")}
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="hero-meta-row">
            <span>
              <Clock size={15} />
              {mealMoment.time}
            </span>
            <button type="button" onClick={onOpenCampus}>
              <MapPin size={15} />
              {tr("切换绑定", "Change campus")}
            </button>
          </div>
        </div>

        {displayFeaturedDish && (
          <div className="hero-feature">
            <span className="orbit-text">
              {tr("今日新鲜 · 好好吃饭 · 北航食堂", "FRESH · DAILY · BUAA FOOD")}
            </span>
            <button
              type="button"
              className="hero-photo"
              onClick={() => onOpenDish(featuredDish)}
              aria-label={tr(
                `查看今日灵感：${displayFeaturedDish.name}`,
                `View today's pick: ${displayFeaturedDish.name}`,
              )}
            >
              <img src={displayFeaturedDish.image} alt={displayFeaturedDish.name} />
              <span className="photo-shade" />
              <span className="hero-pick-label">
                <Sparkles size={14} />
                {tr("北航官方实拍", "Official Beihang photo")}
              </span>
              <span className="hero-photo-copy">
                <small>
                  {featuredCanteen?.shortName} · {displayFeaturedDish.window}
                </small>
                <strong>{displayFeaturedDish.name}</strong>
                <span>
                  <b>¥{displayFeaturedDish.price}</b>
                  <i>{tr("参考价", "Estimate")}</i>
                </span>
              </span>
              <span className="hero-photo-arrow">
                <ArrowRight size={19} />
              </span>
            </button>
            <div className="hero-stamp">
              <span>{tr("食堂", "Halls")}</span>
              <strong>{boundCanteenIds.length}</strong>
              <span>{tr("已绑定", "Bound")}</span>
            </div>
          </div>
        )}
      </section>

      <section className="roll-launcher">
        <div className="roll-launcher-copy">
          <span className="roll-number">01</span>
          <div>
            <span className="section-kicker">{tr("选校区 · 抽一餐", "ONE-CLICK CAMPUS ROLL")}</span>
            <h2>{tr("选一个校区，直接开饭。", "Pick a campus. Roll a meal.")}</h2>
            <p>
              {tr(
                "一次抽全：校区、食堂、楼层窗口、具体菜品和参考价格。",
                "One roll reveals the campus, dining hall, stall, dish and estimated price.",
              )}
            </p>
          </div>
        </div>
        <div className="roll-campus-actions">
          {campuses.map((campus) => {
            const displayRollCampus = localizeCampus(campus, language);
            return (
            <button
              key={campus.id}
              type="button"
              onClick={() => onDrawCampus(campus.id)}
            >
              <img src={campus.cover} alt="" />
              <span>
                <small>{displayRollCampus.english}</small>
                <strong>{displayRollCampus.name}</strong>
                <em>
                  {tr(
                    `${campus.canteens.length} 个食堂`,
                    `${campus.canteens.length} dining halls`,
                  )}
                </em>
              </span>
              <b>
                {tr("抽一顿", "ROLL")}
                <ArrowRight size={16} />
              </b>
            </button>
            );
          })}
        </div>
      </section>

      <section className="mood-filter">
        <div className="section-heading compact">
          <div>
            <span className="section-kicker">{tr("按胃口挑", "PICK YOUR MOOD")}</span>
            <h2>{tr("今天是什么胃口？", "What sounds good today?")}</h2>
          </div>
          <span className="filter-caption">
            {tr("选一个，帮你收窄范围", "Choose a mood to narrow things down")}
          </span>
        </div>
        <div
          className="filter-list"
          role="group"
          aria-label={tr("按口味筛选", "Filter by mood")}
        >
          {filterTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              aria-pressed={activeTag === tag.id}
              className={activeTag === tag.id ? "active" : ""}
              onClick={() => onTagChange(tag.id)}
            >
              {localizeFilterTag(tag, language)}
            </button>
          ))}
        </div>
      </section>

      <section className="canteen-section canteen-strip">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{tr("常去食堂", "YOUR CANTEENS")}</span>
            <h2>{tr("你的食堂半径", "Your dining radius")}</h2>
          </div>
          <button type="button" className="text-button" onClick={onOpenCampus}>
            {tr("管理绑定", "Manage campus")}
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="canteen-scroll">
          {availableCanteens.slice(0, 4).map((canteen, index) => {
            const displayCanteen = localizeCanteen(canteen, language);
            const count = campusDishes.filter(
              (dish) => dish.canteenId === canteen.id,
            ).length;
            return (
              <button
                key={canteen.id}
                type="button"
                className={`canteen-card accent-${index + 1}`}
                onClick={() => onInspectCanteen(canteen.id)}
              >
                <img src={canteen.cover} alt="" loading="lazy" />
                <span className="canteen-card-shade" />
                <span className="canteen-badge">
                  <Check size={11} strokeWidth={3} />
                  {displayCanteen.badge}
                </span>
                <span className="canteen-floor">{displayCanteen.floor}</span>
                <span className="canteen-card-copy">
                  <small>{displayCanteen.building}</small>
                  <strong>{displayCanteen.shortName}</strong>
                  <span>
                    {displayCanteen.windows.split(" · ").slice(0, 2).join(" · ")}
                  </span>
                </span>
                <span className="canteen-card-action">
                  {count > 0
                    ? tr(`${count} 道候选`, `${count} dishes`)
                    : tr("查看菜单", "View menu")}
                  <ArrowRight size={15} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="dish-section" ref={dishSectionRef}>
        <div className="section-heading dish-heading">
          <div>
            <span className="section-kicker">{tr("今日菜单", "CURATED TODAY")}</span>
            <h2>
              {tr("今天值得吃", "Worth eating today")}
              <span className="result-count">{filteredDishes.length}</span>
            </h2>
          </div>
          <div className="heading-actions">
            {activeCanteen && (
              <button
                type="button"
                className="active-filter-pill"
                onClick={onClearCanteen}
              >
                {localizeCanteen(activeCanteen, language).shortName}
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              className="draw-inline"
              onClick={() => onDraw(activeCampus.id)}
            >
              <Shuffle size={16} />
              {tr("随机抽一道", "Random pick")}
            </button>
          </div>
        </div>

        {filteredDishes.length > 0 ? (
          <div className="dish-grid">
            {filteredDishes.map((dish, index) => (
              <DishCard
                key={dish.id}
                dish={dish}
                canteen={findCanteen(dish.canteenId)}
                isFavorite={favorites.includes(dish.id)}
                onOpen={() => onOpenDish(dish)}
                onToggleFavorite={() => onToggleFavorite(dish.id)}
                featured={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <Search size={26} />
            </span>
            <h3>{tr("没有找到这口味道", "No match this time")}</h3>
            <p>
              {tr(
                "换一个关键词或口味标签，也可以重新绑定食堂。",
                "Try another keyword or mood, or update your campus selection.",
              )}
            </p>
            <button type="button" className="primary-button" onClick={onResetFilters}>
              {tr("清除筛选", "Clear filters")}
            </button>
          </div>
        )}
      </section>

      <section className="data-note-card">
        <span className="data-note-icon">
          <Info size={19} />
        </span>
        <div>
          <strong>{tr("这是一份会呼吸的菜单", "A menu that can evolve")}</strong>
          <p>
            {tr(
              "菜品照片、名称、窗口和官方食评来自北京航空航天大学公众号 2026 春季上新；价格为体验参考值，当日供应状态请以北航现场为准。",
              "Dish photos, names, stalls and official tasting notes come from Beihang University's spring 2026 menu feature. Prices are indicative; check availability on site.",
            )}
          </p>
        </div>
        <button type="button" onClick={onOpenSources}>
          {tr("查看来源", "View sources")}
          <ExternalLink size={14} />
        </button>
      </section>
    </>
  );
}

function DishCard({
  dish,
  canteen,
  isFavorite,
  onOpen,
  onToggleFavorite,
  featured = false,
}) {
  const { language, tr } = useLanguage();
  const displayDish = localizeDish(dish, language);
  const displayCanteen = localizeCanteen(canteen, language);
  return (
    <article className={`dish-card ${featured ? "dish-card-featured" : ""}`}>
      <button
        type="button"
        className="dish-card-hit"
        onClick={onOpen}
        aria-label={tr(
          `查看${displayDish.name}详情`,
          `View details for ${displayDish.name}`,
        )}
      >
        <div className="dish-image-wrap">
          <img src={dish.image} alt="" />
          <span className="dish-image-shade" />
          <span className="dish-official-badge">
            <Check size={12} strokeWidth={3} />
            {tr("官方上新", "Official new")}
          </span>
          {featured && (
            <span className="editor-pick">{tr("今日首选", "Today's pick")}</span>
          )}
        </div>
        <div className="dish-card-body">
          <div className="dish-title-row">
            <h3>{displayDish.name}</h3>
            <span className="dish-price">
              <small>¥</small>
              {dish.price}
              <i>*</i>
            </span>
          </div>
          <p>{displayDish.subtitle}</p>
          <div className="dish-location">
            <MapPin size={13} />
            <span>
              {displayCanteen?.shortName} · {displayCanteen?.floor} ·{" "}
              {displayDish.window}
            </span>
          </div>
          <div className="dish-tags">
            {displayDish.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </button>
      <button
        type="button"
        className={`favorite-button ${isFavorite ? "active" : ""}`}
        onClick={onToggleFavorite}
        aria-label={tr(
          isFavorite ? "取消收藏" : "收藏菜品",
          isFavorite ? "Remove from favorites" : "Save dish",
        )}
        aria-pressed={isFavorite}
      >
        <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
      </button>
    </article>
  );
}

function CanteensView({
  activeCampus,
  campuses,
  selectedCanteens,
  onSwitchCampus,
  onInspectCanteen,
  onOpenCampus,
}) {
  const { language, tr } = useLanguage();
  const displayCampus = localizeCampus(activeCampus, language);
  return (
    <>
      <section className="page-heading">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          {tr("校园吃饭地图", "CAMPUS FOOD MAP")}
        </div>
        <h1>{tr("先认识你的食堂。", "Get to know your dining halls.")}</h1>
        <p>
          {tr(
            `两校区、${campuses.reduce((total, campus) => total + campus.canteens.length, 0)} 个主要食堂与餐饮区域，按楼层整理窗口线索。`,
            `Two campuses, ${campuses.reduce((total, campus) => total + campus.canteens.length, 0)} dining halls and food areas, organized by floor and stall.`,
          )}
        </p>
      </section>

      <div className="campus-tab-row">
        {campuses.map((campus) => (
          <button
            key={campus.id}
            type="button"
            className={activeCampus.id === campus.id ? "active" : ""}
            onClick={() => onSwitchCampus(campus.id)}
          >
            <span>{localizeCampus(campus, language).shortName}</span>
            <small>{campus.english}</small>
          </button>
        ))}
        <button type="button" className="manage-binding" onClick={onOpenCampus}>
          {tr("精细管理绑定", "Manage selections")}
          <ChevronRight size={16} />
        </button>
      </div>

      <section
        className="campus-overview"
        style={{ "--campus-accent": activeCampus.accent }}
      >
        <div>
          <span>{displayCampus.english}</span>
          <h2>{displayCampus.name}</h2>
          <p>{displayCampus.description}</p>
          <div className="overview-meta">
            <span>
              <MapPin size={15} />
              {displayCampus.location}
            </span>
            <span>
              <UtensilsCrossed size={15} />
              {tr(
                `${activeCampus.canteens.length} 个餐饮区域`,
                `${activeCampus.canteens.length} dining areas`,
              )}
            </span>
          </div>
        </div>
        <div className="overview-stats">
          <strong>{selectedCanteens.length}</strong>
          <span>{tr("已绑定食堂", "Halls bound")}</span>
          <i />
          <strong>
            {
              dishes.filter((dish) => dish.campusId === activeCampus.id)
                .length
            }
          </strong>
          <span>{tr("菜品线索", "Dishes")}</span>
        </div>
      </section>

      <div className="canteen-full-grid">
        {activeCampus.canteens.map((canteen, index) => {
          const displayCanteen = localizeCanteen(canteen, language);
          const canteenDishes = dishes.filter(
            (dish) => dish.canteenId === canteen.id,
          );
          const isBound = selectedCanteens.includes(canteen.id);
          return (
            <article
              key={canteen.id}
              className={`canteen-full-card ${isBound ? "" : "unbound"}`}
            >
              <div className="canteen-full-image">
                <img src={canteen.cover} alt="" loading="lazy" />
                <span />
                <b>{String(index + 1).padStart(2, "0")}</b>
                <em>{displayCanteen.floor}</em>
              </div>
              <div className="canteen-full-body">
                <div className="canteen-full-title">
                  <div>
                    <small>{displayCanteen.building}</small>
                    <h3>{displayCanteen.name}</h3>
                  </div>
                  <span className="canteen-badge subtle">
                    <Check size={11} strokeWidth={3} />
                    {displayCanteen.badge}
                  </span>
                </div>
                <div className="canteen-window-copy">
                  <UtensilsCrossed size={15} />
                  {displayCanteen.windows}
                </div>
                <div className="canteen-preview-dishes">
                  {canteenDishes.slice(0, 3).map((dish) => (
                    <span key={dish.id}>
                      {localizeDish(dish, language).name}
                    </span>
                  ))}
                  {canteenDishes.length === 0 && (
                    <span>{tr("窗口菜单待补充", "Stall menu pending")}</span>
                  )}
                </div>
                <div className="canteen-hours">
                  <Clock size={14} />
                  <span>{displayCanteen.hours}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onInspectCanteen(canteen.id)}
                >
                  {tr("查看这个食堂的菜单", "View this hall's dishes")}
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="map-footnote">
        <MapPin size={17} />
        <p>
          {tr(
            "菜品照片和档口位置来自北航官方 2026 春季上新报道，楼层与营业时间参考公开迎新指南。供应安排可能随学期调整；粉灰色卡片表示未包含在当前绑定中。",
            "Dish photos and stalls come from Beihang's official spring 2026 menu feature. Floors and hours reference public orientation guides and may change by semester. Faded cards are not in your current selection.",
          )}
        </p>
      </div>
    </>
  );
}

function FavoritesView({
  favoriteDishes,
  favorites,
  onOpenDish,
  onToggleFavorite,
  onExplore,
}) {
  const { tr } = useLanguage();
  return (
    <>
      <section className="page-heading favorites-heading">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          {tr("我的想吃清单", "YOUR SAVED BITES")}
        </div>
        <h1>{tr("想吃的，都放在这里。", "Keep every craving in one place.")}</h1>
        <p>
          {tr(
            "收藏会保存在当前浏览器，不登录也能持续积累你的北航食堂清单。",
            "Favorites stay in your browser, so your Beihang food list grows without an account.",
          )}
        </p>
      </section>

      <div className="favorites-summary">
        <span className="favorite-summary-icon">
          <Heart size={24} fill="currentColor" />
        </span>
        <div>
          <strong>{favoriteDishes.length}</strong>
          <span>{tr("道已收藏菜品", "saved dishes")}</span>
        </div>
        <p>
          {tr(
            "收藏不是承诺，只是给下一次犹豫时留一个答案。",
            "A favorite is simply an answer saved for the next moment of indecision.",
          )}
        </p>
        <button type="button" className="secondary-button" onClick={onExplore}>
          {tr("继续发现", "Keep exploring")}
          <ArrowRight size={16} />
        </button>
      </div>

      {favoriteDishes.length > 0 ? (
        <div className="dish-grid favorites-grid">
          {favoriteDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              canteen={findCanteen(dish.canteenId)}
              isFavorite={favorites.includes(dish.id)}
              onOpen={() => onOpenDish(dish)}
              onToggleFavorite={() => onToggleFavorite(dish.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state favorites-empty">
          <span className="empty-orbit">
            <Heart size={28} />
          </span>
          <h3>{tr("还没有收藏任何味道", "No favorites yet")}</h3>
          <p>
            {tr(
              "点菜品卡片右上角的心形，把想吃的窗口留在这里。",
              "Tap the heart on any dish card to save it here.",
            )}
          </p>
          <button type="button" className="primary-button" onClick={onExplore}>
            <Compass size={17} />
            {tr("去发现", "Start exploring")}
          </button>
        </div>
      )}
    </>
  );
}

function DishDetailModal({
  dish,
  canteen,
  isFavorite,
  onToggleFavorite,
  onClose,
  onDraw,
}) {
  const { language, tr } = useLanguage();
  const displayDish = localizeDish(dish, language);
  const displayCanteen = localizeCanteen(canteen, language);
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="dish-detail-modal modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-detail-title"
      >
        <button
          type="button"
          className="modal-close light"
          onClick={onClose}
          aria-label={tr("关闭菜品详情", "Close dish details")}
        >
          <X size={19} />
        </button>

        <div className="detail-visual">
          <img src={displayDish.image} alt={displayDish.name} />
          <span className="detail-visual-shade" />
          <div className="detail-topline">
            <span className="detail-kicker">{tr("今日推荐 · 01", "TODAY'S PICK · 01")}</span>
            <span className="detail-official">
              <Check size={12} strokeWidth={3} />
              {tr("北航官方上新", "Official Beihang")}
            </span>
          </div>
          <div className="detail-title">
            <div className="detail-tags">
              {displayDish.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <h2 id="dish-detail-title">{displayDish.name}</h2>
            <p>{displayDish.subtitle}</p>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-price-row">
            <span className="detail-price">
              <small>{tr("参考价", "Estimate")}</small>
              ¥{displayDish.price}
              <i>*</i>
            </span>
            <span className="price-note">
              {tr("以现场标价为准", "Check the price on site")}
            </span>
            <button
              type="button"
              className={`detail-favorite ${isFavorite ? "active" : ""}`}
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
            >
              <Heart
                size={18}
                fill={isFavorite ? "currentColor" : "none"}
              />
              {tr(
                isFavorite ? "已收藏" : "收藏",
                isFavorite ? "Saved" : "Save",
              )}
            </button>
          </div>

          <p className="detail-description">{displayDish.description}</p>

          <div className="location-panel">
            <div className="location-icon">
              <MapPin size={21} />
            </div>
            <div>
              <span>{tr("去哪里吃", "Where to find it")}</span>
              <strong>
                {displayCanteen?.name} · {displayCanteen?.floor}
              </strong>
              <p>
                {displayCanteen?.building} / {displayDish.window}
              </p>
            </div>
            <span
              className={`window-trust ${
                dish.windowVerified ? "verified" : ""
              }`}
            >
              {tr(
                dish.windowVerified ? "窗口已见报道" : "窗口待现场核验",
                dish.windowVerified ? "Stall confirmed in report" : "Verify on site",
              )}
            </span>
          </div>

          <div className="detail-info-grid">
            <div>
              <span className="info-icon">
                <Clock size={17} />
              </span>
              <small>{tr("供应时段", "Serving time")}</small>
              <strong>{displayDish.meal.join(" / ")}</strong>
            </div>
            <div>
              <span className="info-icon">
                <Check size={17} />
              </span>
              <small>{tr("信息状态", "Source status")}</small>
              <strong>{tr("官方原文可核验", "Verified in official feature")}</strong>
            </div>
            <div>
              <span className="info-icon">
                <UtensilsCrossed size={17} />
              </span>
              <small>{tr("主要食材", "Ingredients")}</small>
              <strong>{tr("详见档口现场标识", "See stall signage")}</strong>
            </div>
          </div>

          <div className="detail-source">
            <Info size={16} />
            <p>
              <strong>{tr("来源线索：", "Source: ")}</strong>
              {tr(
                `${dish.source}。菜品是否当日供应、窗口编号与价格均可能调整。`,
                "Beihang University official spring 2026 menu feature. Availability, stall numbers and prices may change.",
              )}
            </p>
            <a href={dish.sourceUrl} target="_blank" rel="noreferrer">
              {tr("公开检索", "Public search")}
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="detail-actions">
            <button type="button" className="secondary-button" onClick={onDraw}>
              <Shuffle size={17} />
              {tr("换一个", "Try another")}
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={onToggleFavorite}
            >
              <Heart
                size={17}
                fill={isFavorite ? "currentColor" : "none"}
              />
              {tr(
                isFavorite ? "已加入清单" : "加入想吃清单",
                isFavorite ? "Saved to list" : "Add to food list",
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CampusBindingModal({
  draftCampusId,
  draftCanteens,
  onChooseCampus,
  onToggleCanteen,
  onSave,
  onClose,
}) {
  const { language, tr } = useLanguage();
  const draftCampus = campuses.find((campus) => campus.id === draftCampusId);
  const displayDraftCampus = localizeCampus(draftCampus, language);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="binding-modal modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="binding-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={tr("关闭校区绑定", "Close campus settings")}
        >
          <X size={19} />
        </button>
        <div className="binding-heading">
          <span className="section-kicker">{tr("设置我的饭点", "MAKE IT YOURS")}</span>
          <h2 id="binding-title">
            {tr("把你的校园，绑定进来。", "Make this campus yours.")}
          </h2>
          <p>
            {tr(
              "选择常去的校区和食堂，之后的每次随机，都会先照顾你的日常半径。",
              "Choose your usual campus and dining halls. Rolls and discovery will center your daily routine.",
            )}
          </p>
        </div>

        <div className="campus-choice-grid">
          {campuses.map((campus) => {
            const displayChoiceCampus = localizeCampus(campus, language);
            return (
            <button
              key={campus.id}
              type="button"
              className={draftCampusId === campus.id ? "active" : ""}
              onClick={() => onChooseCampus(campus.id)}
            >
              <img src={campus.cover} alt="" />
              <span />
              <div>
                <small>{displayChoiceCampus.english}</small>
                <strong>{displayChoiceCampus.name}</strong>
                <p>{displayChoiceCampus.location}</p>
              </div>
              <i>
                {draftCampusId === campus.id ? (
                  <Check size={15} />
                ) : null}
              </i>
            </button>
            );
          })}
        </div>

        <div className="canteen-bind-heading">
          <div>
            <strong>{tr("常去哪几个食堂？", "Which halls do you use?")}</strong>
            <span>
              {tr(
                `已选择 ${draftCanteens.length} / ${draftCampus.canteens.length}`,
                `${draftCanteens.length} of ${draftCampus.canteens.length} selected`,
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              draftCanteens.length === draftCampus.canteens.length
                ? draftCampus.canteens.forEach((canteen) =>
                    draftCanteens.includes(canteen.id)
                      ? onToggleCanteen(canteen.id)
                      : null,
                  )
                : draftCampus.canteens.forEach((canteen) =>
                    draftCanteens.includes(canteen.id)
                      ? null
                      : onToggleCanteen(canteen.id),
                  )
            }
          >
            {draftCanteens.length === draftCampus.canteens.length
              ? tr("全部取消", "Clear all")
              : tr("全选", "Select all")}
          </button>
        </div>

        <div className="binding-canteen-grid">
          {draftCampus.canteens.map((canteen) => {
            const displayCanteen = localizeCanteen(canteen, language);
            const checked = draftCanteens.includes(canteen.id);
            return (
              <button
                key={canteen.id}
                type="button"
                className={checked ? "checked" : ""}
                onClick={() => onToggleCanteen(canteen.id)}
                aria-pressed={checked}
              >
                <span className="bind-checkbox">
                  {checked && <Check size={13} strokeWidth={3} />}
                </span>
                <span>
                  <strong>{displayCanteen.shortName}</strong>
                  <small>
                    {displayCanteen.floor} · {displayCanteen.building}
                  </small>
                </span>
              </button>
            );
          })}
        </div>

        <div className="binding-modal-footer">
          <p>
            <Info size={14} />
            {tr("绑定仅保存在本机浏览器", "Saved only in this browser")}
          </p>
          <button type="button" className="primary-button" onClick={onSave}>
            {tr("保存并开始", "Save and start")}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}

function SourcesModal({ onClose }) {
  const { language, tr } = useLanguage();
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="sources-modal modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sources-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={tr("关闭数据来源", "Close sources")}
        >
          <X size={19} />
        </button>
        <div className="sources-heading">
          <span className="source-book-icon">
            <BookOpen size={22} />
          </span>
          <div>
            <span className="section-kicker">{tr("菜单出处", "OPEN NOTES")}</span>
            <h2 id="sources-title">
              {tr("菜单从哪里来？", "Where does the menu come from?")}
            </h2>
            <p>
              {tr(
                "把可信线索与体验型参考数据分开说明。",
                "Verified sources and experience-layer estimates are documented separately.",
              )}
            </p>
          </div>
        </div>

        <div className="source-summary-bar">
          <span>{tr("联网整理时间", "Research date")}</span>
          <strong>2026.11.02</strong>
          <i />
          <span>{tr("整理范围", "Coverage")}</span>
          <strong>{tr("沙河 · 学院路", "Shahe · Xueyuan Road")}</strong>
        </div>

        <div className="source-list">
          {sourceNotes.map((source, index) => (
            <article key={source.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{language === "en" ? source.titleEn : source.title}</h3>
                <p>
                  {language === "en"
                    ? source.descriptionEn
                    : source.description}
                </p>
                <a href={source.query} target="_blank" rel="noreferrer">
                  {tr("查看相关公开检索", "Open public source")}
                  <ExternalLink size={13} />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="source-disclaimer">
          <Info size={18} />
          <p>
            <strong>{tr("数据边界", "Data boundaries")}</strong>
            {tr(
              "菜品、窗口、官方食评和照片来自北航官方公众号原文；价格是本项目补充的体验参考值。本演示没有接入学校实时菜单系统，因此价格和当日供应状态仍需以现场为准。",
              "Dish names, stalls, official tasting notes and photos come from Beihang University's official feature. Prices are indicative project estimates. This open-source demo is not connected to a live campus menu, so verify prices and availability on site.",
            )}
          </p>
        </div>

        <button type="button" className="primary-button source-close-button" onClick={onClose}>
          {tr("我知道了", "Got it")}
        </button>
      </section>
    </div>
  );
}

function DrawModal({
  dish,
  campusId,
  isDrawing,
  hasResult,
  onDrawAgain,
  onSelectCampus,
  onAccept,
  onClose,
}) {
  const { language, tr } = useLanguage();
  const displayDish = dish ? localizeDish(dish, language) : null;
  const canteen = dish
    ? localizeCanteen(findCanteen(dish.canteenId), language)
    : null;
  const campus =
    localizeCampus(
      campuses.find((item) => item.id === campusId) ?? campuses[0],
      language,
    );

  return (
    <div
      className="modal-backdrop draw-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="draw-modal modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="draw-title"
      >
        <button
          type="button"
          className="modal-close light draw-close"
          onClick={onClose}
          aria-label={tr("关闭随机抽取", "Close roll result")}
        >
          <X size={19} />
        </button>
        <div className="draw-stars" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>

        <span className="draw-kicker">
          {isDrawing
            ? tr("正在翻菜单", "CHOOSING FOR YOU")
            : tr("这顿吃什么", "YOUR NEXT MEAL")}
        </span>
        <h2 id="draw-title">
          {isDrawing
            ? tr("正在翻食堂菜单...", "Flipping through the menu...")
            : tr("今天，就吃它。", "Today, it's this one.")}
        </h2>

        <div
          className="draw-campus-tabs"
          aria-label={tr("选择抽取校区", "Choose a roll campus")}
        >
          {campuses.map((item) => (
            <button
              key={item.id}
              type="button"
              className={campusId === item.id ? "active" : ""}
              disabled={isDrawing}
              onClick={() => onSelectCampus(item.id)}
            >
              <MapPin size={13} />
              {localizeCampus(item, language).name}
            </button>
          ))}
        </div>

        {displayDish && (
          <div className={`draw-dish-card ${isDrawing ? "spinning" : ""}`}>
            <img src={displayDish.image} alt="" />
            <span className="draw-image-shade" />
            <div className="draw-dish-copy">
              <span>
                {canteen?.shortName} · {canteen?.floor}
              </span>
              <strong>{displayDish.name}</strong>
              <small>{displayDish.window}</small>
            </div>
            <span className="draw-price">¥{displayDish.price}*</span>
          </div>
        )}

        {hasResult && canteen && (
          <div className="draw-location-grid">
            <div>
              <span>{tr("校区", "Campus")}</span>
              <strong>{campus.name}</strong>
            </div>
            <div>
              <span>{tr("食堂", "Dining hall")}</span>
              <strong>{canteen.name}</strong>
            </div>
            <div>
              <span>{tr("楼层 / 窗口", "Floor / stall")}</span>
              <strong>{displayDish.window}</strong>
            </div>
            <div>
              <span>{tr("参考价格", "Estimated price")}</span>
              <strong>{tr(`约 ¥${displayDish.price}`, `About ¥${displayDish.price}`)}</strong>
            </div>
          </div>
        )}

        {hasResult && (
          <p className="draw-reason">
            “{displayDish?.subtitle}”
            <span>
              <Sparkles size={14} />
              {tr(
                "菜品与窗口来自北航官方原文",
                "Dish and stall sourced from Beihang's official feature",
              )}
            </span>
          </p>
        )}

        <div className="draw-actions">
          <button
            type="button"
            className="draw-secondary"
            onClick={onDrawAgain}
            disabled={isDrawing}
          >
            <Shuffle size={17} />
            {tr("再抽一次", "Roll again")}
          </button>
          <button
            type="button"
            className="draw-primary"
            onClick={onAccept}
            disabled={isDrawing || !hasResult}
          >
            {tr("就吃这个", "Go with this")}
            <ArrowRight size={17} />
          </button>
        </div>
        <p className="draw-footnote">
          {tr(
            "菜品与实拍来自官方上新报道 · 价格与当日供应请以现场为准",
            "Dish and photo from the official feature · Verify price and availability on site",
          )}
        </p>
      </section>
    </div>
  );
}

function MobileNav({ view, favoriteCount, onChangeView, onOpenSources }) {
  const { tr } = useLanguage();
  return (
    <nav className="mobile-nav" aria-label={tr("移动端导航", "Mobile navigation")}>
      <button
        type="button"
        className={view === "discover" ? "active" : ""}
        onClick={() => onChangeView("discover")}
      >
        <Compass size={20} />
        <span>{tr("发现", "Discover")}</span>
      </button>
      <button
        type="button"
        className={view === "canteens" ? "active" : ""}
        onClick={() => onChangeView("canteens")}
      >
        <MapPin size={20} />
        <span>{tr("食堂", "Dining")}</span>
      </button>
      <button
        type="button"
        className={view === "favorites" ? "active" : ""}
        onClick={() => onChangeView("favorites")}
      >
        <span className="mobile-favorite-icon">
          <Heart size={20} />
          {favoriteCount > 0 && <i>{favoriteCount}</i>}
        </span>
        <span>{tr("收藏", "Saved")}</span>
      </button>
      <button type="button" onClick={onOpenSources}>
        <BookOpen size={20} />
        <span>{tr("来源", "Sources")}</span>
      </button>
    </nav>
  );
}

export default App;
