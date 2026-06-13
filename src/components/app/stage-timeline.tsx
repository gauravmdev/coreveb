import { projectProgress } from "@/lib/crm";
import type { Project } from "@/db/schema";

export function StageTimeline({
  project,
  compact = false,
}: {
  project: Pick<Project, "type" | "stageIndex" | "status">;
  compact?: boolean;
}) {
  const { stages, currentIndex, pct, isDone } = projectProgress(project);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-muted">
          Stage {Math.min(currentIndex + 1, stages.length)} of {stages.length}
        </span>
        <span className="font-mono text-brand-soft">{pct}%</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {!compact && (
        <ol className="mt-5 grid grid-cols-3 gap-y-4 sm:grid-cols-6">
          {stages.map((stage, i) => {
            const done = isDone || i < currentIndex;
            const current = !isDone && i === currentIndex;
            return (
              <li key={stage} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full border text-xs font-semibold ${
                    done
                      ? "border-accent/40 bg-accent/15 text-accent"
                      : current
                        ? "border-brand bg-brand/20 text-brand-soft shadow-glow"
                        : "border-border bg-surface text-muted"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`text-[11px] leading-tight ${
                    current ? "font-medium text-fg" : "text-muted"
                  }`}
                >
                  {stage}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
