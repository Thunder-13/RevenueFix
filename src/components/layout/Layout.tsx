import { Header } from "./Header";
import { AppSidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <Header />

      {/* Main Container */}
      <div className="flex min-h-screen pt-8">
        {/* Fixed Sidebar */}
        
        <div className="fixed top-20 left-5 bottom-5">
          <AppSidebar />
        </div>

        {/* Main Content with responsive margins */}
        <div className="flex-1 ml-[calc(100px+5rem)] lg:ml-[calc(200px+5rem)] mt-4 mr-5 mb-5">
          <div className="bg-transparent rounded-lg shadow-md px-8 min-h-[calc(100vh-7rem)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}