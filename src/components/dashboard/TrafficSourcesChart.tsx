import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Globe, Smartphone, Monitor, Tablet } from 'lucide-react';
import { parseReferrerSource } from '@/hooks/useTrackPageVisit';

interface TrafficSourcesChartProps {
  pageId: string;
  pageName?: string;
}

interface VisitData {
  referrer: string | null;
  utm_source: string | null;
  device_type: string | null;
  created_at: string;
}

interface SourceData {
  name: string;
  value: number;
  color: string;
}

const COLORS = [
  '#8B5CF6', // Primary purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

const TrafficSourcesChart = ({ pageId, pageName }: TrafficSourcesChartProps) => {
  const [loading, setLoading] = useState(true);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [deviceData, setDeviceData] = useState<SourceData[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!pageId) return;
      
      try {
        const { data, error } = await supabase
          .from('page_visits')
          .select('referrer, utm_source, device_type, created_at, ip_hash')
          .eq('page_id', pageId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          setSourceData([]);
          setDeviceData([]);
          setTotalVisits(0);
          setUniqueVisitors(0);
          setLoading(false);
          return;
        }

        // Calculate total and unique visits
        setTotalVisits(data.length);
        const uniqueHashes = new Set(data.map((v: any) => v.ip_hash).filter(Boolean));
        setUniqueVisitors(uniqueHashes.size);

        // Process traffic sources
        const sourceCounts: Record<string, number> = {};
        
        data.forEach((visit: VisitData) => {
          let source = 'Direto / Desconhecido';
          
          // Priority: utm_source > parsed referrer > direct
          if (visit.utm_source) {
            source = visit.utm_source.charAt(0).toUpperCase() + visit.utm_source.slice(1);
          } else if (visit.referrer) {
            const parsed = parseReferrerSource(visit.referrer);
            if (parsed) {
              source = parsed;
            }
          }
          
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        // Sort and take top 5
        const sortedSources = Object.entries(sourceCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length],
          }));

        setSourceData(sortedSources);

        // Process device types
        const deviceCounts: Record<string, number> = {
          mobile: 0,
          desktop: 0,
          tablet: 0,
        };
        
        data.forEach((visit: VisitData) => {
          const device = visit.device_type || 'desktop';
          deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        });

        const deviceColors = {
          mobile: '#10B981',
          desktop: '#3B82F6',
          tablet: '#F59E0B',
        };

        const deviceLabels = {
          mobile: 'Mobile',
          desktop: 'Desktop',
          tablet: 'Tablet',
        };

        const sortedDevices = Object.entries(deviceCounts)
          .filter(([_, value]) => value > 0)
          .sort((a, b) => b[1] - a[1])
          .map(([key, value]) => ({
            name: deviceLabels[key as keyof typeof deviceLabels] || key,
            value,
            color: deviceColors[key as keyof typeof deviceColors] || '#6B7280',
          }));

        setDeviceData(sortedDevices);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [pageId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (totalVisits === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Origem do Tráfego
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Nenhuma visita registrada ainda.</p>
            <p className="text-xs mt-1">Os dados aparecerão quando sua página receber visitas.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {/* Traffic Sources */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Origem do Tráfego
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {totalVisits} visitas • {uniqueVisitors} visitantes únicos
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} visitas`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  formatter={(value, entry: any) => (
                    <span className="text-xs text-foreground">
                      {value} ({entry.payload.value})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Device Types */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Dispositivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deviceData.map((device) => {
              const percentage = Math.round((device.value / totalVisits) * 100);
              const Icon = device.name === 'Mobile' ? Smartphone : device.name === 'Tablet' ? Tablet : Monitor;
              
              return (
                <div key={device.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: device.color }} />
                      <span>{device.name}</span>
                    </div>
                    <span className="font-medium">{device.value} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: device.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficSourcesChart;
