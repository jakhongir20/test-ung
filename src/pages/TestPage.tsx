import type { FC } from 'react';

const options = ['A', 'B', 'C', 'D', 'E'] as const;

const TestPage: FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-cyan-700 ring-1 ring-cyan-200">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm1-10V7h-2v7h6v-2h-4Z" /></svg>
            <span className="text-sm">30:24 min</span>
          </div>
        </div>
        <button className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Finish test</button>
      </div>

      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4 md:p-6">
        <p className="text-sm text-gray-500">Question 15</p>
        <h2 className="mt-2 text-lg md:text-xl font-semibold">Python dasturlash tili qanday til?</h2>
        <div className="mt-6 space-y-3">
          {options.map((o, idx) => (
            <label key={o} className="flex items-center gap-4 rounded-xl ring-1 ring-gray-200 hover:ring-cyan-300 has-[:checked]:ring-2 has-[:checked]:ring-cyan-500 transition p-3">
              <span className="w-8 h-8 grid place-items-center rounded bg-gray-100 text-gray-600 font-semibold">{o}</span>
              <input type="radio" name="q1" className="accent-cyan-600" />
              <span className="flex-1">{idx === 1 ? "Python yangi o'rganayotganlarga qulay til" : idx === 3 ? "Barcha javoblar to'g'ri" : 'Option text'}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Prev</button>
          <button className="rounded-lg bg-cyan-600 text-white px-3 py-2 text-sm hover:bg-cyan-700">Next</button>
        </div>
      </section>

      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4 md:p-6">
        <p className="text-sm text-gray-500">Question 16</p>
        <h2 className="mt-2 text-lg md:text-xl font-semibold">What are the main activities of the small company Uzbekneftegaz?</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
            <img src="https://images.unsplash.com/photo-1542326237-94b1c5a538d8?q=80&w=1200&auto=format&fit=crop" className="h-full w-full object-cover" alt="plant" />
          </div>
          <div className="space-y-3">
            {options.slice(0, 4).map((o, idx) => (
              <label key={o} className="flex items-center gap-4 rounded-xl ring-1 ring-gray-200 hover:ring-cyan-300 has-[:checked]:ring-2 has-[:checked]:ring-cyan-500 transition p-3">
                <span className="w-8 h-8 grid place-items-center rounded bg-gray-100 text-gray-600 font-semibold">{o}</span>
                <input type="radio" name="q2" className="accent-cyan-600" />
                <span className="flex-1">{idx === 1 ? 'Oil and gas production and processing' : 'Option text'}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4 md:p-6">
        <p className="text-sm text-gray-500">Question 17</p>
        <h2 className="mt-2 text-lg md:text-xl font-semibold">Where to contact regarding cooperation and contract conclusion?</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
            <img src="https://images.unsplash.com/photo-1498146831523-fbe41acdc5ad?q=80&w=1200&auto=format&fit=crop" className="h-full w-full object-cover" alt="plant" />
          </div>
          <div className="space-y-3">
            {options.map((o, idx) => (
              <label key={o} className="flex items-center gap-4 rounded-xl ring-1 ring-gray-200 hover:ring-cyan-300 has-[:checked]:ring-2 has-[:checked]:ring-cyan-500 transition p-3">
                <span className="w-8 h-8 grid place-items-center rounded bg-gray-100 text-gray-600 font-semibold">{o}</span>
                <input type="radio" name="q3" className="accent-cyan-600" />
                <span className="flex-1">{idx === 2 ? 'To the department for working with partners and contracts' : 'Option text'}</span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestPage


