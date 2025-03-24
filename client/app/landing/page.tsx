import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LeetCodeBattleLanding = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
            <span className="text-emerald-400 font-mono">&lt;/&gt;</span>
          </div>
          <span className="font-mono font-bold">Code-Battle</span>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-emerald-400 border-b border-emerald-400">[ Product ]</a>
          <a href="#" className="opacity-70 hover:opacity-100">Challenges</a>
          <a href="#" className="opacity-70 hover:opacity-100">Leaderboard</a>
          <a href="#" className="opacity-70 hover:opacity-100">Blog</a>
        </nav>
        
        <button className="px-4 py-1 border border-emerald-400 text-emerald-400 rounded hover:bg-emerald-400/10 transition">
          Log — in
        </button>
      </header>
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-20 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="mt-8">
          <h1 className="text-5xl font-bold mb-4">
            Prove your <span className="text-emerald-400">&lt;skills&gt;</span>
            <br />
            we can handle 
            <br />
            the battles.
          </h1>
          
          <p className="text-gray-400 mt-6 max-w-md">
            AI-powered platform for competitive coders to challenge each other in 1v1 algorithmic battles. 
            Solve problems faster, think smarter, climb the ranks.
          </p>
          
          <button className="mt-10 px-8 py-4 bg-emerald-400 text-black font-bold rounded hover:bg-emerald-300 transition">
            Start battling
          </button>
        </div>
        
        <div className="flex flex-col space-y-6">
          {/* Stats Card */}
          <Card className="bg-gray-900/50 border border-gray-800 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-6xl font-bold">3.2K</h3>
                  <p className="text-gray-400">Daily battles</p>
                  <div className="mt-2 flex space-x-1">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 w-4 rounded-full ${i < 8 ? 'bg-emerald-400' : 'bg-gray-700'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="opacity-40">
                  <svg width="80" height="80" viewBox="0 0 100 100" className="stroke-emerald-400 fill-none">
                    <path d="M10,50 L30,30 L50,50 L70,30 L90,50" strokeWidth="2" />
                    <circle cx="30" cy="30" r="3" className="fill-emerald-400" />
                    <circle cx="50" cy="50" r="3" className="fill-emerald-400" />
                    <circle cx="70" cy="30" r="3" className="fill-emerald-400" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Battle Card */}
          <Card className="bg-gray-900/50 border border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-emerald-400/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-emerald-400 text-xs">↗</span>
                </div>
                <span className="font-mono text-sm text-gray-300">CodeMaster / battle-v1</span>
              </div>
              
              <div className="mt-4 space-y-3 font-mono text-sm">
                <div className="flex items-center p-2 bg-emerald-400/10 rounded">
                  <div className="w-4 h-4 mr-3 rounded-full bg-yellow-400 flex items-center justify-center text-xs">
                    ⌛
                  </div>
                  <span>binary-tree-invert.js</span>
                  <span className="ml-auto text-xs">03:42</span>
                </div>
                
                <div className="flex items-center p-2 bg-red-400/10 rounded">
                  <div className="w-4 h-4 mr-3 rounded-full bg-red-400 flex items-center justify-center text-xs">
                    ✕
                  </div>
                  <span>two-sum-optimized.js</span>
                  <span className="ml-auto text-xs">Failed</span>
                </div>
                
                <div className="flex items-center p-2 bg-emerald-400/10 rounded">
                  <div className="w-4 h-4 mr-3 rounded-full bg-emerald-400 flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span>linked-list-cycle.js</span>
                  <span className="ml-auto text-xs">01:25</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Code Section */}
      <div className="container mx-auto px-4 mb-20">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg max-w-xl">
          <div className="flex space-x-1 p-2 border-b border-gray-800">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
          <div className="p-6 font-mono text-sm">
            <div className="text-gray-500">
              // Solve faster than your opponent
            </div>
            <div className="text-emerald-400">
              function <span className="text-blue-400">findMedianSortedArrays</span>(<span className="text-orange-300">nums1, nums2</span>) {'{'}
            </div>
            <div className="pl-4">
              <span className="text-purple-400">const</span> <span className="text-blue-300">merged</span> = <span className="text-yellow-300">[]</span>;
            </div>
            <div className="pl-4">
              <span className="text-purple-400">let</span> <span className="text-blue-300">i</span> = <span className="text-yellow-300">0</span>, <span className="text-blue-300">j</span> = <span className="text-yellow-300">0</span>;
            </div>
            <div className="pl-4 text-gray-300">
              <span className="text-emerald-400">// Your solution here</span>
            </div>
            <div className="pl-4 opacity-40">
              <span className="text-purple-400">while</span> (<span className="text-blue-300">i</span> &lt; nums1.length || <span className="text-blue-300">j</span> &lt; nums2.length) {'{'}
            </div>
            <div className="pl-8 opacity-25">
              <span className="text-emerald-400">// Battle of wits...</span>
            </div>
            <div className="opacity-10">{'}'}</div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="w-12 h-12 bg-emerald-400/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-emerald-400 text-2xl">⚔️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Real-time Battles</h3>
            <p className="text-gray-400">Challenge other coders to solve algorithmic problems faster and more efficiently.</p>
          </div>
          
          <div>
            <div className="w-12 h-12 bg-emerald-400/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-emerald-400 text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Global Rankings</h3>
            <p className="text-gray-400">Climb the leaderboard and establish yourself as an elite competitive programmer.</p>
          </div>
          
          <div>
            <div className="w-12 h-12 bg-emerald-400/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-emerald-400 text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-400">Get personalized insights on your approach, efficiency, and areas for improvement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeBattleLanding;