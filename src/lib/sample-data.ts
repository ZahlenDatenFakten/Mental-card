import { MindNode, CaseTemplate } from '../types/mindmap';

/**
 * Default starter judicial case: Арбитражный спор о взыскании долга по поставке
 */
export const INITIAL_MIND_MAP: MindNode = {
  id: 'case-root',
  title: 'Дело № А40-184920/2024 (ООО «Вектор» к АО «СтройАльянс»)',
  notes: 'Арбитражный спор о взыскании 4 850 000 руб. задолженности по договору поставки оборудования и 485 000 руб. договорной неустойки.',
  color: '#38bdf8', // sky
  priority: 'high',
  tags: ['арбитраж', 'поставка', 'взыскание-долга'],
  nodeType: 'remedy',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  children: [
    // Ветка 1: Фабула дела и хронология событий
    {
      id: 'branch-timeline',
      title: 'I. Фабула дела и ключевая хронология',
      color: '#34d399', // emerald
      nodeType: 'fact_timeline',
      priority: 'high',
      notes: 'Последовательность юридически значимых действий сторон.',
      children: [
        {
          id: 'event-1',
          title: 'Заключение договора поставки № 14-П',
          nodeType: 'fact_timeline',
          eventDate: '2024-01-15',
          caseVolume: 'т. 1',
          casePages: 'л.д. 12-18',
          notes: 'Согласованы спецификация, сроки поставки (30 дней) и порядок 100% постоплаты в течение 10 дней с момента приемки.',
        },
        {
          id: 'event-2',
          title: 'Отгрузка промышленного оборудования',
          nodeType: 'fact_timeline',
          eventDate: '2024-02-10',
          caseVolume: 'т. 1',
          casePages: 'л.д. 22-26',
          notes: 'Товар доставлен перевозчиком на склад Покупателя в г. Подольск без замечаний по упаковке.',
        },
        {
          id: 'event-3',
          title: 'Подписание УПД и приемка товара',
          nodeType: 'fact_timeline',
          eventDate: '2024-02-12',
          caseVolume: 'т. 1',
          casePages: 'л.д. 28',
          notes: 'Универсальный передаточный документ подписан уполномоченным лицом по доверенности.',
        },
        {
          id: 'event-4',
          title: 'Наступление срока оплаты по договору',
          nodeType: 'fact_timeline',
          eventDate: '2024-02-26',
          notes: 'Истек 10-дневный срок на перечисление денежных средств. Оплата не поступила.',
        },
        {
          id: 'event-5',
          title: 'Направление досудебной претензии Истцом',
          nodeType: 'fact_timeline',
          eventDate: '2024-03-15',
          caseVolume: 'т. 1',
          casePages: 'л.д. 34-39',
          notes: 'Соблюден 30-дневный претензионный порядок по ч. 5 ст. 4 АПК РФ. Ответ на претензию не получен.',
        },
      ],
    },

    // Ветка 2: Правовая позиция и нормативное обоснование
    {
      id: 'branch-theses',
      title: 'II. Правовая позиция и тезисы Истца',
      color: '#a78bfa', // violet
      nodeType: 'thesis',
      priority: 'high',
      notes: 'Главные аргументы иска, подтвержденные материалами дела и законодательством.',
      children: [
        {
          id: 'thesis-1',
          title: 'Тезис 1: Обязательство по поставке исполнено надлежащим образом',
          nodeType: 'thesis',
          priority: 'high',
          notes: 'Товар передан в полном объеме, комплектности и в согласованный договором срок.',
          children: [
            {
              id: 'norm-1',
              title: 'Статья 309, 310 ГК РФ (Надлежащее исполнение обязательств)',
              nodeType: 'norm',
              lawArticle: 'ст. 309, 310 ГК РФ',
              citation: 'Обязательства должны исполняться надлежащим образом в соответствии с условиями обязательства и требованиями закона.',
            },
            {
              id: 'norm-2',
              title: 'Статья 506 ГК РФ (Договор поставки)',
              nodeType: 'norm',
              lawArticle: 'ст. 506 ГК РФ',
            },
            {
              id: 'ev-1',
              title: 'УПД № 48 от 12.02.2024 с отметкой о приемке',
              nodeType: 'evidence',
              evidenceType: 'written',
              evidenceStatus: 'attached',
              caseVolume: 'т. 1',
              casePages: 'л.д. 28',
              strengthScore: 5,
              notes: 'Содержит подпись и оригинальную печать Ответчика.',
            },
            {
              id: 'ev-2',
              title: 'Транспортная накладная № ТН-881',
              nodeType: 'evidence',
              evidenceType: 'written',
              evidenceStatus: 'attached',
              caseVolume: 'т. 1',
              casePages: 'л.д. 30',
              strengthScore: 4,
            },
          ],
        },
        {
          id: 'thesis-2',
          title: 'Тезис 2: Нарушение Ответчиком обязанности по оплате',
          nodeType: 'thesis',
          priority: 'high',
          notes: 'Просрочка оплаты составила свыше 90 дней, что порождает право на взыскание неустойки.',
          children: [
            {
              id: 'norm-3',
              title: 'Статья 516 ГК РФ (Расчеты за поставляемые товары)',
              nodeType: 'norm',
              lawArticle: 'ст. 516 ГК РФ',
              citation: 'Покупатель оплачивает поставляемые товары с соблюдением порядка и формы расчетов, предусмотренных договором поставки.',
            },
            {
              id: 'norm-4',
              title: 'Статья 330 ГК РФ и п. 7.1 Договора (Неустойка 0.1% в день)',
              nodeType: 'norm',
              lawArticle: 'ст. 330 ГК РФ',
              notes: 'Расчет неустойки произведен в строгом соответствии с п. 7.1 Договора.',
            },
            {
              id: 'ev-3',
              title: 'Банковская выписка по счету Истца за 2024 год',
              nodeType: 'evidence',
              evidenceType: 'written',
              evidenceStatus: 'attached',
              caseVolume: 'т. 1',
              casePages: 'л.д. 45-52',
              strengthScore: 5,
            },
            {
              id: 'ev-4',
              title: 'Почтовый отчет об отслеживании РПО (претензия)',
              nodeType: 'evidence',
              evidenceType: 'electronic',
              evidenceStatus: 'attached',
              caseVolume: 'т. 1',
              casePages: 'л.д. 40',
              strengthScore: 5,
            },
          ],
        },
      ],
    },

    // Ветка 3: Анализ возражений оппонента и риски
    {
      id: 'branch-defense',
      title: 'III. Возражения оппонента, риски и контрпозиция',
      color: '#fb923c', // orange
      nodeType: 'counter_arg',
      priority: 'high',
      notes: 'Прогнозируемые доводы Ответчика и заготовки опровержений.',
      children: [
        {
          id: 'risk-1',
          title: 'Довод оппонента: Неподписанный акт сверки и отсутствие сверки',
          nodeType: 'counter_arg',
          opponentStance: 'Ответчик в отзыве ссылается на незавершенность сверки взаимных расчетов.',
          children: [
            {
              id: 'rebuttal-1',
              title: 'Опровержение: Акт сверки не является обязательным первичным документом',
              nodeType: 'rebuttal',
              priority: 'high',
              lawArticle: 'ст. 65, 68 АПК РФ, Постановление Президиума ВАС РФ № 10582/10',
              notes: 'Первичными документами, подтверждающими факт поставки, являются УПД и ТТН. Акт сверки лишь констатирует учетные данные.',
              children: [
                {
                  id: 'norm-precedent-1',
                  title: 'Определение ВС РФ № 305-ЭС19-14812 (О силе УПД)',
                  nodeType: 'norm',
                  citation: 'Подписанный без возражений УПД подтверждает факт надлежащего исполнения обязательства по передаче товара.',
                },
              ],
            },
          ],
        },
        {
          id: 'risk-2',
          title: 'Риск: Ходатайство Ответчика о снижении неустойки по ст. 333 ГК РФ',
          nodeType: 'risk',
          priority: 'medium',
          notes: 'Суд первой инстанции может срезать неустойку при формальном заявлении ответчика.',
          children: [
            {
              id: 'rebuttal-2',
              title: 'Контр-аргумент: Отсутствие доказательств явной несоразмерности',
              nodeType: 'rebuttal',
              lawArticle: 'Постановление Пленума ВС РФ от 24.03.2016 № 7 (п. 71, 73, 77)',
              notes: 'Бремя доказывания несоразмерности лежит на коммерческой организации (Ответчике). Ставка 0.1% является общепринятой в деловом обороте.',
            },
          ],
        },
      ],
    },

    // Ветка 4: Просительная часть (Исковые требования)
    {
      id: 'branch-remedies',
      title: 'IV. Просительная часть иска (Требования)',
      color: '#f472b6', // pink
      nodeType: 'remedy',
      priority: 'high',
      notes: 'Точные формулировки резолютивной части судебного решения.',
      children: [
        {
          id: 'remedy-1',
          title: 'Взыскать основной долг в размере 4 850 000 руб.',
          nodeType: 'remedy',
          priority: 'high',
        },
        {
          id: 'remedy-2',
          title: 'Взыскать договорную неустойку в размере 485 000 руб.',
          nodeType: 'remedy',
          priority: 'high',
        },
        {
          id: 'remedy-3',
          title: 'Взыскать расходы по уплате государственной пошлины (49 675 руб.)',
          nodeType: 'remedy',
          priority: 'medium',
          casePages: 'л.д. 4 (платежное поручение)',
        },
      ],
    },
  ],
};

/**
 * Library of curated legal templates for various court proceedings
 */
export const CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: 'arbitration-supply',
    name: 'Арбитраж: Взыскание долга по поставке',
    category: 'Арбитражный процесс',
    description: 'Классический спор о взыскании оплаты за поставленный товар, договорной неустойки и отражении возражений по ст. 333 ГК РФ.',
    data: INITIAL_MIND_MAP,
  },
  {
    id: 'corporate-dispute',
    name: 'Корпоративный спор: Оспаривание решения ОСУ ООО',
    category: 'Корпоративное право',
    description: 'Признание недействительным решения общего собрания участников, нарушение порядка созыва, отсутствие кворума, причинение убытков.',
    data: {
      id: 'corp-root',
      title: 'Оспаривание решения общего собрания участников ООО «Альфа»',
      notes: 'Иск участника с долей 35% о признании недействительным решения ВОСУ от 18.04.2024 об одобрении крупной сделки.',
      color: '#a78bfa',
      nodeType: 'remedy',
      children: [
        {
          id: 'corp-timeline',
          title: 'Хронология корпоративных событий',
          nodeType: 'fact_timeline',
          children: [
            { id: 'c-ev-1', title: 'Получение уведомления о созыве ВОСУ', eventDate: '2024-04-05', nodeType: 'fact_timeline', casePages: 'л.д. 15', notes: 'Уведомление направлено с нарушением 30-дневного срока (ст. 36 ФЗ об ООО).' },
            { id: 'c-ev-2', title: 'Проведение собрания без участия Истца', eventDate: '2024-04-18', nodeType: 'fact_timeline', casePages: 'л.д. 20-25', notes: 'Протокол ВОСУ № 2/24 подписан председателем в отсутствие кворума.' },
            { id: 'c-ev-3', title: 'Заключение оспариваемой сделки отчуждения активов', eventDate: '2024-04-22', nodeType: 'fact_timeline', casePages: 'л.д. 32' },
          ],
        },
        {
          id: 'corp-theses',
          title: 'Основания недействительности решения (Тезисы)',
          nodeType: 'thesis',
          children: [
            {
              id: 'c-th-1',
              title: 'Существенное нарушение порядка созыва и подготовки собрания',
              nodeType: 'thesis',
              children: [
                { id: 'c-norm-1', title: 'ст. 181.4 ГК РФ и ст. 36, 43 ФЗ «Об ООО»', nodeType: 'norm', lawArticle: 'ст. 181.4 ГК РФ' },
                { id: 'c-ev-11', title: 'Конверт и почтовый трек с датой отправки', nodeType: 'evidence', casePages: 'л.д. 16' },
              ],
            },
            {
              id: 'c-th-2',
              title: 'Причинение решением существенных неблагоприятных последствий обществу',
              nodeType: 'thesis',
              children: [
                { id: 'c-norm-2', title: 'ст. 46 ФЗ «Об ООО» (Крупные сделки)', nodeType: 'norm', lawArticle: 'ст. 46 ФЗ «Об ООО»' },
                { id: 'c-ev-12', title: 'Отчет об оценке рыночной стоимости отчужденного имущества', nodeType: 'evidence', evidenceType: 'expertise', casePages: 'т. 1, л.д. 60-95' },
              ],
            },
          ],
        },
        {
          id: 'corp-risks',
          title: 'Возражения ответчика и оценка рисков',
          nodeType: 'counter_arg',
          children: [
            {
              id: 'c-risk-1',
              title: 'Довод ответчика: Голосование Истца не могло повлиять на результаты',
              nodeType: 'counter_arg',
              opponentStance: 'Истец владеет 35%, мажоритарий 65%.',
              children: [
                { id: 'c-reb-1', title: 'Опровержение: Для сделки с заинтересованностью требуется единогласие либо спецкворум', nodeType: 'rebuttal', lawArticle: 'ст. 45 ФЗ «Об ООО»' },
              ],
            },
          ],
        },
        {
          id: 'corp-remedies',
          title: 'Исковые требования',
          nodeType: 'remedy',
          children: [
            { id: 'c-rem-1', title: 'Признать недействительным решение ВОСУ от 18.04.2024', nodeType: 'remedy' },
            { id: 'c-rem-2', title: 'Применить последствия недействительности сделки', nodeType: 'remedy' },
          ],
        },
      ],
    },
  },
  {
    id: 'labor-dispute',
    name: 'Трудовой спор: Оспаривание незаконного увольнения',
    category: 'Трудовое право / СОЮ',
    description: 'Признание увольнения незаконным, восстановление на работе, взыскание среднего заработка за вынужденный прогул и морального вреда.',
    data: {
      id: 'labor-root',
      title: 'Трудовой спор: Иск Иванова И.И. к ПАО «ПромТех»',
      notes: 'Иск о признании увольнения по п. 5 ч. 1 ст. 81 ТК РФ (неоднократное неисполнение обязанностей) незаконным.',
      color: '#f472b6',
      nodeType: 'remedy',
      children: [
        {
          id: 'lab-timeline',
          title: 'Хронология дисциплинарных взысканий',
          nodeType: 'fact_timeline',
          children: [
            { id: 'l-ev-1', title: 'Трудовой договор № 45/2021', eventDate: '2021-03-01', casePages: 'л.д. 10' },
            { id: 'l-ev-2', title: 'Приказ о первом выговоре', eventDate: '2024-02-15', casePages: 'л.д. 22', notes: 'Замечание объявлено без истребования письменных объяснений.' },
            { id: 'l-ev-3', title: 'Приказ об увольнении № 18-к', eventDate: '2024-03-20', casePages: 'л.д. 30' },
          ],
        },
        {
          id: 'lab-theses',
          title: 'Основания незаконности увольнения (Тезисы)',
          nodeType: 'thesis',
          children: [
            {
              id: 'lab-th-1',
              title: 'Нарушение работодателем порядка применения дисциплинарных взысканий',
              nodeType: 'thesis',
              children: [
                { id: 'lab-norm-1', title: 'ст. 192, 193 ТК РФ (Порядок наложения взыскания)', nodeType: 'norm', lawArticle: 'ст. 193 ТК РФ', citation: 'До применения дисциплинарного взыскания работодатель должен затребовать от работника письменное объяснение.' },
                { id: 'lab-ev-1', title: 'Отсутствие акта об отказе от дачи объяснений', nodeType: 'evidence', strengthScore: 5 },
              ],
            },
            {
              id: 'lab-th-2',
              title: 'Несоразмерность проступка тяжести наказания',
              nodeType: 'thesis',
              children: [
                { id: 'lab-norm-2', title: 'Постановление Пленума ВС РФ № 2 от 17.03.2004 (п. 53)', nodeType: 'norm', citation: 'Работодатель обязан доказать соразмерность взыскания и учет предшествующего отношения к труду.' },
                { id: 'lab-ev-2', title: 'Грамоты и благодарности за 2022-2023 гг.', nodeType: 'evidence', casePages: 'л.д. 45-48' },
              ],
            },
          ],
        },
        {
          id: 'lab-remedies',
          title: 'Исковые требования',
          nodeType: 'remedy',
          children: [
            { id: 'lab-rem-1', title: 'Восстановить на работе в должности ведущего инженера', nodeType: 'remedy' },
            { id: 'lab-rem-2', title: 'Взыскать средний заработок за время вынужденного прогула', nodeType: 'remedy' },
            { id: 'lab-rem-3', title: 'Взыскать компенсацию морального вреда (50 000 руб.)', nodeType: 'remedy' },
          ],
        },
      ],
    },
  },
  {
    id: 'blank-case',
    name: 'Чистый судебный процесс (Создать с нуля)',
    category: 'Свой кейс',
    description: 'Пустой шаблон дела с базовой иерархией: Фабула/Хронология, Правовая позиция (Тезисы), Доказательства, Риски, Требования.',
    data: {
      id: 'blank-root',
      title: 'Новое судебное дело (Номер / Стороны)',
      notes: 'Краткое описание предмета спора, наименование суда и ключевых обстоятельств.',
      color: '#38bdf8',
      nodeType: 'remedy',
      children: [
        {
          id: 'blank-timeline',
          title: 'I. Хронология событий и фабула дела',
          color: '#34d399',
          nodeType: 'fact_timeline',
          children: [
            { id: 'b-ev-1', title: 'Событие 1 (Дата, действие сторон)', eventDate: '2024-01-01', nodeType: 'fact_timeline' },
          ],
        },
        {
          id: 'blank-theses',
          title: 'II. Правовая позиция (Тезисы и нормы права)',
          color: '#a78bfa',
          nodeType: 'thesis',
          children: [
            {
              id: 'b-th-1',
              title: 'Тезис 1: Нарушение права / Обоснование требования',
              nodeType: 'thesis',
              children: [
                { id: 'b-norm-1', title: 'Норма права (Статья закона / Пленум)', nodeType: 'norm', lawArticle: 'ст. ...' },
                { id: 'b-ev-11', title: 'Доказательство (Документ, том, л.д.)', nodeType: 'evidence', casePages: 'т. 1, л.д. ...' },
              ],
            },
          ],
        },
        {
          id: 'blank-risks',
          title: 'III. Анализ рисков и контраргументы оппонента',
          color: '#fb923c',
          nodeType: 'counter_arg',
          children: [
            {
              id: 'b-risk-1',
              title: 'Возможный довод оппонента',
              nodeType: 'counter_arg',
              children: [
                { id: 'b-reb-1', title: 'Опровержение и контр-доказательство', nodeType: 'rebuttal' },
              ],
            },
          ],
        },
        {
          id: 'blank-remedy',
          title: 'IV. Исковые требования (Просительная часть)',
          color: '#f472b6',
          nodeType: 'remedy',
          children: [
            { id: 'b-rem-1', title: 'Требование 1: Признать / Взыскать / Обязать', nodeType: 'remedy' },
          ],
        },
      ],
    },
  },
];
