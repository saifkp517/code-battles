'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/components/ui/badge';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { Clock, Code, CheckCircle, X, Eye, EyeOff, Crown, AlertTriangle } from 'lucide-react';


const socket = io('http://localhost:4000');

const CodeBattleArena = () => {



  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [player1Status, setPlayer1Status] = useState('coding');
  const [roomId, setRoomId] = useState('');
  const [player2Status, setPlayer2Status] = useState('coding');
  const [showProblem, setShowProblem] = useState(true);
  const [socketId, setSocketId] = useState('');

  const [code, setMyCode] = useState('');
  const [opponentCode, setOpponentCode] = useState('');


  useEffect(() => {

    const handleConnect = () => {
      setSocketId(socket.id || "");
      socket.emit('joinRoom');
    };

    const handleOpponentCode = ({ code, from }: any) => {
      if (from === socket.id) {
        setMyCode(code); // It's your code
      } else {
        setOpponentCode(code); // It's opponent's code
      }
    };

    if (socket.connected) {
      handleConnect(); // Handle immediately if already connected
    }

    socket.on('connect', handleConnect);
    socket.on('opponentCode', handleOpponentCode);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('opponentCode', handleOpponentCode);
    };
  }, [socket]);

  useEffect(() => {
    socket.on('roomAssigned', ({ roomId }) => {
      console.log('Assigned to room:', roomId);
      setRoomId(roomId);
    });

    return () => {
      socket.off('roomAssigned');
    };
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (newCode: string | undefined) => {
    setMyCode(newCode || "");
    socket.emit('codeUpdate', { roomId: roomId, code: newCode })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-yellow-500';
      case 'passed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <X className="w-4 h-4 text-red-500" />;
      default: return <Code className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h1 className="text-xl font-bold text-white">Code Battle Arena RoomID: {roomId}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-xl font-mono font-bold text-white">{formatTime(timeLeft)}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProblem(!showProblem)}
            >
              {showProblem ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showProblem ? "Hide Problem" : "Show Problem"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Problem Statement Section */}
        {showProblem && (
          <div className="w-full md:w-1/4 p-4 border-r border-slate-800 bg-slate-900 overflow-y-auto">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Problem: Array Sum Optimization</CardTitle>
                <CardDescription>Difficulty: Medium | Time Complexity Target: O(n)</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p className="mb-4">
                  Given an array of integers, find the contiguous subarray with the largest sum and return both the sum and the subarray.
                </p>
                <h3 className="font-bold mb-2 text-white">Input:</h3>
                <pre className="bg-slate-900 p-3 rounded mb-4 text-sm overflow-x-auto">
                  [-2, 1, -3, 4, -1, 2, 1, -5, 4]
                </pre>
                <h3 className="font-bold mb-2 text-white">Expected Output:</h3>
                <pre className="bg-slate-900 p-3 rounded mb-4 text-sm overflow-x-auto">
                  {`Sum: 6
Subarray: [4, -1, 2, 1]`}
                </pre>
                <h3 className="font-bold mb-2 text-white">Constraints:</h3>
                <ul className="list-disc list-inside text-sm">
                  <li className="mb-1">The array length will be between 1 and 10,000</li>
                  <li className="mb-1">Time complexity must be O(n)</li>
                  <li className="mb-1">Space complexity must be O(1) excluding the output</li>
                  <li className="mb-1">Bonus points for clean code and efficient edge case handling</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Coding Area */}
        <div className={`flex-1 flex flex-col ${showProblem ? 'md:w-2/3' : 'w-full'}`}>
          <Tabs defaultValue="split" className="flex-1 flex flex-col">
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-2">
              <TabsList className="bg-slate-800">
                <TabsTrigger value="split">Split View</TabsTrigger>
                <TabsTrigger value="player1">Player 1 Only</TabsTrigger>
                <TabsTrigger value="player2">Player 2 Only</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="split" className="flex-1 flex flex-col md:flex-row m-0 border-0 outline-none">
              {/* Player 1 Code Editor */}
              <div className="flex-1 border-r border-slate-800 flex flex-col">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-950 text-blue-400 border-blue-700">Player 1</Badge>
                    <div className="flex items-center">
                      {getStatusIcon(player1Status)}
                      <span className={`ml-1 text-sm ${getStatusColor(player1Status)}`}>
                        {player1Status.charAt(0).toUpperCase() + player1Status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Submit</Button>
                </div>
                <div className="flex-1 bg-slate-950 p-4 font-mono text-sm text-slate-300 overflow-auto">
                  <Editor
                    height="100%"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(newValue: string | undefined) => {
                      handleCodeChange(newValue)
                    }}

                  // options={{ minimap: { enabled: false }, scrollBeyondLastLine: false }}
                  />
                </div>
              </div>

              {/* Player 2 Code Editor */}
              <div className="flex-1 flex flex-col">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-purple-950 text-purple-400 border-purple-700">Player 2</Badge>
                    <div className="flex items-center">
                      {getStatusIcon(player2Status)}
                      <span className={`ml-1 text-sm ${getStatusColor(player2Status)}`}>
                        {player2Status.charAt(0).toUpperCase() + player2Status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Submit</Button>
                </div>
                <div className="flex-1 bg-slate-950 p-4 font-mono text-sm text-slate-300 overflow-auto">
                  <pre className="whitespace-pre">
                    {`${opponentCode}`}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="player1" className="flex-1 m-0 border-0 outline-none">
              {/* Full screen Player 1 */}
              <div className="flex-1 flex flex-col h-full">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-950 text-blue-400 border-blue-700">Player 1</Badge>
                    <div className="flex items-center">
                      {getStatusIcon(player1Status)}
                      <span className={`ml-1 text-sm ${getStatusColor(player1Status)}`}>
                        {player1Status.charAt(0).toUpperCase() + player1Status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Submit</Button>
                </div>

                <div className="flex-1 bg-slate-950 p-4 font-mono text-sm text-slate-300 overflow-auto">
                  <Editor
                    height="100%"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(newValue: string | undefined) => {
                      handleCodeChange(newValue)
                    }}

                  // options={{ minimap: { enabled: false }, scrollBeyondLastLine: false }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="player2" className="flex-1 m-0 border-0 outline-none">
              {/* Full screen Player 2 */}
              <div className="flex-1 flex flex-col h-full">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-purple-950 text-purple-400 border-purple-700">Player 2</Badge>
                    <div className="flex items-center">
                      {getStatusIcon(player2Status)}
                      <span className={`ml-1 text-sm ${getStatusColor(player2Status)}`}>
                        {player2Status.charAt(0).toUpperCase() + player2Status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Submit</Button>
                </div>
                <div className="flex-1 bg-slate-950 p-4 font-mono text-sm text-slate-300 overflow-auto">
                  <pre className="whitespace-pre">
                    {`${opponentCode}`}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Results Panel */}
          <div className="bg-slate-900 border-t border-slate-800 p-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-white">Player 1 Results</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-blue-400">Coding</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Test Cases:</span>
                      <span className="text-slate-300">0/5 passed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Execution Time:</span>
                      <span className="text-slate-300">-</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-white">Player 2 Results</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-blue-400">Coding</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Test Cases:</span>
                      <span className="text-slate-300">0/5 passed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Execution Time:</span>
                      <span className="text-slate-300">-</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeBattleArena;