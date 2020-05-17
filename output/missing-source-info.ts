const missingSources: { [key: string]: number[] } = {
  adventure: [
    1886391431, // Gearhead Gloves
    1589569998, // Gearhead Gauntlets
    2290569618 // Gearhead Grips
  ],
  blackarmory: [
    2851938357, // Forged Machinist Gauntlets
    4064641551, // Annealed Shaper Bond
    3363625697, // Woven Firesmith Grips
    1497164220, // Forged Machinist Helm
    3155412907, // Forged Machinist Plate
    3322192806, // Annealed Shaper Robes
    2119727155, // Annealed Shaper Crown
    133093143, // Forged Machinist Greaves
    3283890999, // Woven Firesmith Vest
    3607521808, // Woven Firesmith Mask
    78664642, // Annealed Shaper Gloves
    2122810492, // Annealed Shaper Boots
    563606995, // Woven Firesmith Boots
    1512129090, // Forged Machinist Mark
    1117243014 // Woven Firesmith Cape
  ],
  calus: [
    784492908, // Hive Armaments
    2249025553, // Hive Invigoration
    3425422485, // Hive Repurposing
    3888848980 // Hive Barrier
  ],
  crownofsorrow: [
    784492908, // Hive Armaments
    2249025553, // Hive Invigoration
    3425422485, // Hive Repurposing
    3888848980 // Hive Barrier
  ],
  crucible: [
    2466453881, // Wing Discipline
    3089908066, // Wing Discipline
    1673285051, // Wing Theorem
    3839561204, // Wing Theorem
    1765728763, // Ankaa Seeker IV
    1929596421, // Ankaa Seeker IV
    4043980813, // Ankaa Seeker IV
    4211218181, // Ankaa Seeker IV
    530558102, // Phoenix Strife Type 0
    2543903638, // Phoenix Strife Type 0
    2845947996, // Phoenix Strife Type 0
    3781722107, // Phoenix Strife Type 0
    290136582, // Wing Theorem
    2323865727, // Wing Theorem
    1036467370, // Wing Theorem
    2525395257, // Wing Theorem
    438224459, // Wing Discipline
    1722623780, // Wing Discipline
    1062166003, // Wing Contender
    2415711886, // Wing Contender
    283188616, // Wing Contender
    1716643851, // Wing Contender
    3772194440, // Wing Contender
    4123918087, // Wing Contender
    215768941, // Ankaa Seeker IV
    419812559, // Ankaa Seeker IV
    1852468615, // Ankaa Seeker IV
    4134090375, // Ankaa Seeker IV
    85800627, // Ankaa Seeker IV
    852430165, // Ankaa Seeker IV
    2727890395, // Ankaa Seeker IV
    3098458331, // Ankaa Seeker IV
    920187221, // Wing Discipline
    4136212668, // Wing Discipline
    1742940528, // Phoenix Strife Type 0
    1807196134, // Phoenix Strife Type 0
    2231762285, // Phoenix Strife Type 0
    3756286064, // Phoenix Strife Type 0
    98331691, // Binary Phoenix Mark
    468899627, // Binary Phoenix Mark
    670877864, // Binary Phoenix Mark
    3884544409, // Binary Phoenix Mark
    761953100, // Ankaa Seeker IV
    876608500, // Ankaa Seeker IV
    1299272338, // Ankaa Seeker IV
    2775298636, // Ankaa Seeker IV
    3483546829, // Wing Discipline
    3818803676, // Wing Discipline
    388771599, // Phoenix Strife Type 0
    1727248109, // Phoenix Strife Type 0
    2670393359, // Phoenix Strife Type 0
    3315265682, // Phoenix Strife Type 0
    252414402, // Swordflight 4.1
    727838174, // Swordflight 4.1
    2473130418, // Swordflight 4.1
    3797729472, // Swordflight 4.1
    2070517134, // Wing Contender
    3119528729, // Wing Contender
    2496309431, // Wing Discipline
    3522021318, // Wing Discipline
    328902054, // Swordflight 4.1
    1830829330, // Swordflight 4.1
    1904811766, // Swordflight 4.1
    2680535688, // Swordflight 4.1
    449878234, // Phoenix Strife Type 0
    820446170, // Phoenix Strife Type 0
    1548928853, // Phoenix Strife Type 0
    2674680132, // Phoenix Strife Type 0
    1571781304, // Swordflight 4.1
    2296560252, // Swordflight 4.1
    2492669178, // Swordflight 4.1
    3298826188, // Swordflight 4.1
    744199039, // Wing Contender
    1838273186, // Wing Contender
    1654427223, // Swordflight 4.1
    1801625827, // Swordflight 4.1
    2094233929, // Swordflight 4.1
    2293476915, // Swordflight 4.1
    87665893, // Binary Phoenix Cloak
    1071350799, // Binary Phoenix Cloak
    1658896287, // Binary Phoenix Cloak
    2426070307, // Binary Phoenix Cloak
    1467590642, // Binary Phoenix Bond
    1838158578, // Binary Phoenix Bond
    2291226602, // Binary Phoenix Bond
    4269346472, // Binary Phoenix Bond
    356269375, // Wing Theorem
    874101646, // Wing Theorem
    1245115841, // Wing Theorem
    4144133120 // Wing Theorem
  ],
  do: [
    3470850110, // Anti-Extinction Grasps
    102368695, // Anti-Extinction Mask
    1557512974, // Anti-Extinction Plate
    669535051, // Anti-Extinction Helm
    1875607511, // Stella Incognita Mark
    248161012, // Anti-Extinction Greaves
    3373566763, // Anti-Extinction Robes
    3304105970, // Anti-Extinction Vest
    245450812, // Anti-Extinction Hood
    1600224949, // Anti-Extinction Gloves
    3940923523, // Stella Incognita Cloak
    3890232472, // Anti-Extinction Legs
    3176347031, // Anti-Extinction Boots
    2862198970, // Anti-Extinction Gauntlets
    1730282946 // Stella Incognita Bond
  ],
  dreaming: [
    998096007, // Reverie Dawn Hood
    1452333832, // Reverie Dawn Boots
    3711557785, // Reverie Dawn Strides
    2467635521, // Reverie Dawn Hauberk
    1903023095, // Reverie Dawn Grasps
    3343583008, // Reverie Dawn Mark
    2336820707, // Reverie Dawn Gauntlets
    3239662350, // Reverie Dawn Gloves
    2889063206, // Reverie Dawn Casque
    2704876322, // Reverie Dawn Tabard
    4257800469, // Reverie Dawn Greaves
    3250140572, // Reverie Dawn Cloak
    1928769139, // Reverie Dawn Bond
    934704429, // Reverie Dawn Plate
    99549082 // Reverie Dawn Helm
  ],
  drifter: [
    230878649, // Ancient Apocalypse Mask
    759348512, // Ancient Apocalypse Mask
    3537476911, // Ancient Apocalypse Mask
    1188039652, // Ancient Apocalypse Gauntlets
    1359908066, // Ancient Apocalypse Gauntlets
    2677967607, // Ancient Apocalypse Gauntlets
    485653258, // Ancient Apocalypse Strides
    2451538755, // Ancient Apocalypse Strides
    2568447248, // Ancient Apocalypse Strides
    386367515, // Ancient Apocalypse Boots
    392058749, // Ancient Apocalypse Boots
    2039976446, // Ancient Apocalypse Boots
    1013137701, // Ancient Apocalypse Hood
    3925589496, // Ancient Apocalypse Hood
    4255727106, // Ancient Apocalypse Hood
    9767416, // Ancient Apocalypse Bond
    1488486721, // Ancient Apocalypse Bond
    2459422430, // Ancient Apocalypse Bond
    127018032, // Ancient Apocalypse Grips
    1356064950, // Ancient Apocalypse Grips
    2620389105, // Ancient Apocalypse Grips
    94425673, // Ancient Apocalypse Gloves
    1752237812, // Ancient Apocalypse Gloves
    3595268459, // Ancient Apocalypse Gloves
    2512196373, // Ancient Apocalypse Helm
    3664007718, // Ancient Apocalypse Helm
    3825427923, // Ancient Apocalypse Helm
    1548620661, // Ancient Apocalypse Cloak
    2506514251, // Ancient Apocalypse Cloak
    2881248566, // Ancient Apocalypse Cloak
    509238959, // Ancient Apocalypse Mark
    2020166300, // Ancient Apocalypse Mark
    3804360785, // Ancient Apocalypse Mark
    191535001, // Ancient Apocalypse Greaves
    2694124942, // Ancient Apocalypse Greaves
    3404053788, // Ancient Apocalypse Greaves
    1741396519, // Ancient Apocalypse Vest
    2728668760, // Ancient Apocalypse Vest
    2858060922, // Ancient Apocalypse Vest
    191247558, // Ancient Apocalypse Plate
    1237661249, // Ancient Apocalypse Plate
    2518527196, // Ancient Apocalypse Plate
    787909455, // Ancient Apocalypse Robes
    887818405, // Ancient Apocalypse Robes
    3550729740 // Ancient Apocalypse Robes
  ],
  edz: [
    1886391431, // Gearhead Gloves
    1589569998, // Gearhead Gauntlets
    2290569618 // Gearhead Grips
  ],
  eow: [
    574916072, // Bond of Sekris
    781488881, // Mask of Feltroc
    3331120813, // Boots of Sekris
    3168014845, // Cloak of Feltroc
    88873628, // Gauntlets of Nohr
    161336786, // Mask of Sekris
    75025442, // Boots of Feltroc
    2938125956, // Plate of Nohr
    3731175213, // Mask of Nohr
    1877424533, // Robes of Sekris
    3693007688, // Grips of Feltroc
    3386768934, // Greaves of Nohr
    4240859456, // Vest of Feltroc
    3681852889, // Mark of Nohr
    627690043 // Wraps of Sekris
  ],
  ep: [
    2114894938, // Abhorrent Imperative Grasps
    2970562833, // Yuga Sundown Boots
    4286845987, // Midnight Exigent Mark
    3876414174, // Midnight Exigent Gauntlets
    3126089918, // Yuga Sundown Helmet
    425390008, // Midnight Exigent Greaves
    2639046519, // Abhorrent Imperative Cloak
    508035927, // Midnight Exigent Helm
    3691605010, // Midnight Exigent Plate
    3792637803, // Abhorrent Imperative Mask
    3371366804, // Abhorrent Imperative Strides
    2395959535, // Yuga Sundown Gloves
    2034926084, // Yuga Sundown Bond
    2320951982, // Abhorrent Imperative Vest
    720656969 // Yuga Sundown Robes
  ],
  eververse: [
    2225903500, // Robes of Optimacy
    1706764073, // Winterhart Mark
    3455566107, // Winterhart Robes
    4059030097, // Winterhart Mask
    1707587907, // Vest of Optimacy
    1135293055, // Plate of Optimacy
    3781263385, // Arms of Optimacy
    1290784012, // Winterhart Gauntlets
    706111909, // Hood of Optimacy
    2112889975, // Crimson Valor
    167651268, // Crimson Passion
    1135293055, // Plate of Optimacy
    1732950654, // Legs of Optimacy
    2717158440, // Winterhart Grips
    2806805902, // Mark of Optimacy
    1707587907, // Vest of Optimacy
    1984190529, // Magikon
    3161524490, // Rupture
    3569791559, // Shimmering Iris
    1812385586, // Winterhart Bond
    2640279229, // Arms of Optimacy
    138961800, // Helm of Optimacy
    710937567, // Legs of Optimacy
    1732950654, // Legs of Optimacy
    2693084644, // Mask of Optimacy
    163660481, // Bond of Optimacy
    1445212020, // Arms of Optimacy
    2378378507, // Legs of Optimacy
    989291706, // Cloak of Optimacy
    1956273477, // Winterhart Gloves
    691914261, // Silver Dawning Lanterns
    3168164098, // Yellow Dawning Lanterns
    3947596543, // Green Dawning Lanterns
    599687980, // Purple Dawning Lanterns
    989291706, // Cloak of Optimacy
    2777913565, // Winterhart Cloak
    710937567, // Legs of Optimacy
    2225903500, // Robes of Optimacy
    706111909, // Hood of Optimacy
    2806805902, // Mark of Optimacy
    2998296658, // Ice Ball Effects
    3729709035, // Joyfire
    3177119978, // Carmina Commencing
    1602334068, // Regent Redeemer
    2303499975, // Winterhart Boots
    2640279229, // Arms of Optimacy
    2378378507, // Legs of Optimacy
    1051903593, // Dawning Bauble Shell
    1397284432, // Jasper Dawn Shell
    1816495538, // Sweet Memories Shell
    921357268, // Winterhart Plate
    3850655136, // Winterhart Vest
    163660481, // Bond of Optimacy
    3781263385, // Arms of Optimacy
    2760398988, // Winterhart Cover
    1445212020, // Arms of Optimacy
    3866715933, // Dawning Warmth
    1844125034, // Dawning Festiveness
    2623660327, // Dawning Brilliance
    269339124, // Dawning Hope
    2693084644, // Mask of Optimacy
    3352566658, // Winterhart Strides
    138961800, // Helm of Optimacy
    2828252061, // Winterhart Helm
    1936516278 // Winterhart Greaves
  ],
  fwc: [
    680132464, // Simulator Greaves
    480714723, // Simulator Gloves
    3762717334, // Simulator Gauntlets
    1607585295, // Simulator Helm
    1512311134, // Simulator Vest
    3030715588, // Simulator Boots
    2401694485, // Simulator Legs
    2657180960, // Entanglement Bond
    2915206011, // Simulator Mask
    2538410394, // Simulator Hood
    79417130, // Simulator Grips
    883514983, // Entanglement Cloak
    248302381, // Simulator Robes
    2005525978, // Simulator Plate
    1653979435 // Entanglement Mark
  ],
  gambit: [
    230878649, // Ancient Apocalypse Mask
    759348512, // Ancient Apocalypse Mask
    3537476911, // Ancient Apocalypse Mask
    1188039652, // Ancient Apocalypse Gauntlets
    1359908066, // Ancient Apocalypse Gauntlets
    2677967607, // Ancient Apocalypse Gauntlets
    485653258, // Ancient Apocalypse Strides
    2451538755, // Ancient Apocalypse Strides
    2568447248, // Ancient Apocalypse Strides
    386367515, // Ancient Apocalypse Boots
    392058749, // Ancient Apocalypse Boots
    2039976446, // Ancient Apocalypse Boots
    1013137701, // Ancient Apocalypse Hood
    3925589496, // Ancient Apocalypse Hood
    4255727106, // Ancient Apocalypse Hood
    9767416, // Ancient Apocalypse Bond
    1488486721, // Ancient Apocalypse Bond
    2459422430, // Ancient Apocalypse Bond
    127018032, // Ancient Apocalypse Grips
    1356064950, // Ancient Apocalypse Grips
    2620389105, // Ancient Apocalypse Grips
    94425673, // Ancient Apocalypse Gloves
    1752237812, // Ancient Apocalypse Gloves
    3595268459, // Ancient Apocalypse Gloves
    2512196373, // Ancient Apocalypse Helm
    3664007718, // Ancient Apocalypse Helm
    3825427923, // Ancient Apocalypse Helm
    1548620661, // Ancient Apocalypse Cloak
    2506514251, // Ancient Apocalypse Cloak
    2881248566, // Ancient Apocalypse Cloak
    509238959, // Ancient Apocalypse Mark
    2020166300, // Ancient Apocalypse Mark
    3804360785, // Ancient Apocalypse Mark
    191535001, // Ancient Apocalypse Greaves
    2694124942, // Ancient Apocalypse Greaves
    3404053788, // Ancient Apocalypse Greaves
    1741396519, // Ancient Apocalypse Vest
    2728668760, // Ancient Apocalypse Vest
    2858060922, // Ancient Apocalypse Vest
    191247558, // Ancient Apocalypse Plate
    1237661249, // Ancient Apocalypse Plate
    2518527196, // Ancient Apocalypse Plate
    787909455, // Ancient Apocalypse Robes
    887818405, // Ancient Apocalypse Robes
    3550729740 // Ancient Apocalypse Robes
  ],
  gambitprime: [
    1438999856, // Notorious Collector Boots
    1438999858, // Illicit Collector Boots
    1438999859, // Outlawed Collector Boots
    3636943394, // Illicit Invader Helm
    3636943395, // Outlawed Invader Helm
    3636943392, // Notorious Invader Helm
    3088740176, // Notorious Invader Gloves
    3088740178, // Illicit Invader Gloves
    3088740179, // Outlawed Invader Gloves
    1989814422, // Outlawed Invader Grips
    1989814423, // Illicit Invader Grips
    1989814421, // Notorious Invader Grips
    2565812704, // Outlawed Collector Hood
    2565812705, // Illicit Collector Hood
    2565812707, // Notorious Collector Hood
    223681334, // Illicit Reaper Helm
    223681335, // Outlawed Reaper Helm
    223681332, // Notorious Reaper Helm
    1979001652, // Outlawed Reaper Bond
    1979001653, // Illicit Reaper Bond
    1979001655, // Notorious Reaper Bond
    420625863, // Notorious Invader Plate
    420625860, // Outlawed Invader Plate
    420625861, // Illicit Invader Plate
    2336344260, // Illicit Sentry Gloves
    2336344261, // Outlawed Sentry Gloves
    2336344262, // Notorious Sentry Gloves
    2593076934, // Illicit Invader Mask
    2593076935, // Outlawed Invader Mask
    2593076932, // Notorious Invader Mask
    154180150, // Notorious Sentry Cloak
    154180148, // Illicit Sentry Cloak
    154180149, // Outlawed Sentry Cloak
    3166483971, // Notorious Sentry Strides
    3166483968, // Outlawed Sentry Strides
    3166483969, // Illicit Sentry Strides
    1159077399, // Notorious Reaper Strides
    1159077396, // Outlawed Reaper Strides
    1159077397, // Illicit Reaper Strides
    2591049236, // Notorious Invader Robes
    2591049238, // Illicit Invader Robes
    2591049239, // Outlawed Invader Robes
    3373994939, // Notorious Invader Strides
    3373994936, // Outlawed Invader Strides
    3373994937, // Illicit Invader Strides
    3168759586, // Notorious Sentry Mark
    3168759584, // Illicit Sentry Mark
    3168759585, // Outlawed Sentry Mark
    95332290, // Outlawed Collector Strides
    95332291, // Illicit Collector Strides
    95332289, // Notorious Collector Strides
    2976484618, // Outlawed Invader Gauntlets
    2976484619, // Illicit Invader Gauntlets
    2976484617, // Notorious Invader Gauntlets
    1920676413, // Notorious Invader Bond
    1920676414, // Outlawed Invader Bond
    1920676415, // Illicit Invader Bond
    130287074, // Outlawed Sentry Gauntlets
    130287075, // Illicit Sentry Gauntlets
    130287073, // Notorious Sentry Gauntlets
    2187982746, // Illicit Sentry Helm
    2187982747, // Outlawed Sentry Helm
    2187982744, // Notorious Sentry Helm
    2698109346, // Notorious Collector Mask
    2698109344, // Illicit Collector Mask
    2698109345, // Outlawed Collector Mask
    2334120371, // Notorious Reaper Plate
    2334120368, // Outlawed Reaper Plate
    2334120369, // Illicit Reaper Plate
    264182643, // Notorious Collector Grips
    264182640, // Outlawed Collector Grips
    264182641, // Illicit Collector Grips
    3660501108, // Outlawed Sentry Hood
    3660501109, // Illicit Sentry Hood
    3660501111, // Notorious Sentry Hood
    893169982, // Notorious Invader Cloak
    893169980, // Illicit Invader Cloak
    893169981, // Outlawed Invader Cloak
    98700834, // Notorious Reaper Cloak
    98700832, // Illicit Reaper Cloak
    98700833, // Outlawed Reaper Cloak
    3489978604, // Illicit Invader Boots
    3489978605, // Outlawed Invader Boots
    3489978606, // Notorious Invader Boots
    2799932930, // Illicit Collector Mark
    2799932931, // Outlawed Collector Mark
    2799932928, // Notorious Collector Mark
    4266990316, // Notorious Sentry Boots
    4266990318, // Illicit Sentry Boots
    4266990319, // Outlawed Sentry Boots
    1208982392, // Outlawed Reaper Hood
    1208982393, // Illicit Reaper Hood
    1208982395, // Notorious Reaper Hood
    759881007, // Notorious Sentry Plate
    759881004, // Outlawed Sentry Plate
    759881005, // Illicit Sentry Plate
    3525447590, // Outlawed Collector Vest
    3525447591, // Illicit Collector Vest
    3525447589, // Notorious Collector Vest
    563461323, // Notorious Reaper Greaves
    563461320, // Outlawed Reaper Greaves
    563461321, // Illicit Reaper Greaves
    1386198150, // Outlawed Reaper Gauntlets
    1386198151, // Illicit Reaper Gauntlets
    1386198149, // Notorious Reaper Gauntlets
    1951201409, // Notorious Invader Hood
    1951201410, // Outlawed Invader Hood
    1951201411, // Illicit Invader Hood
    1039402696, // Notorious Reaper Boots
    1039402698, // Illicit Reaper Boots
    1039402699, // Outlawed Reaper Boots
    234582862, // Notorious Reaper Mark
    234582860, // Illicit Reaper Mark
    234582861, // Outlawed Reaper Mark
    3948054486, // Outlawed Collector Greaves
    3948054487, // Illicit Collector Greaves
    3948054485, // Notorious Collector Greaves
    975478398, // Notorious Collector Helm
    975478396, // Illicit Collector Helm
    975478397, // Outlawed Collector Helm
    4245233854, // Outlawed Sentry Grips
    4245233855, // Illicit Sentry Grips
    4245233853, // Notorious Sentry Grips
    1984789551, // Notorious Reaper Vest
    1984789548, // Outlawed Reaper Vest
    1984789549, // Illicit Reaper Vest
    4020124604, // Illicit Sentry Robes
    4020124605, // Outlawed Sentry Robes
    4020124606, // Notorious Sentry Robes
    3583507224, // Illicit Reaper Robes
    3583507225, // Outlawed Reaper Robes
    3583507226, // Notorious Reaper Robes
    3837542170, // Notorious Invader Mark
    3837542168, // Illicit Invader Mark
    3837542169, // Outlawed Invader Mark
    4026665503, // Notorious Invader Greaves
    4026665500, // Outlawed Invader Greaves
    4026665501, // Illicit Invader Greaves
    3403732216, // Illicit Collector Gloves
    3403732217, // Outlawed Collector Gloves
    3403732218, // Notorious Collector Gloves
    3220030414, // Illicit Sentry Mask
    3220030415, // Outlawed Sentry Mask
    3220030412, // Notorious Sentry Mask
    432797516, // Outlawed Collector Bond
    432797517, // Illicit Collector Bond
    432797519, // Notorious Collector Bond
    370332342, // Illicit Collector Cloak
    370332343, // Outlawed Collector Cloak
    370332340, // Notorious Collector Cloak
    3533064930, // Outlawed Reaper Grips
    3533064931, // Illicit Reaper Grips
    3533064929, // Notorious Reaper Grips
    2051266839, // Notorious Sentry Greaves
    2051266836, // Outlawed Sentry Greaves
    2051266837, // Illicit Sentry Greaves
    1295793306, // Illicit Reaper Mask
    1295793307, // Outlawed Reaper Mask
    1295793304, // Notorious Reaper Mask
    2371932407, // Notorious Collector Gauntlets
    2371932404, // Outlawed Collector Gauntlets
    2371932405, // Illicit Collector Gauntlets
    722344176, // Illicit Reaper Gloves
    722344177, // Outlawed Reaper Gloves
    722344178, // Notorious Reaper Gloves
    2710420859, // Notorious Sentry Vest
    2710420856, // Outlawed Sentry Vest
    2710420857, // Illicit Sentry Vest
    1477025072, // Outlawed Sentry Bond
    1477025073, // Illicit Sentry Bond
    1477025075, // Notorious Sentry Bond
    3981071587, // Notorious Invader Vest
    3981071584, // Outlawed Invader Vest
    3981071585, // Illicit Invader Vest
    4060232810, // Outlawed Collector Plate
    4060232811, // Illicit Collector Plate
    4060232809, // Notorious Collector Plate
    1505642256, // Illicit Collector Robes
    1505642257, // Outlawed Collector Robes
    1505642258 // Notorious Collector Robes
  ],
  ikora: [
    2684281417, // Noble Constant Mark
    3758301014, // Noble Constant Type 2
    1735538848, // Frumious Vest
    662797277, // Frumious Cloak
    2416730691, // Ego Talon IV
    2688111404, // Noble Constant Type 2
    4208352991, // Ego Talon IV
    1895532772, // Ego Talon IV
    1940451444, // Noble Constant Type 2
    1842727357, // Ego Talon IV
    4146629762, // Frumious Strides
    4225579453, // Noble Constant Type 2
    3511221544, // Frumious Grips
    558125905, // Frumious Mask
    1698434490 // Ego Talon Bond
  ],
  io: [
    2025523685, // Mindbreaker Boots
    2164070257, // Mindbreaker Boots
    1445420672 // Mindbreaker Boots
  ],
  ironbanner: [
    130221063, // Iron Truage Vestments
    738836759, // Iron Truage Vestments
    1604601714, // Iron Truage Vestments
    131359121, // Iron Fellowship Casque
    4144217282, // Iron Fellowship Strides
    92135663, // Iron Remembrance Vest
    4248834293, // Iron Remembrance Vest
    2058205265, // Iron Truage Gloves
    3300129601, // Iron Truage Gloves
    3791686334, // Iron Truage Gloves
    561808153, // Mantle of Efrideet
    1452894389, // Mantle of Efrideet
    2853073502, // Mantle of Efrideet
    935677805, // Iron Truage Casque
    3292445816, // Iron Truage Casque
    3856062457, // Iron Truage Casque
    1675022998, // Iron Remembrance Helm
    1882457108, // Iron Remembrance Helm
    1015625830, // Iron Truage Boots
    3686482762, // Iron Truage Boots
    4048191131, // Iron Truage Boots
    706104224, // Iron Truage Gauntlets
    1478755348, // Iron Truage Gauntlets
    2555322239, // Iron Truage Gauntlets
    1313767877, // Radegast's Iron Sash
    2500327265, // Radegast's Iron Sash
    2627255028, // Radegast's Iron Sash
    63725907, // Iron Remembrance Plate
    425007249, // Iron Remembrance Plate
    1181560527, // Iron Truage Vest
    3057399960, // Iron Truage Vest
    3646911172, // Iron Truage Vest
    500363457, // Iron Symmachy Grips
    1438648985, // Iron Symmachy Bond
    1339294334, // Cloak of Remembrance
    3329206472, // Cloak of Remembrance
    3570981007, // Iron Symmachy Greaves
    198946996, // Iron Symmachy Helm
    1173846338, // Iron Fellowship Bond
    130221063, // Iron Truage Vestments
    738836759, // Iron Truage Vestments
    1604601714, // Iron Truage Vestments
    808693674, // Iron Symmachy Mark
    1342036510, // Iron Truage Greaves
    1476572353, // Iron Truage Greaves
    3696011098, // Iron Truage Greaves
    935677805, // Iron Truage Casque
    3292445816, // Iron Truage Casque
    3856062457, // Iron Truage Casque
    1015625830, // Iron Truage Boots
    3686482762, // Iron Truage Boots
    4048191131, // Iron Truage Boots
    3042878056, // Iron Fellowship Grips
    744156528, // Iron Symmachy Mask
    75550387, // Iron Truage Legs
    1889355043, // Iron Truage Legs
    4211068696, // Iron Truage Legs
    739655237, // Iron Truage Helm
    1105558158, // Iron Truage Helm
    2914695209, // Iron Truage Helm
    559176540, // Iron Symmachy Gloves
    197164672, // Iron Truage Hood
    423204919, // Iron Truage Hood
    3543922672, // Iron Truage Hood
    1960776126, // Iron Fellowship Greaves
    2845071512, // Iron Remembrance Casque
    3544440242, // Iron Remembrance Casque
    1570751539, // Iron Symmachy Strides
    2391553724, // Iron Fellowship Hood
    4078529821, // Iron Fellowship Cloak
    1990315366, // Iron Symmachy Cloak
    706104224, // Iron Truage Gauntlets
    1478755348, // Iron Truage Gauntlets
    2555322239, // Iron Truage Gauntlets
    2900181965, // Iron Symmachy Gauntlets
    1233689371, // Iron Remembrance Hood
    2758933481, // Iron Remembrance Hood
    1027482647, // Iron Fellowship Boots
    1349302244, // Iron Remembrance Legs
    3115791898, // Iron Remembrance Legs
    1876007169, // Iron Fellowship Mark
    75550387, // Iron Truage Legs
    1889355043, // Iron Truage Legs
    4211068696, // Iron Truage Legs
    2054377692, // Iron Truage Grips
    3369424240, // Iron Truage Grips
    3756249289, // Iron Truage Grips
    473526496, // Iron Fellowship Vest
    197164672, // Iron Truage Hood
    423204919, // Iron Truage Hood
    3543922672, // Iron Truage Hood
    1313089081, // Iron Truage Plate
    3906637800, // Iron Truage Plate
    4096639276, // Iron Truage Plate
    1342036510, // Iron Truage Greaves
    1476572353, // Iron Truage Greaves
    3696011098, // Iron Truage Greaves
    1311649814, // Timur's Iron Bond
    2241419267, // Timur's Iron Bond
    2867156198, // Timur's Iron Bond
    892360677, // Iron Fellowship Helm
    4156963223, // Iron Symmachy Vest
    3735443949, // Iron Symmachy Hood
    21320325, // Bond of Remembrance
    1631733639, // Bond of Remembrance
    739655237, // Iron Truage Helm
    1105558158, // Iron Truage Helm
    2914695209, // Iron Truage Helm
    2898234995, // Iron Symmachy Plate
    3746327861, // Iron Fellowship Gloves
    228784708, // Iron Symmachy Robes
    2058205265, // Iron Truage Gloves
    3300129601, // Iron Truage Gloves
    3791686334, // Iron Truage Gloves
    3472216012, // Iron Fellowship Plate
    2885394189, // Iron Remembrance Strides
    3600816955, // Iron Remembrance Strides
    2054377692, // Iron Truage Grips
    3369424240, // Iron Truage Grips
    3756249289, // Iron Truage Grips
    3815391974, // Iron Symmachy Boots
    167461728, // Iron Remembrance Gloves
    2692970954, // Iron Remembrance Gloves
    2310625418, // Mark of Remembrance
    2620437164, // Mark of Remembrance
    561808153, // Mantle of Efrideet
    1452894389, // Mantle of Efrideet
    2853073502, // Mantle of Efrideet
    3308875113, // Iron Remembrance Grips
    4010793371, // Iron Remembrance Grips
    1673037492, // Iron Fellowship Gauntlets
    1313089081, // Iron Truage Plate
    3906637800, // Iron Truage Plate
    4096639276, // Iron Truage Plate
    1425558127, // Iron Remembrance Greaves
    1631922345, // Iron Remembrance Greaves
    2302106622, // Iron Remembrance Vestments
    2614190248, // Iron Remembrance Vestments
    713182381, // Iron Remembrance Gauntlets
    2879116647, // Iron Remembrance Gauntlets
    1313767877, // Radegast's Iron Sash
    2500327265, // Radegast's Iron Sash
    2627255028, // Radegast's Iron Sash
    1311649814, // Timur's Iron Bond
    2241419267, // Timur's Iron Bond
    2867156198, // Timur's Iron Bond
    2817130155, // Iron Fellowship Robes
    1181560527, // Iron Truage Vest
    3057399960, // Iron Truage Vest
    3646911172 // Iron Truage Vest
  ],
  lastwish: [
    576683388, // Gauntlets of the Great Hunt
    2868042232, // Vest of the Great Hunt
    1127835600, // Grips of the Great Hunt
    2280287728, // Bond of the Great Hunt
    16387641, // Mark of the Great Hunt
    3227674085, // Boots of the Great Hunt
    1646520469, // Cloak of the Great Hunt
    4219088013, // Helm of the Great Hunt
    3492720019, // Gloves of the Great Hunt
    3874578566, // Greaves of the Great Hunt
    3445582154, // Hood of the Great Hunt
    776723133, // Robes of the Great Hunt
    1444894250, // Strides of the Great Hunt
    3143067364, // Plate of the Great Hunt
    1190016345 // Mask of the Great Hunt
  ],
  legendaryengram: [
    4074193483, // Tangled Web Cloak
    1726695877, // Cloak of Five Full Moons
    107232578, // Tangled Web Gauntlets
    3536492583, // Kerak Type 2
    2442805346, // Icarus Drifter Mask
    2332398934, // Kerak Type 2
    2020589887, // Road Complex AA1
    1513486336, // Road Complex AA1
    836969671, // Insight Unyielding Greaves
    4079913195, // Dead End Cure 2.1
    633160551, // Insight Rover Vest
    1810399711, // Philomath Bond
    489743173, // Insight Unyielding Gauntlets
    73720713, // High-Minded Complex
    532728591, // Thorium Holt Gloves
    1772639961, // Hodiocentrist Bond
    3498500850, // Philomath Gloves
    2026285619, // Errant Knight 1.0
    1367655773, // Tangled Web Boots
    737010724, // Thorium Holt Bond
    2439195958, // Philomath Robes
    635809934, // Terra Concord Helm
    4166246718, // Insight Vikti Robes
    545134223, // Tangled Web Mark
    1954457094, // Road Complex AA1
    3506159922, // Anti-Hero Victory
    1111042046, // High-Minded Complex
    1295776817, // Insight Rover Grips
    474076509, // Errant Knight 1.0
    2674524165, // Tangled Web Robes
    1293868684, // Insight Unyielding Helm
    1892576458, // Devastation Complex
    875215126, // Prodigal Mark
    3717812073, // Thorium Holt Robes
    1598372079, // Retro-Grade TG2
    1742735530, // Road Complex AA1
    1257810769, // Prodigal Gauntlets
    1213841242, // Red Moon Phantom Steps
    1301696822, // Mimetic Savior Greaves
    339438127, // High-Minded Complex
    1006824129, // Terra Concord Greaves
    2454861732, // Prodigal Robes
    2518901664, // Red Moon Phantom Grips
    2151378428, // Tangled Web Greaves
    553373026, // Tangled Web Hood
    3619376218, // Heiro Camo
    3688229984, // Insight Rover Mask
    2173858802, // Prodigal Cloak
    489480785, // High-Minded Complex
    2562555736, // Icarus Drifter Cape
    1425077417, // Mimetic Savior Bond
    1904199788, // Mark of the Unassailable
    629482101, // Dead End Cure 2.1
    2734010957, // Prodigal Hood
    2713755753, // Kerak Type 2
    1854024004, // Be Thy Cipher
    1127029635, // Insight Rover Boots
    2379553211, // Be Thy Guide
    854373147, // Insight Unyielding Plate
    2092750352, // Tangled Web Strides
    3316802363, // Retro-Grade TG2
    1761136389, // Errant Knight 1.0
    1728789982, // Thorium Holt Hood
    3386676796, // Prodigal Gloves
    4146408011, // Tangled Web Gloves
    2819613314, // Far Gone Hood
    2561056920, // Retro-Grade TG2
    3024860521, // Retro-Grade TG2
    2402435619, // Philomath Cover
    2445181930, // Errant Knight 1.0
    4097652774, // Tangled Web Plate
    130772858, // Tangled Web Vest
    2205604183, // Dead End Cure 2.1
    133227345, // Kerak Type 2
    1548943654, // Tesseract Trace IV
    3691737472, // Prodigal Helm
    3593916933, // Prodigal Grasps
    3434158555, // Prodigal Vest
    2772485446, // Prodigal Steps
    494682309, // Massyrian's Draw
    2838060329, // Heiro Camo
    3198691833, // Prodigal Bond
    1893349933, // Tesseract Trace IV
    2845530750, // Retro-Grade Mark
    2478301019, // Insight Vikti Hood
    1148805553, // Thorium Holt Boots
    1865671934, // Devastation Complex
    2148295091, // Tangled Web Helm
    3899739148, // Philomath Boots
    639670612, // Mimetic Savior Plate
    3906537733, // Icarus Drifter Vest
    3527995388, // Dead End Cure 2.1
    2546015644, // Tesseract Trace IV
    1195298951, // Be Thy Champion
    983115833, // Terra Concord Plate
    548907748, // Devastation Complex
    1088960547, // Prodigal Greaves
    3516789127, // Prodigal Strides
    655964556, // Mimetic Savior Gauntlets
    3920228039, // Synaptic Construct
    2360521872, // A Cloak Called Home
    3257088093, // Icarus Drifter Legs
    880368054, // Tangled Web Grips
    24598504, // Red Moon Phantom Vest
    629469344, // Heiro Camo
    1740873035, // Icarus Drifter Grips
    3979056138, // Insight Vikti Gloves
    433294875, // Devastation Complex
    1348658294, // Clandestine Maneuvers
    2193432605, // Mimetic Savior Helm
    3988753671, // Prodigal Cuirass
    3087552232, // Heiro Camo
    3018268196, // Insight Vikti Boots
    432525353, // Red Moon Phantom Mask
    2085574015, // Terra Concord Fists
    2297281780, // Terra Concord Mark
    1028913028, // Tesseract Trace IV
    144651852, // Prodigal Mask
    1330542168, // Tangled Web Bond
    3061780015 // Tangled Web Mask
  ],
  leviathan: [
    3853397100, // Boots of the Emperor's Agent
    3853397101, // Boots of the Ace-Defiant
    2758465168, // Greaves of the Emperor's Champion
    2758465169, // Greaves of Rull
    2232730708, // Vest of the Emperor's Agent
    2232730709, // Vest of the Ace-Defiant
    311429764, // Shadow's Mark
    311429765, // Mark of the Emperor's Champion
    2913992254, // Mask of Rull
    2913992255, // Helm of the Emperor's Champion
    3292127944, // Cuirass of the Emperor's Champion
    3292127945, // Chassis of Rull
    2183861870, // Gauntlets of the Emperor's Champion
    2183861871, // Gauntlets of Rull
    1108389626, // Gloves of the Emperor's Agent
    1108389627, // Grips of the Ace-Defiant
    641933202, // Helm of the Ace-Defiant
    641933203, // Mask of the Emperor's Agent
    336656482, // Boots of the Fulminator
    336656483, // Boots of the Emperor's Minister
    3530284424, // Wraps of the Fulminator
    3530284425, // Wraps of the Emperor's Minister
    618662448, // Headpiece of the Emperor's Minister
    618662449, // Mask of the Fulminator
    1230192768, // Robes of the Fulminator
    1230192769, // Robes of the Emperor's Minister
    581908796, // Bond of the Emperor's Minister
    581908797, // Shadow's Bond
    1354679720, // Shadow's Cloak
    1354679721 // Cloak of the Emperor's Agent
  ],
  mars: [
    2114894938, // Abhorrent Imperative Grasps
    2970562833, // Yuga Sundown Boots
    4286845987, // Midnight Exigent Mark
    3876414174, // Midnight Exigent Gauntlets
    3126089918, // Yuga Sundown Helmet
    425390008, // Midnight Exigent Greaves
    2639046519, // Abhorrent Imperative Cloak
    508035927, // Midnight Exigent Helm
    3691605010, // Midnight Exigent Plate
    3792637803, // Abhorrent Imperative Mask
    3371366804, // Abhorrent Imperative Strides
    2395959535, // Yuga Sundown Gloves
    2034926084, // Yuga Sundown Bond
    2320951982, // Abhorrent Imperative Vest
    720656969 // Yuga Sundown Robes
  ],
  menagerie: [
    472691604, // Exodus Down Vest
    3446606632, // Exodus Down Vest
    569678873, // Exodus Down Mark
    667921213, // Exodus Down Mark
    1439502385, // Exodus Down Helm
    2736812653, // Exodus Down Helm
    1810569868, // Exodus Down Bond
    3536375792, // Exodus Down Bond
    1316205184, // Exodus Down Plate
    3654781892, // Exodus Down Plate
    56157064, // Exodus Down Gauntlets
    3855512540, // Exodus Down Gauntlets
    569251271, // Exodus Down Gloves
    4007396243, // Exodus Down Gloves
    1157496418, // Exodus Down Greaves
    2816760678, // Exodus Down Greaves
    4060742749, // Exodus Down Mask
    4130486121, // Exodus Down Mask
    2032811197, // Exodus Down Robes
    3951684081, // Exodus Down Robes
    853736709, // Exodus Down Cloak
    1640979177, // Exodus Down Cloak
    3660228214, // Exodus Down Hood
    3960258378, // Exodus Down Hood
    192377242, // Exodus Down Strides
    3593464438, // Exodus Down Strides
    3617024265, // Exodus Down Boots
    3742350309, // Exodus Down Boots
    1539014368, // Exodus Down Grips
    2947629004 // Exodus Down Grips
  ],
  mercury: [
    3820658718, // Kairos Function Wraps
    3873109093, // Kairos Function Plate
    61987238, // Kairos Function Mask
    4252342556, // Kairos Function Cloak
    2673599019, // Kairos Function Gauntlets
    3333954498, // Kairos Function Helm
    452177303, // Kairos Function Crown
    4240041208, // Kairos Function Boots
    2529023928, // Kairos Function Mark
    3370914423, // Kairos Function Grips
    3469837505, // Kairos Function Vest
    2748513874, // Kairos Function Robes
    3385331555, // Kairos Function Bond
    884481817, // Kairos Function Boots
    4148237373 // Kairos Function Greaves
  ],
  nessus: [
    3144980977, // Unethical Experiments Cloak
    2866378042, // Unethical Experiments Bond
    2940586725 // Unethical Experiments Mark
  ],
  nm: [
    198912077, // Sovereign Grips
    2048299190, // Coronation Mark
    1519285164, // Sovereign Legs
    446438979, // Sovereign Hood
    971138346, // Coronation Cloak
    869711119, // Sovereign Boots
    1792644404, // Sovereign Mask
    2165598463, // Coronation Bond
    1685792113, // Sovereign Gauntlets
    908447143, // Sovereign Plate
    2835971286, // Sovereign Robes
    1516941763, // Sovereign Greaves
    4119718816, // Sovereign Helm
    3060679667, // Sovereign Vest
    1117943570 // Sovereign Gloves
  ],
  raid: [
    96643258, // Bladesmith's Memory Mask
    977326564, // Bulletsmith's Ire Mark
    583145321, // Gunsmith's Devotion Crown
    300528205, // Bladesmith's Memory Vest
    3491990569, // Bulletsmith's Ire Plate
    384384821, // Bladesmith's Memory Strides
    2286640864, // Gunsmith's Devotion Gloves
    2564183153, // Bulletsmith's Ire Greaves
    2719710110, // Bulletsmith's Ire Helm
    940003738, // Gunsmith's Devotion Boots
    2750983488, // Bladesmith's Memory Cloak
    1499503877, // Gunsmith's Devotion Bond
    2334017923, // Bladesmith's Memory Grips
    1989682895, // Bulletsmith's Ire Gauntlets
    4092373800 // Gunsmith's Devotion Robes
  ],
  scourge: [
    96643258, // Bladesmith's Memory Mask
    977326564, // Bulletsmith's Ire Mark
    583145321, // Gunsmith's Devotion Crown
    300528205, // Bladesmith's Memory Vest
    3491990569, // Bulletsmith's Ire Plate
    384384821, // Bladesmith's Memory Strides
    2286640864, // Gunsmith's Devotion Gloves
    2564183153, // Bulletsmith's Ire Greaves
    2719710110, // Bulletsmith's Ire Helm
    940003738, // Gunsmith's Devotion Boots
    2750983488, // Bladesmith's Memory Cloak
    1499503877, // Gunsmith's Devotion Bond
    2334017923, // Bladesmith's Memory Grips
    1989682895, // Bulletsmith's Ire Gauntlets
    4092373800 // Gunsmith's Devotion Robes
  ],
  seasonpass: [
    238618944, // Righteous Helm
    238618947, // Righteous Helm
    299852985, // Righteous Strides
    299852986, // Righteous Strides
    344824592, // Righteous Vest
    344824595, // Righteous Vest
    382498901, // Righteous Mask
    382498902, // Righteous Mask
    445618860, // Righteous Mark
    445618863, // Righteous Mark
    509561140, // Substitutional Alloy Gloves
    509561143, // Substitutional Alloy Gloves
    785967405, // Righteous Gloves
    785967406, // Righteous Gloves
    936010064, // Righteous Boots
    936010067, // Righteous Boots
    940065569, // Righteous Cloak
    940065570, // Righteous Cloak
    1076538457, // Righteous Gauntlets
    1076538458, // Righteous Gauntlets
    1137424312, // Substitutional Alloy Cloak
    1137424315, // Substitutional Alloy Cloak
    1416697413, // Righteous Bond
    1416697414, // Righteous Bond
    1557571324, // Righteous Hood
    1557571327, // Righteous Hood
    1560040305, // Righteous Plate
    1560040306, // Righteous Plate
    1721943441, // Substitutional Alloy Boots
    1721943442, // Substitutional Alloy Boots
    1855720513, // Substitutional Alloy Vest
    1855720514, // Substitutional Alloy Vest
    2096778461, // Substitutional Alloy Strides
    2096778462, // Substitutional Alloy Strides
    2468603405, // Substitutional Alloy Plate
    2468603406, // Substitutional Alloy Plate
    2690973101, // Substitutional Alloy Hood
    2690973102, // Substitutional Alloy Hood
    2815379657, // Substitutional Alloy Bond
    2815379658, // Substitutional Alloy Bond
    2903026873, // Substitutional Alloy Helm
    2903026874, // Substitutional Alloy Helm
    2942269704, // Substitutional Alloy Gauntlets
    2942269707, // Substitutional Alloy Gauntlets
    3166926328, // Substitutional Alloy Robes
    3166926331, // Substitutional Alloy Robes
    3192738009, // Substitutional Alloy Greaves
    3192738010, // Substitutional Alloy Greaves
    3406670224, // Righteous Greaves
    3406670227, // Righteous Greaves
    1387688628, // The Gate Lord's Eye
    3750877148, // Righteous Grips
    3750877151, // Righteous Grips
    3757338780, // Substitutional Alloy Mark
    3757338783, // Substitutional Alloy Mark
    3931361416, // Righteous Robes
    3931361419, // Righteous Robes
    4026120124, // Substitutional Alloy Grips
    4026120127, // Substitutional Alloy Grips
    4078925541, // Substitutional Alloy Mask
    4078925542 // Substitutional Alloy Mask
  ],
  shaxx: [
    2466453881, // Wing Discipline
    3089908066, // Wing Discipline
    1673285051, // Wing Theorem
    3839561204, // Wing Theorem
    1765728763, // Ankaa Seeker IV
    1929596421, // Ankaa Seeker IV
    4043980813, // Ankaa Seeker IV
    4211218181, // Ankaa Seeker IV
    530558102, // Phoenix Strife Type 0
    2543903638, // Phoenix Strife Type 0
    2845947996, // Phoenix Strife Type 0
    3781722107, // Phoenix Strife Type 0
    290136582, // Wing Theorem
    2323865727, // Wing Theorem
    1036467370, // Wing Theorem
    2525395257, // Wing Theorem
    438224459, // Wing Discipline
    1722623780, // Wing Discipline
    1062166003, // Wing Contender
    2415711886, // Wing Contender
    283188616, // Wing Contender
    1716643851, // Wing Contender
    3772194440, // Wing Contender
    4123918087, // Wing Contender
    215768941, // Ankaa Seeker IV
    419812559, // Ankaa Seeker IV
    1852468615, // Ankaa Seeker IV
    4134090375, // Ankaa Seeker IV
    85800627, // Ankaa Seeker IV
    852430165, // Ankaa Seeker IV
    2727890395, // Ankaa Seeker IV
    3098458331, // Ankaa Seeker IV
    920187221, // Wing Discipline
    4136212668, // Wing Discipline
    1742940528, // Phoenix Strife Type 0
    1807196134, // Phoenix Strife Type 0
    2231762285, // Phoenix Strife Type 0
    3756286064, // Phoenix Strife Type 0
    98331691, // Binary Phoenix Mark
    468899627, // Binary Phoenix Mark
    670877864, // Binary Phoenix Mark
    3884544409, // Binary Phoenix Mark
    761953100, // Ankaa Seeker IV
    876608500, // Ankaa Seeker IV
    1299272338, // Ankaa Seeker IV
    2775298636, // Ankaa Seeker IV
    3483546829, // Wing Discipline
    3818803676, // Wing Discipline
    388771599, // Phoenix Strife Type 0
    1727248109, // Phoenix Strife Type 0
    2670393359, // Phoenix Strife Type 0
    3315265682, // Phoenix Strife Type 0
    252414402, // Swordflight 4.1
    727838174, // Swordflight 4.1
    2473130418, // Swordflight 4.1
    3797729472, // Swordflight 4.1
    2070517134, // Wing Contender
    3119528729, // Wing Contender
    2496309431, // Wing Discipline
    3522021318, // Wing Discipline
    328902054, // Swordflight 4.1
    1830829330, // Swordflight 4.1
    1904811766, // Swordflight 4.1
    2680535688, // Swordflight 4.1
    449878234, // Phoenix Strife Type 0
    820446170, // Phoenix Strife Type 0
    1548928853, // Phoenix Strife Type 0
    2674680132, // Phoenix Strife Type 0
    1571781304, // Swordflight 4.1
    2296560252, // Swordflight 4.1
    2492669178, // Swordflight 4.1
    3298826188, // Swordflight 4.1
    744199039, // Wing Contender
    1838273186, // Wing Contender
    1654427223, // Swordflight 4.1
    1801625827, // Swordflight 4.1
    2094233929, // Swordflight 4.1
    2293476915, // Swordflight 4.1
    87665893, // Binary Phoenix Cloak
    1071350799, // Binary Phoenix Cloak
    1658896287, // Binary Phoenix Cloak
    2426070307, // Binary Phoenix Cloak
    1467590642, // Binary Phoenix Bond
    1838158578, // Binary Phoenix Bond
    2291226602, // Binary Phoenix Bond
    4269346472, // Binary Phoenix Bond
    356269375, // Wing Theorem
    874101646, // Wing Theorem
    1245115841, // Wing Theorem
    4144133120 // Wing Theorem
  ],
  sos: [
    3862230571, // Insigne Shade Bond
    1378348656, // Insigne Shade Boots
    2575374197, // Turris Shade Gauntlets
    1178920188, // Turris Shade Helm
    4213777114, // Insigne Shade Robes
    2305801487, // Insigne Shade Cover
    165966230, // Insigne Shade Gloves
    3316476193, // Equitis Shade Grips
    813277303, // Equitis Shade Rig
    4151496279, // Turris Shade Greaves
    91896851, // Equitis Shade Boots
    1035112834, // Turris Shade Mark
    3518692432, // Equitis Shade Cowl
    2295412715, // Turris Shade Plate
    2475562438 // Equitis Shade Cloak
  ],
  strikes: [
    1514841742, // Mark of Shelter
    3014775444, // Mark of Shelter
    2454114768, // Xenos Vale IV
    3221304270, // Xenos Vale IV
    1003941622, // Vigil of Heroes
    3500775049, // Vigil of Heroes
    946526461, // The Took Offense
    3469164235, // The Took Offense
    420247988, // Xenos Vale IV
    533855986, // Xenos Vale IV
    758026143, // Vigil of Heroes
    986111044, // Vigil of Heroes
    432360904, // Vigil of Heroes
    2939022735, // Vigil of Heroes
    508642129, // Vigil of Heroes
    2902263756, // Vigil of Heroes
    3666681446, // Vigil of Heroes
    4288492921, // Vigil of Heroes
    1188816597, // The Took Offense
    1959285715, // The Took Offense
    799187478, // Vigil of Heroes
    4074662489, // Vigil of Heroes
    358599471, // Vigil of Heroes
    2076567986, // Vigil of Heroes
    1130203390, // Vigil of Heroes
    1405063395, // Vigil of Heroes
    417061387, // Xenos Vale IV
    1702245537, // Xenos Vale IV
    4024037919, // Origin Story
    1276048857, // The Shelter in Place
    4138296191, // The Shelter in Place
    1699493316, // The Last Dance
    2011569904, // Vigil of Heroes
    2671880779, // Vigil of Heroes
    2498588344, // Xenos Vale IV
    3034285946, // Xenos Vale IV
    2060516289, // Vigil of Heroes
    3074985148, // Vigil of Heroes
    2460793798, // Vigil of Heroes
    3130904371, // Vigil of Heroes
    768769183, // The Shelter in Place
    2722966297, // The Shelter in Place
    1953621386, // The Took Offense
    4087433052, // The Took Offense
    2304309360, // Vigil of Heroes
    2422319309, // Vigil of Heroes
    1805830669, // Xenos Vale Bond
    3963753111, // Xenos Vale Bond
    1825880546, // The Took Offense
    2408514352, // The Took Offense
    1320081419, // The Shelter in Place
    3984883553, // The Shelter in Place
    1269679141, // The Took Offense
    2764938807, // The Took Offense
    1538362007, // Vigil of Heroes
    3544662820, // Vigil of Heroes
    3499839403, // Vigil of Heroes
    3584380110, // Vigil of Heroes
    3375632008, // The Shelter in Place
    4038429998, // The Shelter in Place
    2337221567, // Vigil of Heroes
    3851385946, // Vigil of Heroes
    1699493316 // The Last Dance
  ],
  tangled: [
    1566911695, // Scorned Baron Plate
    902989307, // Scorned Baron Vest
    1407026808, // Torobatl Celebration Mask
    2944336620, // Nea-Thonis Breather
    4245441464, // Scorned Baron Robes
    3523809305 // Eimin-Tin Ritual Mask
  ],
  titan: [
    4105480824, // Lost Pacific Cape
    1511235307, // Lost Pacific Grips
    2602992893, // Lost Pacific Strides
    66047450, // Lost Pacific Gloves
    2171693954, // Lost Pacific Mask
    3283642233, // Lost Pacific Plate
    688564517, // Lost Pacific Vest
    3416618798, // Lost Pacific Robes
    1743790315, // Lost Pacific Helmet
    1322519316, // Lost Pacific Boots
    1505338369, // Lost Pacific Greaves
    1558884814, // Lost Pacific Helm
    727401524, // Lost Pacific Mark
    3734713335, // Lost Pacific Bond
    2584088255 // Lost Pacific Gauntlets
  ],
  trials: [
    421771594, // Cloak Relentless
    421771595, // Cloak Judgment
    3127319342, // Floating Cowl
    3127319343, // Flowing Cowl
    4177448932, // Focusing Wraps
    4177448933, // Channeling Wraps
    773318266, // Flowing Vest
    773318267, // Floating Vest
    2158289680, // Flowing Boots
    2158289681, // Floating Boots
    72827962, // Focusing Robes
    72827963, // Channeling Robes
    784751926, // Crushing Plate
    784751927, // Annihilating Plate
    3149072082, // Judgement's Wrap
    3149072083, // Bond Relentless
    3025466098, // Crushing Guard
    3025466099, // Annihilating Guard
    3426704396, // Crushing Greaves
    3426704397, // Annihilating Greaves
    1929400866, // Annihilating Helm
    1929400867, // Crushing Helm
    945907382, // Flowing Grips
    945907383, // Floating Grips
    686607148, // Channeling Cowl
    686607149, // Focusing Cowl
    155955678, // Mark Relentless
    155955679, // Mark Judgment
    4100217958, // Focusing Boots
    4100217959 // Flowing Treads
  ],
  zavala: [
    1514841742, // Mark of Shelter
    3014775444, // Mark of Shelter
    2454114768, // Xenos Vale IV
    3221304270, // Xenos Vale IV
    1003941622, // Vigil of Heroes
    3500775049, // Vigil of Heroes
    946526461, // The Took Offense
    3469164235, // The Took Offense
    420247988, // Xenos Vale IV
    533855986, // Xenos Vale IV
    758026143, // Vigil of Heroes
    986111044, // Vigil of Heroes
    432360904, // Vigil of Heroes
    2939022735, // Vigil of Heroes
    508642129, // Vigil of Heroes
    2902263756, // Vigil of Heroes
    3666681446, // Vigil of Heroes
    4288492921, // Vigil of Heroes
    1188816597, // The Took Offense
    1959285715, // The Took Offense
    799187478, // Vigil of Heroes
    4074662489, // Vigil of Heroes
    358599471, // Vigil of Heroes
    2076567986, // Vigil of Heroes
    1130203390, // Vigil of Heroes
    1405063395, // Vigil of Heroes
    417061387, // Xenos Vale IV
    1702245537, // Xenos Vale IV
    4024037919, // Origin Story
    1276048857, // The Shelter in Place
    4138296191, // The Shelter in Place
    1699493316, // The Last Dance
    2011569904, // Vigil of Heroes
    2671880779, // Vigil of Heroes
    2498588344, // Xenos Vale IV
    3034285946, // Xenos Vale IV
    2060516289, // Vigil of Heroes
    3074985148, // Vigil of Heroes
    2460793798, // Vigil of Heroes
    3130904371, // Vigil of Heroes
    768769183, // The Shelter in Place
    2722966297, // The Shelter in Place
    1953621386, // The Took Offense
    4087433052, // The Took Offense
    2304309360, // Vigil of Heroes
    2422319309, // Vigil of Heroes
    1805830669, // Xenos Vale Bond
    3963753111, // Xenos Vale Bond
    1825880546, // The Took Offense
    2408514352, // The Took Offense
    1320081419, // The Shelter in Place
    3984883553, // The Shelter in Place
    1269679141, // The Took Offense
    2764938807, // The Took Offense
    1538362007, // Vigil of Heroes
    3544662820, // Vigil of Heroes
    3499839403, // Vigil of Heroes
    3584380110, // Vigil of Heroes
    3375632008, // The Shelter in Place
    4038429998, // The Shelter in Place
    2337221567, // Vigil of Heroes
    3851385946, // Vigil of Heroes
    1699493316 // The Last Dance
  ]
};

export default missingSources;
