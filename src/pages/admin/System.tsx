import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Database, 
  Cpu, 
  HardDrive, 
  Terminal, 
  RefreshCw,
  Play
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const System = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const systemStats = {
    cpu: '14%',
    memory: '1.2 GB / 4.0 GB',
    storage: '32.1 GB / 100 GB',
    uptime: '14d 6h 23m'
  };

  const logs = [
    { id: 1, type: 'INFO', msg: 'Database backup successfully committed', time: '10:45 AM' },
    { id: 2, type: 'WARN', msg: 'Elevated latency detected on /api/attendance/scan', time: '10:12 AM' },
    { id: 3, type: 'INFO', msg: 'Teacher signup request for Emily Carter received', time: '09:55 AM' },
    { id: 4, type: 'ERROR', msg: 'Failed authentication check for student_test@edu.com', time: '08:30 AM' },
  ];

  const handleBackup = () => {
    toast({
      title: "Backup Initiated",
      description: "Writing users.json, sessions.json, and attendance.json to safe storage...",
    });
  };

  const handleRefreshStats = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Stats Refreshed",
        description: "System logs and memory allocation stats have been reloaded.",
      });
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">System Telemetry & Audit Logs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Monitor system runtime, database file storage integrity, and operational server metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">CPU Usage</p>
            <h3 className="font-bold text-2xl text-gray-900 mt-1">{systemStats.cpu}</h3>
          </div>
          <Cpu className="h-8 w-8 text-primary/45" />
        </Card>
        <Card className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Memory Usage</p>
            <h3 className="font-bold text-lg text-gray-900 mt-2">{systemStats.memory}</h3>
          </div>
          <HardDrive className="h-8 w-8 text-primary/45" />
        </Card>
        <Card className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Database Storage</p>
            <h3 className="font-bold text-lg text-gray-900 mt-2">{systemStats.storage}</h3>
          </div>
          <Database className="h-8 w-8 text-primary/45" />
        </Card>
        <Card className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">System Uptime</p>
            <h3 className="font-bold text-lg text-gray-900 mt-2">{systemStats.uptime}</h3>
          </div>
          <Shield className="h-8 w-8 text-emerald-500/45" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diagnostics & Operations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" /> Maintenance & Operations
              </CardTitle>
              <CardDescription>Administrative database scripts and state control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Maintenance Mode</h4>
                  <p className="text-xs text-muted-foreground">Temporarily block non-admin logins</p>
                </div>
                <Switch 
                  checked={maintenanceMode} 
                  onCheckedChange={(checked) => {
                    setMaintenanceMode(checked);
                    toast({
                      title: checked ? "Maintenance Mode Activated" : "Maintenance Mode Deactivated",
                      description: checked ? "Non-admin user log-ins will be locked." : "Standard portal is back online.",
                      variant: checked ? "destructive" : "default"
                    });
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <Button onClick={handleBackup} className="gap-2">
                  <Database className="h-4 w-4" /> Trigger Database Backup
                </Button>
                <Button variant="outline" onClick={handleRefreshStats} disabled={refreshing} className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${refreshing && 'animate-spin'}`} /> Refetch Stats
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System logs console */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" /> System Events console
              </CardTitle>
              <CardDescription>Live streaming API logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-muted/40 rounded-lg flex items-center justify-between gap-4 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    {log.type === 'INFO' && <Badge className="bg-blue-500 hover:bg-blue-600 border-0 text-[10px] px-1.5 py-0.5">INFO</Badge>}
                    {log.type === 'WARN' && <Badge className="bg-amber-500 hover:bg-amber-600 border-0 text-[10px] px-1.5 py-0.5">WARN</Badge>}
                    {log.type === 'ERROR' && <Badge className="bg-red-500 hover:bg-red-600 border-0 text-[10px] px-1.5 py-0.5">ERROR</Badge>}
                    <span className="text-gray-700 font-medium">{log.msg}</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">{log.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Info panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environment Info</CardTitle>
              <CardDescription>Application configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Framework</span>
                <span className="text-gray-900">Vite (React + TS)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Styling Engine</span>
                <span className="text-gray-900">TailwindCSS</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Server Connection</span>
                <span className="text-gray-900">Active (express)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Local Environment</span>
                <span className="text-gray-900">Development</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
