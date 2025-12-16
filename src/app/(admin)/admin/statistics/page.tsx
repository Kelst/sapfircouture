import { Eye, TrendingUp, Calendar, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  getViewsStats,
  getTopDresses,
  getDressCount,
} from "@/actions/statistics.actions";

export default async function StatisticsPage() {
  const [stats, topDresses, totalDresses] = await Promise.all([
    getViewsStats(),
    getTopDresses(10),
    getDressCount(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">
          Track dress views and popularity
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All time dress page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.todayViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Views today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.weekViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.monthViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Dresses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Dresses</CardTitle>
          <p className="text-sm text-muted-foreground">
            Top 10 dresses by total views
          </p>
        </CardHeader>
        <CardContent>
          {topDresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No views recorded yet</p>
              <p className="text-sm">
                Views will appear here once visitors browse dresses
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Dress</TableHead>
                  <TableHead>Collection</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDresses.map((dress, index) => (
                  <TableRow key={dress.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/catalog/${dress.slug}`}
                        target="_blank"
                        className="font-medium hover:underline"
                      >
                        {dress.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dress.collectionName || "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {dress.viewCount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Total dresses in catalog: {totalDresses}
      </div>
    </div>
  );
}
