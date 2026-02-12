import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Users, Smartphone, Monitor, Tablet, TrendingUp, Calendar, Loader2, Globe, MousePointerClick, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { parseReferrerSource } from "@/hooks/useTrackPageVisit";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface PageOption {
  id: string;
  page_name: string | null;
  slug: string;
  template_type: string;
  source: 'landing' | 'cloned';
}

interface VisitRow {
  referrer: string | null;
  utm_source: string | null;
  device_type: string | null;
  created_at: string;
  ip_hash: string | null;
}

interface TrackingRow {
  viewer_fingerprint: string;
  viewed_at: string;
}

interface CtaClickRow {
  created_at: string;
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#6366F1', '#14B8A6'];

const AnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pages, setPages] = useState<PageOption[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [tracking, setTracking] = useState<TrackingRow[]>([]);
  const [ctaClicks, setCtaClicks] = useState<CtaClickRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);

  // Fetch user pages
  useEffect(() => {
    if (!user) return;
    const fetchPages = async () => {
      const [{ data: lp }, { data: cp }, { data: prof }] = await Promise.all([
        supabase.from("landing_pages").select("id, page_name, slug, template_type").eq("user_id", user.id).order("updated_at", { ascending: false }),
        supabase.from("cloned_pages").select("id, page_name, slug").eq("user_id", user.id).order("updated_at", { ascending: false }),
        supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
      ]);
      const landingPages: PageOption[] = (lp || []).map(p => ({ ...p, source: 'landing' as const }));
      const clonedPages: PageOption[] = (cp || []).map(p => ({ ...p, template_type: 'cloned', source: 'cloned' as const }));
      setPages([...landingPages, ...clonedPages]);
      setProfile(prof);
      setSelectedPageId("all");
    };
    fetchPages();
  }, [user]);

  // Fetch analytics data
  useEffect(() => {
    if (!user || pages.length === 0) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const daysAgo = parseInt(dateRange);
      const since = new Date();
      since.setDate(since.getDate() - daysAgo);
      const sinceISO = since.toISOString();

      const pageIds = selectedPageId === "all" ? pages.map(p => p.id) : [selectedPageId];

      // Fetch visits
      let visitsQuery = supabase
        .from("page_visits")
        .select("referrer, utm_source, device_type, created_at, ip_hash")
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: true });

      if (selectedPageId !== "all") {
        visitsQuery = visitsQuery.eq("page_id", selectedPageId);
      } else {
        visitsQuery = visitsQuery.in("page_id", pageIds);
      }

      // Fetch tracking for unique visitors
      let trackingQuery = supabase
        .from("page_view_tracking")
        .select("viewer_fingerprint, viewed_at")
        .gte("viewed_at", sinceISO);

      if (selectedPageId !== "all") {
        trackingQuery = trackingQuery.eq("page_id", selectedPageId);
      } else {
        trackingQuery = trackingQuery.in("page_id", pageIds);
      }

      // Fetch CTA clicks
      let ctaQuery = supabase
        .from("cta_clicks")
        .select("created_at")
        .gte("created_at", sinceISO);

      if (selectedPageId !== "all") {
        ctaQuery = ctaQuery.eq("page_id", selectedPageId);
      } else {
        ctaQuery = ctaQuery.in("page_id", pageIds);
      }

      const [{ data: vData }, { data: tData }, { data: cData }] = await Promise.all([
        visitsQuery,
        trackingQuery,
        ctaQuery,
      ]);

      setVisits(vData || []);
      setTracking(tData || []);
      setCtaClicks(cData || []);
      setLoading(false);
    };
    fetchData();
  }, [user, pages, selectedPageId, dateRange]);

  // KPIs
  const totalVisits = visits.length;
  const totalCtaClicks = ctaClicks.length;
  const ctr = totalVisits > 0 ? ((totalCtaClicks / totalVisits) * 100).toFixed(1) : '0.0';
  const uniqueVisitors = useMemo(() => {
    const ips = new Set(visits.map(v => v.ip_hash).filter(Boolean));
    return ips.size || new Set(tracking.map(t => t.viewer_fingerprint).filter(Boolean)).size;
  }, [visits, tracking]);

  // Daily line chart
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    const daysAgo = parseInt(dateRange);
    // Prefill dates
    for (let i = daysAgo - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }
    visits.forEach(v => {
      const key = v.created_at.slice(0, 10);
      if (map[key] !== undefined) map[key]++;
    });
    return Object.entries(map).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      visitas: count,
    }));
  }, [visits, dateRange]);

  // Device donut
  const deviceData = useMemo(() => {
    const counts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
    visits.forEach(v => {
      const d = v.device_type || "desktop";
      counts[d] = (counts[d] || 0) + 1;
    });
    const labels: Record<string, string> = { mobile: "Mobile", desktop: "Desktop", tablet: "Tablet" };
    const colors: Record<string, string> = { mobile: "#10B981", desktop: "#3B82F6", tablet: "#F59E0B" };
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || "#6B7280" }));
  }, [visits]);

  // Source table
  const sourceTable = useMemo(() => {
    const counts: Record<string, number> = {};
    visits.forEach(v => {
      let source = "Direto";
      if (v.utm_source) {
        source = v.utm_source.charAt(0).toUpperCase() + v.utm_source.slice(1);
      } else if (v.referrer) {
        const parsed = parseReferrerSource(v.referrer);
        if (parsed) source = parsed;
      }
      counts[source] = (counts[source] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value], i) => ({ name, value, pct: totalVisits > 0 ? Math.round((value / totalVisits) * 100) : 0, color: COLORS[i % COLORS.length] }));
  }, [visits, totalVisits]);

  const DeviceIcon = ({ name }: { name: string }) => {
    if (name === "Mobile") return <Smartphone className="w-4 h-4" />;
    if (name === "Tablet") return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <DashboardLayout avatarUrl={profile?.avatar_url} fullName={profile?.full_name}>
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Analytics Avançado</h1>
              <p className="text-sm text-muted-foreground">Dados reais das suas páginas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Page selector */}
            <Select value={selectedPageId} onValueChange={setSelectedPageId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione a página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as páginas</SelectItem>
                {pages.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.source === 'cloned' ? '🔗 ' : ''}{p.page_name || p.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date range */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-0 shadow-card">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Visitas Totais</p>
                      <p className="text-2xl font-bold text-foreground">{totalVisits.toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Únicos</p>
                      <p className="text-2xl font-bold text-foreground">{uniqueVisitors.toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <MousePointerClick className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Cliques CTA</p>
                      <p className="text-2xl font-bold text-foreground">{totalCtaClicks.toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                      <Percent className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">CTR</p>
                      <p className="text-2xl font-bold text-foreground">{ctr}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Line Chart - Daily visits */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Evolução Diária de Visitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalVisits === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    Nenhuma visita registrada neste período.
                  </div>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          interval={Math.max(0, Math.floor(dailyData.length / 8))}
                        />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="visitas"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bottom row: Donut + Source Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Donut */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Dispositivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deviceData.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">Sem dados.</div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="h-[200px] w-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                              {deviceData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value: number) => [`${value} visitas`, ""]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-3 w-full">
                        {deviceData.map(d => {
                          const pct = totalVisits > 0 ? Math.round((d.value / totalVisits) * 100) : 0;
                          return (
                            <div key={d.name} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <DeviceIcon name={d.name} />
                                  <span>{d.name}</span>
                                </div>
                                <span className="font-medium">{d.value} ({pct}%)</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Source Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Top Origens de Tráfego
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sourceTable.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">Sem dados.</div>
                  ) : (
                    <div className="space-y-2">
                      {sourceTable.map((s, i) => (
                        <div key={s.name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                          <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="flex-1 text-sm font-medium text-foreground truncate">{s.name}</span>
                          <span className="text-sm text-muted-foreground">{s.value}</span>
                          <span className="text-xs text-muted-foreground w-10 text-right">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
