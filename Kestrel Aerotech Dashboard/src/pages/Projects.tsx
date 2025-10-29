import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rocket, Plus, Edit, Trash2, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface ProjectWithMembers extends Project {
  memberCount: number;
  recentLogs: number;
}

const Projects = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, isAdmin]);

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch member counts and recent logs for each project
      const projectsWithStats = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { count: memberCount } = await supabase
            .from("project_members")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          const { count: recentLogs } = await supabase
            .from("project_logs")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id)
            .gte("log_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

          return {
            ...project,
            memberCount: memberCount || 0,
            recentLogs: recentLogs || 0,
          };
        })
      );

      setProjects(projectsWithStats);
    } catch (error: any) {
      toast.error("Failed to load projects");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddProject = async () => {
    if (!projectForm.name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    try {
      const { error } = await supabase.from("projects").insert({
        name: projectForm.name,
        description: projectForm.description || null,
      });

      if (error) throw error;

      toast.success("Project created successfully");
      setProjectForm({ name: "", description: "" });
      setIsAddingProject(false);
      fetchProjects();
    } catch (error: any) {
      toast.error("Failed to create project");
      console.error(error);
    }
  };

  const handleUpdateProject = async () => {
    if (!projectForm.name.trim() || !editingProjectId) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: projectForm.name,
          description: projectForm.description || null,
        })
        .eq("id", editingProjectId);

      if (error) throw error;

      toast.success("Project updated successfully");
      setProjectForm({ name: "", description: "" });
      setEditingProjectId(null);
      fetchProjects();
    } catch (error: any) {
      toast.error("Failed to update project");
      console.error(error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This will also delete all project logs and member assignments.")) return;

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);

      if (error) throw error;

      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error: any) {
      toast.error("Failed to delete project");
      console.error(error);
    }
  };

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Rocket className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold glow-text mb-2">Projects</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {isAdmin ? "Manage all society projects" : "View projects you're part of"}
            </p>
          </div>
          
          {isAdmin && !isAddingProject && !editingProjectId && (
            <Button onClick={() => setIsAddingProject(true)} variant="hero" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          )}
        </div>

        {isAdmin && (isAddingProject || editingProjectId) && (
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                {editingProjectId ? "Edit Project" : "Create New Project"}
              </CardTitle>
              <CardDescription className="text-sm">
                {editingProjectId ? "Update project details" : "Add a new project to track"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-sm md:text-base">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-sm md:text-base">Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Brief description of the project"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  rows={3}
                  className="text-sm md:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={editingProjectId ? handleUpdateProject : handleAddProject}
                  variant="hero"
                  className="w-full sm:w-auto"
                >
                  {editingProjectId ? "Update" : "Create"} Project
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingProject(false);
                    setEditingProjectId(null);
                    setProjectForm({ name: "", description: "" });
                  }}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {projects.length === 0 ? (
          <Card className="card-3d">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Rocket className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-sm md:text-base text-muted-foreground text-center">
                {isAdmin ? "Create your first project to get started!" : "No projects assigned to you yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="card-3d hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg break-words line-clamp-2">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm mt-1">
                        Created {format(new Date(project.created_at), "MMM dd, yyyy")}
                      </CardDescription>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingProjectId(project.id);
                            setProjectForm({
                              name: project.name,
                              description: project.description || "",
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.description && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 break-words">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{project.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{project.recentLogs} logs (7d)</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
