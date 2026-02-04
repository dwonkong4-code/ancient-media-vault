import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, CreditCard, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, updateUserSubscription, removeUserSubscription, deleteUser, type UserData } from "@/lib/admin-db";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

const PLANS = [
  { name: "Weekly", days: 7 },
  { name: "Monthly", days: 30 },
  { name: "Yearly", days: 365 },
  { name: "Lifetime", days: -1 },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setIsLoading(false);
  };

  const handleManageSubscription = (user: UserData) => {
    setSelectedUser(user);
    setSelectedPlan(user.subscription?.plan || "");
    setSubscriptionDialogOpen(true);
  };

  const handleUpdateSubscription = async () => {
    if (!selectedUser || !selectedPlan) return;
    
    const plan = PLANS.find((p) => p.name === selectedPlan);
    if (!plan) return;

    try {
      await updateUserSubscription(selectedUser.id, plan.name, plan.days);
      toast({ title: "Subscription updated successfully!" });
      setSubscriptionDialogOpen(false);
      loadUsers();
    } catch (error) {
      toast({ title: "Error updating subscription", variant: "destructive" });
    }
  };

  const handleRemoveSubscription = async (userId: string) => {
    if (confirm("Are you sure you want to remove this user's subscription?")) {
      try {
        await removeUserSubscription(userId);
        toast({ title: "Subscription removed!" });
        loadUsers();
      } catch (error) {
        toast({ title: "Error removing subscription", variant: "destructive" });
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(userId);
        toast({ title: "User deleted successfully!" });
        loadUsers();
      } catch (error) {
        toast({ title: "Error deleting user", variant: "destructive" });
      }
    }
  };

  const isSubscriptionActive = (user: UserData) => {
    return user.subscription?.isActive && 
           user.subscription.expiresAt && 
           new Date(user.subscription.expiresAt) > new Date();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage all registered users</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No users found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {isSubscriptionActive(user) ? (
                        <Badge className="bg-green-500">{user.subscription?.plan}</Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.subscription?.expiresAt ? (
                        format(new Date(user.subscription.expiresAt), "MMM dd, yyyy")
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleManageSubscription(user)} title="Manage subscription">
                          <CreditCard className="w-4 h-4" />
                        </Button>
                        {isSubscriptionActive(user) && (
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveSubscription(user.id)} title="Remove subscription">
                            <UserX className="w-4 h-4 text-orange-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscription Dialog */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">User: {selectedUser?.name}</p>
              <p className="text-sm text-muted-foreground">Email: {selectedUser?.email}</p>
            </div>
            <div className="space-y-2">
              <Label>Select Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((plan) => (
                    <SelectItem key={plan.name} value={plan.name}>
                      {plan.name} ({plan.days === -1 ? "Lifetime" : `${plan.days} days`})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSubscriptionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSubscription} disabled={!selectedPlan}>
                Update Subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
