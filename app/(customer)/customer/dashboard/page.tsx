'use client';

import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectCard } from '@/components/project/ProjectCard';
import { DashboardStatsGrid, DashboardStatsSkeleton } from '@/components/customer/DashboardStats';
import { RecentActivity, RecentActivitySkeleton } from '@/components/customer/RecentActivity';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useProjects, useDashboardStats, useActivityFeed } from '@/lib/api/projects';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CustomerDashboardPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? 'usr_cust_001'; // fallback for dev

  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats(userId);
  const { data: projects, isLoading: projectsLoading } = useProjects(userId);
  const { data: activity, isLoading: activityLoading } = useActivityFeed(userId);

  const recentProjects = projects?.slice(0, 3) ?? [];

  return (
    <div className="space-y-8 animate-page-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your projects
          </p>
        </div>
        <Button
          asChild
          className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link href="/customer/projects/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Dashboard statistics</h2>
        {statsLoading ? (
          <DashboardStatsSkeleton />
        ) : statsError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load statistics. Please refresh.
          </div>
        ) : stats ? (
          <DashboardStatsGrid stats={stats} />
        ) : null}
      </section>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <section className="lg:col-span-2" aria-labelledby="recent-projects-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-projects-heading" className="font-serif text-lg font-semibold text-foreground">
              Recent Projects
            </h2>
            <Link
              href="/customer/projects"
              className="text-sm text-accent underline underline-offset-2 hover:text-accent/80"
            >
              View all
            </Link>
          </div>

          {projectsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="ivory-card rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            /* Empty state + CTA */
            <div className="neu-card-3d rounded-2xl p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Sparkles className="h-7 w-7 text-accent" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground">
                Start your first project
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us about your space and get bids from verified vendors.
              </p>
              <Button
                asChild
                className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/customer/projects/new">
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Create Project
                </Link>
              </Button>
            </div>
          )}
        </section>

        {/* Activity Feed */}
        <section aria-labelledby="activity-heading">
          <div className="mb-4">
            <h2 id="activity-heading" className="font-serif text-lg font-semibold text-foreground">
              Recent Activity
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-5">
            {activityLoading ? (
              <RecentActivitySkeleton />
            ) : (
              <RecentActivity events={activity ?? []} />
            )}
          </div>
        </section>
      </div>

      {/* Create New Project CTA Card */}
      <section aria-labelledby="cta-heading">
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{
            background: 'linear-gradient(135deg, hsl(0 0% 5%) 0%, hsl(0 0% 8%) 100%)',
          }}
        >
          {/* Background glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse 60% 80% at 80% 50%, hsl(45 65% 52% / 0.2), transparent)',
            }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="cta-heading" className="font-serif text-xl font-semibold text-white">
                Ready to transform your space?
              </h2>
              <p className="mt-1 text-sm text-white/60">
                Create a new project and get competitive bids from verified vendors.
              </p>
            </div>
            <Button
              asChild
              className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/customer/projects/new">
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Create New Project
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
