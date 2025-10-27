import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rocket, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ProjectLog {
  id: string;
  content: string;
  log_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: {
    name: string;
    email: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [newLog, setNewLog] = useState("");
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchProjectAndLogs();
    }
  }, [user, id]);

  const fetchProjectAndLogs = async () => {
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch logs
      const { data: logsData, error: logsError } = await supabase
        .from("project_logs")
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .eq("project_id", id)
        .order("log_date", { ascending: false });

      if (logsError) throw logsError;
      setLogs(logsData || []);
    } catch (error: any) {
      toast.error("Failed to load project data");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddLog = async () => {
    if (!newLog.trim()) {
      toast.error("Please enter log content");
      return;
    }

    try {
      const { error } = await supabase
        .from("project_logs")
        .insert({
          project_id: id,
          user_id: user!.id,
          content: newLog,
          log_date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;

      toast.success("Log added successfully");
      setNewLog("");
      fetchProjectAndLogs();
    } catch (error: any) {
      toast.error("Failed to add log");
      console.error(error);
    }
  };

  const handleUpdateLog = async (logId: string) => {
    if (!editContent.trim()) {
      toast.error("Please enter log content");
      return;
    }

    try {
      const { error } = await supabase
        .from("project_logs")
        .update({ content: editContent })
        .eq("id", logId);

      if (error) throw error;

      toast.success("Log updated successfully");
      setEditingLog(null);
      setEditContent("");
      fetchProjectAndLogs();
    } catch (error: any) {
      toast.error("Failed to update log");
      console.error(error);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from("project_logs")
        .delete()
        .eq("id", logId);

      if (error) throw error;

      toast.success("Log deleted successfully");
      fetchProjectAndLogs();
    } catch (error: any) {
      toast.error("Failed to delete log");
      console.error(error);
    }
  };

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Rocket className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold glow-text">{project.name}</h1>
          </div>
          
          {project.description && (
            <p className="text-muted-foreground text-lg">{project.description}</p>
          )}
        </div>

        <Card className="card-3d">
          <CardHeader>
            <CardTitle>Add New Log</CardTitle>
            <CardDescription>Document your progress on this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newLog">Log Entry</Label>
              <Textarea
                id="newLog"
                placeholder="Describe what you worked on today..."
                value={newLog}
                onChange={(e) => setNewLog(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleAddLog} variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              Add Log
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Project Timeline</h2>
          
          {logs.length === 0 ? (
            <Card className="card-3d">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Logs Yet</h3>
                <p className="text-muted-foreground text-center">
                  Be the first to add a progress log for this project!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id} className="card-3d">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{log.profiles.name}</CardTitle>
                        <CardDescription>
                          {format(new Date(log.log_date), "MMMM dd, yyyy")}
                        </CardDescription>
                      </div>
                      
                      {log.user_id === user?.id && (
                        <div className="flex gap-2">
                          {editingLog === log.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateLog(log.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingLog(null);
                                  setEditContent("");
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingLog(log.id);
                                  setEditContent(log.content);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteLog(log.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingLog === log.id ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                      />
                    ) : (
                      <p className="text-foreground whitespace-pre-wrap">{log.content}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
