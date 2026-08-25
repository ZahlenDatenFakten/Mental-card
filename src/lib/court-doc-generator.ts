import { MindNode, TimelineEvent } from '../types/mindmap';

interface CollectedEvidence {
  title: string;
  type?: string;
  volumePages?: string;
  status?: string;
  notes?: string;
  attachedToThesis?: string;
}

interface CollectedNorm {
  title: string;
  article?: string;
  citation?: string;
  notes?: string;
}

interface CollectedThesis {
  title: string;
  notes?: string;
  norms: string[];
  evidence: string[];
}

interface CollectedRisk {
  title: string;
  opponentArg?: string;
  rebuttal?: string;
  notes?: string;
}

/**
 * Extracts and formats all judicial elements from a MindNode tree.
 */
export function generateCourtMemorandum(root: MindNode): string {
  const events: TimelineEvent[] = [];
  const evidenceList: CollectedEvidence[] = [];
  const normsList: CollectedNorm[] = [];
  const thesesList: CollectedThesis[] = [];
  const risksList: CollectedRisk[] = [];
  const remedies: string[] = [];

  function traverse(node: MindNode, currentThesisTitle?: string) {
    const nodeType = node.nodeType || 'general';

    // Collect Chronology / Timeline Events
    if (node.eventDate || nodeType === 'fact_timeline') {
      events.push({
        nodeId: node.id,
        title: node.title,
        date: node.eventDate || 'Дата не указана',
        time: node.eventTime,
        notes: node.notes,
        casePages: [node.caseVolume, node.casePages].filter(Boolean).join(', '),
        nodeType: nodeType,
      });
    }

    // Collect Evidence
    if (nodeType === 'evidence' || node.casePages || node.caseVolume) {
      const volPage = [node.caseVolume, node.casePages].filter(Boolean).join(', ');
      evidenceList.push({
        title: node.title,
        type: node.evidenceType === 'written' ? 'Письменное' : node.evidenceType === 'expertise' ? 'Экспертиза' : node.evidenceType === 'witness' ? 'Свидетельские показания' : node.evidenceType === 'electronic' ? 'Электронное' : 'Документ',
        volumePages: volPage || 'Не приобщено',
        status: node.evidenceStatus === 'attached' ? 'Приобщено к материалам' : node.evidenceStatus === 'motion_pending' ? 'Заявлено ходатайство' : node.evidenceStatus === 'to_request' ? 'Требуется истребовать' : 'В наличии',
        notes: node.notes,
        attachedToThesis: currentThesisTitle,
      });
    }

    // Collect Legal Norms
    if (nodeType === 'norm' || node.lawArticle) {
      normsList.push({
        title: node.title,
        article: node.lawArticle,
        citation: node.citation,
        notes: node.notes,
      });
    }

    // Collect Theses
    if (nodeType === 'thesis') {
      const childNorms: string[] = [];
      const childEvidence: string[] = [];
      if (node.children) {
        node.children.forEach((c) => {
          if (c.nodeType === 'norm' || c.lawArticle) childNorms.push(c.lawArticle || c.title);
          if (c.nodeType === 'evidence' || c.casePages) childEvidence.push(c.title);
        });
      }
      thesesList.push({
        title: node.title,
        notes: node.notes,
        norms: childNorms,
        evidence: childEvidence,
      });
    }

    // Collect Risks & Counter-arguments
    if (nodeType === 'risk' || nodeType === 'counter_arg' || node.opponentStance) {
      risksList.push({
        title: node.title,
        opponentArg: node.opponentStance,
        rebuttal: nodeType === 'rebuttal' ? node.notes : undefined,
        notes: node.notes,
      });
    }

    // Collect Remedies
    if (nodeType === 'remedy') {
      remedies.push(node.title + (node.notes ? ` (${node.notes})` : ''));
    }

    const nextThesis = nodeType === 'thesis' ? node.title : currentThesisTitle;

    if (node.children) {
      for (const child of node.children) {
        traverse(child, nextThesis);
      }
    }
  }

  traverse(root);

  // Sort timeline events chronologically
  events.sort((a, b) => a.date.localeCompare(b.date));

  // Build structured Court Document
  const docLines: string[] = [];

  docLines.push(`# ПРАВОВАЯ ПОЗИЦИЯ И СУДЕБНЫЙ МЕМОРАНДУМ ПО ДЕЛУ`);
  docLines.push(`**Предмет спора / Дело:** ${root.title}`);
  if (root.notes) {
    docLines.push(`**Краткое резюме:** ${root.notes}`);
  }
  docLines.push(`**Дата формирования документа:** ${new Date().toLocaleDateString('ru-RU')}`);
  docLines.push(`\n---\n`);

  // Section 1: Chronology & Facts
  docLines.push(`## I. ФАБУЛА ДЕЛА И ХРОНОЛОГИЯ СОБЫТИЙ\n`);
  if (events.length === 0) {
    docLines.push(`*События хронологии не зафиксированы.*`);
  } else {
    docLines.push(`| Дата / Время | Событие / Юридический факт | Материалы дела | Примечание |`);
    docLines.push(`| :--- | :--- | :--- | :--- |`);
    events.forEach((ev) => {
      docLines.push(`| **${ev.date}** ${ev.time || ''} | ${ev.title} | ${ev.casePages || '—'} | ${ev.notes || '—'} |`);
    });
  }
  docLines.push(`\n---\n`);

  // Section 2: Legal Arguments & Theses
  docLines.push(`## II. ПРАВОВАЯ ПОЗИЦИЯ И ОСНОВНЫЕ ТЕЗИСЫ\n`);
  if (thesesList.length === 0) {
    docLines.push(`*Тезисы позиции не сформулированы.*`);
  } else {
    thesesList.forEach((t, i) => {
      docLines.push(`### 2.${i + 1}. ${t.title}`);
      if (t.notes) docLines.push(`> ${t.notes}\n`);
      if (t.norms.length > 0) {
        docLines.push(`- **Нормативное обоснование:** ${t.norms.join('; ')}`);
      }
      if (t.evidence.length > 0) {
        docLines.push(`- **Подтверждающие доказательства:** ${t.evidence.join('; ')}`);
      }
      docLines.push(``);
    });
  }
  docLines.push(`\n---\n`);

  // Section 3: Legal Norms & Precedents
  docLines.push(`## III. НОРМАТИВНО-ПРАВОВАЯ БАЗА И СУДЕБНАЯ ПРАКТИКА\n`);
  if (normsList.length === 0) {
    docLines.push(`*Ссылки на нормы права не добавлены.*`);
  } else {
    normsList.forEach((n, i) => {
      docLines.push(`${i + 1}. **${n.article || n.title}**${n.article && n.title !== n.article ? ` — ${n.title}` : ''}`);
      if (n.citation) docLines.push(`   *Цитата:* «${n.citation}»`);
      if (n.notes) docLines.push(`   *Комментарий юриста:* ${n.notes}`);
    });
  }
  docLines.push(`\n---\n`);

  // Section 4: Evidence Registry
  docLines.push(`## IV. РЕЕСТР ДОКАЗАТЕЛЬСТВ\n`);
  if (evidenceList.length === 0) {
    docLines.push(`*Доказательства в реестре отсутствуют.*`);
  } else {
    docLines.push(`| № | Доказательство / Документ | Вид | Том, л.д. | Статус | Подтверждаемый факт |`);
    docLines.push(`| :- | :--- | :--- | :--- | :--- | :--- |`);
    evidenceList.forEach((ev, i) => {
      docLines.push(`| ${i + 1} | **${ev.title}** | ${ev.type || 'Письменное'} | ${ev.volumePages || '—'} | ${ev.status || 'В наличии'} | ${ev.attachedToThesis || 'Общие обстоятельства'} |`);
    });
  }
  docLines.push(`\n---\n`);

  // Section 5: Opponent Counter-arguments & Risk Assessment
  if (risksList.length > 0) {
    docLines.push(`## V. ОЦЕНКА РИСКОВ И ВОЗРАЖЕНИЙ ОППОНЕНТА\n`);
    risksList.forEach((r, i) => {
      docLines.push(`### 5.${i + 1}. ${r.title}`);
      if (r.opponentArg) docLines.push(`- **Позиция оппонента:** ${r.opponentArg}`);
      if (r.rebuttal) docLines.push(`- **Контраргумент / Опровержение:** ${r.rebuttal}`);
      if (r.notes) docLines.push(`- **Заметки:** ${r.notes}`);
      docLines.push(``);
    });
    docLines.push(`\n---\n`);
  }

  // Section 6: Remedies / Relief Sought
  if (remedies.length > 0) {
    docLines.push(`## VI. ИСКОВЫЕ ТРЕБОВАНИЯ / ПРОСИТЕЛЬНАЯ ЧАСТЬ\n`);
    remedies.forEach((rem, i) => {
      docLines.push(`${i + 1}. ${rem}`);
    });
    docLines.push(``);
  }

  return docLines.join('\n');
}
