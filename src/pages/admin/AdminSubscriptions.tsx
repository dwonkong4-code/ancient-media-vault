import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, CreditCard, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, updateUserSubscription, removeUserSubscription, type UserData } from "@/lib/admin-db";
import { format, differenceInDays } from "date-fns";

export default function AdminSubscriptions() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "free">("all");
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

  const isSubscriptionActive = (user: UserData) => {
    return user.subscription?.isActive && 
           user.subscription.expiresAt && 
           new Date(user.subscription.expiresAt) > new Date();
  };

  const getDaysRemaining = (expiresAt: Date) => {
    const days = differenceInDays(new Date(expiresAt), new Date());
    return days > 0 ? days : 0;
  };

  const handleExtendSubscription = async (user: UserData, days: number) => {
    try {
      const currentPlan = user.subscription?.plan || "Monthly";
      await updateUserSubscription(user.id, currentPlan, days);
      toast({ title: `Extended subscription by ${days} days!` });
      loadUsers();
    } catch (error) {
      toast({ title: "Error extending subscription", variant: "destructive" });
    }
  };

  const handleRemoveSubscription = async (userId: string) => {
    if (confirm("Are you sure you want to remove this subscription?")) {
      try {
        await removeUserSubscription(userId);
        toast({ title: "Subscription removed!" });
        loadUsers();
      } catch (error) {
        toast({ title: "Error removing subscription", variant: "destructive" });
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case "active":
        return isSubscriptionActive(user);
      case "expired":
        return user.subscription && !isSubscriptionActive(user);
      case "free":
        return !user.subscription;
      default:
        return true;
    }
  });

  const stats = {
    total: users.length,
    active: users.filter(isSubscriptionActive).length,
    expired: users.filter((u) => u.subscription && !isSubscriptionActive(u)).length,
    free: users.filter((u) => !u.subscription).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage user subscriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="cursor-pointer" onClick={() => setFilter("all")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Users</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer border-green-500/50" onClick={() => setFilter("active")}>
          <CardContent className="p-4">
            <div className="text-sm text-green-500">Active</div>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer border-orange-500/50" onClick={() => setFilter("expired")}>
          <CardContent className="p-4">
            <div className="text-sm text-orange-500">Expired</div>
            <div className="text-2xl font-bold text-orange-500">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter("free")}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Free Users</div>
            <div className="text-2xl font-bold">{stats.free}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Days Left</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-8">No subscriptions found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.subscription?.plan || "-"}
                    </TableCell>
                    <TableCell>
                      {isSubscriptionActive(user) ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : user.subscription ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.subscription?.expiresAt
                        ? format(new Date(user.subscription.expiresAt), "MMM dd, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {isSubscriptionActive(user) && user.subscription?.expiresAt
                        ? `${getDaysRemaining(user.subscription.expiresAt)} days`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExtendSubscription(user, 7)}
                        >
                          +7d
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExtendSubscription(user, 30)}
                        >
                          +30d
                        </Button>
                        {isSubscriptionActive(user) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRemoveSubscription(user.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
