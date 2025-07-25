import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { statisticsService } from "@/services/statistics.service";
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

interface Statistics {
  totalUsers: number;
  activeUsers: number;
  notActiveUsers: number;
  blockedUsers: number;
  totalGroups: number;
  activeGroups: number;
  notActiveGroups: number;
  blockedGroups: number;
  totalRequests: number;
  totalEmergencies: number;
  requestsByDate: { _id: string; count: number }[];
  checkedUrlsByType: { _id: string; count: number }[];
}

const COLORS = ["#62e3c8", "#36a2eb", "#ffcd56", "#ff6384"];

export default function Home() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const data = await statisticsService.getStatistics(startDate, endDate);
        setStatistics(data);
      } catch (err) {
        toast.error("Statistikalarni yuklashda xatolik yuz berdi.");
        setError("Statistikalarni yuklashda xatolik yuz berdi.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [startDate, endDate]);

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  const renderCard = (title: string, value: number | undefined, Icon: React.ElementType) => (
    <Card className="shadow-lg rounded-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-5 w-5 text-[#62e3c8]" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 bg-gray-200" />
        ) : (
          <div className="text-3xl font-bold text-gray-800">
            {value ?? 0}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Boshqaruv Paneli</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {renderCard("Jami Foydalanuvchilar", statistics?.totalUsers, Users)}
        {renderCard("Faol Foydalanuvchilar", statistics?.activeUsers, UserCheck)}
        {renderCard("Nofaol Foydalanuvchilar", statistics?.notActiveUsers, UserX)}
        {renderCard("Bloklangan Foydalanuvchilar", statistics?.blockedUsers, UserMinus)}
        {renderCard("Jami Murojaatlar", statistics?.totalRequests, MessageSquare)}
        {renderCard("Shoshilinch Xabarlar", statistics?.totalEmergencies, AlertTriangle)}
        {renderCard("Jami Guruhlar", statistics?.totalGroups, Users)}
        {renderCard("Faol Guruhlar", statistics?.activeGroups, CheckCircle)}
        {renderCard("Nofaol Guruhlar", statistics?.notActiveGroups, XCircle)}
        {renderCard("Bloklangan Guruhlar", statistics?.blockedGroups, Ban)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Kunlik Murojaatlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Boshlanish sanasi"
                className="py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Tugash sanasi"
                className="py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62e3c8] focus:border-transparent"
              />
            </div>
            {loading ? (
              <Skeleton className="h-[250px] w-full bg-gray-200" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statistics?.requestsByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="_id" stroke="#555" />
                  <YAxis stroke="#555" />
                  <Tooltip cursor={{ fill: 'rgba(98, 227, 200, 0.2)' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#62e3c8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Tekshirilgan URL Turlari</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px] w-full bg-gray-200" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statistics?.checkedUrlsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#62e3c8"
                    dataKey="count"
                  >
                    {statistics?.checkedUrlsByType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

