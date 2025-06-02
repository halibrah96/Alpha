import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, Search, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EmailHealthResults {
  email: string;
  domain: string;
  deliverabilityScore: number;
  checks: {
    validFormat: boolean;
    domainExists: boolean;
    mxRecordExists: boolean;
    spfConfigured: boolean;
    dmarcConfigured: boolean;
    dkimConfigured: boolean;
    blacklisted: boolean;
  };
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
}

export default function EmailHealthChecker() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [results, setResults] = useState<EmailHealthResults | null>(null);

  const emailHealthMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/email/health-check", { email });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Health Check Complete",
        description: `Email health analysis completed for ${email}`,
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze email health. Please check the email and try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      emailHealthMutation.mutate(email.trim());
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getCheckIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 dark:bg-orange-900 text-orange-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Email Health Checker</CardTitle>
                <CardDescription>Comprehensive email deliverability and security analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter email address (e.g., user@example.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button 
                type="submit" 
                disabled={emailHealthMutation.isPending}
                className="min-w-[120px]"
              >
                {emailHealthMutation.isPending ? "Analyzing..." : "Analyze"}
                <Search className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Section */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Score Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Health Score for {results.email}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(results.deliverabilityScore)}`}>
                    {results.deliverabilityScore}%
                  </div>
                  <div className="text-sm text-gray-600 mb-3">Deliverability Score</div>
                  <Progress 
                    value={results.deliverabilityScore} 
                    className="w-full h-2"
                  />
                </div>
                <div className="text-center">
                  <Badge className={getRiskColor(results.riskLevel)}>
                    <Shield className="w-4 h-4 mr-2" />
                    {results.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <div className="text-sm text-gray-600 mt-2">Security Risk Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {Object.values(results.checks).filter(Boolean).length}/
                    {Object.values(results.checks).length}
                  </div>
                  <div className="text-sm text-gray-600">Security Checks Passed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security & Deliverability Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Valid Email Format</span>
                  {getCheckIcon(results.checks.validFormat)}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Domain Exists</span>
                  {getCheckIcon(results.checks.domainExists)}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">MX Record Found</span>
                  {getCheckIcon(results.checks.mxRecordExists)}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">SPF Configured</span>
                  {getCheckIcon(results.checks.spfConfigured)}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">DMARC Configured</span>
                  {getCheckIcon(results.checks.dmarcConfigured)}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">DKIM Configured</span>
                  {getCheckIcon(results.checks.dkimConfigured)}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Not Blacklisted</span>
                  {getCheckIcon(!results.checks.blacklisted)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}