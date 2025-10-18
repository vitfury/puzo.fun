import { DailyActivityChecklist } from '../components/activities/DailyActivityChecklist';
import { MusicWalkCard } from '../components/activities/MusicWalkCard';
import { Layout } from '../components/Layout';

export function ActivitiesPage() {
  return (
    <Layout>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side: Daily Activities Checklist (2 columns on large screens) */}
          <div className="lg:col-span-2">
            <DailyActivityChecklist />
          </div>

          {/* Right side: Music Walk Card (1 column on large screens) */}
          <div className="lg:col-span-1">
            <MusicWalkCard />
          </div>
        </div>
      </div>
    </Layout>
  );
}
