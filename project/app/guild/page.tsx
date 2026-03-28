import Link from 'next/link'
import {
  CONTRACT_EVALUATION_CRITERIA,
  CONTRACT_PROCESS_STEPS,
  DUNGEON_CONTRACTS,
  type DungeonContract,
} from '@/lib/data/dungeon-contracts'

function ContractCard({ contract }: { contract: DungeonContract }) {
  return (
    <article className="rounded-sm border border-rune/15 bg-stone transition-colors hover:border-rune/30">
      <div className="flex items-start justify-between gap-4 border-b border-rune/10 px-6 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-cinzel text-[0.55rem] uppercase tracking-[0.18em] text-mist">
              Proposition {contract.proposition}
            </span>
            <span className="border border-rune/20 bg-rune/5 px-2 py-0.5 font-cinzel text-[0.55rem] uppercase tracking-[0.12em] text-rune">
              {contract.leadRole} opens
            </span>
          </div>
          <h2 className="mt-2 font-cinzel text-xl font-bold text-parchment">{contract.title}</h2>
        </div>

        <div className="flex flex-wrap justify-end gap-1.5">
          {contract.tags.map(tag => (
            <span
              key={tag}
              className="border border-rune/20 bg-abyss px-2 py-0.5 font-mono text-[0.55rem] text-rune-dim"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 py-4">
        <p className="font-crimson text-base italic leading-relaxed text-parchment/90">{contract.scenario}</p>
      </div>

      <div className="grid gap-4 px-6 pb-4 lg:grid-cols-2">
        <div className="rounded-sm border border-rune/15 bg-deep p-4">
          <div className="mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-rune">Navigator</div>
          <p className="font-crimson text-sm leading-relaxed text-mist">{contract.navigatorRole}</p>
        </div>
        <div className="rounded-sm border border-rune/15 bg-deep p-4">
          <div className="mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-gold">Driver</div>
          <p className="font-crimson text-sm leading-relaxed text-mist">{contract.driverRole}</p>
        </div>
      </div>

      <div className="grid gap-6 border-t border-rune/10 px-6 py-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-mist">Business Questions</div>
          <ol className="flex flex-col gap-1.5">
            {contract.requirements.map((requirement, index) => (
              <li key={index} className="flex gap-2">
                <span className="mt-0.5 shrink-0 font-cinzel text-[0.6rem] text-rune">{index + 1}.</span>
                <span className="font-crimson text-sm text-parchment">{requirement}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-mist">Notebook Finish</div>
          <ul className="flex flex-col gap-1.5">
            {contract.deliverables.map((deliverable, index) => (
              <li key={index} className="flex gap-2 font-crimson text-sm text-parchment">
                <span className="mt-0.5 shrink-0 text-gold">*</span>
                {deliverable}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-rune/10 px-6 py-4">
        <div className="mb-3 font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-mist">Starter Queries</div>
        <div className="grid gap-3 lg:grid-cols-3">
          {contract.starterQueries.map(starter => (
            <div key={starter.label} className="rounded-sm border border-rune/10 bg-abyss p-3">
              <div className="mb-1.5 font-cinzel text-[0.6rem] uppercase tracking-wide text-rune">{starter.label}</div>
              <p className="mb-3 font-crimson text-sm italic leading-relaxed text-mist">{starter.desc}</p>
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[0.7rem] leading-relaxed text-parchment/80">
                {starter.query}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function GuildPage() {
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
            Dungeon Contracts
          </h1>
          <p className="mt-2 font-crimson text-lg italic text-mist">
            Ten paired real-world SQL propositions built for role rotation, notebook work, and business-facing recommendations.
          </p>
        </div>
      </div>

      <div className="border-b border-rune/10 bg-deep/60 px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['10', 'Propositions', 'paired real-world sessions'],
              ['1-2h', 'Expected Length', 'scheduled outside class'],
              ['T-SQL', 'Required', 'CTEs, subqueries, functions, optimization'],
              ['Notebook', 'Submission Trail', 'notes, query evolution, recommendations'],
            ].map(([value, label, detail]) => (
              <div key={label} className="rounded-sm border border-rune/15 bg-stone p-4 text-center">
                <div className="font-cinzel text-2xl font-bold text-gold">{value}</div>
                <div className="mt-1 font-cinzel text-[0.6rem] uppercase tracking-[0.15em] text-parchment">{label}</div>
                <div className="mt-1 font-crimson text-sm text-mist">{detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-sm border border-rune/20 bg-rune/5 p-4">
              <div className="mb-2 font-cinzel text-xs uppercase tracking-[0.15em] text-rune">Overview</div>
              <p className="font-crimson text-base leading-relaxed text-parchment">
                Students pair up, alternate Navigator and Driver responsibilities, and solve a business problem in shared notebook form.
                The goal is not just correct SQL, but a usable recommendation backed by clear evidence.
              </p>
            </div>
            <div className="rounded-sm border border-gold/20 bg-gold/5 p-4">
              <div className="mb-2 font-cinzel text-xs uppercase tracking-[0.15em] text-gold">Process</div>
              <ul className="flex flex-col gap-2">
                {CONTRACT_PROCESS_STEPS.map(step => (
                  <li key={step} className="flex gap-2 font-crimson text-sm leading-relaxed text-parchment">
                    <span className="mt-0.5 shrink-0 text-gold">*</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-sm border border-fire/20 bg-fire/5 p-4">
              <div className="mb-2 font-cinzel text-xs uppercase tracking-[0.15em] text-fire">Evaluation</div>
              <ul className="flex flex-col gap-2">
                {CONTRACT_EVALUATION_CRITERIA.map(item => (
                  <li key={item} className="flex gap-2 font-crimson text-sm leading-relaxed text-parchment">
                    <span className="mt-0.5 shrink-0 text-fire">*</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="font-cinzel text-[0.6rem] uppercase tracking-[0.25em] text-rune-dim">
          Paired problem-solving ladder - {DUNGEON_CONTRACTS.length} total propositions
        </div>

        <div className="mt-8 flex flex-col gap-6">
          {DUNGEON_CONTRACTS.map(contract => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>

        <div className="mt-10 border-t border-rune/10 pt-6 text-center">
          <p className="font-crimson text-sm italic text-mist">
            Rotate roles every session. By the end of the project, each partner should have a complete notebook trail of ten paired propositions, role notes, and final recommendations.
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
