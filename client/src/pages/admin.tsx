import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, Megaphone, AlertTriangle, Save, Trash2, Calculator } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // Fetch ad settings
  const { data: adSettings, isLoading: adSettingsLoading } = useQuery({
    queryKey: ["/api/ads/settings"],
    enabled: isAuthenticated,
  });

  // Fetch error logs
  const { data: errorLogs, isLoading: errorLogsLoading } = useQuery({
    queryKey: ["/api/logs/errors"],
    enabled: isAuthenticated,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Use admin/admin123",
        variant: "destructive",
      });
    },
  });

  // Update ad settings mutation
  const updateAdSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest("PUT", "/api/ads/settings", settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads/settings"] });
      toast({
        title: "Settings Saved",
        description: "Megaphone settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to update ad settings.",
        variant: "destructive",
      });
    },
  });

  // Clear logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/logs/errors");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs/errors"] });
      toast({
        title: "Logs Cleared",
        description: "All error logs have been cleared.",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleSaveAdSettings = () => {
    if (adSettings) {
      updateAdSettingsMutation.mutate(adSettings);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: "", password: "" });
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>Enter credentials to access admin panel</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="admin123"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                  <Link href="/">
                    <Button type="button" variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <motion.div 
        className="bg-gray-800 dark:bg-gray-900 text-white p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold">
            <Shield className="inline w-5 h-5 mr-2" />
            Admin Dashboard
          </h1>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="secondary" size="sm">
                <Calculator className="w-4 h-4 mr-2" />
                Back to Calculator
              </Button>
            </Link>
            <Button 
              onClick={handleLogout}
              variant="destructive" 
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="max-w-7xl mx-auto p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Megaphone Management
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Error Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-green-600" />
                  Advertisement Settings
                </CardTitle>
                <CardDescription>
                  Manage Google Ads integration and ad display settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {adSettingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="loading-spinner"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Megaphone Controls</h4>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <span className="font-medium">Intrusive Ads</span>
                            <p className="text-sm text-muted-foreground">Show popup ads on page load</p>
                          </div>
                          <Switch
                            checked={adSettings?.intrusiveAdsEnabled ?? true}
                            onCheckedChange={(checked) => {
                              queryClient.setQueryData(["/api/ads/settings"], {
                                ...adSettings,
                                intrusiveAdsEnabled: checked
                              });
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <span className="font-medium">Banner Ads</span>
                            <p className="text-sm text-muted-foreground">Show banner ads in header</p>
                          </div>
                          <Switch
                            checked={adSettings?.bannerAdsEnabled ?? true}
                            onCheckedChange={(checked) => {
                              queryClient.setQueryData(["/api/ads/settings"], {
                                ...adSettings,
                                bannerAdsEnabled: checked
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Megaphone Configuration</h4>
                        
                        <div className="space-y-2">
                          <Label htmlFor="adFrequency">Megaphone Frequency (minutes)</Label>
                          <Input
                            id="adFrequency"
                            type="number"
                            min="1"
                            max="60"
                            value={adSettings?.adFrequency ?? 5}
                            onChange={(e) => {
                              queryClient.setQueryData(["/api/ads/settings"], {
                                ...adSettings,
                                adFrequency: parseInt(e.target.value)
                              });
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="googleAdsId">Google Ads ID</Label>
                          <Input
                            id="googleAdsId"
                            type="text"
                            placeholder="ca-pub-xxxxxxxxx"
                            value={adSettings?.googleAdsId ?? ""}
                            onChange={(e) => {
                              queryClient.setQueryData(["/api/ads/settings"], {
                                ...adSettings,
                                googleAdsId: e.target.value
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <Button 
                      onClick={handleSaveAdSettings}
                      disabled={updateAdSettingsMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateAdSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      System Error Logs
                    </CardTitle>
                    <CardDescription>
                      Monitor application errors and warnings
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearLogsMutation.mutate()}
                    disabled={clearLogsMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {errorLogsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="loading-spinner"></div>
                  </div>
                ) : (
                  <ScrollArea className="h-64 w-full">
                    {!errorLogs || errorLogs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No error logs found
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {errorLogs.map((log) => (
                          <div 
                            key={log.id}
                            className="p-3 border rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge 
                                variant={log.type === "AUTH_ERROR" ? "destructive" : 
                                       log.type === "VALIDATION_ERROR" ? "secondary" : "default"}
                              >
                                {log.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{log.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
