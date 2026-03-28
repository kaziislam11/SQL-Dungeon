import Link from 'next/link'
import { CORE_SQLNOIR_QUESTS, SECRET_QUESTS } from '@/lib/quests'
import { AZM_TRIALS, KAZI_TRIALS } from '@/lib/data/paired-problems'

export default function HomePage() {
  const previewQuests = CORE_SQLNOIR_QUESTS.slice(0, 6)
  const trialCount = KAZI_TRIALS.length + AZM_TRIALS.length

  return (
    <main className="min-h-screen bg-abyss">
      <div className="pointer-events-none fixed inset-y-0 left-0 z-10 w-72 animate-flicker-l bg-[radial-gradient(ellipse_at_left_center,rgba(255,107,43,0.07)_0%,transparent_70%)]" />
      <div className="pointer-events-none fixed inset-y-0 right-0 z-10 w-72 animate-flicker-r bg-[radial-gradient(ellipse_at_right_center,rgba(255,107,43,0.07)_0%,transparent_70%)]" />

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_38px,rgba(255,255,255,0.012)_38px,rgba(255,255,255,0.012)_40px),repeating-linear-gradient(90deg,transparent,transparent_58px,rgba(255,255,255,0.008)_58px,rgba(255,255,255,0.008)_60px)]" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 animate-spin-slow rounded-full border border-rune/10" />
          <div className="absolute inset-10 animate-spin-medium rounded-full border border-gold/8" />
          <div className="absolute inset-24 animate-spin-fast rounded-full border border-rune/10" />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.07)_0%,transparent_65%)]" />
        </div>

        <p className="relative z-10 mb-8 animate-rise font-cinzel text-xs uppercase tracking-[0.4em] text-gold-dim opacity-0 [animation-delay:0.3s]">
          CSCI 331 · SQLNOIR project experience
        </p>

        <h1
          className="relative z-10 animate-rise font-cinzel font-black leading-none tracking-wider text-shadow-rune opacity-0 [animation-delay:0.5s]"
          style={{ fontSize: 'clamp(3.4rem,9vw,8rem)' }}
        >
          SQL:DUNGEON
          <span
            className="mt-2 block font-cinzel text-rune text-shadow-rune"
            style={{ fontSize: '0.34em', letterSpacing: '0.28em' }}
          >
            SQLNOIR MYSTERIES AND GUILD TRIALS
          </span>
        </h1>

        <div className="relative z-10 my-6 animate-rise text-xl tracking-[1rem] text-gold text-shadow-gold opacity-0 [animation-delay:0.8s]">
          * * * *
        </div>

        <p className="relative z-10 mx-auto mb-12 max-w-3xl animate-rise font-crimson text-lg italic leading-loose text-mist opacity-0 [animation-delay:1s]">
          A gamified T-SQL project for junior and senior CS majors. Solve ten multi-part SQLNOIR mysteries, document your
          work in notebook form, then switch into paired Kazi and Azm trials that simulate business stakeholder and
          programmer-analyst collaboration.
        </p>

        <div className="relative z-10 mb-14 grid gap-6 animate-rise opacity-0 [animation-delay:1.2s] sm:grid-cols-2 lg:grid-cols-4">
          {[
            [String(CORE_SQLNOIR_QUESTS.length), 'Core Mysteries', 'independent SQLNOIR cases'],
            ['4', 'Sections Each', 'one final integrated query'],
            [String(trialCount), 'Paired Trials', '5 Kazi + 5 Azm sessions'],
            [String(SECRET_QUESTS.length), 'Hidden Bonus Quests', 'scroll-unlocked extras'],
          ].map(([value, label, detail]) => (
            <div key={label} className="rounded border border-rune/15 bg-deep/80 px-6 py-5">
              <span className="block font-cinzel text-4xl font-bold text-gold text-shadow-gold">{value}</span>
              <span className="mt-1 block font-cinzel text-xs uppercase tracking-widest text-parchment">{label}</span>
              <span className="mt-2 block font-crimson text-sm text-mist">{detail}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 animate-rise opacity-0 [animation-delay:1.4s]">
          <Link
            href="/auth/signup"
            className="border border-rune-dim bg-rune/10 px-12 py-4 font-cinzel text-sm font-bold uppercase tracking-[0.3em] text-rune transition-all hover:-translate-y-0.5 hover:border-rune hover:bg-rune/25 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
          >
            Enter the Dungeon
          </Link>
          <Link
            href="/auth/login"
            className="font-cinzel text-xs uppercase tracking-[0.2em] text-mist transition-colors hover:text-parchment"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </section>

      <div className="overflow-hidden whitespace-nowrap border-y border-gold/20 bg-gradient-to-r from-[#1a0e2e] via-[#0f0a1a] to-[#1a0e2e] py-2.5 font-cinzel text-xs uppercase tracking-[0.15em] text-gold-dim">
        <span className="inline-block animate-marquee">
          {Array(2)
            .fill('SQL notebooks · Azure Data Studio · SSMS · VS Code · CTEs · recursive CTEs · joins · subqueries · window functions · PIVOT · UDF thinking · optimization · GitHub group submission · ')
            .join('')}
        </span>
      </div>

      <section className="border-b border-rune/10 bg-deep py-20">
        <div className="mx-auto max-w-6xl px-8">
          <p className="mb-2 flex items-center gap-3 font-cinzel text-xs uppercase tracking-[0.35em] text-rune-dim before:text-gold before:content-['*']">
            Project Goals <span className="h-px flex-1 bg-rune/15" />
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Deep T-SQL', 'Build fluency with joins, aggregations, CTEs, functions, recursive logic, and more advanced query patterns.'],
              ['Notebook Storytelling', 'Document narrative reasoning, query evolution, results, and recommendations in a polished notebook workflow.'],
              ['Industry Practice', 'Alternate stakeholder and analyst roles, communicate clearly, and turn SQL output into real business decisions.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded border border-rune/15 bg-stone p-5">
                <div className="mb-2 font-cinzel text-sm uppercase tracking-[0.12em] text-parchment">{title}</div>
                <p className="font-crimson text-base leading-relaxed text-mist">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-rune/10 bg-deep py-24">
        <div className="mx-auto max-w-6xl px-8">
          <p className="mb-2 flex items-center gap-3 font-cinzel text-xs uppercase tracking-[0.35em] text-rune-dim before:text-gold before:content-['*']">
            SQLNOIR Mysteries <span className="h-px flex-1 bg-rune/15" />
          </p>
          <h2 className="font-cinzel text-4xl font-bold text-parchment text-shadow-rune">
            Ten core independent mysteries
            <span className="mt-1 block font-cinzel text-base font-normal tracking-[0.15em] text-mist">
              sections 1-3 gather clues, section 4 combines everything into one final answer
            </span>
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {previewQuests.map(quest => (
              <div key={quest.id} className="relative border border-rune/20 bg-stone p-7 transition-all hover:-translate-y-1 hover:border-rune-dim">
                <span className={`absolute right-4 top-4 border px-2 py-0.5 font-cinzel text-[0.5rem] uppercase tracking-[0.15em] ${quest.rankClass}`}>
                  {quest.rank}
                </span>
                <p className="mb-2 font-cinzel text-[0.55rem] uppercase tracking-widest text-mist">{quest.id}</p>
                <h3 className="mb-2 font-cinzel text-base font-bold leading-snug text-parchment">{quest.title}</h3>
                <p className="mb-4 font-crimson text-sm italic leading-relaxed text-mist">{quest.lore}</p>
                <div className="mb-3 flex flex-wrap gap-1">
                  {quest.tags.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      className="border border-rune/25 bg-rune/5 px-2 py-0.5 font-cinzel text-[0.5rem] uppercase tracking-[0.1em] text-rune-dim"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span key={index} className={`text-xs ${index < quest.diff ? 'text-gold' : 'text-gold/20'}`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ['I', 'Clue Gathering', 'Filter, join, and surface the first evidence.'],
              ['II', 'Cross-Reference', 'Use deeper joins and subqueries to narrow the field.'],
              ['III', 'Analysis', 'Apply functions, aggregates, and advanced reasoning.'],
              ['IV', 'Verdict', 'Deliver one integrated answer with the final SQLNOIR solution.'],
            ].map(([floor, title, description]) => (
              <div key={floor} className="border border-rune/15 bg-abyss p-6 text-center transition-colors hover:bg-stone">
                <div className="mb-2 font-cinzel text-3xl font-black text-rune text-shadow-rune">{floor}</div>
                <div className="mb-1 font-cinzel text-xs uppercase tracking-widest text-parchment">{title}</div>
                <div className="font-crimson text-sm italic leading-relaxed text-mist">{description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-rune/10 bg-deep py-24">
        <div className="mx-auto max-w-6xl px-8">
          <p className="mb-2 flex items-center gap-3 font-cinzel text-xs uppercase tracking-[0.35em] text-rune-dim before:text-gold before:content-['*']">
            Guild Contracts <span className="h-px flex-1 bg-rune/15" />
          </p>
          <h2 className="font-cinzel text-4xl font-bold text-parchment text-shadow-rune">
            Kazi&apos;s Trials and Azm&apos;s Trials
            <span className="mt-1 block font-cinzel text-base font-normal tracking-[0.15em] text-mist">
              paired real-world SQL sessions with role rotation, notebook deliverables, and business recommendations
            </span>
          </h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded border border-violet-500/25 bg-violet-500/5 p-6">
              <div className="mb-2 font-cinzel text-xs uppercase tracking-[0.15em] text-violet-300">Kazi&apos;s Trials</div>
              <p className="font-crimson text-base leading-relaxed text-parchment">
                Five navigator-led sessions. The stakeholder guides the business framing, clarifies requirements, and explains why each query matters before the driver writes it.
              </p>
            </div>
            <div className="rounded border border-red-500/25 bg-red-500/5 p-6">
              <div className="mb-2 font-cinzel text-xs uppercase tracking-[0.15em] text-red-300">Azm&apos;s Trials</div>
              <p className="font-crimson text-base leading-relaxed text-parchment">
                Five driver-led sessions. The programmer-analyst pushes deeper SQL, tighter execution, refinement, and technical polish while still meeting the business objective.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="border border-gold/25 bg-gold/10 px-8 py-3 font-cinzel text-sm font-bold uppercase tracking-[0.2em] text-gold transition-all hover:-translate-y-0.5 hover:bg-gold/20"
            >
              Start the Project
            </Link>
            <Link
              href="/auth/login"
              className="border border-rune/20 px-8 py-3 font-cinzel text-sm uppercase tracking-[0.2em] text-rune transition-colors hover:border-rune hover:text-parchment"
            >
              View the Dungeon
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
