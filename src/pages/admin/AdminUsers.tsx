import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, CreditCard, UserX, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, updateUserSubscription, removeUserSubscription, deleteUser, type UserData } from "@/lib/admin-db";
import { format, differenceInDays } from "date-fns";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { planDurations } from "@/lib/pesapal";

// Build plans array from planDurations
const PLANS = Object.entries(planDurations).map(([name, days]) => ({
  name,
  days,
}));

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [customDays, setCustomDays] = useState("");
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
    setCustomDays("");
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

  const handleCustomDaysSubscription = async () => {
    if (!selectedUser || !customDays) return;
    
    const days = parseInt(customDays);
    if (isNaN(days) || days <= 0) {
      toast({ title: "Please enter a valid number of days", variant: "destructive" });
      return;
    }

    try {
      await updateUserSubscription(selectedUser.id, `Custom (${days} days)`, days);
      toast({ title: `Subscription activated for ${days} days!` });
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

  const getDaysRemaining = (expiresAt: Date) => {
    const days = differenceInDays(new Date(expiresAt), new Date());
    return days > 0 ? days : 0;
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(isSubscriptionActive).length,
    free: users.filter((u) => !u.subscription || !isSubscriptionActive(u)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all registered users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#0d1e36] border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0d1e36] border-border/50 border-green-500/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <div className="text-sm text-green-500">Active Subscriptions</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0d1e36] border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.free}</div>
            <div className="text-sm text-muted-foreground">Free Users</div>
          </CardContent>
        </Card>
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

      <Card className="bg-[#0d1e36] border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No users found</TableCell>
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
                      {isSubscriptionActive(user) && user.subscription?.expiresAt
                        ? `${getDaysRemaining(user.subscription.expiresAt)} days`
                        : "-"}
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

      {/* Subscription Dialog - Enhanced with all plans */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-medium">{selectedUser?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              {selectedUser?.subscription && isSubscriptionActive(selectedUser) && (
                <div className="mt-2">
                  <Badge className="bg-green-500">{selectedUser.subscription.plan}</Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    Expires: {format(new Date(selectedUser.subscription.expiresAt), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
            </div>

            {/* All available plans */}
            <div className="space-y-2">
              <Label>Select Subscription Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((plan) => (
                    <SelectItem key={plan.name} value={plan.name}>
                      {plan.name} {plan.days === -1 ? "(Lifetime)" : `(${plan.days} days)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleUpdateSubscription} 
                disabled={!selectedPlan}
                className="w-full mt-2"
              >
                Activate Plan
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or custom duration</span>
              </div>
            </div>

            {/* Custom days option */}
            <div className="space-y-2">
              <Label>Custom Days</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter number of days"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  min="1"
                />
                <Button 
                  onClick={handleCustomDaysSubscription}
                  disabled={!customDays}
                  variant="outline"
                >
                  Apply
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSubscriptionDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
