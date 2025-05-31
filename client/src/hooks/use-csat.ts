import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useCsat() {
  const { toast } = useToast();
  const [ratings, setRatings] = useState([5, 10, 15, 25, 45]); // Default sample data
  const [targetRating, setTargetRating] = useState(4.0);

  // Save CSAT data mutation
  const saveCsatMutation = useMutation({
    mutationFn: async (data: { rating1: number; rating2: number; rating3: number; rating4: number; rating5: number }) => {
      const response = await apiRequest("POST", "/api/csat/save", data);
      return response.json();
    },
    onError: () => {
      // Log error to backend
      apiRequest("POST", "/api/logs/error", {
        type: "CSAT_SAVE_ERROR",
        message: "Failed to save CSAT data"
      }).catch(() => {});
    },
  });

  // Log error mutation
  const logErrorMutation = useMutation({
    mutationFn: async (error: { type: string; message: string }) => {
      const response = await apiRequest("POST", "/api/logs/error", error);
      return response.json();
    },
  });

  const updateRating = (index: number, value: number) => {
    if (value < 0) {
      logErrorMutation.mutate({
        type: "VALIDATION_ERROR",
        message: `Invalid rating value: ${value}. Values must be non-negative.`
      });
      return;
    }

    const newRatings = [...ratings];
    newRatings[index] = value;
    setRatings(newRatings);

    // Auto-save CSAT data
    saveCsatMutation.mutate({
      rating1: newRatings[0],
      rating2: newRatings[1], 
      rating3: newRatings[2],
      rating4: newRatings[3],
      rating5: newRatings[4],
    });
  };

  const resetCalculator = () => {
    setRatings([0, 0, 0, 0, 0]);
    setTargetRating(4.0);
    
    toast({
      title: "Calculator Reset",
      description: "All values have been cleared.",
    });

    logErrorMutation.mutate({
      type: "INFO",
      message: "Calculator reset by user"
    });
  };

  const loadSampleData = () => {
    const sampleData = [5, 10, 15, 25, 45];
    setRatings(sampleData);
    
    toast({
      title: "Sample Data Loaded",
      description: "Calculator populated with sample survey data.",
    });

    logErrorMutation.mutate({
      type: "INFO", 
      message: "Sample data loaded by user"
    });

    // Save sample data
    saveCsatMutation.mutate({
      rating1: sampleData[0],
      rating2: sampleData[1],
      rating3: sampleData[2], 
      rating4: sampleData[3],
      rating5: sampleData[4],
    });
  };

  const calculations = useMemo(() => {
    const total = ratings.reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return {
        csat: "0.00",
        dsat: "0.00", 
        ssat: "0.00",
        total: 0,
        percentages: [0, 0, 0, 0, 0],
        satisfied: 0,
        neutral: 0,
        dissatisfied: 0,
      };
    }

    // Calculate CSAT: Σ(rating × count) / total responses
    const weightedSum = ratings.reduce((sum, count, index) => sum + (count * (index + 1)), 0);
    const csat = (weightedSum / total).toFixed(2);

    // Calculate DSAT: ((1★ + 2★) / Total) * 100
    const dsat = (((ratings[0] + ratings[1]) / total) * 100).toFixed(2);

    // Calculate SSAT: (((5★ – (1★ + 2★)) / Total) * 100 + 100)
    const ssat = (((ratings[4] - (ratings[0] + ratings[1])) / total) * 100 + 100).toFixed(2);

    // Calculate percentages for each rating
    const percentages = ratings.map(count => (count / total) * 100);

    // Additional metrics
    const satisfied = ratings[3] + ratings[4]; // 4★ + 5★
    const neutral = ratings[2]; // 3★
    const dissatisfied = ratings[0] + ratings[1]; // 1★ + 2★

    return {
      csat,
      dsat,
      ssat: Math.max(0, parseFloat(ssat)).toFixed(2), // Ensure non-negative
      total,
      percentages,
      satisfied,
      neutral,
      dissatisfied,
    };
  }, [ratings]);

  const requiredFiveStars = useMemo(() => {
    const currentTotal = ratings.reduce((sum, count) => sum + count, 0);
    
    if (currentTotal === 0) {
      return 0;
    }

    const currentWeightedSum = ratings.reduce((sum, count, index) => sum + (count * (index + 1)), 0);
    
    // Calculate required 5-star responses
    // target = (currentWeightedSum + 5 * x) / (currentTotal + x)
    // Solving for x: x = (target * currentTotal - currentWeightedSum) / (5 - target)
    
    const numerator = targetRating * currentTotal - currentWeightedSum;
    const denominator = 5 - targetRating;
    
    if (denominator <= 0) {
      return 0;
    }
    
    const required = Math.ceil(numerator / denominator);
    return Math.max(0, required);
  }, [ratings, targetRating]);

  // Log calculation errors
  useEffect(() => {
    if (calculations.total > 0) {
      const csatValue = parseFloat(calculations.csat);
      if (csatValue < 1 || csatValue > 5) {
        logErrorMutation.mutate({
          type: "CALCULATION_WARNING",
          message: `Unusual CSAT value calculated: ${csatValue}`
        });
      }
    }
  }, [calculations, logErrorMutation]);

  return {
    ratings,
    updateRating,
    resetCalculator,
    loadSampleData,
    calculations,
    targetRating,
    setTargetRating,
    requiredFiveStars,
  };
}
