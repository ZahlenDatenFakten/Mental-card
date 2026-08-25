import { MindNode, CaseTemplate, CaseItem } from '../types/mindmap';

/**
 * Default starter judicial case: Окружной спор о взыскании долга по поставке
 */
export const INITIAL_MIND_MAP: MindNode = {
  id: 'case-root',
  title: 'Дело № ОКР-184920/2024 (ООО «Вектор» к АО «СтройАльянс»)',
  notes: 'Спор о взыскании 4 850 000 руб. задолженности по договору поставки оборудования и 485 000 руб. договорной неустойки.',
  color: '#38bdf8', // sky
  priority: 'high',
  tags: ['окружной-суд', 'поставка', 'взыскание-долга'],
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
          notes: 'Товар доставлен перевозчиком на склад Покупателя без замечаний по упаковке.',
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
          notes: 'Соблюден 30-дневный претензионный порядок. Ответ на претензию не получен.',
        },
      ],
    },
    // Ветка 2: Правовые основания и тезисы Истца
    {
      id: 'branch-theses',
      title: 'II. Правовые основания иска',
      color: '#a78bfa', // violet
      nodeType: 'thesis',
      priority: 'high',
      notes: 'Материально-правовая квалификация правоотношений сторон.',
      children: [
        {
          id: 'thesis-1',
          title: 'Обязательство по оплате принято и не исполнено',
          nodeType: 'thesis',
          lawArticle: 'ст. 309, 310, 486, 516 ГК РФ',
          citation: 'Обязательства должны исполняться надлежащим образом. Односторонний отказ от исполнения обязательства не допускается.',
          strengthScore: 5,
          children: [
            {
              id: 'ev-1',
              title: 'Договор поставки № 14-П с приложениями',
              nodeType: 'evidence',
              caseVolume: 'т. 1',
              casePages: 'л.д. 12-18',
              evidenceType: 'written',
              evidenceStatus: 'attached',
              strengthScore: 5,
            },
            {
              id: 'ev-2',
              title: 'УПД № 48 от 12.02.2024 с отметкой о приемке',
              nodeType: 'evidence',
              caseVolume: 'т. 1',
              casePages: 'л.д. 28',
              evidenceType: 'written',
              evidenceStatus: 'attached',
              strengthScore: 5,
            },
          ],
        },
        {
          id: 'thesis-2',
          title: 'Обоснованность начисления договорной неустойки (0.1% в день)',
          nodeType: 'thesis',
          lawArticle: 'ст. 330 ГК РФ, п. 6.2 Договора',
          strengthScore: 5,
          children: [
            {
              id: 'ev-calc',
              title: 'Расчет цены иска и штрафных санкций',
              nodeType: 'evidence',
              caseVolume: 'т. 1',
              casePages: 'л.д. 8-11',
              evidenceType: 'written',
              evidenceStatus: 'attached',
              strengthScore: 5,
            },
          ],
        },
      ],
    },
    // Ветка 3: Анализ возражений Ответчика и опровержения
    {
      id: 'branch-counter',
      title: 'III. Возражения Ответчика и их опровержение',
      color: '#fb923c', // orange
      nodeType: 'counter_arg',
      notes: 'Прогнозируемая тактика защиты Ответчика и контр-аргументы.',
      children: [
        {
          id: 'counter-1',
          title: 'Ответчик: «Товар поставлен с недостатками качества»',
          nodeType: 'counter_arg',
          opponentStance: 'Покупатель утверждает, что оборудование не вышло на проектную мощность.',
          children: [
            {
              id: 'rebuttal-1',
              title: 'Опровержение: Акт приемки подписан без замечаний',
              nodeType: 'rebuttal',
              lawArticle: 'ст. 513 ГК РФ',
              citation: 'Покупатель обязан проверить количество и качество принятых товаров.',
              notes: 'Акт о скрытых недостатках в установленный договором срок не составлялся.',
              children: [
                {
                  id: 'ev-rebuttal-doc',
                  title: 'Акт совместного ввода в эксплуатацию от 14.02.2024',
                  nodeType: 'evidence',
                  caseVolume: 'т. 1',
                  casePages: 'л.д. 31',
                  evidenceType: 'written',
                  evidenceStatus: 'attached',
                  strengthScore: 5,
                },
              ],
            },
          ],
        },
      ],
    },
    // Ветка 4: Исковые требования
    {
      id: 'branch-remedy',
      title: 'IV. Исковые требования (Просительная часть)',
      color: '#f472b6', // pink
      nodeType: 'remedy',
      children: [
        {
          id: 'claim-1',
          title: 'Взыскать основной долг: 4 850 000 руб.',
          nodeType: 'remedy',
        },
        {
          id: 'claim-2',
          title: 'Взыскать неустойку: 485 000 руб.',
          nodeType: 'remedy',
        },
      ],
    },
  ],
};

/**
 * Initial Starter Case Portfolio for the 3 instances:
 * 1) Окружная инстанция (первая)
 * 2) Апелляционная инстанция (вторая)
 * 3) Верховная инстанция (последняя)
 */
export const INITIAL_CASES: CaseItem[] = [
  {
    id: 'case-district-1',
    title: 'ОКР-184920/2024 — ООО «Вектор» к АО «СтройАльянс»',
    caseNumber: 'ОКР-184920/2024',
    instance: 'district',
    courtName: 'Окружной суд (1-я инстанция)',
    judge: 'Судья Новиков К.В.',
    status: 'in_progress',
    description: 'Окружное производство: Взыскание задолженности и неустойки по договору поставки оборудования.',
    root: INITIAL_MIND_MAP,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'case-appellate-1',
    title: 'АП-38190/2024 — Апелляционная жалоба по спору об аренде',
    caseNumber: 'АП-38190/2024',
    instance: 'appellate',
    courtName: 'Апелляционный суд (2-я инстанция)',
    judge: 'Председательствующий судья Васильева Е.А.',
    status: 'appeal_pending',
    description: 'Апелляционное обжалования решения окружного суда по спору об аренде.',
    root: {
      id: 'appellate-root',
      title: 'Апелляционная инстанция: Дело № АП-38190/2024 (Арендный спор)',
      nodeType: 'thesis',
      color: '#a78bfa',
      children: [
        {
          id: 'app-grounds',
          title: 'Основания апелляционного обжалования решения',
          nodeType: 'thesis',
          color: '#f43f5e',
          children: [
            {
              id: 'app-g1',
              title: 'Неполное выяснение обстоятельств, имеющих значение для дела',
              nodeType: 'thesis',
              notes: 'Окружной суд не исследовал представленные акты сверки взаиморасчетов.',
            },
            {
              id: 'app-g2',
              title: 'Неправильное применение норм материального права',
              nodeType: 'thesis',
              lawArticle: 'ст. 619, 622 ГК РФ',
              notes: 'Арендодатель не направил письменное предупреждение о расторжении договора.',
            },
          ],
        },
        {
          id: 'app-evidence',
          title: 'Дополнительные доказательства в апелляции',
          nodeType: 'evidence',
          color: '#34d399',
          children: [
            {
              id: 'app-ev1',
              title: 'Платежные поручения об оплате за спорный период',
              nodeType: 'evidence',
              caseVolume: 'т. 2',
              casePages: 'л.д. 14-22',
              evidenceType: 'written',
              evidenceStatus: 'motion_pending',
            },
          ],
        },
      ],
    },
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 7200000,
  },
  {
    id: 'case-supreme-1',
    title: 'ВС-24-8190 — Жалоба в Верховную инстанцию',
    caseNumber: 'ВС-24-8190',
    instance: 'supreme',
    courtName: 'Верховный Суд (Высшая инстанция)',
    judge: 'Судья Верховного Суда Попов В.В.',
    status: 'in_progress',
    description: 'Рассмотрение в высшей инстанции: проверка существенных нарушений норм права.',
    root: {
      id: 'supreme-root',
      title: 'Верховная инстанция: № ВС-24-8190',
      nodeType: 'thesis',
      color: '#34d399',
      children: [
        {
          id: 'supreme-grounds',
          title: 'Основания пересмотра судебных актов Верховным Судом',
          nodeType: 'thesis',
          color: '#f43f5e',
          children: [
            {
              id: 'sup-g1',
              title: 'Существенное нарушение норм материального и процессуального права',
              nodeType: 'thesis',
              lawArticle: 'ст. 10, 168 ГК РФ',
              notes: 'Нарушение единообразия судебной практики и основополагающих принципов права.',
            },
            {
              id: 'sup-uniformity',
              title: 'Прецедентная позиция высшего судебного органа',
              nodeType: 'norm',
              lawArticle: 'Определение Верховного Суда',
              citation: 'Правовая позиция обязательна для применения судами нижестоящих инстанций.',
            },
          ],
        },
      ],
    },
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
];

/**
 * Ready-to-use case templates
 */
export const CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: 'arbitration-supply',
    name: 'Поставка и неустойка (Окружная инстанция)',
    category: '1. Окружная инстанция',
    description: 'Готовая структура для взыскания долга, неустойки с опровержением типичных возражений о качестве.',
    data: INITIAL_MIND_MAP,
  },
  {
    id: 'corporate-dispute',
    name: 'Корпоративный спор: Оспаривание ВОСУ',
    category: 'Корпоративное право',
    description: 'Признание недействительными решений общего собрания участников (нарушение кворума, неизвещение).',
    data: {
      id: 'case-corp-root',
      title: 'Дело об оспаривании решения ВОСУ ООО «Прогресс»',
      color: '#a78bfa',
      nodeType: 'remedy',
      notes: 'Иск участника о признании недействительным решения общего собрания.',
      children: [
        {
          id: 'corp-timeline',
          title: 'I. Хронология корпоративного конфликта',
          nodeType: 'fact_timeline',
          color: '#34d399',
        },
        {
          id: 'corp-theses',
          title: 'II. Основания недействительности',
          nodeType: 'thesis',
          color: '#a78bfa',
        },
      ],
    },
  },
  {
    id: 'blank-case',
    name: 'Чистый процесс (с нуля)',
    category: 'Базовый',
    description: 'Пустой шаблон для проектирования собственного судебного процесса.',
    data: {
      id: 'blank-root',
      title: 'Новое судебное дело',
      notes: 'Сформулируйте предмет спора и исковые требования.',
      nodeType: 'remedy',
      color: '#38bdf8',
      children: [
        {
          id: 'blank-timeline',
          title: 'I. Фабула дела и хронология',
          nodeType: 'fact_timeline',
          color: '#34d399',
        },
        {
          id: 'blank-theses',
          title: 'II. Правовые основания и тезисы',
          nodeType: 'thesis',
          color: '#a78bfa',
        },
        {
          id: 'blank-claims',
          title: 'III. Исковые требования',
          nodeType: 'remedy',
          color: '#f472b6',
        },
      ],
    },
  },
];
