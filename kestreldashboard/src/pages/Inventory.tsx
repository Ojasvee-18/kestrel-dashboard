import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const Inventory = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", quantity: 0 });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchInventory();
  }, [user]);

  const fetchInventory = async () => {
    const { data } = await supabase.from("inventory").select("*").order("name");
    setItems(data || []);
  };

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error("Item name is required");
      return;
    }

    const { error } = await supabase.from("inventory").insert({
      name: formData.name,
      description: formData.description,
      quantity: formData.quantity,
    });

    if (error) {
      toast.error("Failed to add item");
    } else {
      toast.success("Item added successfully");
      setFormData({ name: "", description: "", quantity: 0 });
      setIsAdding(false);
      fetchInventory();
    }
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from("inventory")
      .update({
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update item");
    } else {
      toast.success("Item updated successfully");
      setEditingId(null);
      setFormData({ name: "", description: "", quantity: 0 });
      fetchInventory();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("inventory").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete item");
    } else {
      toast.success("Item deleted successfully");
      fetchInventory();
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || "",
      quantity: item.quantity,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: "", description: "", quantity: 0 });
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold glow-text">Inventory</h1>
          {isAdmin && !isAdding && !editingId && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>

        {isAdmin && (isAdding || editingId) && (
          <Card className="card-3d">
            <CardHeader>
              <CardTitle>{isAdding ? "Add New Item" : "Edit Item"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="Quantity"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Item description"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={isAdding ? handleAdd : () => handleUpdate(editingId!)}>
                  {isAdding ? "Add" : "Update"}
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="card-3d">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {item.name}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">Qty: {item.quantity}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;
