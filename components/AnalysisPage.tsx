
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult, GroundedContent } from '../types';
import { fastFraudService } from '../services/fastFraudService';
import { getFraudData } from '../services/offlineService';
import { Spinner } from './ui/Spinner';
import { Card } from './ui/Card';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { UploadIcon } from './icons/UploadIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { FlagIcon } from './icons/FlagIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { MagnifyingGlassCircleIcon } from './icons/MagnifyingGlassCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { TrendUpIcon } from './icons/TrendUpIcon';

const AnalysisPage: React.FC = () => {
    const [claimDetails, setClaimDetails] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [editableReport, setEditableReport] = useState('');
    const [fraudTrends, setFraudTrends] = useState<GroundedContent | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setUploadedFile(file);
            setFileName(file.name);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const fetchAdditionalData = useCallback(async () => {
        try {
            const trends = await getFraudData('latest insurance fraud trends in India');
            setFraudTrends(trends);
        } catch (e) {
            console.error("Failed to fetch additional data:", e);
        }
    }, []);

    const handleSubmit = async () => {
        if (!claimDetails.trim()) {
            setError('Please provide claim details.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setFraudTrends(null);

        try {
            let fileData: { mimeType: string, data: string } | undefined;
            if (uploadedFile) {
                const base64Data = await fileToBase64(uploadedFile);
                fileData = { mimeType: uploadedFile.type, data: base64Data };
            }

            // Use fast fraud service for instant analysis
            const result = await fastFraudService.analyzeClaimFast(claimDetails, fileData);

            setAnalysisResult(result);
            setEditableReport(
`Fraud Assessment Report
=======================

Risk Score: ${result.riskScore}/100
Recommendation: ${result.recommendedAction}

Suspicious Indicators:
${result.suspiciousIndicators.map(i => `- ${i}`).join('\n')}

Detailed Risk Breakdown:
${result.riskBreakdown}
`);
            // Fetch additional data in parallel
            fetchAdditionalData();

        } catch (e: any) {
            console.error(e);
            setError(`Analysis failed: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const downloadReport = () => {
        const blob = new Blob([editableReport], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Fraud_Assessment_Report.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getScoreColor = (score: number) => {
        if (score < 40) return 'text-green-500';
        if (score < 75) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getActionIcon = (action: AnalysisResult['recommendedAction']) => {
        switch (action) {
            case 'Approve': return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
            case 'Investigate': return <MagnifyingGlassCircleIcon className="h-8 w-8 text-yellow-500" />;
            case 'Reject': return <XCircleIcon className="h-8 w-8 text-red-500" />;
            default: return null;
        }
    };

    if (isLoading) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col justify-center items-center h-[calc(100vh-80px)]"
            >
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                >
                    <Spinner />
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-4 text-lg text-gray-600 font-medium"
                    >
                        Fast AI Analysis in Progress...
                    </motion.p>
                </motion.div>
            </motion.div>
        );
    }
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
            <AnimatePresence mode="wait">
                {!analysisResult ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-8">
                            <motion.h2 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-2xl font-bold text-gray-800 mb-6"
                            >
                                Submit Claim for AI Evaluation
                            </motion.h2>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="claim-details" className="block text-sm font-medium text-gray-700 mb-1">
                                Claim Details
                            </label>
                            <textarea
                                id="claim-details"
                                rows={8}
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describe the claim incident, policy details, and any other relevant information..."
                                value={claimDetails}
                                onChange={(e) => setClaimDetails(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Supporting Documents (Optional)
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                        >
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">{fileName || 'PDF, PNG, JPG, DOCX up to 10MB'}</p>
                                </div>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                            >
                                {isLoading ? 'Analyzing...' : 'Run Fraud Analysis'}
                            </button>
                        </div>
                    </div>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        <div className="lg:col-span-2 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card>
                                     <h3 className="text-xl font-bold text-gray-800 p-6 border-b">Fraud Analysis Results</h3>
                                     <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                            className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-sm text-gray-500 font-medium">Fraud Risk Score</span>
                                            <motion.span 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className={`text-6xl font-bold ${getScoreColor(analysisResult.riskScore)}`}
                                            >
                                                {analysisResult.riskScore}
                                            </motion.span>
                                            <span className="text-sm text-gray-500 font-medium">out of 100</span>
                                        </motion.div>
                                        <motion.div 
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="md:col-span-2 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-sm text-gray-500 font-medium mb-2">Recommended Action</span>
                                             <div className="flex items-center space-x-3">
                                                <motion.div
                                                    initial={{ rotate: -180, opacity: 0 }}
                                                    animate={{ rotate: 0, opacity: 1 }}
                                                    transition={{ delay: 0.6 }}
                                                >
                                                    {getActionIcon(analysisResult.recommendedAction)}
                                                </motion.div>
                                                <motion.span 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.7 }}
                                                    className="text-2xl font-bold text-gray-800"
                                                >
                                                    {analysisResult.recommendedAction}
                                                </motion.span>
                                            </div>
                                        </motion.div>
                                     </div>
                             <motion.div 
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: 0.8 }}
                                 className="p-6 space-y-6"
                             >
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.9 }}
                                    className="flex items-start space-x-3"
                                >
                                    <FlagIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1"/>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Suspicious Indicators</h4>
                                        <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                                            {analysisResult.suspiciousIndicators.map((item, index) => 
                                                <motion.li 
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1 + index * 0.1 }}
                                                >
                                                    {item}
                                                </motion.li>
                                            )}
                                        </ul>
                                    </div>
                                </motion.div>
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2 }}
                                    className="flex items-start space-x-3"
                                >
                                    <LightBulbIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1"/>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Detailed Risk Breakdown</h4>
                                        <p className="mt-2 text-gray-600 whitespace-pre-wrap">{analysisResult.riskBreakdown}</p>
                                    </div>
                                </motion.div>
                             </motion.div>
                        </Card>
                            </motion.div>
                         <motion.div
                             initial={{ opacity: 0, x: -30 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: 0.2 }}
                         >
                             <Card>
                                <div className="flex justify-between items-center p-6 border-b">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center"><DocumentTextIcon className="h-6 w-6 mr-2"/> Investigation Report Editor</h3>
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={downloadReport} 
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                        Download Report
                                    </motion.button>
                                </div>
                                <div className="p-6">
                                    <textarea
                                        value={editableReport}
                                        onChange={(e) => setEditableReport(e.target.value)}
                                        rows={15}
                                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                    />
                                </div>
                            </Card>
                         </motion.div>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-8"
                        >
                            <InfoCard icon={<TrendUpIcon className="h-6 w-6 text-blue-600"/>} title="Fraud Trends in India" data={fraudTrends} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const InfoCard: React.FC<{icon: React.ReactNode, title: string, data: GroundedContent | null}> = ({icon, title, data}) => (
    <Card>
        <h3 className="text-lg font-bold text-gray-800 p-4 border-b flex items-center">{icon}<span className="ml-2">{title}</span></h3>
        <div className="p-4">
            {data ? (
                <>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{data.content}</p>
                    {data.sources && data.sources.length > 0 && (
                        <div className="mt-3">
                            <h5 className="text-xs font-semibold text-gray-500">Sources:</h5>
                            <ul className="text-xs list-disc list-inside">
                                {data.sources.map((source, i) => (
                                    <li key={i}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{source.title}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex justify-center items-center p-4">
                    <Spinner />
                </div>
            )}
        </div>
    </Card>
);


export default AnalysisPage;
