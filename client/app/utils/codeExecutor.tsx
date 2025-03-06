import React, { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, FileCodeIcon } from "lucide-react";

const JUDGE0_API_URL = "http://localhost:2358";

// Type definitions
interface TestCase {
  input: string;
  expectedOutput: string;
}

interface SubmissionResult {
  status: {
    id: number;
    description: string;
  };
  stdout?: string;
  time?: number;
  input: string;
  expectedOutput: string;
  passed: boolean;
}

interface CodeExecutorProps {
  sourceCode: string;
  languageId: number;
  // testCases: TestCase[];
}

const CodeExecutor: React.FC<CodeExecutorProps> = ({ 
  sourceCode, 
  languageId, 
  // testCases 
}) => {

  const testCases = [
    {
      input: "add(2, 3)",
      expectedOutput: "5"
    },
    {
      input: "add(-1, 1)",
      expectedOutput: "0"
    },
    {
      input: "add(10, -5)",
      expectedOutput: "5"
    }
  ];

  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<SubmissionResult[]>([]);

  const executeCode = async () => {
    setLoading(true);
    setResult(null);
    setTestResults([]);
    console.log

    try {
      // Array to store individual test case results
      const allTestResults: SubmissionResult[] = [];

      // Run code against each test case
      for (const testCase of testCases) {
        const submissionResponse = await axios.post(`${JUDGE0_API_URL}/submissions`, {
          source_code: sourceCode,
          language_id: languageId,
          stdin: '',
        });

        const token = submissionResponse.data.token;

        // Polling for results
        let resultResponse;
        while (true) {
          resultResponse = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`);
          if (resultResponse.data.status.id !== 1 && resultResponse.data.status.id !== 2) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Compare output with expected output
        const testResult: SubmissionResult = {
          ...resultResponse.data,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          passed: resultResponse.data.stdout?.trim() === testCase.expectedOutput.trim()
        };

        allTestResults.push(testResult);
      }

      setResult(allTestResults[0]); // Set the first result for overall display
      setTestResults(allTestResults);
    } catch (error) {
      console.error("Error executing code:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={executeCode}
        variant="secondary"
        size="sm"
        disabled={loading}
        className="flex items-center gap-2"
      >
        <FileCodeIcon size={16} />
        {loading ? "Running..." : "Run Code"}
      </Button>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="py-3">
          <CardTitle className="text-sm text-white flex items-center justify-between">
            <span>Execution Results</span>
            {testResults.length > 0 && (
              <span className={`text-xs ${testResults.every(r => r.passed) ? 'text-green-400' : 'text-red-400'}`}>
                {testResults.every(r => r.passed) ? 'All Tests Passed' : 'Some Tests Failed'}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="py-3 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="animate-spin text-blue-400" size={24} />
              <span className="text-blue-400">Processing...</span>
            </div>
          ) : testResults.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={
                      result?.status.description === "Accepted"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {result?.status.description}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Time:</span>
                  <span className="text-slate-300">
                    {result?.time ? `${result.time}s` : "-"}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-sm text-white mb-2">Test Case Results</h3>
                {testResults.map((testResult, index) => (
                  <div 
                    key={index} 
                    className={`
                      p-3 mb-2 rounded-md flex items-center justify-between
                      ${testResult.passed ? 'bg-green-900/30' : 'bg-red-900/30'}
                    `}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {testResult.passed ? (
                          <Check className="text-green-400" size={16} />
                        ) : (
                          <X className="text-red-400" size={16} />
                        )}
                        <span className="text-sm text-white">Test Case {index + 1}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Input: {testResult.input}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs text-slate-400">Expected: {testResult.expectedOutput}</div>
                      <div className="text-xs text-slate-300">Actual: {testResult.stdout?.trim() || '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-slate-400">Click "Run Code" to execute.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeExecutor;