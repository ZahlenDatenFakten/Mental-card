import { MindNode, CaseTemplate, CaseItem } from '../types/mindmap';

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
            {
              id: 'ev-3',
              title: 'Доверенность на лицо, принявшее товар',
              nodeType: 'evidence',
              caseVolume: 'т. 1',
              casePages: 'л.д. 29',
              evidenceType: 'written',
              evidenceStatus: 'attached',
              strengthScore: 4,
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
              citation: 'Покупатель обязан проверить количество и качество принятых товаров и о выявленных несоответствиях незамедлительно письменно уведомить поставщика.',
              notes: 'Акт о скрытых недостатках в установленный договором 5-дневный срок не составлялся, вызов представителя Истца не направлялся.',
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
        {
          id: 'counter-2',
          title: 'Ответчик: Ходатайство о снижении неустойки по ст. 333 ГК РФ',
          nodeType: 'counter_arg',
          opponentStance: 'Заявление о явной несоразмерности неустойки последствиям нарушения.',
          children: [
            {
              id: 'rebuttal-2',
              title: 'Опровержение: Ставка 0.1% соответствует обычной деловой практике',
              nodeType: 'rebuttal',
              lawArticle: 'Постановление Пленума ВС РФ № 7 от 24.03.2016 (п. 73, 75)',
              citation: 'Бремя доказывания несоразмерности неустойки возлагается на ответчика (коммерческую организацию).',
              strengthScore: 4,
            },
          ],
        },
      ],
    },
    // Ветка 4: Процессуальные риски
    {
      id: 'branch-risks',
      title: 'IV. Оценка рисков процесса',
      color: '#f43f5e', // rose
      nodeType: 'risk',
      notes: 'Вероятные процессуальные затяжки и контр-меры.',
      children: [
        {
          id: 'risk-1',
          title: 'Риск назначения судебной технической экспертизы',
          nodeType: 'risk',
          notes: 'Ответчик может ходатайствовать об экспертизе для затягивания спора на 3-6 месяцев.',
          children: [
            {
              id: 'risk-action-1',
              title: 'Контрмера: Подготовить список экспертных учреждений и вопросы суду',
              nodeType: 'rebuttal',
              notes: 'Заявить кандидатуры ведущих экспертных бюро с минимальными сроками и стоимостью.',
            },
          ],
        },
      ],
    },
    // Ветка 5: Исковые требования
    {
      id: 'branch-remedy',
      title: 'V. Исковые требования (Просительная часть)',
      color: '#f472b6', // pink
      nodeType: 'remedy',
      notes: 'Итоговые требования к суду по ст. 125 АПК РФ.',
      children: [
        {
          id: 'claim-1',
          title: 'Взыскать основной долг: 4 850 000 руб.',
          nodeType: 'remedy',
        },
        {
          id: 'claim-2',
          title: 'Взыскать неустойку: 485 000 руб. + до момента фактической оплаты',
          nodeType: 'remedy',
        },
        {
          id: 'claim-3',
          title: 'Взыскать расходы по оплате госпошлины: 49 675 руб.',
          nodeType: 'remedy',
        },
      ],
    },
  ],
};

/**
 * Initial Starter Case Portfolio across all judicial instances
 */
export const INITIAL_CASES: CaseItem[] = [
  {
    id: 'case-first-instance-1',
    title: 'А40-184920/2024 — ООО «Вектор» к АО «СтройАльянс»',
    caseNumber: 'А40-184920/2024',
    instance: 'first_instance',
    courtName: 'Арбитражный суд города Москвы',
    judge: 'Судья Новиков К.В.',
    status: 'in_progress',
    description: 'Взыскание задолженности и неустойки по договору поставки оборудования.',
    root: INITIAL_MIND_MAP,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'case-appellate-1',
    title: '09АП-38190/2024 — Апелляционная жалоба по аренде помещений',
    caseNumber: '09АП-38190/2024',
    instance: 'appellate',
    courtName: 'Девятый арбитражный апелляционный суд (9-й ААС)',
    judge: 'Председательствующий судья Васильева Е.А.',
    status: 'appeal_pending',
    description: 'Обжалование решения 1-й инстанции о расторжении договора долгосрочной аренды.',
    root: {
      id: 'appellate-root',
      title: 'Апелляция: Дело № 09АП-38190/2024 (Арендный спор)',
      nodeType: 'thesis',
      color: '#a78bfa',
      children: [
        {
          id: 'app-grounds',
          title: 'Основания отмены решения по ст. 270 АПК РФ',
          nodeType: 'thesis',
          color: '#f43f5e',
          children: [
            {
              id: 'app-g1',
              title: 'Неполное выяснение обстоятельств, имеющих значение для дела',
              nodeType: 'thesis',
              lawArticle: 'п. 1 ч. 1 ст. 270 АПК РФ',
              notes: 'Суд 1-й инстанции не исследовал акты сверки за 2023 год.',
            },
            {
              id: 'app-g2',
              title: 'Неправильное применение норм материального права',
              nodeType: 'thesis',
              lawArticle: 'ст. 619, 622 ГК РФ',
              notes: 'Арендодатель не направил письменное предупреждение о необходимости исполнения обязательства.',
            },
          ],
        },
        {
          id: 'app-evidence',
          title: 'Новые доказательства по ч. 2 ст. 268 АПК РФ',
          nodeType: 'evidence',
          color: '#34d399',
          children: [
            {
              id: 'app-ev1',
              title: 'Платежные поручения об оплате коммунальных услуг',
              nodeType: 'evidence',
              caseVolume: 'т. 2',
              casePages: 'л.д. 14-22',
              evidenceType: 'written',
              evidenceStatus: 'motion_pending',
              notes: 'Ходатайство о приобщении: документы получены после вынесения решения.',
            },
          ],
        },
      ],
    },
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 7200000,
  },
  {
    id: 'case-cassation-1',
    title: 'Ф05-19280/2023 — Корпоративный спор об оспаривании решения ВОСУ',
    caseNumber: 'Ф05-19280/2023',
    instance: 'cassation',
    courtName: 'Арбитражный суд Московского округа (АС МО)',
    judge: 'Судебный состав: Петров А.М., Сидоров Д.В.',
    status: 'in_progress',
    description: 'Кассационная проверка законности судебных актов по корпоративному спору.',
    root: {
      id: 'cass-root',
      title: 'Кассация: Дело № Ф05-19280/2023 (Корпоративный спор ВОСУ)',
      nodeType: 'thesis',
      color: '#fb923c',
      children: [
        {
          id: 'cass-grounds',
          title: 'Кассационные основания отмены по ст. 288 АПК РФ',
          nodeType: 'thesis',
          color: '#f43f5e',
          children: [
            {
              id: 'cass-g1',
              title: 'Нарушение норм процессуального права (ст. 288 ч. 3 АПК РФ)',
              nodeType: 'thesis',
              lawArticle: 'ст. 67.1 ГК РФ, ст. 43 ФЗ об ООО',
              notes: 'Несоблюдение нотариального удостоверения состава участников.',
            },
            {
              id: 'cass-practice',
              title: 'Несоответствие выводов судов прецедентной практике округа',
              nodeType: 'norm',
              lawArticle: 'Постановление АС МО от 15.02.2023 по делу № А40-5544/22',
              citation: 'Решения собраний при отсутствии нотариального удостоверения ничтожны.',
            },
          ],
        },
      ],
    },
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: 'case-supreme-1',
    title: '№ 305-ЭС24-8190 — Кассационная жалоба в Верховный Суд РФ',
    caseNumber: '305-ЭС24-8190',
    instance: 'supreme',
    courtName: 'Верховный Суд Российской Федерации (СКЭС)',
    judge: 'Судья ВС РФ Попов В.В.',
    status: 'in_progress',
    description: 'Жалоба в Судебную коллегию по экономическим спорам ВС РФ.',
    root: {
      id: 'supreme-root',
      title: 'Верховный Суд РФ: № 305-ЭС24-8190 (СКЭС)',
      nodeType: 'thesis',
      color: '#34d399',
      children: [
        {
          id: 'supreme-grounds',
          title: 'Основания для передачи в СКЭС по ст. 291.11 АПК РФ',
          nodeType: 'thesis',
          color: '#f43f5e',
          children: [
            {
              id: 'sup-g1',
              title: 'Существенное нарушение норм материального права',
              nodeType: 'thesis',
              lawArticle: 'ст. 291.11 АПК РФ, ст. 10, 168 ГК РФ',
              notes: 'Нарушение единообразия толкования правовых норм в судебной практике.',
            },
            {
              id: 'sup-uniformity',
              title: 'Формирование единообразной практики высшим судебным органом',
              nodeType: 'norm',
              lawArticle: 'Определение ВС РФ № 305-ЭС21-1234',
              citation: 'Правовая позиция ВС РФ обязательна для применения судами всех инстанций.',
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
 * Ready-to-use case templates for different types of litigation
 */
export const CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: 'arbitration-supply',
    name: 'Арбитраж: Поставка и неустойка',
    category: 'Арбитражный спор',
    description: 'Готовая структура для взыскания долга, процентов/неустойки, с опровержением типичных возражений о качестве.',
    data: INITIAL_MIND_MAP,
  },
  {
    id: 'corporate-dispute',
    name: 'Корпоративный спор: Оспаривание ВОСУ',
    category: 'Корпоративное право',
    description: 'Признание недействительными решений общего собрания участников (нарушение кворума, неизвещение, отсутствие нотариуса).',
    data: {
      id: 'case-corp-root',
      title: 'Дело об оспаривании решения ВОСУ ООО «Прогресс»',
      color: '#a78bfa',
      nodeType: 'remedy',
      notes: 'Иск участника с долей 35% о признании недействительным решения внеочередного общего собрания участников.',
      children: [
        {
          id: 'corp-timeline',
          title: 'I. Хронология корпоративного конфликта',
          nodeType: 'fact_timeline',
          color: '#34d399',
          children: [
            {
              id: 'corp-ev-1',
              title: 'Получение требования о проведении ВОСУ',
              nodeType: 'fact_timeline',
              eventDate: '2024-02-01',
              notes: 'Требование подписано участником с долей 65%.',
            },
            {
              id: 'corp-ev-2',
              title: 'Дата проведения оспариваемого собрания',
              nodeType: 'fact_timeline',
              eventDate: '2024-03-05',
              notes: 'Собрание проведено без участия Истца.',
            },
          ],
        },
        {
          id: 'corp-theses',
          title: 'II. Основания недействительности (ст. 181.4, 181.5 ГК РФ)',
          nodeType: 'thesis',
          color: '#a78bfa',
          children: [
            {
              id: 'corp-th-1',
              title: 'Существенное нарушение порядка созыва (ст. 36 ФЗ об ООО)',
              nodeType: 'thesis',
              lawArticle: 'ст. 36 ФЗ «Об ООО», п. 1 ст. 181.4 ГК РФ',
              strengthScore: 5,
            },
            {
              id: 'corp-th-2',
              title: 'Отсутствие нотариального удостоверения состава участников',
              nodeType: 'thesis',
              lawArticle: 'пп. 3 п. 3 ст. 67.1 ГК РФ',
              citation: 'Решения собрания, не удостоверенные нотариально, являются ничтожными (п. 107 Постановления Пленума ВС РФ № 25).',
              strengthScore: 5,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'labor-dispute',
    name: 'Трудовой спор: Незаконное увольнение',
    category: 'Трудовое право',
    description: 'Восстановление на работе, взыскание среднего заработка за время вынужденного прогула и компенсация морального вреда.',
    data: {
      id: 'case-labor-root',
      title: 'Иск о восстановлении на работе (Иванов И.И. к ООО «Техно»)',
      color: '#f472b6',
      nodeType: 'remedy',
      notes: 'Спор о признании незаконным увольнения по п. 2 ч. 1 ст. 81 ТК РФ (сокращение штата).',
      children: [
        {
          id: 'labor-theses',
          title: 'I. Основания незаконности увольнения',
          nodeType: 'thesis',
          color: '#a78bfa',
          children: [
            {
              id: 'labor-th-1',
              title: 'Не предложены все имеющиеся вакантные должности',
              nodeType: 'thesis',
              lawArticle: 'ч. 3 ст. 81, ч. 1 ст. 180 ТК РФ',
              notes: 'У работодателя имелись вакансии, соответствующие квалификации работника.',
              strengthScore: 5,
            },
            {
              id: 'labor-th-2',
              title: 'Не учтено преимущественное право на оставление на работе',
              nodeType: 'thesis',
              lawArticle: 'ст. 179 ТК РФ',
              strengthScore: 4,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'blank-case',
    name: 'Чистый процесс (с нуля)',
    category: 'Базовый',
    description: 'Пустой шаблон дела для самостоятельного проектирования правовой позиции и доказательственного древа.',
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
          id: 'blank-counter',
          title: 'III. Возражения оппонента и опровержение',
          nodeType: 'counter_arg',
          color: '#fb923c',
        },
        {
          id: 'blank-claims',
          title: 'IV. Исковые требования',
          nodeType: 'remedy',
          color: '#f472b6',
        },
      ],
    },
  },
];
