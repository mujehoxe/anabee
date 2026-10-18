/* ANABEE product specifications by place. */
(function (global) {
  function item(id, place, pillar, name, note, behavior, phrase) {
    return {
      id: id,
      place: place,
      pillar: pillar,
      name: name,
      spec: note,
      behavior: behavior,
      phrase: phrase,
      status: "specification"
    };
  }

  var pillars = [
    {
      id: "air",
      ar: "الهواء",
      en: "Air",
      icon: "air",
      behaviors: [
        "Do not smoke in the square metre where you stand.",
        "Plant something, or look after a plant already in that place."
      ]
    },
    {
      id: "water",
      ar: "الماء",
      en: "Water",
      icon: "water_drop",
      behaviors: [
        "Turn the tap off when you do not need the water.",
        "Use a reusable cup instead of one you throw away."
      ]
    },
    {
      id: "soil",
      ar: "التربة",
      en: "Soil",
      icon: "landscape",
      behaviors: [
        "Do not drop waste on the soil in this square metre.",
        "Sort what you can, in the same place."
      ]
    },
    {
      id: "energy",
      ar: "الطاقة",
      en: "Energy",
      icon: "bolt",
      behaviors: [
        "Switch off a device or a light you do not need in this square metre.",
        "Use daylight when it is enough."
      ]
    },
    {
      id: "food",
      ar: "الغذاء",
      en: "Food",
      icon: "restaurant",
      behaviors: [
        "Take only as much as you will eat.",
        "Do not leave food on the plate to be thrown away."
      ]
    },
    {
      id: "plant",
      ar: "النبات",
      en: "Plant",
      icon: "potted_plant",
      behaviors: [
        "Do not cut a plant or break a branch.",
        "Water one plant, or protect it from harm."
      ]
    },
    {
      id: "animal",
      ar: "الحيوان",
      en: "Animal",
      icon: "pets",
      behaviors: [
        "Do not harm an animal in this place.",
        "If it is safe and allowed, leave clean water."
      ]
    }
  ];

  var places = [
    { id: "restaurant", ar: "المطاعم", en: "Restaurants", n: 10 },
    { id: "hotel", ar: "الفنادق", en: "Hotels", n: 10 },
    { id: "street", ar: "الشوارع والمدن", en: "Streets and cities", n: 10 },
    { id: "transit", ar: "الطائرات والمطارات والموانئ", en: "Aircraft, airports and ports", n: 10 },
    { id: "worship", ar: "المساجد والمعابد", en: "Mosques and temples", n: 5 },
    { id: "wedding", ar: "صالات الأفراح", en: "Wedding halls", n: 5 },
    { id: "stadium", ar: "الملاعب والمنشآت الرياضية", en: "Stadiums and sports venues", n: 25 }
  ];

  var products = [
    item("r01", "restaurant", "water", "ANABEE cup", "A cup reused inside the restaurant. Designed for everyday reuse.", "Do not ask for a cup that is thrown away after one drink.", "I love clean water ANABEE"),
    item("r02", "restaurant", "food", "ANABEE plate", "A smaller plate in the specification, so less is left behind.", "Do not waste food on this plate.", "I love food without waste ANABEE"),
    item("r03", "restaurant", "plant", "ANABEE cloth napkin", "A cloth napkin that is washed, instead of a paper one every meal.", "Refuse the paper napkin when cloth is available.", "I love plants ANABEE"),
    item("r04", "restaurant", "food", "ANABEE leftovers box", "A box reused for leftovers. Ready as a specification for partners.", "Take the rest with you instead of throwing it away.", "I love food without waste ANABEE"),
    item("r05", "restaurant", "plant", "ANABEE digital menu", "A menu by QR code instead of a paper menu for every guest.", "Do not ask for paper if the menu is on a screen.", "I love plants ANABEE"),
    item("r06", "restaurant", "water", "ANABEE reusable straw", "A metal or glass straw in the specification. Ready for partner production.", "Refuse the plastic straw.", "I love clean water ANABEE"),
    item("r07", "restaurant", "water", "ANABEE water refill", "A refill point in the restaurant. A behaviour-linked refill point.", "Refill your bottle instead of buying a new one.", "I love clean water ANABEE"),
    item("r08", "restaurant", "food", "ANABEE behaviour sticker", "A sticker on the table that names the no-waste behaviour.", "Read it and do it before you order.", "I love food without waste ANABEE"),
    item("r09", "restaurant", "soil", "ANABEE cloth takeaway bag", "A cloth bag for takeaway, in the specification.", "Refuse a plastic bag for the order.", "I love clean soil ANABEE"),
    item("r10", "restaurant", "food", "ANABEE leftovers card", "A card that records the weight left on the plate. A habit tool in the specification.", "Weigh what is left once, so you see the habit.", "I love food without waste ANABEE"),

    item("h01", "hotel", "water", "ANABEE sheet", "Sheets washed on request, not automatically every day.", "Hang the card if you do not need the sheets changed.", "I love clean water ANABEE"),
    item("h02", "hotel", "water", "ANABEE soap", "A fixed soap dispenser instead of small bottles that are thrown away.", "Use the dispenser. Do not ask for a new bottle.", "I love clean water ANABEE"),
    item("h03", "hotel", "water", "ANABEE save-water card", "A card at the tap: turn it off.", "Turn the tap off while you brush your teeth.", "I love clean water ANABEE"),
    item("h04", "hotel", "water", "ANABEE towel", "A towel hung up again if it is still fit to use.", "Hang the towel if you will use it tomorrow.", "I love clean water ANABEE"),
    item("h05", "hotel", "energy", "ANABEE linen card", "A card that says: do not change the sheets today.", "Leave the card if you do not need a new wash.", "I love saved energy ANABEE"),
    item("h06", "hotel", "energy", "ANABEE room light", "A light that goes off with the door key. A specification.", "Turn the light off when you leave the room.", "I love saved energy ANABEE"),
    item("h07", "hotel", "soil", "ANABEE sort bin", "Two bins in the room: what can be recycled and what cannot. Specification only.", "Put each thing in the right bin.", "I love clean soil ANABEE"),
    item("h08", "hotel", "water", "ANABEE glass bottle", "A bottle filled from the hotel dispenser.", "Do not buy bottled water if a dispenser is there.", "I love clean water ANABEE"),
    item("h09", "hotel", "energy", "ANABEE room power key", "A key that cuts the room power when you leave. A behaviour specification.", "Take the key with you so what you do not need switches off.", "I love saved energy ANABEE"),
    item("h10", "hotel", "water", "ANABEE shower card", "A sign by the shower asking for a shorter shower.", "Shorten the shower by one minute.", "I love clean water ANABEE"),

    item("s01", "street", "soil", "ANABEE bin", "A street bin in the specification, tied to not dropping waste on the ground.", "Do not throw anything outside the bin.", "I love clean soil ANABEE"),
    item("s02", "street", "energy", "ANABEE street light", "A more efficient lamp in the specification. A city lighting specification.", "Do not ask for more light than this square metre needs.", "I love saved energy ANABEE"),
    item("s03", "street", "soil", "ANABEE bench", "A public bench left clean.", "Leave the bench as you found it, or cleaner.", "I love clean soil ANABEE"),
    item("s04", "street", "air", "ANABEE bike stand", "A place to lock a bike for a short trip instead of a car, when that is realistic.", "If the distance is short and safe, use the bike.", "I love clean air ANABEE"),
    item("s05", "street", "air", "ANABEE air board", "A board that shows a number if a sensor exists. A display for local air data when available.", "Read the number before you smoke or run a generator.", "I love clean air ANABEE"),
    item("s06", "street", "water", "ANABEE drinking fountain", "A public drink point that reduces bottles. A specification.", "Drink from it if the water is safe, instead of buying a bottle.", "I love clean water ANABEE"),
    item("s07", "street", "soil", "ANABEE compost bin", "A bin for plant scraps in the neighbourhood. A neighbourhood compost specification.", "If the bin is there, put plant scraps in it.", "I love clean soil ANABEE"),
    item("s08", "street", "plant", "ANABEE tree shade", "Protecting a tree that is already there. Care for the tree already there.", "Do not cut the branch or dig at the roots.", "I love plants ANABEE"),
    item("s09", "street", "air", "ANABEE walking metre", "A metre you walk instead of starting a car for a very short distance.", "Walk this metre if it is safe.", "I love clean air ANABEE"),
    item("s10", "street", "energy", "ANABEE public charger", "A charge point that is unplugged when charging is finished.", "Unplug the charger when the battery is full.", "I love saved energy ANABEE"),

    item("t01", "transit", "plant", "ANABEE digital ticket", "A ticket on the phone instead of paper.", "Do not print the ticket if the system accepts the phone.", "I love plants ANABEE"),
    item("t02", "transit", "air", "ANABEE carbon behaviour card", "A card that reminds you about the trip. A reminder to choose lower-impact travel when you can.", "Choose the lower-impact trip when you actually have a choice.", "I love clean air ANABEE"),
    item("t03", "transit", "water", "ANABEE lounge bottle", "A bottle filled in the lounge.", "Fill it from the dispenser if one is there.", "I love clean water ANABEE"),
    item("t04", "transit", "water", "ANABEE lounge cup", "A cup reused in an airport or port lounge.", "Refuse the plastic cup.", "I love clean water ANABEE"),
    item("t05", "transit", "soil", "ANABEE reusable travel pillow", "A traveller's pillow that is washed. A travel amenity specification.", "Do not take a pillow that is thrown away after one trip.", "I love clean soil ANABEE"),
    item("t06", "transit", "soil", "ANABEE no-plastic bag", "A cloth bag for cabin items.", "Refuse a plastic bag from the shop.", "I love clean soil ANABEE"),
    item("t07", "transit", "energy", "ANABEE gate screen", "The gate screen replaces printed notices.", "Read the screen. Do not take a repeat paper leaflet.", "I love saved energy ANABEE"),
    item("t08", "transit", "soil", "ANABEE seat sticker", "A sticker on the seat: leave it clean.", "Do not leave waste on the seat.", "I love clean soil ANABEE"),
    item("t09", "transit", "energy", "ANABEE shared luggage trolley", "A trolley returned to its point.", "Return the trolley after the bags.", "I love saved energy ANABEE"),
    item("t10", "transit", "water", "ANABEE port behaviour card", "A card on the quay: no liquids in the sea.", "Do not empty anything into the water.", "I love clean water ANABEE"),

    item("w01", "worship", "soil", "ANABEE prayer rug", "A rug folded and left clean. A cleanliness behaviour for shared spaces.", "Leave the rug clean for the next person.", "I love a clean place ANABEE"),
    item("w02", "worship", "soil", "ANABEE shoe rack", "A rack for shoes outside the hall.", "Put shoes on the rack, not on the floor.", "I love a clean place ANABEE"),
    item("w03", "worship", "water", "ANABEE ablution tap", "A tap that is easy to close during ablution. A specification.", "Turn the water off between the steps.", "I love clean water ANABEE"),
    item("w04", "worship", "soil", "ANABEE cleanliness bin", "A bin by the door.", "Put waste in the bin.", "I love a clean place ANABEE"),
    item("w05", "worship", "soil", "ANABEE cleanliness card", "A short card at the entrance.", "Read it and do one behaviour before you leave.", "I love a clean place ANABEE"),

    item("d01", "wedding", "plant", "ANABEE digital invitation", "An invitation on the phone instead of a card for every guest.", "Send the invitation digitally.", "I love plants ANABEE"),
    item("d02", "wedding", "water", "ANABEE celebration cup", "A cup reused in the hall.", "Do not use a cup that is thrown away.", "I love clean water ANABEE"),
    item("d03", "wedding", "food", "ANABEE celebration plate", "A plate sized so less is left at the buffet.", "Take one round of what you will eat.", "I love food without waste ANABEE"),
    item("d04", "wedding", "soil", "ANABEE decoration without plastic", "Decoration from cloth and reusable paper, not balloons that are thrown away.", "Refuse decoration that is thrown away the same night.", "I love clean soil ANABEE"),
    item("d05", "wedding", "plant", "ANABEE cloth gift box", "A cloth box instead of shiny wrap.", "Wrap the gift in cloth or paper that can be reused.", "I love plants ANABEE"),

    item("p01", "stadium", "soil", "ANABEE seat", "A stand seat left without waste.", "Do not leave anything under the seat.", "I love clean support ANABEE"),
    item("p02", "stadium", "plant", "ANABEE shirt", "A cotton shirt in the specification, washed and reused. Not stock for sale.", "Wear a shirt you already have instead of buying one to throw away.", "I love clean support ANABEE"),
    item("p03", "stadium", "water", "ANABEE stand cup", "A stadium cup that is reused.", "Refuse the single-use match cup.", "I love clean water ANABEE"),
    item("p04", "stadium", "soil", "ANABEE stand bin", "A bin between the seats.", "Put waste in it before you stand up.", "I love clean support ANABEE"),
    item("p05", "stadium", "air", "ANABEE clean-support sign", "A sign: support without smoke and without flares.", "Do not smoke in your seat.", "I love clean air ANABEE"),
    item("p06", "stadium", "plant", "ANABEE digital match ticket", "A ticket on the phone.", "Do not print the ticket.", "I love plants ANABEE"),
    item("p07", "stadium", "plant", "ANABEE cloth flag", "A cloth flag folded after the match, not paper thrown away.", "Take the flag with you.", "I love plants ANABEE"),
    item("p08", "stadium", "food", "ANABEE meal without plastic", "A meal in a reused container, or eaten completely.", "Do not leave half the meal.", "I love food without waste ANABEE"),
    item("p09", "stadium", "water", "ANABEE water station", "A refill point in the stadium. A specification.", "Refill your bottle.", "I love clean water ANABEE"),
    item("p10", "stadium", "water", "ANABEE stadium towel", "A towel for a player or spectator that is washed.", "Do not take a towel that is thrown away.", "I love clean water ANABEE"),
    item("p11", "stadium", "soil", "ANABEE bag", "A cloth bag for the day.", "Refuse a bag from the stall.", "I love clean soil ANABEE"),
    item("p12", "stadium", "plant", "ANABEE cap", "A cap kept across seasons, kept across seasons.", "Use a cap you already have.", "I love plants ANABEE"),
    item("p13", "stadium", "plant", "ANABEE scarf", "A cloth scarf.", "Do not buy a plastic scarf for one match.", "I love plants ANABEE"),
    item("p14", "stadium", "soil", "ANABEE training card", "A card in the changing room: the floor is left clean.", "Pick up what fell after training.", "I love clean soil ANABEE"),
    item("p15", "stadium", "soil", "ANABEE substitutes' bench", "The bench area without discarded containers.", "Put the container in the bin as you get up.", "I love clean support ANABEE"),
    item("p16", "stadium", "air", "ANABEE match behaviour board", "One line on the screen: one behaviour for this match. A matchday behaviour cue.", "Read the line and do it.", "I love clean air ANABEE"),
    item("p17", "stadium", "energy", "ANABEE efficient stadium light", "Lighting lowered after the whistle when operations allow it.", "Do not ask for every floodlight to stay on for extra photos.", "I love saved energy ANABEE"),
    item("p18", "stadium", "soil", "ANABEE pitch and soil card", "A maintenance behaviour: do not walk on the pitch without a reason.", "Do not walk on the grass if you are asked not to.", "I love clean soil ANABEE"),
    item("p19", "stadium", "air", "ANABEE players' tunnel sign", "A short sign before entry: no smoking.", "Do not smoke in the tunnel.", "I love clean air ANABEE"),
    item("p20", "stadium", "soil", "ANABEE club-shop bag", "A cloth bag for the shop.", "Refuse the shop's plastic bag.", "I love clean soil ANABEE"),
    item("p21", "stadium", "air", "ANABEE 7-second recording point", "A place where a pledge may be recorded. A place to record your pledge when filming is welcome.", "Record 7 seconds only if filming is allowed.", "I love clean air ANABEE"),
    item("p22", "stadium", "soil", "ANABEE supporter wristband", "A cloth band reused, not paper for every match.", "Use one band for the season.", "I love clean support ANABEE"),
    item("p23", "stadium", "air", "ANABEE stadium bike parking", "Bike parking at the gate.", "If you came from nearby, leave the car.", "I love clean air ANABEE"),
    item("p24", "stadium", "soil", "ANABEE recycling bin", "A clear bin at the exit.", "Sort before you leave.", "I love clean soil ANABEE"),
    item("p25", "stadium", "air", "ANABEE pledge screen", "A screen that shows the pledge sentence of someone who recorded voluntarily. It does not show anyone without consent.", "Do not ask to show the face of a person who did not agree.", "I love clean air ANABEE")
  ];

  if (products.length !== 75) {
    console.warn("ANABEE catalog expected 75 specs, got " + products.length);
  }

  // Use Material Icons names that resolve as glyphs (unknown names render as text and overflow the chip).
  var productIcons = {
    r01: "local_cafe", r02: "dinner_dining", r03: "dry_cleaning", r04: "inventory_2",
    r05: "qr_code_2", r06: "emoji_food_beverage", r07: "local_drink", r08: "sticky_note_2",
    r09: "shopping_bag", r10: "monitor_weight",
    h01: "bed", h02: "soap", h03: "water_drop", h04: "dry",
    h05: "hotel", h06: "lightbulb", h07: "delete", h08: "liquor",
    h09: "key", h10: "shower",
    s01: "delete", s02: "light", s03: "chair", s04: "pedal_bike",
    s05: "air", s06: "local_drink", s07: "compost", s08: "park",
    s09: "directions_walk", s10: "electrical_services",
    t01: "confirmation_number", t02: "energy_savings_leaf", t03: "local_drink", t04: "local_cafe",
    t05: "airline_seat_recline_normal", t06: "shopping_bag", t07: "tv", t08: "airline_seat_recline_extra",
    t09: "luggage", t10: "anchor",
    w01: "self_improvement", w02: "directions_walk", w03: "water_drop", w04: "delete", w05: "sticky_note_2",
    d01: "mail", d02: "local_cafe", d03: "dinner_dining", d04: "celebration", d05: "redeem",
    p01: "event_seat", p02: "checkroom", p03: "local_cafe", p04: "delete",
    p05: "campaign", p06: "confirmation_number", p07: "flag", p08: "fastfood",
    p09: "local_drink", p10: "dry", p11: "shopping_bag", p12: "checkroom",
    p13: "dry_cleaning", p14: "fitness_center", p15: "deck", p16: "tv",
    p17: "lightbulb", p18: "grass", p19: "smoke_free", p20: "shopping_bag",
    p21: "videocam", p22: "watch", p23: "pedal_bike", p24: "recycling", p25: "live_tv"
  };

  products.forEach(function (product) {
    product.icon = productIcons[product.id] || "inventory_2";
    var itemBase = "/assets/products/items/" + product.id;
    product.image = itemBase + ".jpg";
    product.imageCard = itemBase + "-480.jpg";
    product.imageSrcset = product.imageCard + " 480w, " + product.image + " 800w";
  });

  places.forEach(function (place) {
    place.image = "/assets/products/" + place.id + ".jpg";
  });

  global.ANABEE_CATALOG = {
    pillars: pillars,
    places: places,
    products: products,
    joinPlaces: places.concat([{ id: "other", ar: "مكان آخر", en: "Somewhere else", n: 0 }])
  };
})(window);
