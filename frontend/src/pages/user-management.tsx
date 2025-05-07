import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  last_login: string;
  status: string;
}

interface UserRole {
  id: number;
  name: string;
  description: string;
}

interface Tasks {
  id: number;
  name: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [task, setTasks] = useState<Tasks[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, rolesResponse, tasksResponse] = await Promise.all([
          apiService.getUsers(),
          apiService.getUserRoles(),
          apiService.getUserTasks()
        ]);
        
        setUsers(usersResponse.data.data);
        setRoles(rolesResponse.data.data);
        setTasks(tasksResponse.data.data);
      } catch (error) {
        console.error("Error fetching user management data:", error);
        toast({
          title: "Error",
          description: "Failed to load user management data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <main className="flex flex-1 items-center justify-center">
            <LoadingSpinner size="lg" text="Loading user management data..." />
          </main>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold">User Management</h1>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>

            {/* Users Table */}
            <div className="mb-8">
              <DataTable
                title="Users"
                columns={[
                  { key: "name", header: "Name" },
                  { key: "email", header: "Email" },
                  { key: "role", header: "Role" },
                  { 
                    key: "last_login", 
                    header: "Last Login",
                    formatter: (value) => {
                      const date = new Date(value);
                        return date.toLocaleString();
                    }
                  },
                  { 
                    key: "status", 
                    header: "Status",
                    formatter: (value) => getStatusBadge(value)
                  },
                ]}
                data={users}
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Roles Table */}
              <DataTable
                title="User Roles"
                columns={[
                  { key: "name", header: "Role" },
                  { key: "description", header: "Description" },
                ]}
                data={roles}
              />

              {/* User Task Table */}
              <DataTable
                title="User Tasks"
                columns={[
                  { key: "name", header: "User" },
                  { key: "tasks", header: "Task Count"}
                ]}
                data={task}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;