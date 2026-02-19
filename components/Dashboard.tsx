
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { Card } from './ui/Card';
import { ZapIcon } from './icons/ZapIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { SearchIcon } from './icons/SearchIcon';

interface DashboardProps {
  onStartAnalysis: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <Card className="flex flex-col items-center text-center p-6 bg-white hover:shadow-xl transition-shadow duration-300">
        <div className="mb-4 text-blue-600">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </Card>
);


const Dashboard: React.FC<DashboardProps> = ({ onStartAnalysis }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
    >
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight"
        >
          <span className="block">Intelligent Fraud Detection,</span>
          <span className="block text-blue-600">Instantly.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600"
        >
          Leverage the power of AI to analyze insurance claims, identify suspicious patterns, and protect your business from fraud with unparalleled accuracy and speed.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartAnalysis}
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
          >
            Start Analysis
            <ArrowRightIcon className="ml-3 h-6 w-6" />
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-20 sm:mt-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <BrainCircuitIcon className="h-10 w-10" />, title: "Deep Claim Analysis", description: "Our most advanced model meticulously examines every detail of a claim for complex fraud detection." },
              { icon: <SearchIcon className="h-10 w-10" />, title: "Real-Time Data", description: "Stay ahead with up-to-the-minute fraud alerts and trends powered by Google Search." },
              { icon: <ZapIcon className="h-10 w-10" />, title: "Rapid Assessments", description: "Get quick insights and career recommendations with our high-speed, low-latency AI." }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.2, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
