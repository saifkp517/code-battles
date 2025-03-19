'use client'
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Users, Timer, Eye, CheckCircle, XCircle, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { redirect } from 'next/navigation';

import { useSession } from 'next-auth/react';


const CodeBattlePlatform = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('battles');
  const [roomCode, setRoomCode] = useState('');



  if (status === "unauthenticated") {
    redirect("/login");
  }
  // Demo data
  const upcomingBattles = [
    { id: 1, name: 'Algorithm Showdown', players: 2, difficulty: 'Medium', startTime: '10:30 AM' },
    { id: 2, name: 'Data Structure Duel', players: 2, difficulty: 'Hard', startTime: '11:45 AM' },
    { id: 3, name: 'Frontend Challenge', players: 2, difficulty: 'Easy', startTime: '2:15 PM' }
  ];

  const tournaments = [
    {
      id: 101,
      name: 'Weekly Algorithm Tournament',
      participants: 16,
      rounds: 4,
      prize: '$500',
      status: 'Registering',
      startDate: 'March 5, 2025'
    },
    {
      id: 102,
      name: 'React Masters',
      participants: 32,
      rounds: 5,
      prize: '$1,000',
      status: 'Registering',
      startDate: 'March 10, 2025'
    },
    {
      id: 103,
      name: 'Backend Battle Royale',
      participants: 8,
      rounds: 3,
      prize: '$300',
      status: 'In Progress',
      startDate: 'March 3, 2025'
    }
  ];

  const activeBattles = [
    {
      id: 201,
      name: 'Dynamic Programming Challenge',
      players: [
        { username: 'codemaster99', avatar: '/api/placeholder/30/30', rating: 1850 },
        { username: 'algorithmQueen', avatar: '/api/placeholder/30/30', rating: 1920 }
      ],
      viewers: 24,
      timeLeft: '14:22'
    },
    {
      id: 202,
      name: 'CSS Battle',
      players: [
        { username: 'frontendWizard', avatar: '/api/placeholder/30/30', rating: 1720 },
        { username: 'designDragon', avatar: '/api/placeholder/30/30', rating: 1690 }
      ],
      viewers: 13,
      timeLeft: '08:45'
    }
  ];

  const leaderboard = [
    { rank: 1, username: 'algorithmQueen', avatar: '/api/placeholder/30/30', rating: 1920, wins: 42, losses: 7 },
    { rank: 2, username: 'codemaster99', avatar: '/api/placeholder/30/30', rating: 1850, wins: 38, losses: 10 },
    { rank: 3, username: 'byteBaron', avatar: '/api/placeholder/30/30', rating: 1810, wins: 35, losses: 12 },
    { rank: 4, username: 'syntaxSage', avatar: '/api/placeholder/30/30', rating: 1790, wins: 31, losses: 14 },
    { rank: 5, username: 'frontendWizard', avatar: '/api/placeholder/30/30', rating: 1720, wins: 29, losses: 15 },
  ];

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Navbar username={session?.user?.name} icon={session?.user?.image} eloscore={123} />

      {/* Main content */}
      <Tabs defaultValue="battles" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="battles">
            <Zap className="w-4 h-4 mr-2" />
            Battles
          </TabsTrigger>
          <TabsTrigger value="tournaments">
            <Trophy className="w-4 h-4 mr-2" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Users className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Battles Tab */}
        <TabsContent value="battles" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>Join a Battle</CardTitle>
                  <CardDescription>Join an existing battle or create your own</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={roomCode}
                      onChange={e => {
                        setRoomCode(e.target.value)
                      }}
                      placeholder="Enter room code"
                      className="flex-1"
                    />
                    <Button
                      onClick={(e) => {
                        window.location.href = `/battle?userId=${session?.user!.name}&elo=${100}`
                      }}
                    >
                      Join
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button variant="outline" className="w-full">
                      Create New Battle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Match</CardTitle>
                  <CardDescription>Find an opponent at your skill level</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 justify-center">
                    <Button variant="default">
                      Easy
                    </Button>
                    <Button variant="outline">
                      Medium
                    </Button>
                    <Button variant="outline">
                      Hard
                    </Button>
                  </div>
                  <Button className="w-full mt-4">Find Match</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* <Card>
            <CardHeader>
              <CardTitle>Upcoming Battles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingBattles.map(battle => (
                  <div key={battle.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{battle.name}</p>
                      <div className="flex gap-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {battle.players}
                        </span>
                        <span>•</span>
                        <Badge variant="outline" className={
                          battle.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          battle.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                          'bg-red-100 text-red-800'
                        }>
                          {battle.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm flex items-center">
                        <Timer className="w-4 h-4 mr-1 text-gray-500" />
                        {battle.startTime}
                      </span>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Battles</CardTitle>
              <CardDescription>Watch ongoing battles in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeBattles.map(battle => (
                  <div key={battle.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{battle.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm flex items-center">
                          <Eye className="w-4 h-4 mr-1 text-gray-500" />
                          {battle.viewers}
                        </span>
                        <span className="text-sm flex items-center">
                          <Timer className="w-4 h-4 mr-1 text-gray-500" />
                          {battle.timeLeft}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={battle.players[0].avatar} />
                          <AvatarFallback>{battle.players[0].username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{battle.players[0].username}</p>
                          <Badge variant="outline" className="bg-amber-100">
                            {battle.players[0].rating}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-xl font-bold">VS</div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-medium">{battle.players[1].username}</p>
                          <Badge variant="outline" className="bg-amber-100">
                            {battle.players[1].rating}
                          </Badge>
                        </div>
                        <Avatar>
                          <AvatarImage src={battle.players[1].avatar} />
                          <AvatarFallback>{battle.players[1].username.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Watch
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </TabsContent>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {tournaments.map(tournament => (
              <Card key={tournament.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{tournament.name}</CardTitle>
                      <CardDescription>Starts on {tournament.startDate}</CardDescription>
                    </div>
                    <Badge className={
                      tournament.status === 'Registering' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                    }>
                      {tournament.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Participants</p>
                      <p className="font-medium">{tournament.participants}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rounds</p>
                      <p className="font-medium">{tournament.rounds}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Prize</p>
                      <p className="font-medium text-amber-600">{tournament.prize}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    {tournament.status === 'Registering' ? 'Register' : 'View Bracket'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Tournament</CardTitle>
              <CardDescription>Set up your own coding tournament</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Create Tournament</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {leaderboard.map((player, index) => (
                    <div
                      key={player.username}
                      className={`flex items-center p-3 rounded-md ${index === 0 ? 'bg-amber-50' : index === 1 ? 'bg-slate-50' : index === 2 ? 'bg-orange-50' : ''}`}
                    >
                      <div className="w-8 text-center font-semibold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : player.rank}
                      </div>
                      <Avatar className="mx-3">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback>{player.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{player.username}</p>
                        <div className="flex text-sm text-gray-500">
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {player.wins}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="flex items-center text-red-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            {player.losses}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-100">
                        <Trophy className="w-3 h-3 mr-1 text-amber-500" />
                        {player.rating}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeBattlePlatform;