import React, { useEffect, useMemo, useRef } from 'react';
import { SyntaxData, Chunk } from '../types';

const labelColors: Record<string, { underline: string; text: string }> = {
  s: { underline: 'border-sky-500', text: 'text-sky-600' },
  v: { underline: 'border-rose-500', text: 'text-rose-600' },
  o: { underline: 'border-emerald-500', text: 'text-emerald-600' },
  sc: { underline: 'border-emerald-500', text: 'text-emerald-600' },
};

const modifierColors = {
  text: 'text-amber-600',
  ring: 'text-amber-500',
};

function chunkColor(tag: string) {
  const key = tag.toLowerCase();
  return labelColors[key] ?? { underline: 'border-slate-400', text: 'text-slate-500' };
}

function formatTag(tag: string) {
  if (!tag) return '';
  return tag.toUpperCase();
}

function renderDecoratedChunk(
  chunk: Chunk,
  nested: Chunk[],
  underline: string,
  setChunkRef: (key: string) => (node: HTMLSpanElement | null) => void,
  chunkKey: (chunk: Chunk) => string,
) {
  if (!nested.length) {
    return (
      <span
        className={`inline-flex flex-wrap items-end gap-1 border-b-2 ${underline} pb-1 text-[17px] font-semibold text-slate-800`}
      >
        {chunk.text}
      </span>
    );
  }

  const segments: (string | JSX.Element)[] = [];
  let remaining = chunk.text;

  nested.forEach((mod) => {
    const idx = remaining.indexOf(mod.text);
    if (idx === -1) return;
    const before = remaining.slice(0, idx);
    if (before) segments.push(before);

    segments.push(
      <span
        key={`${mod.start}-${mod.end}-inline`}
        ref={setChunkRef(chunkKey(mod))}
        className="flex flex-col items-center"
      >
        <span className="text-[12px] font-semibold text-amber-600">{mod.gramEle}</span>
        <span className="text-[17px] font-semibold text-slate-700">({mod.text})</span>
      </span>,
    );

    remaining = remaining.slice(idx + mod.text.length);
  });

  if (remaining) segments.push(remaining);

  return (
    <span
      className={`inline-flex flex-wrap items-end gap-1 border-b-2 ${underline} pb-1 text-[17px] font-semibold text-slate-800`}
    >
      {segments.map((seg, i) =>
        typeof seg === 'string' ? (
          <span key={`seg-${i}`} className="leading-6">
            {seg}
          </span>
        ) : (
          seg
        ),
      )}
    </span>
  );
}

type SyntaxCardProps = {
  data: SyntaxData;
  index: number;
};

export function SyntaxCard({ data, index }: SyntaxCardProps) {
  const structuralChunks = [...data.chunks.filter((chunk) => chunk.senEle)].sort(
    (a, b) => a.start - b.start,
  );
  const modifierChunks = data.chunks.filter((chunk) => !chunk.senEle && chunk.gramEle);
  const combinedChunks = [...structuralChunks, ...modifierChunks].sort((a, b) => a.start - b.start);

  const hiddenKeys = new Set<string>();
  const nestedByKey: Record<string, Chunk[]> = {};
  const chunkKey = (chunk: Chunk) => `${chunk.start}-${chunk.end}-${chunk.senEle || chunk.gramEle}`;
  const chunkRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const setChunkRef = (key: string) => (node: HTMLSpanElement | null) => {
    if (node) {
      chunkRefs.current[key] = node;
    } else {
      delete chunkRefs.current[key];
    }
  };

  combinedChunks.forEach((chunk, idx) => {
    if (!chunk.gramEle) return;
    const container = combinedChunks
      .slice(0, idx)
      .find((prev) => prev.end === chunk.end && prev.text.includes(chunk.text));
    if (container) {
      const key = chunkKey(container);
      if (!nestedByKey[key]) nestedByKey[key] = [];
      nestedByKey[key].push(chunk);
      hiddenKeys.add(chunkKey(chunk));
    }
  });

  const displayChunks = combinedChunks.filter((chunk) => !hiddenKeys.has(chunkKey(chunk)));

  const hasComplement = structuralChunks.some((chunk) => chunk.senEle.toLowerCase() === 'sc');
  const grammarPoint = hasComplement
    ? 'be동사 + 보어(SC) 형태로 주어를 설명하거나 정의합니다.'
    : '주요 성분을 확인하세요.';

  const modifierArrows = useMemo(() => modifierChunks.filter((c) => c.modifier), [modifierChunks]);

  const renderSegments = () => {
    const segments: JSX.Element[] = [];
    let cursor = 0;

    displayChunks.forEach((chunk) => {
      // if (chunk.start > cursor) {
      //   const gap = data.sentence.slice(cursor, chunk.start);
      //   segments.push(
      //     <span
      //       key={`gap-${cursor}-${chunk.start}`}
      //       className="whitespace-pre text-[17px] leading-7 text-slate-600 mr-1 mb-1 inline-flex items-end"
      //     >
      //       {gap}
      //     </span>,
      //   );
      // }

      const nested = nestedByKey[chunkKey(chunk)] ?? [];
      const isModifier = !chunk.senEle && chunk.gramEle;
      if (isModifier) {
        segments.push(
          <span
            key={`${chunk.start}-${chunk.end}-mod`}
            ref={setChunkRef(chunkKey(chunk))}
            className="mr-1 mb-1 flex flex-col items-center self-start"
          >
            <span className={`text-[12px] font-semibold ${modifierColors.text}`}>{chunk.gramEle}</span>
            <span className="text-[17px] font-semibold text-slate-700">({chunk.text})</span>
          </span>,
        );
      } else {
        const colors = chunkColor(chunk.senEle);
        segments.push(
          <span
            key={`${chunk.start}-${chunk.end}`}
            ref={setChunkRef(chunkKey(chunk))}
            className="mr-1 mb-1 flex flex-col items-start"
          >
            {renderDecoratedChunk(chunk, nested, colors.underline, setChunkRef, chunkKey)}
            <span className={`text-[13px] font-bold uppercase ${colors.text}`}>{formatTag(chunk.senEle)}</span>
          </span>,
        );
      }

      cursor = chunk.end;
    });

    if (cursor < data.sentence.length) {
      const tail = data.sentence.slice(cursor);
      segments.push(
        <span
          key={`gap-tail-${cursor}`}
          className="whitespace-pre text-[17px] leading-7 text-slate-600 mr-1 mb-1 inline-flex items-end"
        >
          {tail}
        </span>,
      );
    }

    return segments;
  };

  useEffect(() => {
    const draw = () => {
      // 캔버스 처리 순서: 컨테이너 크기에 맞게 캔버스 리사이즈 → 각 modifier의 타겟 청크 계산 → 곡선 화살표와 화살촉을 그림
      const container = canvasContainerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#2563eb'; // blue-600
      ctx.fillStyle = '#2563eb';
      ctx.lineWidth = 2.2;

      const findTargetChunk = (mod: Chunk) => {
        const headCandidates = combinedChunks.filter((c) => c !== mod && (c.senEle || !c.modifier));

        // 1) 가장 작은 포함(head) chunk 우선 (명사구/주요 성분 등)
        const containing = headCandidates
          .filter((c) => c.start <= mod.start && c.end >= mod.end)
          .sort((a, b) => a.end - a.start - (b.end - b.start))[0];
        if (containing) return containing;

        // 2) 없으면 mod 앞에서 가장 가까운 구조 성분
        const before = headCandidates
          .filter((s) => s.senEle && s.end <= mod.start)
          .sort((a, b) => b.end - a.end)[0];
        return before ?? null;
      };

      const drawArrow = (fromEl: HTMLElement, toEl: HTMLElement) => {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const startX = fromRect.left - rect.left + fromRect.width / 4; // 라벨 가로 중앙에서 시작
        const startY = fromRect.top - rect.top + fromRect.height / 2; // 라벨 세로 중앙에서 시작
        const endX = toRect.left - rect.left + toRect.width / 5;
        const endY = toRect.top - rect.top + 25;
        // 각진(ㄴ자) 경로: 위쪽으로 띄운 후 가로/세로로 연결
        const rawElbowY = Math.min(startY, endY) - 24; // 기본 꺾임 위치: 더 위쪽보다 24px 위
        const elbowY = Math.max(4, Math.min(rawElbowY, endY - 24)); // 끝점보다 최소 24px 위로 띄워 마지막 세로 구간 확보

        const points = [
          { x: startX, y: startY },
          { x: startX, y: elbowY },
          { x: endX, y: elbowY },
          { x: endX, y: endY },
        ];

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        const headLength = 8;
        const prev = points[points.length - 2];
        const dx = endX - prev.x || 0.001;
        const dy = endY - prev.y;
        const angle = Math.atan2(dy, dx); // 마지막 세그먼트 방향
        const arrowAngle = Math.PI / 6;
        const tipX = endX;
        const tipY = endY;
        const leftX = tipX - headLength * Math.cos(angle - arrowAngle);
        const leftY = tipY - headLength * Math.sin(angle - arrowAngle);
        const rightX = tipX - headLength * Math.cos(angle + arrowAngle);
        const rightY = tipY - headLength * Math.sin(angle + arrowAngle);

        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.closePath();
        ctx.fill();
      };

      modifierArrows.forEach((mod) => {
        const fromEl = chunkRefs.current[chunkKey(mod)];
        const targetChunk = findTargetChunk(mod);
        const toEl = targetChunk ? chunkRefs.current[chunkKey(targetChunk)] : null;
        if (fromEl && toEl) {
          drawArrow(fromEl, toEl);
        }
      });

      ctx.restore();
    };

    draw();
    window.addEventListener('resize', draw);
    return () => {
      window.removeEventListener('resize', draw);
    };
  }, [modifierArrows, structuralChunks]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-4">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
          {index}
        </div>
        <div className="flex-1">
          <p className="text-[17px] font-semibold leading-7 text-slate-800">{data.sentence}</p>
        </div>
        <div className="text-indigo-300">▲</div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div
          ref={canvasContainerRef}
          className="relative rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
        >
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
          <div className="flex flex-wrap items-end text-[16px] leading-7">{renderSegments()}</div>
        </div>

        <p className="text-[15px] leading-7 text-slate-700">{data.translation}</p>

        <div className="rounded-xl border border-slate-200 bg-[#f5f7fb] px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
              문법 포인트
            </span>
            <p className="text-[14px] leading-6 text-slate-700">{grammarPoint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
