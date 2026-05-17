import type { ChairNameEntry } from "@/lib/pipeline/chair-names-types"

const CONTESSA_II_NAMES: ChairNameEntry = {
  en: "Okamura Contessa II",
  ja: "オカムラ コンテッサセコンダ",
  ko: "오카무라 콘테사2",
  aliases: {
    en: ["Contessa", "Contessa II", "Contessa 2", "Okamura Contessa"],
    ja: ["コンテッサ", "コンテッサ2", "コンテッサセコンダ"],
    ko: ["콘테사", "콘테사2", "콘테사 세콘다", "오카무라 콘테사"],
  },
}

export const OKAMURA_CHAIRS: Record<string, ChairNameEntry> = {
  "okamura-contessa-2": CONTESSA_II_NAMES,
  "okamura-contessa-ii": CONTESSA_II_NAMES,
  "okamura-sylphy": {
    en: "Okamura Sylphy",
    ja: "オカムラ シルフィー",
    ko: "오카무라 실피",
    aliases: {
      en: ["Sylphy Chair", "Okamura Sylphy Chair"],
      ja: ["シルフィー", "シルフィチェア"],
      ko: ["실피", "실피 체어", "오카무라 실피"],
    },
  },
  "okamura-baron": {
    en: "Okamura Baron",
    ja: "オカムラ バロン",
    ko: "오카무라 바론",
    aliases: {
      en: ["Baron Chair", "Okamura Baron Chair"],
      ja: ["バロン", "バロンチェア"],
      ko: ["바론", "바론 체어"],
    },
  },
  "okamura-sabrina": {
    en: "Okamura Sabrina",
    ja: "オカムラ サブリナ",
    ko: "오카무라 사브리나",
    aliases: {
      en: ["Sabrina Chair"],
      ja: ["サブリナ", "サブリナチェア"],
      ko: ["사브리나", "사브리나 체어"],
    },
  },
  "okamura-portone": {
    en: "Okamura Portone",
    ja: "オカムラ ポルトーネ",
    ko: "오카무라 포르토네",
    aliases: {
      en: ["Portone Chair"],
      ja: ["ポルトーネ"],
      ko: ["포르토네", "포르토네 체어"],
    },
  },
  "okamura-cronos": {
    en: "Okamura Cronos",
    ja: "オカムラ クロノス",
    ko: "오카무라 크로노스",
    aliases: {
      en: ["Cronos Chair"],
      ja: ["クロノス", "クロノスチェア"],
      ko: ["크로노스", "크로노스 체어"],
    },
  },
  "okamura-legno": {
    en: "Okamura Legno",
    ja: "オカムラ レグノ",
    ko: "오카무라 레그노",
    aliases: {
      en: ["Legno Chair"],
      ja: ["レグノ", "レグノチェア"],
      ko: ["레그노", "레그노 체어"],
    },
  },
}
