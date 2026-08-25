import React, { useEffect, useRef, useState } from 'react';
import {
  Scale,
  BookOpen,
  FileCheck,
  Calendar,
  AlertTriangle,
  Gavel,
  Copy,
  Check,
  Plus,
  ArrowRight,
  X,
  Lightbulb,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';

export interface Node3DData {
  id: string;
  label: string;
  type: 'thesis' | 'evidence' | 'norm' | 'fact' | 'risk' | 'remedy';
  color: string;
  description: string;
  tacticalTip: string;
  courtPractice: string;
}

const LEGAL_TERMS_DATABASE: Node3DData[] = [
  {
    id: 'term-1',
    label: 'Исковые требования',
    type: 'remedy',
    color: '#FF375F',
    description: 'Просительная часть иска: взыскание основного долга, договорной неустойки, процентов по ст. 395 ГК РФ и судебных расходов.',
    tacticalTip: 'Указывайте точные денежные суммы с разделением требований. Обязательно требуйте взыскания процентов/пени по день фактической оплаты долга.',
    courtPractice: 'Пленум ВС РФ № 7 от 24.03.2016 (п. 48 о начислении процентов до дня фактической уплаты).',
  },
  {
    id: 'term-2',
    label: 'Правовой тезис',
    type: 'thesis',
    color: '#BF5AF2',
    description: 'Ключевое правовое утверждение стороны, формулирующее факт нарушения ответчиком обязательств и прав истца.',
    tacticalTip: 'Формулируйте тезис кратко (2-3 предложения). Тезис должен отвечать на вопросы: Кто нарушил? Что нарушил? Каковы последствия?',
    courtPractice: 'Определения СКЭС ВС РФ: нерассмотрение существенного правового тезиса влечет отмену решения.',
  },
  {
    id: 'term-3',
    label: 'ст. 309, 310 ГК РФ',
    type: 'norm',
    color: '#0A84FF',
    description: 'Надлежащее исполнение обязательств и недопустимость одностороннего отказа от исполнения договора.',
    tacticalTip: 'Фундаментальная правовая норма для любого договорного иска. Достаточно доказать факт заключения договора и отсутствие оплаты.',
    courtPractice: 'Обзор судебной практики Верховного Суда РФ № 3 (2020).',
  },
  {
    id: 'term-4',
    label: 'Договор поставки',
    type: 'evidence',
    color: '#30D158',
    description: 'Письменное доказательство: договор, спецификации, заявки и дополнительные соглашения с подписями уполномоченных лиц.',
    tacticalTip: 'Проверьте полномочия лица, подписавшего договор (доверенность, выписка из ЕГРЮЛ на дату подписания). При электронном обмене приложите протокол ЭДО.',
    courtPractice: 'ст. 65, 68, 71 АПК РФ (Оценка относимости, допустимости и достоверности доказательств).',
  },
  {
    id: 'term-5',
    label: 'Акт сверки расчетов',
    type: 'evidence',
    color: '#30D158',
    description: 'Документ бухгалтерского учета, подтверждающий взаимное признание сторонами сальдо задолженности.',
    tacticalTip: 'Акт сверки, подписанный директором или лицом по спецдоверенности, прерывает течение 3-летнего срока исковой давности (ст. 203 ГК РФ).',
    courtPractice: 'Постановление Пленума ВС РФ № 43 от 29.09.2015, п. 20.',
  },
  {
    id: 'term-6',
    label: 'Хронология оплаты',
    type: 'fact',
    color: '#FF9F0A',
    description: 'Фактическая последовательность отгрузок, выставления счетов и частичных оплат с точными датами и суммами.',
    tacticalTip: 'Оформляйте хронологию наглядной таблицей с указанием реквизитов платежных поручений. Это ускоряет проверку расчета судьей в 3 раза.',
    courtPractice: 'ст. 65 АПК РФ (Бремя доказывания исполнения денежного обязательства лежит на должнике).',
  },
  {
    id: 'term-7',
    label: 'Возражения оппонента',
    type: 'risk',
    color: '#FF453A',
    description: 'Контраргументы ответчика: ссылки на ненадлежащее качество, пропуск срока, несоблюдение претензионного порядка.',
    tacticalTip: 'Не ждите судебного заседания — подготовьте письменные контр-пояснения (ст. 81 АПК РФ) с опровержением каждого пункта оппонента.',
    courtPractice: 'Принцип состязательности сторон (ст. 9 АПК РФ, ст. 12 ГПК РФ).',
  },
  {
    id: 'term-8',
    label: 'Товарная накладная (УПД)',
    type: 'evidence',
    color: '#30D158',
    description: 'Первичный учетный документ (ТОРГ-12 / УПД со статусом 1), подтверждающий реальное вручение товара покупателю.',
    tacticalTip: 'Убедитесь в наличии подписи с расшифровкой и оттиска печати либо доверенности на получение ТМЦ (форма М-2).',
    courtPractice: 'Постановление Президиума ВАС РФ № 6179/10 (презумпция полномочий при наличии печати).',
  },
  {
    id: 'term-9',
    label: 'Пленум ВС РФ № 7',
    type: 'norm',
    color: '#0A84FF',
    description: 'Постановление Пленума ВС РФ от 24.03.2016 № 7 об ответственности за нарушение обязательств.',
    tacticalTip: 'Используйте для блокировки необоснованного снижения неустойки: ответчик обязан доказать исключительность обстоятельств и необоснованность выгоды.',
    courtPractice: 'П. 71-77 Постановления Пленума ВС РФ № 7 (правила применения ст. 333 ГК РФ).',
  },
  {
    id: 'term-10',
    label: 'Контр-позиция',
    type: 'thesis',
    color: '#BF5AF2',
    description: 'Встречная юридическая конструкция, разрушающая доказательственную базу оппонента.',
    tacticalTip: 'Применяйте тактику встречной квалификации: доказывайте отсутствие вины (ст. 401 ГК РФ) либо просрочку самого кредитора (ст. 406 ГК РФ).',
    courtPractice: 'ст. 131 АПК РФ (Право на мотивированный отзыв на исковое заявление).',
  },
  {
    id: 'term-11',
    label: 'Судебная экспертиза',
    type: 'evidence',
    color: '#30D158',
    description: 'Заключение эксперта (ст. 82 АПК РФ, ст. 79 ГПК РФ) по вопросам объемов, стоимости или качества.',
    tacticalTip: 'Заранее составьте ходатайство с кандидатурами аккредитованных экспертов, гарантийными письмами и депозитом средств на счет суда.',
    courtPractice: 'Постановление Пленума ВАС РФ № 23 от 04.04.2014 (О назначении и проведении экспертиз).',
  },
  {
    id: 'term-12',
    label: 'Расчет неустойки',
    type: 'remedy',
    color: '#FF375F',
    description: 'Арифметически выверенная таблица начисления штрафных санкций за каждый день допущенной просрочки.',
    tacticalTip: 'Прилагайте математическую формулу с указанием ключевой ставки Банка России на каждый конкретный день просрочки.',
    courtPractice: 'ст. 125, 126 АПК РФ (Обязательное приложение к исковому заявлению).',
  },
];

interface Node3DState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  data: Node3DData;
  radius: number;
  pulsePhase: number;
  projectedX: number;
  projectedY: number;
  projectedScale: number;
  hitBox: { x: number; y: number; w: number; h: number };
}

export const Hero3DCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node3DData | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const { addChildNode, root, addToast, setCurrentView, createCase } = useMindMapStore();

  const nodesRef = useRef<Node3DState[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 420;
    };

    window.addEventListener('resize', handleResize);

    // Camera Rotation
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / width - 0.5;
      const normY = (e.clientY - rect.top) / height - 0.5;
      targetRotY = normX * 0.5;
      targetRotX = -normY * 0.4;

      // Hit test for cursor hover
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let foundHover: string | null = null;
      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const n = nodesRef.current[i];
        if (n.projectedScale > 0.45 && n.hitBox) {
          const { x, y, w, h } = n.hitBox;
          if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
            foundHover = n.data.id;
            break;
          }
        }
      }
      setHoveredNodeId(foundHover);
      canvas.style.cursor = foundHover ? 'pointer' : 'grab';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const n = nodesRef.current[i];
        if (n.projectedScale > 0.45 && n.hitBox) {
          const { x, y, w, h } = n.hitBox;
          if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
            setSelectedNode(n.data);
            break;
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    // Initialize 3D Nodes
    nodesRef.current = LEGAL_TERMS_DATABASE.map((item, idx) => {
      const theta = (idx / LEGAL_TERMS_DATABASE.length) * Math.PI * 2;
      const phi = Math.acos(idx % 2 === 0 ? 0.4 : -0.4);
      const radius = 175 + (idx % 3) * 25;

      return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta) * 0.65,
        z: radius * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.15,
        vz: (Math.random() - 0.5) * 0.18,
        data: item,
        radius: 6,
        pulsePhase: Math.random() * Math.PI * 2,
        projectedX: 0,
        projectedY: 0,
        projectedScale: 1,
        hitBox: { x: 0, y: 0, w: 0, h: 0 },
      };
    });

    const fov = 380;
    let time = 0;

    const render = () => {
      time += 0.012;

      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY + Math.sin(time * 0.4) * 0.12 - rotY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Subtle ambient space glow
      const bgGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        width * 0.6
      );
      bgGrad.addColorStop(0, 'rgba(10, 132, 255, 0.08)');
      bgGrad.addColorStop(0.5, 'rgba(191, 90, 242, 0.04)');
      bgGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const project = (x: number, y: number, z: number) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const distance = fov / (fov + z2 + 360);
        return {
          px: centerX + x1 * distance,
          py: centerY + y2 * distance,
          scale: distance,
          depth: z2,
        };
      };

      // Update positions
      nodesRef.current.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        if (Math.abs(n.x) > 220) n.vx *= -1;
        if (Math.abs(n.y) > 140) n.vy *= -1;
        if (Math.abs(n.z) > 200) n.vz *= -1;
      });

      // Project nodes
      const projected = nodesRef.current.map((n) => {
        const prj = project(n.x, n.y, n.z);
        n.projectedX = prj.px;
        n.projectedY = prj.py;
        n.projectedScale = prj.scale;
        return {
          node: n,
          px: prj.px,
          py: prj.py,
          scale: prj.scale,
          depth: prj.depth,
        };
      });

      // Sort by depth
      projected.sort((a, b) => b.depth - a.depth);

      // 1. DRAW CONNECTIONS FIRST (Underneath nodes)
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];

          const dist3D = Math.hypot(
            a.node.x - b.node.x,
            a.node.y - b.node.y,
            a.node.z - b.node.z
          );

          if (dist3D < 160) {
            const alpha = (1 - dist3D / 160) * 0.35 * Math.min(a.scale, b.scale);
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);

            const grad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
            grad.addColorStop(0, a.node.data.color);
            grad.addColorStop(1, b.node.data.color);

            ctx.strokeStyle = grad;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.0 * Math.min(a.scale, b.scale);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // 2. DRAW GLOWING NODES & CLICKABLE LABELS
      projected.forEach(({ node, px, py, scale }) => {
        if (scale <= 0) return;

        const isHovered = hoveredNodeId === node.data.id;
        const isSelected = selectedNode?.id === node.data.id;
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.15 + 1;
        const currentRadius = (node.radius * scale * pulse) * (isHovered ? 1.4 : 1.0);

        // Outer Glow
        const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, currentRadius * 4);
        glowGrad.addColorStop(0, node.data.color + (isHovered ? 'cc' : '88'));
        glowGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Center Sphere
        ctx.beginPath();
        ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.data.color;
        ctx.shadowColor = node.data.color;
        ctx.shadowBlur = (isHovered || isSelected ? 18 : 10) * scale;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label Pill
        if (scale > 0.45) {
          ctx.font = `600 ${Math.max(10, 11.5 * scale)}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
          const textWidth = ctx.measureText(node.data.label).width;
          const padX = 10 * scale;
          const padY = 5 * scale;
          const boxW = textWidth + padX * 2 + 14 * scale;
          const boxH = 20 * scale + padY;
          const boxX = px - boxW / 2;
          const boxY = py + currentRadius + 5 * scale;

          node.hitBox = { x: boxX, y: boxY, w: boxW, h: boxH };

          // Solid glass pill background
          ctx.fillStyle = isHovered || isSelected ? '#242428' : '#161618';
          ctx.strokeStyle = isHovered || isSelected ? node.data.color : node.data.color + '55';
          ctx.lineWidth = isHovered || isSelected ? 1.5 : 0.9;

          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, boxH, 8 * scale);
          ctx.fill();
          ctx.stroke();

          // Left node color indicator dot
          ctx.beginPath();
          ctx.arc(boxX + 7 * scale, boxY + boxH / 2, 3 * scale, 0, Math.PI * 2);
          ctx.fillStyle = node.data.color;
          ctx.fill();

          // Text
          ctx.fillStyle = isHovered || isSelected ? '#FFFFFF' : '#F5F5F7';
          ctx.fillText(node.data.label, boxX + 14 * scale, boxY + boxH / 2 + 4 * scale);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [hoveredNodeId, selectedNode]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    addToast({
      type: 'success',
      title: 'Скопировано в буфер',
      message: text,
      duration: 2000,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInsertIntoActiveCase = (node: Node3DData) => {
    addChildNode(root.id, node.label, node.type as any);
    addToast({
      type: 'success',
      title: 'Блок добавлен в дело',
      message: `«${node.label}» добавлен в активную ментальную карту.`,
    });
    setCurrentView('workspace');
  };

  const handleCreateCaseWithTerm = (node: Node3DData) => {
    createCase({
      title: `Дело: ${node.label}`,
      instance: 'district',
      courtName: 'Окружной арбитражный суд',
      status: 'in_progress',
      description: node.description,
    });
  };

  const getNodeTypeBadge = (type: Node3DData['type']) => {
    switch (type) {
      case 'thesis':
        return { label: 'Правовой тезис', icon: <Scale className="w-3.5 h-3.5" />, color: '#BF5AF2' };
      case 'norm':
        return { label: 'Норма права', icon: <BookOpen className="w-3.5 h-3.5" />, color: '#0A84FF' };
      case 'evidence':
        return { label: 'Доказательство', icon: <FileCheck className="w-3.5 h-3.5" />, color: '#30D158' };
      case 'fact':
        return { label: 'Факт фабулы', icon: <Calendar className="w-3.5 h-3.5" />, color: '#FF9F0A' };
      case 'risk':
        return { label: 'Процессуальный риск', icon: <AlertTriangle className="w-3.5 h-3.5" />, color: '#FF453A' };
      case 'remedy':
        return { label: 'Исковое требование', icon: <Gavel className="w-3.5 h-3.5" />, color: '#FF375F' };
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[430px] overflow-hidden rounded-3xl border border-zinc-800/80 shadow-2xl bg-[#0d0d10]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Floating Interactive Legal Inspector Card Overlay */}
      {selectedNode && (
        <div className="absolute inset-x-3.5 bottom-3.5 sm:inset-x-6 sm:bottom-6 p-5 sm:p-6 apple-sheet-window border border-white/20 shadow-2xl z-30 animate-apple-spring-in backdrop-blur-3xl bg-[#1c1c1f]/95">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: `${selectedNode.color}22`,
                  color: selectedNode.color,
                  border: `1px solid ${selectedNode.color}44`,
                }}
              >
                {getNodeTypeBadge(selectedNode.type).icon}
                <span>{getNodeTypeBadge(selectedNode.type).label}</span>
              </div>

              <h4 className="text-base font-bold text-white tracking-tight">
                {selectedNode.label}
              </h4>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="p-1.5 rounded-xl text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#EBEBF5] leading-relaxed mb-3.5 font-sans">
            {selectedNode.description}
          </p>

          {/* Tactical Legal Tip */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FFD60A]">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Тактическая подсказка для суда:</span>
            </div>
            <p className="text-xs text-[#A1A1A6] leading-relaxed">
              {selectedNode.tacticalTip}
            </p>
            <div className="text-[11px] font-mono text-[#64D2FF] pt-1">
              ✦ {selectedNode.courtPractice}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2.5 flex-wrap pt-1 border-t border-white/[0.08]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleInsertIntoActiveCase(selectedNode)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold apple-btn-green rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.95]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Вставить в карту</span>
              </button>

              <button
                onClick={() => handleCreateCaseWithTerm(selectedNode)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium apple-btn-secondary rounded-xl transition-all cursor-pointer active:scale-[0.95]"
              >
                <span>Создать дело</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => handleCopy(`${selectedNode.label}: ${selectedNode.description}\nТактика: ${selectedNode.tacticalTip}`)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#8E8E93] hover:text-white hover:bg-white/[0.08] rounded-xl transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Скопировано' : 'Копировать'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
