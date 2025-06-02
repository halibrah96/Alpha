import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, CheckCircle, XCircle, AlertCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DNSRecord {
  type: string;
  status: "valid" | "invalid" | "warning" | "not_found";
  value?: string;
  details?: string;
}

interface DNSResults {
  domain: string;
  records: {
    mx: DNSRecord[];
    spf: DNSRecord;
    dkim: DNSRecord;
    dmarc: DNSRecord;
  };
  summary: {
    totalChecks: number;
    passed: number;
    warnings: number;
    failed: number;
  };
}

export default function DNSAnalyzer() {
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<DNSResults | null>(null);

  const dnsAnalysisMutation = useMutation({
    mutationFn: async (domain: string) => {
      const response = await apiRequest("POST", "/api/dns/analyze", { domain });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Analysis Complete",
        description: `DNS analysis completed for ${domain}`,
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze DNS records. Please check the domain and try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      dnsAnalysisMutation.mutate(domain.trim());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "invalid":
      case "not_found":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "invalid":
      case "not_found":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Value copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
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
              <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">DNS Security Analyzer</CardTitle>
                <CardDescription>Check DKIM, DMARC, SPF, and MX records for email security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex-1"
                required
              />
              <Button 
                type="submit" 
                disabled={dnsAnalysisMutation.isPending}
                className="min-w-[120px]"
              >
                {dnsAnalysisMutation.isPending ? "Analyzing..." : "Analyze"}
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
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Analysis Summary for {results.domain}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.summary.passed}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{results.summary.warnings}</div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.summary.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{results.summary.totalChecks}</div>
                  <div className="text-sm text-gray-600">Total Checks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DNS Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SPF Record */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getStatusIcon(results.records.spf.status)}
                  SPF Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={getStatusColor(results.records.spf.status)}>
                  {results.records.spf.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {results.records.spf.value && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Record Value:</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(results.records.spf.value!)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-xs break-all">{results.records.spf.value}</code>
                  </div>
                )}
                {results.records.spf.details && (
                  <p className="text-sm text-gray-600">{results.records.spf.details}</p>
                )}
              </CardContent>
            </Card>

            {/* DKIM Record */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getStatusIcon(results.records.dkim.status)}
                  DKIM Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={getStatusColor(results.records.dkim.status)}>
                  {results.records.dkim.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {results.records.dkim.value && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Record Value:</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(results.records.dkim.value!)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-xs break-all">{results.records.dkim.value}</code>
                  </div>
                )}
                {results.records.dkim.details && (
                  <p className="text-sm text-gray-600">{results.records.dkim.details}</p>
                )}
              </CardContent>
            </Card>

            {/* DMARC Record */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getStatusIcon(results.records.dmarc.status)}
                  DMARC Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={getStatusColor(results.records.dmarc.status)}>
                  {results.records.dmarc.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {results.records.dmarc.value && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Record Value:</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(results.records.dmarc.value!)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-xs break-all">{results.records.dmarc.value}</code>
                  </div>
                )}
                {results.records.dmarc.details && (
                  <p className="text-sm text-gray-600">{results.records.dmarc.details}</p>
                )}
              </CardContent>
            </Card>

            {/* MX Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {results.records.mx.length > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  MX Records ({results.records.mx.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.records.mx.length > 0 ? (
                  results.records.mx.map((record, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {record.value && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(record.value!)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {record.value && (
                        <code className="text-xs break-all">{record.value}</code>
                      )}
                      {record.details && (
                        <p className="text-sm text-gray-600 mt-2">{record.details}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No MX records found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}