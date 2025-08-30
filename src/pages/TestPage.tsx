import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { QuestionNavigator, QuestionCard, type Option } from '../components/test';

type Question = {
  id: number;
  title: string;
  options: Option[];
  multiple?: boolean;
  mediaUrl?: string;
};

const TestPage: FC = () => {
  const questions: Question[] = useMemo(() => ([
    {
      id: 1,
      title: "Python dasturlash tili qanday til?",
      options: [
        { key: 'A', label: 'Python juda yaxshi til' },
        { key: 'B', label: "Python yangi o\'rganayotganlarga qulay til" },
        { key: 'C', label: "Hamma javoblar to\'g\'ri" },
      ],
    },
    {
      id: 2,
      title: 'What are the main activities of the small company Uzbekneftegaz?',
      options: [
        { key: 'A', label: 'Agricultural machinery production' },
        { key: 'B', label: 'Oil and gas production and processing' },
        { key: 'C', label: 'Consumer electronics production' },
        { key: 'D', label: 'Food trade' },
      ],
      mediaUrl: 'https://images.unsplash.com/photo-1542326237-94b1c5a538d8?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Where to contact regarding cooperation and contract conclusion?',
      options: [
        { key: 'A', label: "To the company's HR department" },
        { key: 'B', label: 'To the technical department for well servicing' },
        { key: 'C', label: 'To the department for working with partners and contracts' },
        { key: 'D', label: "To the company's accounting department" },
      ],
      mediaUrl: 'https://images.unsplash.com/photo-1498146831523-fbe41acdc5ad?q=80&w=1200&auto=format&fit=crop',
      multiple: true,
    },
  ]), []);

  const total = questions.length;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [navOpen, setNavOpen] = useState(false);

  const question = questions[current];
  const selected = answers[question.id] || [];

  function toggleOption(key: string) {
    setAnswers((prev) => {
      const cur = prev[question.id] || [];
      const next = question.multiple
        ? cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]
        : [key];
      return { ...prev, [question.id]: next };
    });
  }

  function go(delta: number) {
    setCurrent((c) => Math.min(Math.max(c + delta, 0), total - 1));
  }

  const answeredFlags = questions.map((q) => (answers[q.id]?.length ?? 0) > 0);

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-cyan-700 ring-1 ring-cyan-200">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm1-10V7h-2v7h6v-2h-4Z" /></svg>
            <span className="text-sm">30:24 min</span>
          </div>
        </div>
        <button className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Finish test</button>
      </div>

      <QuestionCard
        index={current + 1}
        title={question.title}
        options={question.options}
        selectedKeys={selected}
        multiple={question.multiple}
        onToggle={toggleOption}
        media={question.mediaUrl ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
              <img src={question.mediaUrl} className="h-full w-full object-cover" alt="media" />
            </div>
          </div>
        ) : null}
      />

      <div className="relative">
        <div className="flex justify-between items-center rounded-2xl bg-white ring-1 ring-gray-200 p-3">
          <button onClick={() => setNavOpen((v) => !v)} className="rounded-xl px-3 py-2 text-sm ring-1 ring-gray-200 hover:bg-gray-50">Question {current + 1} of {total}</button>
          <div className="flex items-center gap-2">
            <button onClick={() => go(-1)} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Prev</button>
            <button onClick={() => go(1)} className="rounded-lg bg-cyan-600 text-white px-3 py-2 text-sm hover:bg-cyan-700">Next</button>
          </div>
        </div>

        <QuestionNavigator
          total={total}
          currentIndex={current}
          answered={answeredFlags}
          open={navOpen}
          onClose={() => setNavOpen(false)}
          onSelect={(i) => setCurrent(i)}
          // @ts-ignore supply popup variant
          variant="popup"
        />

        <QuestionNavigator
          total={total}
          currentIndex={current}
          answered={answeredFlags}
          open={navOpen}
          onClose={() => setNavOpen(false)}
          onSelect={(i) => setCurrent(i)}
        />
      </div>
    </div>
  );
};

export default TestPage


