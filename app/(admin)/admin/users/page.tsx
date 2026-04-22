'use client';



const MOCK_USERS = [
  { id: 'usr_cust_001', name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'CUSTOMER', status: 'ACTIVE' },
  { id: 'usr_cust_002', name: 'Rahul Mehta', email: 'rahul.mehta@example.com', role: 'CUSTOMER', status: 'ACTIVE' },
  { id: 'usr_vend_001', name: 'Arjun Kapoor', email: 'arjun.interiors@example.com', role: 'VENDOR', status: 'ACTIVE' },
  { id: 'usr_vend_002', name: 'Sneha Patel', email: 'designcraft@example.com', role: 'VENDOR', status: 'SUSPENDED' },
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'hsl(142 71% 45%)',
  SUSPENDED: 'hsl(0 72% 60%)',
  BANNED: 'hsl(0 72% 40%)',
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ban, suspend, or reinstate platform users.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['User', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((u) => {
              const color = STATUS_COLORS[u.status] ?? 'hsl(0 0% 50%)';
              return (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent font-serif">
                        {u.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-foreground capitalize">{u.role.toLowerCase()}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${color}15`, color }}>
                      {u.status.charAt(0) + u.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {u.status === 'ACTIVE' ? (
                        <button type="button" className="rounded-lg border border-amber-400/40 px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">Suspend</button>
                      ) : (
                        <button type="button" className="rounded-lg border border-emerald-400/40 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">Reinstate</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
