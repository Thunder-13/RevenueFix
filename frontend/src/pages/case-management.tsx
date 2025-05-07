import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { FolderOpen, Clock, PlusCircle, CheckCircle } from "lucide-react";
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

interface Case {
  id: string;
  priority: string;
  customer: string;
  subject: string;
  status: string;
  created_at: string;
  assigned_to: string;
  description: string;
}

interface CaseData {
  summary: {
    total_cases: number;
    open_cases: number;
    cases_created_today: number;
    cases_closed_today: number;
    average_resolution_time: number;
  };
  case_by_priority: Array<{ priority: string; count: number }>;
  case_by_department: Array<{ department: string; count: number }>;
  recent_cases: Case[];
  assigned_to_list: string[];
}

// Form schema for adding/editing a case
const caseFormSchema = z.object({
  priority: z.string({
    required_error: "Please select a priority level",
  }),
  customer: z.string().min(2, {
    message: "Customer name must be at least 2 characters",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
  assigned_to: z.string().optional(),
  status: z.string().default("Open"),
});

const CaseManagement = () => {
  const [data, setData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<z.infer<typeof caseFormSchema>>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      priority: "",
      customer: "",
      subject: "",
      description: "",
      assigned_to: "",
      status: "Open",
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCaseData();
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching case data:", error);
      toast({
        title: "Error",
        description: "Failed to load case management data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [toast]);

  // Reset form when dialog opens/closes or when switching between add/edit modes
  useEffect(() => {
    if (isDialogOpen) {
      if (isEditMode && selectedCase) {
        form.reset({
          priority: selectedCase.priority,
          customer: selectedCase.customer,
          subject: selectedCase.subject,
          description: selectedCase.description,
          assigned_to: selectedCase.assigned_to,
          status: selectedCase.status,
        });
      } else {
        form.reset({
          priority: "",
          customer: "",
          subject: "",
          description: "",
          assigned_to: "",
          status: "Open",
        });
      }
    }
  }, [isDialogOpen, isEditMode, selectedCase, form]);

  const onSubmit = async (values: z.infer<typeof caseFormSchema>) => {
    try {
      if (isEditMode && selectedCase) {
        // Update existing case
        await apiService.updateCase(selectedCase.id, values);
        toast({
          title: "Success",
          description: "Case has been updated successfully.",
        });
      } else {
        // Add new case
        await apiService.addCase(values);
        toast({
          title: "Success",
          description: "Case has been added successfully.",
        });
      }
      setIsDialogOpen(false);
      form.reset();
      fetchData(); // Refresh data
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} case:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} case. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedCase(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <main className="flex flex-1 items-center justify-center">
            <LoadingSpinner size="lg" text="Loading case management data..." />
          </main>
        </div>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'P1':
        return <Badge variant="destructive">P1</Badge>;
      case 'P2':
        return <Badge className="bg-orange-500">P2</Badge>;
      case 'P3':
        return <Badge className="bg-yellow-500">P3</Badge>;
      case 'P4':
        return <Badge variant="outline">P4</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge variant="outline" className="border-red-500 text-red-500">Open</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'Pending Customer':
        return <Badge className="bg-yellow-500">Pending Customer</Badge>;
      case 'Scheduled':
        return <Badge className="bg-purple-500">Scheduled</Badge>;
      case 'Closed':
      case 'Resolved':
        return <Badge className="bg-green-500">{status}</Badge>;
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
              <h1 className="text-3xl font-bold">Case Management</h1>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddNewClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Case
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Case" : "Create New Case"}</DialogTitle>
                    <DialogDescription>
                      {isEditMode 
                        ? "Update the case details below." 
                        : "Fill in the details to create a new support case."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="P1">P1 - Critical</SelectItem>
                                <SelectItem value="P2">P2 - High</SelectItem>
                                <SelectItem value="P3">P3 - Medium</SelectItem>
                                <SelectItem value="P4">P4 - Low</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer</FormLabel>
                            <FormControl>
                              <Input placeholder="Customer name or company" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description of the issue" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed description of the case..."
                                className="resize-none"
                                rows={4}
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
                                  <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">{isEditMode ? "Update Case" : "Create Case"}</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Total Cases"
                value={data?.summary.total_cases || 0}
                description="all cases"
                icon={<FolderOpen className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Open Cases"
                value={data?.summary.open_cases || 0}
                description="need attention"
                icon={<FolderOpen className="h-4 w-4 text-red-500" />}
              />
              <MetricsCard
                title="Created Today"
                value={data?.summary.cases_created_today || 0}
                description="new cases"
                icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Closed Today"
                value={data?.summary.cases_closed_today || 0}
                description="resolved cases"
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
              />
            </div>

            {/* Cases Table */}
            <div className="mt-8">
              <DataTable
                title="All Cases"
                description="Click on any row to edit the case"
                columns={[
                  { key: "id", header: "ID" },
                  { 
                    key: "priority", 
                    header: "Priority",
                    formatter: (value) => getPriorityBadge(value)
                  },
                  { key: "customer", header: "Customer" },
                  { key: "subject", header: "Subject" },
                  { 
                    key: "status", 
                    header: "Status",
                    formatter: (value) => getStatusBadge(value)
                  },
                  { key: "assigned_to", header: "Assigned To" },
                  { 
                    key: "created_at", 
                    header: "Created",
                    formatter: (value) => {
                      const date = new Date(value);
                      return date.toLocaleString();
                    }
                  },
                ]}
                data={data?.recent_cases || []}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CaseManagement;