import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import RatingInput from "./rating-input";
import { useCsat } from "@/hooks/use-csat";
import { Target, RotateCcw, Database, Download, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CSATCalculator() {
  const { toast } = useToast();
  const {
    ratings,
    updateRating,
    resetCalculator,
    loadSampleData,
    calculations,
    targetRating,
    setTargetRating,
    requiredFiveStars,
  } = useCsat();

  const exportResults = () => {
    const results = {
      ratings,
      calculations,
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `csat-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Results Exported",
      description: "CSAT results have been downloaded as JSON file.",
    });
  };

  const shareResults = async () => {
    const text = `Our latest CSAT score: ${calculations.csat}/5.00 🎯`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CSAT Results',
          text: text,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(text);
        toast({
          title: "Results Copied",
          description: "CSAT results copied to clipboard!",
        });
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Results Copied", 
        description: "CSAT results copied to clipboard!",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Calculator Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 text-primary w-12 h-12 rounded-xl flex items-center justify-center">
                <i className="fas fa-star text-xl"></i>
              </div>
              <div>
                <CardTitle className="text-2xl">CSAT Survey Input</CardTitle>
                <CardDescription>Enter the number of responses for each rating</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <RatingInput
                  key={rating}
                  rating={rating}
                  value={ratings[rating - 1]}
                  onChange={(value) => updateRating(rating - 1, value)}
                  percentage={calculations.percentages[rating - 1]}
                />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-6 border-t border-border">
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={resetCalculator}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={loadSampleData}
                  className="flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Load Sample Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportResults}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Results
                </Button>
                <Button 
                  variant="outline" 
                  onClick={shareResults}
                  className="flex items-center gap-2"
                >
                  <Share className="w-4 h-4" />
                  Share Results
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6 text-center">
            <i className="fas fa-chart-line text-3xl mb-3"></i>
            <h3 className="text-lg font-semibold mb-2">CSAT Score</h3>
            <div className="text-3xl font-bold number-counter">{calculations.csat}</div>
            <div className="text-blue-100 text-sm mt-1">out of 5.00</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6 text-center">
            <i className="fas fa-thumbs-down text-3xl mb-3"></i>
            <h3 className="text-lg font-semibold mb-2">DSAT</h3>
            <div className="text-3xl font-bold number-counter">{calculations.dsat}%</div>
            <div className="text-red-100 text-sm mt-1">Dissatisfied</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6 text-center">
            <i className="fas fa-thumbs-up text-3xl mb-3"></i>
            <h3 className="text-lg font-semibold mb-2">SSAT</h3>
            <div className="text-3xl font-bold number-counter">{calculations.ssat}%</div>
            <div className="text-green-100 text-sm mt-1">Super Satisfied</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <i className="fas fa-users text-3xl mb-3"></i>
            <h3 className="text-lg font-semibold mb-2">Total Responses</h3>
            <div className="text-3xl font-bold number-counter">{calculations.total}</div>
            <div className="text-purple-100 text-sm mt-1">Survey Count</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Target Calculator and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Target Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Target CSAT Calculator
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Calculate required 5-star responses for target average
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Target Average Rating
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={targetRating}
                    onChange={(e) => setTargetRating(parseFloat(e.target.value) || 4.0)}
                    className="border-amber-300 dark:border-amber-700 focus:ring-amber-500"
                  />
                </div>
                <div className="flex items-end">
                  <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-3 w-full">
                    <div className="text-sm text-amber-700 dark:text-amber-300">Required 5-star responses:</div>
                    <div className="text-2xl font-bold text-amber-800 dark:text-amber-200 number-counter">
                      {requiredFiveStars}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-chart-bar"></i>
                Rating Distribution
              </CardTitle>
              <CardDescription>Visual breakdown of rating percentages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-y-0">
                  <span className="w-16 text-sm text-muted-foreground">
                    {rating} Star{rating !== 1 ? 's' : ''}:
                  </span>
                  <div className="flex-1 mx-3 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`bg-rating-${rating} h-3 rounded-full rating-bar`}
                      style={{ width: `${calculations.percentages[rating - 1]}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm font-medium">
                    {calculations.percentages[rating - 1].toFixed(1)}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl text-blue-500 mb-2">
              <i className="fas fa-thumbs-up"></i>
            </div>
            <div className="text-2xl font-bold text-foreground number-counter">
              {calculations.satisfied}
            </div>
            <div className="text-sm text-muted-foreground">Satisfied Customers</div>
            <Badge variant="secondary" className="mt-2 text-xs">4★ + 5★</Badge>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl text-orange-500 mb-2">
              <i className="fas fa-meh"></i>
            </div>
            <div className="text-2xl font-bold text-foreground number-counter">
              {calculations.neutral}
            </div>
            <div className="text-sm text-muted-foreground">Neutral Customers</div>
            <Badge variant="secondary" className="mt-2 text-xs">3★</Badge>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl text-red-500 mb-2">
              <i className="fas fa-thumbs-down"></i>
            </div>
            <div className="text-2xl font-bold text-foreground number-counter">
              {calculations.dissatisfied}
            </div>
            <div className="text-sm text-muted-foreground">Dissatisfied Customers</div>
            <Badge variant="secondary" className="mt-2 text-xs">1★ + 2★</Badge>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
