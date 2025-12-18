import { useState } from 'react';
import rawData from '../dummy.json';
import { SyntaxCard } from './components/SyntaxCard';
import { SyntaxData } from './types';

export default function App() {
  const normalizeData = (data: unknown): SyntaxData[] =>
    Array.isArray(data) ? (data as SyntaxData[]) : [data as SyntaxData];

  const [inputValue, setInputValue] = useState(() => JSON.stringify(rawData, null, 2));
  const [datasets, setDatasets] = useState<SyntaxData[]>(() => normalizeData(rawData));
  const [error, setError] = useState<string | null>(null);

  // json 적용 버튼
  const handleApply = () => {
    try {
      const parsed = JSON.parse(inputValue);
      setDatasets(normalizeData(parsed));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요.';
      setError(`JSON을 읽을 수 없어요: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-slate-900">
      <div className="w-full px-10 py-6 lg:py-8">
        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              {/* <div>
                <p className="text-[13px] font-semibold uppercase text-indigo-600 tracking-wide">INPUT</p>
                <p className="text-lg font-bold text-slate-900">dummy.json</p>
              </div> */}
              {/* <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">편집 가능</span> */}
            </div>
            <div className="px-5 pb-6 pt-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                rows={22}
                spellCheck={false}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-[13px] leading-6 text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={handleApply}
                className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-white"
              >
                적용하기
              </button>
              {error ? (
                <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>
              ) : (
                <p className="mt-3 text-sm text-slate-500">텍스트 수정 후 적용하기 버튼을 누르세요.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {datasets.map((entry, index) => (
              <SyntaxCard key={`${entry.sentence}-${index}`} data={entry} index={index + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
