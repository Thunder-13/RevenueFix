import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { AlertTriangle, AlertOctagon, AlertCircle, CheckCircle, Plus, Archive, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Alarm {
  id: string;
  severity: string;
  source: string;
  message: string;
  timestamp: string;
  status: string;
  assigned_to: string;
}

interface AlarmData {
  summary: {
    total_alarms: number;
    critical_alarms: number;
    major_alarms: number;
    minor_alarms: number;
    open_alarms: number;
    resolved_alarms: number;
    archived_alarms: number;
    resolved_today: number;
  };
  alarm_by_category: Array<{ category: string; count: number }>;
  recent_alarms: Alarm[];
  assigned_to_list: string[];
}

// Form schema for adding/editing an alarm
const alarmFormSchema = z.object({
  severity: z.string({
    required_error: "Please select a severity level",
  }),
  source: z.string({
    required_error: "Please select a source system",
  }),
  message: z.string().min(5, {
    message: "Message must be at least 5 characters",
  }),
  status: z.string().default("Open"),
  assigned_to: z.string(),
});

const AlarmManagement = () => {
  const [data, setData] = useState<AlarmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("Demo User");
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();

  // Initialize form
  const form = useForm<z.infer<typeof alarmFormSchema>>({
    resolver: zodResolver(alarmFormSchema),
    defaultValues: {
      severity: "",
      source: "",
      message: "",
      status: "Open",
      assigned_to: "",
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAlarmData();
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching alarm data:", error);
      toast({
        title: "Error",
        description: "Failed to load alarm management data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // // Get current user from localStorage
    // const userStr = localStorage.getItem("user");
    // if (userStr) {
    //   try {
    //     const userData = JSON.parse(userStr);
    //     setCurrentUser(userData.name);
    //   } catch (e) {
    //     console.error("Failed to parse user data", e);
    //   }
    // }
  }, [toast]);

  // Reset form when dialog opens/closes or when switching between add/edit modes
  useEffect(() => {
    if (isDialogOpen) {
      if (isEditMode && selectedAlarm) {
        form.reset({
          severity: selectedAlarm.severity,
          source: selectedAlarm.source,
          message: selectedAlarm.message,
          status: selectedAlarm.status,
          // assigned_to: selectedAlarm.assigned_to,
        });
      } else {
        form.reset({
          severity: "",
          source: "",
          message: "",
          status: "Open",
          assigned_to: "",
        });
      }
    }
  }, [isDialogOpen, isEditMode, selectedAlarm, form]);

  const onSubmit = async (values: z.infer<typeof alarmFormSchema>) => {
    try {
      if (isEditMode && selectedAlarm) {
        // Update existing alarm
        await apiService.updateAlarm(selectedAlarm.id, values);
        toast({
          title: "Success",
          description: "Alarm has been updated successfully.",
        });
      } else {
        // Add new alarm
        await apiService.addAlarm(values);
        toast({
          title: "Success",
          description: "Alarm has been added successfully.",
        });
      }
      setIsDialogOpen(false);
      form.reset();
      fetchData(); // Refresh data
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} alarm:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} alarm. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (alarm: Alarm) => {
    // // Only allow editing if the alarm is assigned to the current user
    // if (alarm.assigned_to !== 'Unassigned' && alarm.assigned_to !== currentUser) {
    //   toast({
    //     title: "Access Denied",
    //     description: `This alarm is assigned to ${alarm.assigned_to}. You cannot edit it.`,
    //     variant: "destructive",
    //   });
    //   return;
    // }
    
    setSelectedAlarm(alarm);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedAlarm(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };
  
  // const handleClaimAlarm = async (alarm: Alarm) => {
  //   try {
  //     await apiService.claimAlarm(alarm.id, currentUser);
  //     toast({
  //       title: "Success",
  //       description: "Alarm has been claimed successfully.",
  //     });
  //     fetchData(); // Refresh data
  //   } catch (error) {
  //     console.error("Error claiming alarm:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to claim alarm. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };
  
  const handleArchiveAlarm = async (alarm: Alarm) => {
    try {
      await apiService.archiveAlarm(alarm.id);
      toast({
        title: "Success",
        description: "Alarm has been archived successfully.",
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error archiving alarm:", error);
      toast({
        title: "Error",
        description: "Failed to archive alarm. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteAlarm = async (alarm: Alarm) => {
    try {
      await apiService.deleteAlarm(alarm.id);
      toast({
        title: "Success",
        description: "Alarm has been deleted successfully.",
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting alarm:", error);
      toast({
        title: "Error",
        description: "Failed to delete alarm. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <main className="flex flex-1 items-center justify-center">
            <LoadingSpinner size="lg" text="Loading alarm management data..." />
          </main>
        </div>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'major':
        return <Badge className="bg-orange-500">Major</Badge>;
      case 'minor':
        return <Badge variant="outline">Minor</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <Badge variant="outline" className="border-red-500 text-red-500">Open</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'archived':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Archived</Badge>;
      case 'deleted':
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Deleted</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getAssignmentCell = (alarm: Alarm) => {
    // if (alarm.assigned_to === 'Unassigned') {
    //   return (
    //     <Button 
    //       variant="outline" 
    //       size="sm" 
    //       className="flex items-center gap-1 text-xs"
    //       // onClick={() => handleClaimAlarm(alarm)}
    //     >
    //       <UserPlus className="h-3 w-3" />
    //       Claim
    //     </Button>
    //   );
    // }
    return alarm.assigned_to;
  };
  
  // const getActionButtons = (alarm: Alarm) => {
  //   // Only show action buttons if the alarm is assigned to the current user
  //   if (alarm.assigned_to !== currentUser) {
  //     return null;
  //   }
    
  //   return (
  //     <div className="flex gap-2">
  //       <Button 
  //         variant="outline" 
  //         size="sm" 
  //         className="h-8 w-8 p-0"
  //         onClick={() => handleArchiveAlarm(alarm)}
  //       >
  //         <Archive className="h-4 w-4" />
  //       </Button>
  //       <Button 
  //         variant="outline" 
  //         size="sm" 
  //         className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
  //         onClick={() => handleDeleteAlarm(alarm)}
  //       >
  //         <Trash2 className="h-4 w-4" />
  //       </Button>
  //     </div>
  //   );
  // };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-[98%]">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold">Alarm Management</h1>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddNewClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Alarm
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Alarm" : "Add New Alarm"}</DialogTitle>
                    <DialogDescription>
                      {isEditMode 
                        ? "Update the alarm details below." 
                        : "Create a new alarm to track system issues."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severity</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select severity level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Critical">Critical</SelectItem>
                                <SelectItem value="Major">Major</SelectItem>
                                <SelectItem value="Minor">Minor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select source system" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Billing System">Billing System</SelectItem>
                                <SelectItem value="Core Network">Core Network</SelectItem>
                                <SelectItem value="CRM System">CRM System</SelectItem>
                                <SelectItem value="Data Center">Data Center</SelectItem>
                                <SelectItem value="Access Network">Access Network</SelectItem>
                                <SelectItem value="Security System">Security System</SelectItem>
                                <SelectItem value="Database Server">Database Server</SelectItem>
                                <SelectItem value="Monitoring System">Monitoring System</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the alarm..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="assigned_to"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assign To</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select agent" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* <SelectItem value="Unassigned">Unassigned</SelectItem> */}
                                  {data?.assigned_to_list.map((name) => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Open">Open</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Pending Customer">Pending Customer</SelectItem>
                                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                                  <SelectItem value="Resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                                <SelectItem value="Archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}
                      <DialogFooter>
                        <Button type="submit">{isEditMode ? "Update Alarm" : "Add Alarm"}</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <MetricsCard
                title="Total Alarms"
                value={data?.summary.total_alarms || 0}
                description="active alarms"
                icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Critical Alarms"
                value={data?.summary.critical_alarms || 0}
                description="need immediate attention"
                icon={<AlertOctagon className="h-4 w-4 text-destructive" />}
              />
              <MetricsCard
                title="Major Alarms"
                value={data?.summary.major_alarms || 0}
                description="high priority"
                icon={<AlertCircle className="h-4 w-4 text-orange-500" />}
              />
              <MetricsCard
                title="Minor Alarms"
                value={data?.summary.minor_alarms || 0}
                description="low priority"
                icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
              />
              <MetricsCard
                title="Resolved Today"
                value={data?.summary.resolved_today || 0}
                description="cleared alarms"
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
              />
            </div>

            {/* Alarms Table with Tabs */}
            <div className="mt-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Alarms</TabsTrigger>
                  <TabsTrigger value="Open">Open</TabsTrigger>
                  <TabsTrigger value="Resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="Archived">Archived</TabsTrigger>
                  {/* <TabsTrigger value="Deleted">Deleted</TabsTrigger> */}
                </TabsList>
              </Tabs>
              
              <DataTable
                title={activeTab === "all" ? "All Alarms" : `${activeTab} Alarms`}
                // description="Click on an alarm row to edit it (if you're assigned to it)"
                columns={[
                  { key: "id", header: "ID" },
                  { 
                    key: "severity", 
                    header: "Severity",
                    formatter: (value) => getSeverityBadge(value)
                  },
                  { key: "source", header: "Source" },
                  { key: "message", header: "Message" },
                  { 
                    key: "status", 
                    header: "Status",
                    formatter: (value) => getStatusBadge(value)
                  },
                  { 
                    key: "timestamp", 
                    header: "Time",
                    formatter: (value) => {
                      const date = new Date(value);
                      return date.toLocaleString();
                    }
                  },
                  { 
                    key: "assigned_to", 
                    header: "Assigned To",
                    // cellAction: (row) => getAssignmentCell(row),
                    // onCellClick: (row) => {
                    //   if (row.assigned_to === 'Unassigned') {
                    //     handleClaimAlarm(row);
                    //   }
                    // }
                  },
                  // {
                  //   key: "actions",
                  //   header: "Actions",
                  //   cellAction: (row) => getActionButtons(row)
                  // }
                ]}
                data={data?.recent_alarms || []}
                onRowClick={handleRowClick}
                filterValue={activeTab === "all" ? undefined : activeTab}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlarmManagement;