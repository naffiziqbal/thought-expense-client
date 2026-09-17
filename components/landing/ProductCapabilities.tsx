import { productCapabilities } from '@/lib/landingContent';

export function ProductCapabilities() {
  return (
    <section className="border-b border-token bg-token-card px-4 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-token-primary md:text-4xl">
            What you get after the first save
          </h2>
          <p className="mt-3 text-lg text-token-secondary">
            ThoughtExpense is more than a parser — it is a place to understand spending over time.
          </p>
        </div>

        <div className="mt-12 divide-y divide-token rounded-2xl border border-token bg-token-surface">
          {productCapabilities.map((item, index) => (
            <div
              key={item.title}
              className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between md:gap-8 md:p-8"
            >
              <div className="flex gap-4 md:max-w-xl">
                <span className="mt-0.5 text-sm font-bold tabular-nums text-token-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-token-primary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-token-secondary">{item.description}</p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-medium text-token-accent md:pt-1">{item.platforms}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
