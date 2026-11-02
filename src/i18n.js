import { createContext, useContext } from "react";

export const LanguageContext = createContext(null);

export function useLanguage() {
  return useContext(LanguageContext);
}

const campusEnglish = {
  shahe: {
    name: "Shahe Campus",
    shortName: "Shahe",
    location: "Changping · Shahe Higher Education Park",
    description:
      "Seven dining halls across the East and West dining buildings. Current dishes and stall information come from Beihang University's official spring 2026 menu feature.",
  },
  xueyuanlu: {
    name: "Xueyuan Road Campus",
    shortName: "Xueyuan Road",
    location: "Haidian · Xueyuan Road",
    description:
      "Heyi Building and the North Campus dining halls anchor daily dining at Xueyuan Road. Every dish below comes from Beihang University's official spring 2026 menu feature.",
  },
};

const canteenEnglish = {
  "shahe-east-1": {
    name: "Shahe East First Dining Hall",
    shortName: "East Hall 1",
    building: "East Dining Hall",
    floor: "1F",
    windows: "Stall 17 fried food · Stall 33 noodles",
    hours: "06:30–09:00 / 10:30–13:00 / 17:00–19:00",
    badge: "Spring 2026",
    tags: ["Noodles", "Fried food", "Breakfast"],
  },
  "shahe-east-2": {
    name: "Shahe East Second Dining Hall",
    shortName: "East Hall 2",
    building: "East Dining Hall",
    floor: "3F Atrium / South",
    windows: "Rice noodles · Teppan · Lotus-leaf rice",
    hours: "Lunch & dinner · Check on-site notices",
    badge: "New stalls",
    tags: ["Teppan", "Rice noodles", "Steamed rice"],
  },
  "shahe-east-3": {
    name: "Shahe East Third Dining Hall",
    shortName: "East Hall 3",
    building: "East Dining Hall",
    floor: "3F North",
    windows: "Chef's kitchen · Signature pork rice · Yandu classics",
    hours: "Lunch & dinner · Check on-site notices",
    badge: "Regional flavors",
    tags: ["Braised meat", "Chicken rice", "Sichuan flavor"],
  },
  "shahe-west-1": {
    name: "Shahe West First Dining Hall",
    shortName: "West Hall 1",
    building: "West Dining Hall",
    floor: "1F",
    windows: "Smart buffet line · Stall 9 sizzling pots",
    hours: "06:30–09:00 / 10:30–13:30 / 17:00–19:30",
    badge: "Official photos",
    tags: ["Buffet", "Stir-fry", "Breakfast"],
  },
  "shahe-west-2": {
    name: "Shahe West Second Dining Hall",
    shortName: "West Hall 2",
    building: "West Dining Hall",
    floor: "2F",
    windows: "Baked rice · Chongqing noodles · Taiwan braised pork",
    hours: "Lunch & dinner · Check on-site notices",
    badge: "Noodles & rice",
    tags: ["Rice noodles", "Meat pie", "Fried noodles"],
  },
  "shahe-west-3": {
    name: "Shahe West Third Dining Hall",
    shortName: "West Hall 3",
    building: "West Dining Hall",
    floor: "3F",
    windows: "Pizza & pasta · Egg fish rice · Fresh beef noodles",
    hours: "Lunch & dinner · Check on-site notices",
    badge: "Specialty meals",
    tags: ["Baked rice", "Silky egg", "Rice noodles"],
  },
  "shahe-west-4": {
    name: "Shahe West Fourth Dining Hall",
    shortName: "West Hall 4",
    building: "West Dining Hall",
    floor: "B1 · Stall 6",
    windows: "Stall 6 · Home-style stir-fry",
    hours: "Breakfast, lunch & dinner · Check on-site notices",
    badge: "B1 stir-fry",
    tags: ["Beef", "Sichuan flavor", "Home-style"],
  },
  "xueyuan-xueyi": {
    name: "First Dining Hall",
    shortName: "Hall 1",
    building: "Heyi Building",
    floor: "2F South / North",
    windows: "Signature dishes · Original grill stall",
    hours: "06:30–09:00 / 10:30–13:00 / 17:00–19:00",
    badge: "Signature dishes",
    tags: ["Fish", "Small bowls", "Seafood"],
  },
  "xueyuan-xuesi": {
    name: "Fourth Dining Hall",
    shortName: "Hall 4",
    building: "Heyi Building",
    floor: "3F",
    windows: "Sichuan-Chongqing · Beijing dumplings · Fish & fried rice",
    hours: "10:00–21:00",
    badge: "Open all day",
    tags: ["Sichuan-Chongqing", "Grilled fish", "Dumplings"],
  },
  "xueyuan-xueqi": {
    name: "Seventh Dining Hall",
    shortName: "Hall 7",
    building: "Heyi Building",
    floor: "4F South",
    windows: "Stall 1 · Stall 2 · Signature dishes",
    hours: "Lunch & dinner · Check on-site notices",
    badge: "Hot pot",
    tags: ["Broth", "Lamb rice", "Signature dishes"],
  },
  "xueyuan-xuesan": {
    name: "North Campus Third Dining Hall",
    shortName: "North Hall 3",
    building: "North Campus Dining Hall",
    floor: "B1",
    windows: "Northeast classics · Rongchang braised food · Northern flatbreads",
    hours: "10:00–23:00",
    badge: "Late night",
    tags: ["Guobaorou", "Braised food", "Late night"],
  },
  "xueyuan-xuewu": {
    name: "North Campus Fifth Dining Hall",
    shortName: "North Hall 5",
    building: "North Campus Dining Hall",
    floor: "1F",
    windows: "Fish stall",
    hours: "06:30–09:00 / 10:30–13:00 / 17:00–19:00",
    badge: "Fish stall",
    tags: ["Fish", "Fried food", "Braised dishes"],
  },
  "xueyuan-xueliu": {
    name: "North Campus Sixth Dining Hall",
    shortName: "North Hall 6",
    building: "North Campus Dining Hall",
    floor: "2F",
    windows: "Shaanxi noodles · Hunan small bowls · Fried chicken",
    hours: "10:00–21:00",
    badge: "Regional flavors",
    tags: ["Shaanxi noodles", "Hunan food", "Late night"],
  },
};

const tagEnglish = {
  官方上新: "Official new",
  面食: "Noodles",
  热汤: "Hot soup",
  海鲜: "Seafood",
  炸物: "Fried food",
  肉食: "Meat",
  高蛋白: "High protein",
  米粉: "Rice noodles",
  米饭: "Rice",
  蒸菜: "Steamed",
  吃辣: "Spicy",
  面点: "Pastry",
  特色菜: "Specialty",
  卤味: "Braised food",
  家常菜: "Home-style",
  蒜香: "Garlic",
  酥脆: "Crispy",
  焖锅: "Sizzling pot",
  米线: "Rice noodles",
  芝士: "Cheese",
  鱼类: "Fish",
  豆瓣香: "Douban chili",
  自选: "Build your own",
  下饭: "Rice-friendly",
  清淡: "Light",
  土豆粉: "Potato noodles",
  清汤: "Clear broth",
  蔬菜: "Vegetables",
  锅物: "Hot pot",
  羊肉: "Lamb",
  套餐: "Set meal",
  酸甜: "Sweet & sour",
  椒麻: "Peppercorn",
  早餐: "Breakfast",
  凉菜: "Cold dish",
  晚餐: "Dinner",
  午餐: "Lunch",
};

const dishEnglish = {
  "shahe-east1-feichang-noodles": ["Pork Intestine Noodles", "Rich broth with a lingering savory finish", "Stall 17"],
  "shahe-east1-seafood-noodles": ["Seafood Noodles", "Fresh shrimp and a clean, savory broth", "Stall 33"],
  "shahe-east1-fried-ribs": ["Fried Pork Ribs", "Crisp outside and fragrant throughout", "Stall 17"],
  "shahe-east1-chicken-wing-root": ["Crispy Chicken Wing Roots", "Crunchy coating with juicy chicken inside", "Stall 17"],
  "shahe-east2-beef-rice-noodles": ["Fresh Beef Rice Noodles", "Tender beef and silky rice noodles", "Atrium · Sliced meat noodle stall"],
  "shahe-east2-teppan-beef": ["Sizzling Teppan Beef", "A dramatic sizzle with deep savory sauce", "Atrium · Sizzling pot & teppan stall"],
  "shahe-east2-lotus-chicken-rice": ["Lotus-Leaf Chicken & Shiitake Rice", "Fragrant lotus leaf with soft, savory rice", "Atrium · Bamboo steamer rice stall"],
  "shahe-east2-spicy-wonton": ["Sichuan Pepper Wontons", "Plump wontons with a bold numbing kick", "South · Wonton & dumpling stall"],
  "shahe-east3-acid-duck": ["Dingnan Fermented Rice Wine Duck", "A distinctive fermented aroma and deep flavor", "North · Chef's Kitchen stall"],
  "shahe-east3-braised-chicken-leg": ["Signature Braised Chicken Leg", "Glossy sauce, rich flavor and tender meat", "North · Signature pork rice stall"],
  "shahe-east3-roast-goose": ["Rongchang Braised Roast Goose", "Authentic regional seasoning with a mellow braise", "North · Braised goose & chicken stall"],
  "shahe-west4-jiaoshao-beef": ["Charred Braised Beef", "Fragrant, rich and satisfying without feeling heavy", "Stall 6"],
  "shahe-west1-mushroom-beef": ["Garlic Mushroom Beef", "Silky beef with fragrant garlic and mushrooms", "Smart buffet line"],
  "shahe-west1-crispy-chicken": ["Crispy Chicken", "Crisp skin, juicy meat and a savory glaze", "Smart buffet line"],
  "shahe-west1-overflow-chicken": ["Sizzling Chicken Pot Rice", "A fragrant pot of tender, sauce-soaked chicken", "Stall 9"],
  "shahe-west2-foil-beef-noodles": ["Foil-Wrapped Beef Rice Noodles", "Tangy, savory broth absorbed by every noodle", "Baked rice stall"],
  "shahe-west2-spicy-chicken-rice-noodles": ["Spicy Chicken Rice Noodle Soup", "Numbing, spicy broth with crisp chicken", "Chongqing noodle stall"],
  "shahe-west2-pork-meat-pie": ["Xianghe Pork Meat Pie", "Generous filling with a juicy, savory center", "Congee & flatbread stall"],
  "shahe-west3-sausage-cheese-rice": ["Sausage & Cheese Baked Rice", "Savory, cheesy and pleasingly stretchy", "Pizza & pasta stall"],
  "shahe-west3-shrimp-egg-rice": ["Shrimp & Silky Egg Rice", "Soft egg and bouncy shrimp over rice", "Silky egg fish rice stall"],
  "xueyuan-first-douban-catfish": ["Douban Chili Catfish", "Fragrant broad-bean chili with delicate fish", "2F North · Signature dish stall"],
  "xueyuan-first-grilled-octopus": ["Grilled Octopus", "Fresh, savory and charred to a tender bite", "2F North · Signature dish stall"],
  "xueyuan-first-small-bowls": ["Signature Small Bowls", "A varied, rice-friendly selection of small dishes", "2F South · Original grill stall"],
  "xueyuan-fourth-braised-fish-tail": ["Dry-Braised Fish Tail", "Rich sauce and deep flavor in every bite", "Sichuan-Chongqing stall"],
  "xueyuan-fourth-egg-bamboo-pork": ["Silky Egg, Pork & Celtuce", "Crisp celtuce with tender egg and pork", "Sichuan-Chongqing stall"],
  "xueyuan-fourth-hotpot-wonton": ["Hot Pot Wontons", "Thin wrappers, generous filling and mala heat", "Beijing dumpling stall"],
  "xueyuan-fourth-potato-noodle-fish": ["Potato Noodle Grilled Fish", "Chewy potato noodles with savory grilled fish", "Fried rice & grilled fish stall"],
  "xueyuan-seventh-broth-vegetables": ["Vegetables in Rich Broth", "Clean broth and a generous vegetable bowl", "Stall 1"],
  "xueyuan-seventh-chicken-pot": ["Nourishing Chicken Pot", "Clear broth with tender, comforting chicken", "Stall 1"],
  "xueyuan-seventh-lamb-rice": ["House-Special Lamb Rice", "Aromatic lamb with rice that soaks up the sauce", "Stall 2"],
  "xueyuan-seventh-guokui-beef": ["Beef with Guokui Flatbread", "Tender flatbread paired with savory beef", "Signature dish stall"],
  "xueyuan-third-guobaorou-set": ["Guobaorou Pork Set", "Crisp pork with a balanced sweet-and-sour glaze", "B1 · Northeast flavor stall"],
  "xueyuan-third-pepper-chicken-rice": ["Peppercorn Hand-Pulled Chicken Rice", "Addictive peppercorn aroma with tender chicken", "B1 · Rongchang braised food stall"],
  "xueyuan-third-mushroom-pork-rice": ["Braised Pork & Shiitake Rice", "Tender pork and mushrooms over savory rice", "B1 · Rongchang braised food stall"],
  "xueyuan-third-scallion-meat-pie": ["Xianghe Pork & Scallion Pie", "Thin crust, full filling and plenty of juice", "B1 · Northern flatbread stall"],
  "xueyuan-fifth-fried-redfish": ["Crispy Redfin Fish", "Crunchy exterior with delicate fish inside", "1F · Fish stall"],
  "xueyuan-fifth-tofu-catfish": ["Spicy Tofu & Catfish", "Bold mala sauce with tofu and tender catfish", "1F · Fish stall"],
  "xueyuan-sixth-qishan-noodles": ["Qishan Minced Meat Noodles", "Hot-and-sour broth with aromatic minced meat", "2F · Shancheng noodle stall"],
  "xueyuan-sixth-oil-noodles": ["Shaanxi Oil-Splashed Noodles", "Chewy noodles finished with fragrant chili oil", "2F · Shancheng noodle stall"],
};

export function localizeCampus(campus, language) {
  if (language !== "en") return campus;
  return { ...campus, ...campusEnglish[campus.id] };
}

export function localizeCanteen(canteen, language) {
  if (!canteen || language !== "en") return canteen;
  return { ...canteen, ...canteenEnglish[canteen.id] };
}

export function localizeDish(dish, language) {
  if (language !== "en") return dish;
  const [name, subtitle, window] = dishEnglish[dish.id] ?? [
    dish.name,
    dish.subtitle,
    dish.window,
  ];
  return {
    ...dish,
    name,
    subtitle,
    window,
    tags: dish.tags.map((tag) => tagEnglish[tag] ?? tag),
    meal: dish.meal.map((meal) => tagEnglish[meal] ?? meal),
    description: `Official review: ${subtitle}. The dish name, stall information and photo come from Beihang University's official spring 2026 menu feature. Price is an indicative project estimate.`,
  };
}

export function localizeFilterTag(tag, language) {
  if (language !== "en") return tag.label;
  return (
    {
      全部: "All",
      官方上新: "Official new",
      吃辣: "Spicy",
      面食: "Noodles",
      米饭: "Rice",
      鱼类: "Fish",
      清淡: "Light",
      省钱: "Under ¥20",
    }[tag.id] ?? tag.label
  );
}
