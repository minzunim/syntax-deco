import rawData from '../dummy.json';
import { SyntaxCard } from './components/SyntaxCard';
import { SyntaxData } from './types';

export default function App() {
  const datasets: SyntaxData[] = Array.isArray(rawData) ? rawData : [rawData as SyntaxData];

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {datasets.map((entry, index) => (
            <SyntaxCard key={`${entry.sentence}-${index}`} data={entry} index={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
