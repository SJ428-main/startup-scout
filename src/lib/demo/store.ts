import type {
  AgentRun,
  Company,
  Notification,
  ResearchAnalysis,
  Source,
  StartupScore,
} from "@/types";

export interface TimelineEvent {
  id: string;
  company_id: string;
  company_name: string;
  stage: string;
  timestamp: string;
  details: string;
}

interface DemoStore {
  companies: Company[];
  research: ResearchAnalysis[];
  scores: StartupScore[];
  agent_runs: AgentRun[];
  notifications: Notification[];
  sources: Source[];
  timeline: TimelineEvent[];
}

export interface DemoStoreApi {
  store: DemoStore;
  query: <T>(sql: string, params?: Record<string, unknown>) => T[];
  insert: (table: string, rows: Record<string, unknown>[]) => void;
  reset: () => void;
  updateCompanyStatus: (id: string, status: Company["status"]) => void;
  updateAgentRun: (
    id: string,
    update: Partial<
      Pick<
        AgentRun,
        "status" | "completed_at" | "items_processed" | "error_message"
      >
    >
  ) => void;
}

let store: DemoStore | null = null;

export function getDemoStore(): DemoStoreApi {
  if (!store) {
    store = createEmptyStore();
  }

  return {
    store,
    query: <T>(sql: string, _params?: Record<string, unknown>): T[] => {
      const s = sql.toLowerCase();

      if (s.includes("from companies")) {
        if (s.includes("order by discovered_at desc")) {
          return [...store!.companies].reverse() as T[];
        }
        if (s.includes("where status =")) {
          const status = _params?.status as string;
          return store!.companies.filter((c) => c.status === status) as T[];
        }
        if (s.includes("where id =")) {
          return store!.companies.filter(
            (c) => c.id === _params?.id
          ) as T[];
        }
        return store!.companies as T[];
      }

      if (s.includes("from scores")) {
        if (s.includes("order by total_score desc")) {
          return [...store!.scores].sort(
            (a, b) => b.total_score - a.total_score
          ) as T[];
        }
        if (s.includes("where company_id =")) {
          return store!.scores.filter(
            (sc) => sc.company_id === _params?.company_id
          ) as T[];
        }
        return store!.scores as T[];
      }

      if (s.includes("from research")) {
        if (s.includes("where company_id =")) {
          return store!.research.filter(
            (r) => r.company_id === _params?.company_id
          ) as T[];
        }
        return store!.research as T[];
      }

      if (s.includes("from agent_runs")) {
        const runs = [...store!.agent_runs].sort(
          (a, b) =>
            new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        );
        if (s.includes("limit")) {
          const limit = (_params?.limit as number) ?? 50;
          return runs.slice(0, limit) as T[];
        }
        return runs as T[];
      }

      if (s.includes("from notifications")) {
        return [...store!.notifications].reverse() as T[];
      }

      if (s.includes("from sources")) {
        return store!.sources as T[];
      }

      if (s.includes("count()")) {
        if (s.includes("from companies")) {
          return [{ count: store!.companies.length }] as T[];
        }
        if (s.includes("from agent_runs")) {
          return [{ count: store!.agent_runs.length }] as T[];
        }
        if (s.includes("from notifications")) {
          return [{ count: store!.notifications.length }] as T[];
        }
      }

      if (s.includes("max(total_score)")) {
        const max = store!.scores.reduce(
          (m, sc) => Math.max(m, sc.total_score),
          0
        );
        return [{ max_score: max }] as T[];
      }

      return [];
    },
    insert: (table: string, rows: Record<string, unknown>[]) => {
      const key = table.replace("startup_scout.", "") as keyof DemoStore;
      if (key in store!) {
        (store![key] as unknown[]).push(...rows);
      }
    },
    reset: () => {
      store = createEmptyStore();
    },
    updateCompanyStatus: (id: string, status: Company["status"]) => {
      const company = store!.companies.find((c) => c.id === id);
      if (company) company.status = status;
    },
    updateAgentRun: (id, update) => {
      const run = store!.agent_runs.find((r) => r.id === id);
      if (run) Object.assign(run, update);
    },
  };
}

function createEmptyStore(): DemoStore {
  return {
    companies: [],
    research: [],
    scores: [],
    agent_runs: [],
    notifications: [],
    sources: [],
    timeline: [],
  };
}

export function initDemoStore(data: Partial<DemoStore>): void {
  const demo = getDemoStore();
  if (data.companies) demo.store.companies = data.companies;
  if (data.research) demo.store.research = data.research;
  if (data.scores) demo.store.scores = data.scores;
  if (data.agent_runs) demo.store.agent_runs = data.agent_runs;
  if (data.notifications) demo.store.notifications = data.notifications;
  if (data.sources) demo.store.sources = data.sources;
  if (data.timeline) demo.store.timeline = data.timeline;
}

export function getDemoTimeline(): TimelineEvent[] {
  return getDemoStore().store.timeline;
}

export function addDemoTimelineEvent(event: TimelineEvent): void {
  getDemoStore().store.timeline.unshift(event);
}
