import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, CheckSquare, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchMembers();
      fetchAttendance();
    }
  }, [isAdmin, selectedDate]);

  const fetchMembers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("name");
    setMembers(data || []);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from("attendance")
      .select("user_id")
      .eq("attendance_date", selectedDate);
    
    const attendanceMap: Record<string, boolean> = {};
    data?.forEach((a) => attendanceMap[a.user_id] = true);
    setAttendance(attendanceMap);
  };

  const toggleAttendance = async (userId: string) => {
    const isPresent = attendance[userId];
    
    if (isPresent) {
      await supabase
        .from("attendance")
        .delete()
        .eq("user_id", userId)
        .eq("attendance_date", selectedDate);
    } else {
      await supabase
        .from("attendance")
        .insert({
          user_id: userId,
          attendance_date: selectedDate,
          marked_by: user!.id,
        });
    }
    
    fetchAttendance();
    toast.success("Attendance updated");
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold glow-text">Admin Dashboard</h1>

        <Card className="card-3d">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Attendance ({format(new Date(selectedDate), "MMM dd, yyyy")})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
            
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span>{member.name}</span>
                  <Checkbox
                    checked={!!attendance[member.id]}
                    onCheckedChange={() => toggleAttendance(member.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="p-3 bg-secondary/30 rounded-lg">
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
