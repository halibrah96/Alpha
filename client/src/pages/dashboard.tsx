import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FileImage, Globe, Mail, BarChart3, Settings, Shield } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import CSATCalculator from "@/components/csat-calculator";
import OCRProcessor from "@/components/ocr-processor";
import DNSAnalyzer from "@/components/dns-analyzer";
import EmailHealthChecker from "@/components/email-health-checker";
import PrivacyBanner from "@/components/privacy-banner";

const tools = [
  {
    id: "csat",
    name: "CSAT Calculator",
    description: "Advanced customer satisfaction analytics with visual reports",
    icon: Calculator,
    color: "blue",
    component: CSATCalculator
  },
  {
    id: "ocr",
    name: "Image OCR",
    description: "Extract text from any image using advanced recognition",
    icon: FileImage,
    color: "green",
    component: OCRProcessor
  },
  {
    id: "dns",
    name: "DNS Analyzer",
    description: "Check DKIM, DMARC, SPF, MX records and domain health",
    icon: Globe,
    color: "purple",
    component: DNSAnalyzer
  },
  {
    id: "email",
    name: "Email Health",
    description: "Comprehensive email deliverability and security analysis",
    icon: Mail,
    color: "orange",
    component: EmailHealthChecker
  }
];

export default function Dashboard() {
  const [selectedTool, setSelectedTool] = useState("csat");
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);

  // Fetch tool settings to check which tools are enabled
  const { data: toolSettings } = useQuery({
    queryKey: ["/api/tools/settings"],
  });

  // Fetch query statistics
  const { data: queryStats } = useQuery({
    queryKey: ["/api/stats/queries"],
  });

  const enabledTools = tools.filter(tool => {
    if (!toolSettings) return true; // Show all tools if settings not loaded yet
    switch (tool.id) {
      case "csat": return toolSettings.csatEnabled;
      case "ocr": return toolSettings.ocrEnabled;
      case "dns": return toolSettings.dnsEnabled;
      case "email": return toolSettings.emailHealthEnabled;
      default: return true;
    }
  });

  const currentTool = enabledTools.find(tool => tool.id === selectedTool) || enabledTools[0];
  const CurrentComponent = currentTool?.component;

  const getToolStats = (toolType: string) => {
    return queryStats?.find(stat => stat.toolType === toolType)?.count || 0;
  };

  return (
    <div className="min-h-screen bg-background">
      {showPrivacyBanner && (
        <PrivacyBanner onAccept={() => setShowPrivacyBanner(false)} />
      )}

      {/* Header */}
      <motion.header 
        className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Professional Tool Suite
              </h1>
              <p className="text-blue-100 mt-2">Comprehensive business analytics and utilities</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex gap-3"
            >
              <Link href="/admin">
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tool Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {enabledTools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            const stats = getToolStats(tool.id);
            
            return (
              <Card 
                key={tool.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? `border-${tool.color}-500 ring-2 ring-${tool.color}-500/20` : ''
                }`}
                onClick={() => setSelectedTool(tool.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Icon className={`w-8 h-8 text-${tool.color}-600`} />
                    <Badge variant="secondary" className="text-xs">
                      {stats.toLocaleString()} queries
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </motion.div>

        {/* Tool Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Tabs value={selectedTool} onValueChange={setSelectedTool} className="space-y-6">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${enabledTools.length}, 1fr)` }}>
              {enabledTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <TabsTrigger key={tool.id} value={tool.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tool.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {enabledTools.map((tool) => (
              <TabsContent key={tool.id} value={tool.id} className="space-y-6">
                <div className="min-h-[600px]">
                  {CurrentComponent && tool.id === selectedTool && <CurrentComponent />}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}