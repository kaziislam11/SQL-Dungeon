import Link from 'next/link'
import { AZM_TRIALS, KAZI_TRIALS, type TrialContract } from '@/lib/data/paired-problems'

interface TrialSectionProps {
  title: string
  subtitle: string
  accent: string
  accentSoft: string
  trials: TrialContract[]
}

function TrialSection({ title, subtitle, accent, accentSoft, trials }: TrialSectionProps) {
  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-rune/10 pb-3">
        <div>
          <p className={`font-cinzel text-[0.6rem] uppercase tracking-[0.25em] ${accent}`}>{title}</p>
          <h2 className="mt-1 font-cinzel text-2xl font-bold text-parchment">{subtitle}</h2>
        </div>
        <div className={`rounded border px-3 py-1 font-cinzel text-[0.6rem] uppercase tracking-[0.15em] ${accentSoft}`}>
          {trials.length} sessions
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {trials.map(trial => (
          <article
            key={trial.id}
            className="rounded border border-rune/15 bg-stone transition-colors hover:border-rune/30"
          >
            <div className="flex items-start justify-between gap-4 border-b border-rune/10 px-6 py-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-cinzel text-[0.55rem] uppercase tracking-[0.15em] text-mist">
                    {trial.id.toUpperCase()} · from {trial.sourceProblemId.toUpperCase()}
                  </span>
                  <span className={`rounded border px-2 py-0.5 font-cinzel text-[0.55rem] uppercase tracking-[0.12em] ${accentSoft}`}>
                    {trial.leadRole} leads
                  </span>
                </div>
                <h3 className="mt-1 font-cinzel text-lg font-bold text-parchment">
                  Session {trial.session}. {trial.title}
                </h3>
              </div>

              <div className="flex flex-wrap justify-end gap-1">
                {trial.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded border border-rune/20 bg-rune/5 px-2 py-0.5 font-mono text-[0.55rem] text-rune-dim"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="px-6 py-4">
              <p className="font-crimson text-base italic text-parchment/90">{trial.scenario}</p>
            </div>

            <div className="grid gap-4 px-6 pb-4 lg:grid-cols-3">
              <div className="rounded border border-rune/15 bg-deep p-4">
                <div className={`mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] ${accent}`}>Mentor Focus</div>
                <p className="font-crimson text-sm leading-relaxed text-mist">{trial.mentorFocus}</p>
              </div>
              <div className="rounded border border-rune/15 bg-deep p-4">
                <div className="mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-rune">Navigator</div>
                <p className="font-crimson text-sm leading-relaxed text-mist">{trial.navigatorRole}</p>
              </div>
              <div className="rounded border border-rune/15 bg-deep p-4">
                <div className="mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-gold">Driver</div>
                <p className="font-crimson text-sm leading-relaxed text-mist">{trial.driverRole}</p>
              </div>
            </div>

            <div className="grid gap-6 border-t border-rune/10 px-6 py-4 lg:grid-cols-2">
              <div>
                <div className="mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-mist">Business Questions</div>
                <ol className="flex flex-col gap-1.5">
                  {trial.requirements.map((requirement, index) => (
                    <li key={index} className="flex gap-2">
                      <span className={`mt-0.5 shrink-0 font-cinzel text-[0.6rem] ${accent}`}>{index + 1}.</span>
                      <span className="font-crimson text-sm text-parchment">{requirement}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-mist">Notebook Finish</div>
                <p className="mb-3 font-crimson text-sm leading-relaxed text-mist">{trial.outputFocus}</p>
                <ul className="flex flex-col gap-1">
                  {trial.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex gap-2 font-crimson text-sm text-parchment">
                      <span className={`mt-0.5 shrink-0 ${accent}`}>*</span>
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-rune/10 px-6 py-4">
              <div className="mb-3 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-mist">Starter Queries</div>
              <div className="flex flex-col gap-3">
                {trial.starterQueries.map((starter, index) => (
                  <div key={index} className="rounded border border-rune/10 bg-abyss p-3">
                    <div className={`mb-1.5 font-cinzel text-[0.6rem] uppercase tracking-wide ${accent}`}>{starter.label}</div>
                    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[0.7rem] leading-relaxed text-parchment/80">
                      {starter.query}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function GuildPage() {
  const totalTrials = KAZI_TRIALS.length + AZM_TRIALS.length

  return (
    <div className="min-h-screen bg-abyss text-parchment">
      <div className="border-b border-rune/20 bg-deep px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/dungeon"
            className="mb-4 inline-flex items-center gap-2 font-cinzel text-[0.65rem] uppercase tracking-[0.15em] text-mist transition-colors hover:text-parchment"
          >
            &larr; Back to Dungeon
          </Link>
          <h1 className="font-cinzel text-3xl font-black tracking-wider text-gold text-shadow-gold">
            Guild Contracts
          </h1>
          <p className="mt-2 font-crimson text-lg italic text-mist">
            SQLNOIR paired problem-solving split into Kazi&apos;s Trials and Azm&apos;s Trials
          </p>
        </div>
      </div>

      <div className="border-b border-rune/10 bg-deep/60 px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['10', 'Paired Sessions', '5 Kazi + 5 Azm'],
              ['5', 'Trials Each', 'per pair member ladder'],
              ['4', 'Notebook Outputs', 'queries, results, notes, recommendations'],
              ['T-SQL', 'Required', 'CTEs, subqueries, functions, optimization'],
            ].map(([value, label, detail]) => (
              <div key={label} className="rounded border border-rune/15 bg-stone p-4 text-center">
                <div className="font-cinzel text-2xl font-bold text-gold">{value}</div>
                <div className="mt-1 font-cinzel text-[0.6rem] uppercase tracking-[0.15em] text-parchment">{label}</div>
                <div className="mt-1 font-crimson text-sm text-mist">{detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded border border-rune/20 bg-rune/5 p-4">
              <div className="mb-2 font-cinzel text-xs uppercase tracking-[0.15em] text-rune">Overview</div>
              <p className="font-crimson text-base leading-relaxed text-parchment">
                These contracts simulate agile business-technical work. The pair alternates roles, works in a shared SQL notebook,
                and turns raw query output into a recommendation a stakeholder could actually use.
              </p>
            </div>
            <div className="rounded border border-gold/20 bg-gold/5 p-4">
              <div className="mb-2 font-cinzel text-xs uppercase tracking-[0.15em] text-gold">Tools</div>
              <p className="font-crimson text-base leading-relaxed text-parchment">
                Use Azure Data Studio SQL Notebooks, SSMS notebooks, or VS Code notebook extensions. The important part is
                a notebook-style deliverable with narrative, code, results, and recommendations.
              </p>
            </div>
            <div className="rounded border border-fire/20 bg-fire/5 p-4">
              <div className="mb-2 font-cinzel text-xs uppercase tracking-[0.15em] text-fire">Submission</div>
              <p className="font-crimson text-base leading-relaxed text-parchment">
                Finish each session with a GitHub-ready shared notebook trail. Show role rotation, query evolution,
                advanced T-SQL depth, and a final business-facing insight.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded border border-violet-500/25 bg-violet-500/5 p-4">
              <div className="mb-2 font-cinzel text-xs uppercase tracking-[0.15em] text-violet-300">Kazi&apos;s Trials</div>
              <p className="font-crimson text-base leading-relaxed text-parchment">
                Kazi&apos;s ladder is navigator-first. The business stakeholder leads the session, frames the requirements,
                catches logic issues, and explains what decision the SQL is meant to support before the driver types.
              </p>
            </div>
            <div className="rounded border border-red-500/25 bg-red-500/5 p-4">
              <div className="mb-2 font-cinzel text-xs uppercase tracking-[0.15em] text-red-300">Azm&apos;s Trials</div>
              <p className="font-crimson text-base leading-relaxed text-parchment">
                Azm&apos;s ladder is driver-first. The programmer-analyst leads execution, explores deeper SQL features,
                tightens the query plan, and pushes the notebook toward stronger technical polish and optimization.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="font-cinzel text-[0.6rem] uppercase tracking-[0.25em] text-rune-dim">
          SQLNOIR paired trials - {totalTrials} total sessions
        </div>

        <TrialSection
          title="Kazi's Trials"
          subtitle="Navigator / Business Stakeholder lead sessions"
          accent="text-violet-300"
          accentSoft="border-violet-500/30 bg-violet-500/10 text-violet-200"
          trials={KAZI_TRIALS}
        />

        <TrialSection
          title="Azm's Trials"
          subtitle="Driver / Programmer-Analyst lead sessions"
          accent="text-red-300"
          accentSoft="border-red-500/30 bg-red-500/10 text-red-200"
          trials={AZM_TRIALS}
        />

        <div className="mt-10 border-t border-rune/10 pt-6 text-center">
          <p className="font-crimson text-sm italic text-mist">
            Rotate roles every session. By the end of the project, each partner should have completed five Kazi-led trials and five Azm-led trials worth of notebook work.
          </p>
          <Link
            href="/dungeon"
            className="mt-4 inline-flex items-center gap-2 font-cinzel text-[0.65rem] uppercase tracking-[0.15em] text-rune transition-colors hover:text-parchment"
          >
            &larr; Return to the Dungeon
          </Link>
        </div>
      </div>
    </div>
  )
}
