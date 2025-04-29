// import { AppSidebar } from "@/components/layout/Sidebar";
// import { Header } from "@/components/layout/Header";
// import { MetricsCard } from "@/components/dashboard/MetricsCard";
// import { RevenueChart } from "@/components/dashboard/RevenueChart";
// import { Wifi, TrendingUp, BarChart3 } from "lucide-react";

// const Data = ({ data }: { data: any }) => {
//   return (
//     <div className="flex min-h-screen">
//       <AppSidebar />
//       <div className="flex flex-1 flex-col">
//         <Header />
//         <main className="flex-1 p-6 md:p-8">
//           <div className="mx-auto max-w-7xl">
//             <h1 className="mb-6 text-3xl font-bold">Data</h1>
//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//               <MetricsCard
//                 title="Data Revenue"
//                 value={data?.data.total_revenue || 0}
//                 prefix="$"
//                 trend={data?.data.growth_rate}
//                 description="vs. previous period"
//                 icon={<Wifi className="h-4 w-4 text-muted-foreground" />}
//               />
//               <MetricsCard
//                 title="Growth Rate"
//                 value={data?.data.growth_rate || 0}
//                 suffix="%"
//                 description="compared to last month"
//                 icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
//               />
//               <MetricsCard
//                 title="Data Usage"
//                 value={data?.data.data_usage_tb || 0}
//                 suffix=" TB"
//                 description="total terabytes"
//                 icon={<Wifi className="h-4 w-4 text-muted-foreground" />}
//               />
//               <MetricsCard
//                 title="Avg Revenue/GB"
//                 value={data?.data.average_revenue_per_gb || 0}
//                 prefix="$"
//                 description="per gigabyte"
//                 icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
//               />
//             </div>
//             <RevenueChart
//               title="Data Revenue Trend"
//               data={data?.data.revenue_trend || []}
//               valuePrefix="$"
//               description="Daily data revenue over the last 30 days"
//             />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Data;