import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Zap } from "lucide-react";

interface IntrusiveAdProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntrusiveAd({ isOpen, onClose }: IntrusiveAdProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="max-w-md w-full shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8" />
                  <div>
                    <h3 className="text-xl font-semibold">🚀 Boost Your Business</h3>
                    <p className="text-sm text-blue-100">Advanced Analytics Tools</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                {/* Google Ads Placeholder */}
                <div className="bg-gray-100 dark:bg-gray-800 h-32 rounded-lg flex items-center justify-center text-muted-foreground border-2 border-dashed border-gray-300 dark:border-gray-600 mb-4">
                  <div className="text-center">
                    <i className="fas fa-ad text-2xl mb-2"></i>
                    <p className="text-sm font-medium">Google Ads Placement</p>
                    <p className="text-xs">Dynamic Ad Content</p>
                  </div>
                </div>
                
                <Button 
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continue to Calculator
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Ad will close automatically in 10 seconds
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
