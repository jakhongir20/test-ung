export interface GuideFile {
  id: string;
  titleKey: string;
  fileName: string;
  fileType: 'pptx' | 'ppt' | 'pdf' | 'doc' | 'zip';
}

export interface GuideLink {
  id: string;
  number: string;
  date: string;
  title: string;
  url: string;
}

export interface GuideNode {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  icon?: string;
  children?: GuideNode[];
  files?: GuideFile[];
  links?: GuideLink[];
  placeholder?: boolean;
}

export const GUIDES_TREE: GuideNode[] = [
  {
    id: 'cat1',
    titleKey: 'guides.cat1.title',
    descriptionKey: 'guides.cat1.description',
    icon: 'document',
    links: [
      {
        id: 'law1',
        number: 'ВМҚ-99-сон',
        date: '28.03.2002',
        title: '2002 — 2004 йилларда уй-жой фондини газни ҳисобга олиш приборлари билан жиҳозлашга доир қўшимча чора-тадбирлар тўғрисида',
        url: 'https://lex.uz/docs/-259710',
      },
      {
        id: 'law2',
        number: 'ЎРҚ-419',
        date: '03.01.2017',
        title: 'Коррупцияга қарши курашиш тўғрисида',
        url: 'https://lex.uz/docs/-3088008',
      },
      {
        id: 'law3',
        number: 'ЎРҚ-445',
        date: '11.09.2017',
        title: 'Жисмоний ва юридик шахсларнинг мурожаатлари тўғрисида»ги Ўзбекистон Республикаси қонунига ўзгартиш ва қўшимчалар киритиш ҳақида',
        url: 'https://lex.uz/docs/-3336169',
      },
      {
        id: 'law4',
        number: 'ПҚ-3379',
        date: '08.11.2017',
        title: 'Энергия ресурсларидан оқилона фойдаланишни таъминлаш чора-тадбирлари тўғрисида',
        url: 'https://lex.uz/docs/-3405580',
      },
      {
        id: 'law5',
        number: 'Буйруқ 3018',
        date: '01.06.2018',
        title: 'Табиий газ етказиб бериш, транспортировка қилиш, тақсимлаш ва сотишдаги йўқотишларни аниқлаш тартиби тўғрисидаги йўриқномани тасдиқлаш ҳақида',
        url: 'https://lex.uz/docs/-3761143',
      },
      {
        id: 'law6',
        number: 'ВМҚ-646',
        date: '10.08.2018',
        title: 'Аҳоли ва ижтимоий соҳа объектларига кундалик ҳаётда фойдаланиш учун суюлтирилган углеводород газини етказиб бериш тизимини такомиллаштириш тўғрисида',
        url: 'https://lex.uz/docs/-3911903',
      },
      {
        id: 'law7',
        number: 'ВМҚ-226',
        date: '16.03.2019',
        title: 'Газ хўжалигида хавфсизлик қоидаларини тасдиқлаш тўғрисида',
        url: 'https://lex.uz/docs/-4244878',
      },
      {
        id: 'law8',
        number: 'ПҚ-4388',
        date: '09.07.2019',
        title: 'Аҳоли ва иқтисодиётни энергия ресурслари билан барқарор таъминлаш, нефть-газ тармоғини молиявий соғломлаштириш ва унинг бошқарув тизимини такомиллаштириш чора-тадбирлари тўғрисида',
        url: 'https://lex.uz/docs/-4410278',
      },
      {
        id: 'law9',
        number: 'ПФ-6010',
        date: '18.06.2020',
        title: 'Табиий газ ва электр энергиясини сотиш механизмини такомиллаштириш бўйича қўшимча чора-тадбирлар тўғрисида',
        url: 'https://lex.uz/docs/-4859613',
      },
      {
        id: 'law10',
        number: 'ПҚ-4840',
        date: '24.09.2020',
        title: 'Табиий газ назорати ва ҳисобининг автоматлаштирилган тизимини жорий этиш лойиҳасини амалга оширишга доир қўшимча чора-тадбирлар тўғрисида',
        url: 'https://lex.uz/docs/-5016206',
      },
      {
        id: 'law11',
        number: 'ПФ-6079',
        date: '05.10.2020',
        title: '"Рақамли Ўзбекистон — 2030" стратегиясини тасдиқлаш ва уни самарали амалга ошириш чора-тадбирлари тўғрисида',
        url: 'https://lex.uz/docs/-5030957',
      },
      {
        id: 'law12',
        number: 'ПҚ-280',
        date: '15.06.2022',
        title: 'Табиий газ бозорини ислоҳ қилишнинг қўшимча чора-тадбирлари тўғрисида',
        url: 'https://lex.uz/docs/-6072689',
      },
      {
        id: 'law13',
        number: 'ВМҚ-430',
        date: '05.08.2022',
        title: 'Республика истеъмолчиларини табиий ва суюлтирилган газ билан таъминлаш тизимининг самарадорлигини ошириш чора-тадбирлари тўғрисида',
        url: 'https://lex.uz/docs/-6142840',
      },
      {
        id: 'law14',
        number: 'ПҚ-54',
        date: '13.02.2023',
        title: 'Ёқилғи-энергия ресурсларидан фойдаланиш соҳасида давлат назорати самарадорлигини ошириш чора-тадбирлари тўғрисида',
        url: 'https://lex.uz/docs/-6384162',
      },
      {
        id: 'law15',
        number: 'ПҚ-157',
        date: '12.05.2023',
        title: 'Табиий газ ва суюқ углеводородни қазиб чиқариш, қайта ишлаш ҳамда реализация қилиш ҳисобини юритиш тизимини такомиллаштириш чора-тадбирлари',
        url: 'https://lex.uz/docs/-6465550',
      },
      {
        id: 'law16',
        number: 'ПФ-77',
        date: '24.05.2023',
        title: 'Ёқилғи-энергетика соҳасида давлат назорати механизмларини такомиллаштириш ва «рақамли энергоназорат» тизимини жорий этиш тўғрисида',
        url: 'https://lex.uz/docs/-6472925',
      },
      {
        id: 'law17',
        number: 'ВМҚ-475',
        date: '15.09.2023',
        title: 'Ёқилғи-энергетика соҳасида бозор механизмларини жорий этишнинг қўшимча чора-тадбирлари тўғрисида',
        url: 'https://lex.uz/docs/-6609144',
      },
      {
        id: 'law18',
        number: 'ВМҚ-541',
        date: '16.10.2023',
        title: 'Электр, иссиқлик энергияси, газдан фойдаланиш қоидаларини бузиш билан боғлиқ ҳуқуқбузарликлар тўғрисидаги фотосуратлар ва (ёки) видеоёзувларни қабул қилиш, кўриб чиқиш ҳамда уларни тақдим этган шахсларни рағбатлантириш тартиби ҳақидаги низомни тасдиқлаш тўғрисида',
        url: 'https://lex.uz/docs/-6634783',
      },
      {
        id: 'law19',
        number: 'ВМҚ-567',
        date: '27.10.2023',
        title: 'Иссиқхона хўжаликлари ва мева-сабзавотларни экспорт қилувчи корхоналарнинг фаолиятини қўллаб-қувватлашга доир қўшимча чора-тадбирлар тўғрисида',
        url: 'https://lex.uz/docs/-6645947',
      },
      {
        id: 'law20',
        number: 'ВМҚ-204',
        date: '16.04.2024',
        title: 'Ёқилғи-энергетика соҳасида бозор механизмларини жорий этишнинг қўшимча чора-тадбирлари тўғрисида',
        url: 'https://lex.uz/docs/-6884060',
      },
      {
        id: 'law21',
        number: '',
        date: '30.04.2024',
        title: 'Ўзбекистон Республикасининг Меҳнат кодекси',
        url: 'https://lex.uz/docs/-6257288',
      },
      {
        id: 'law22',
        number: 'ВМҚ-319',
        date: '31.05.2024',
        title: 'Электр энергияси ва табиий газдан фойдаланиш қоидаларини тасдиқлаш тўғрисида',
        url: 'https://lex.uz/docs/-6954979',
      },
      {
        id: 'law23',
        number: 'ЎРҚ-931',
        date: '05.06.2024',
        title: 'Манфаатлар тўқнашуви тўғрисида',
        url: 'https://lex.uz/docs/-6952742',
      },
      {
        id: 'law24',
        number: 'ВМҚ-387',
        date: '06.07.2024',
        title: 'Табиий газ ресурсларидан оқилона фойдаланиш чора-тадбирлари тўғрисида',
        url: 'https://lex.uz/docs/-7011738',
      },
      {
        id: 'law25',
        number: 'ВМҚ-14',
        date: '16.01.2025',
        title: 'Олий таълим тизимида дуал таълимни ташкил этиш чора-тадбирлари тўғрисида',
        url: 'https://lex.uz/docs/-7332601',
      },
    ],
  },
  {
    id: 'cat2',
    titleKey: 'guides.cat2.title',
    descriptionKey: 'guides.cat2.description',
    icon: 'building',
    children: [
      {
        id: 'cat2-1',
        titleKey: 'guides.cat2_1.title',
        descriptionKey: 'guides.cat2_1.description',
        children: [
          {
            id: 'cat2-1-1',
            titleKey: 'guides.cat2_1_1.title',
            placeholder: true,
          },
          {
            id: 'cat2-1-2',
            titleKey: 'guides.cat2_1_2.title',
            placeholder: true,
          },
          {
            id: 'cat2-1-3',
            titleKey: 'guides.cat2_1_3.title',
            placeholder: true,
          },
        ],
      },
      {
        id: 'cat2-2',
        titleKey: 'guides.cat2_2.title',
        descriptionKey: 'guides.cat2_2.description',
        children: [
          {
            id: 'cat2-2-1',
            titleKey: 'guides.cat2_2_1.title',
            placeholder: true,
          },
          {
            id: 'cat2-2-2',
            titleKey: 'guides.cat2_2_2.title',
            placeholder: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cat3',
    titleKey: 'guides.cat3.title',
    descriptionKey: 'guides.cat3.description',
    icon: 'academic',
    files: [
      {
        id: 'file1',
        titleKey: 'guides.file1.title',
        fileName: 'davlat-kadastrlari-yagona-tizimi.pptx',
        fileType: 'pptx',
      },
      {
        id: 'file2',
        titleKey: 'guides.file2.title',
        fileName: 'mehnat-muhofazasi-oqitish-dasturi.pptx',
        fileType: 'pptx',
      },
      {
        id: 'file3',
        titleKey: 'guides.file3.title',
        fileName: 'xavfli-ishlab-chiqarish-obyektlari.ppt',
        fileType: 'ppt',
      },
      {
        id: 'file4',
        titleKey: 'guides.file4.title',
        fileName: 'texnogen-xavf-davlat-kadastri.pptx',
        fileType: 'pptx',
      },
      {
        id: 'file5',
        titleKey: 'guides.file5.title',
        fileName: 'turmushda-gazdan-xavfsiz-foydalanish.pptx',
        fileType: 'pptx',
      },
    ],
  },
];

export function findNode(tree: GuideNode[], path: string[]): GuideNode[] | GuideNode | null {
  if (path.length === 0) return tree;

  const [first, ...rest] = path;
  const node = tree.find((n) => n.id === first);
  if (!node) return null;

  if (rest.length === 0) return node;

  if (node.children) {
    return findNode(node.children, rest);
  }

  return null;
}
