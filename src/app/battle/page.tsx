'use client';

import { useState } from 'react';

export default function BattleTracker() {
  const [battleRound, setBattleRound] = useState(1);
  const [leftFaction] = useState({
    name: 'ADEPTUS CUSTODES',
    detachment: 'LIONS OF THE EMPEROR',
    victoryPoints: 3,
    linchpin: 0,
    secondary: 3,
    challenge: 0,
    commandPoints: 1
  });
  
  const [rightFaction] = useState({
    name: 'DARK ANGELS',
    detachment: 'WRATH OF THE ROCK',
    victoryPoints: 4,
    linchpin: 0,
    secondary: 4,
    challenge: 0,
    commandPoints: 2
  });

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Left Panel - Adeptus Custodes */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        {/* Dark metallic texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-transparent to-black/60"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative z-10 p-8 h-full flex flex-col justify-between">
          {/* Faction Name */}
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-4 text-yellow-200">
              {leftFaction.name}
            </h1>
            <div className="text-sm tracking-widest text-yellow-300/80 mb-8">
              DETACHMENT: <span className="text-yellow-200">{leftFaction.detachment}</span>
            </div>
          </div>

          {/* Scores */}
          <div className="space-y-6">
            <div className="flex items-center space-x-8">
              <div className="text-8xl font-bold text-yellow-200">
                {leftFaction.victoryPoints}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-6xl font-bold text-yellow-300">{leftFaction.linchpin}</span>
                  <span className="text-yellow-400 tracking-wider">LINCHPIN</span>
                </div>
                <div className="text-yellow-500/80 tracking-widest text-xs">
                  VICTORY POINTS
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-6xl font-bold text-yellow-300">
                {leftFaction.secondary}
              </div>
              <div className="text-yellow-400 tracking-wider text-sm">
                SECONDARY
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-6xl font-bold text-yellow-300">
                {leftFaction.challenge}
              </div>
              <div className="text-yellow-400 tracking-wider text-sm">
                CHALLENGE
              </div>
            </div>
          </div>

          {/* Command Points */}
          <div className="bg-yellow-900/30 border border-yellow-600/50 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-200">
              {leftFaction.commandPoints} COMMAND POINTS
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel - Battle Scene */}
      <div className="flex-1 relative bg-gradient-to-b from-orange-600 via-red-600 to-orange-800 flex flex-col justify-center items-center">
        {/* Battle artwork placeholder - would be replaced with actual image */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 via-red-600/90 to-orange-900/80">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.1%22%3E%3Cpolygon points=%2250 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        </div>
        
        {/* Central battle figure silhouette */}
        <div className="relative z-10 w-64 h-64 mb-8">
          <div className="w-full h-full bg-gradient-to-b from-yellow-400/20 via-orange-500/30 to-red-900/40 rounded-full flex items-center justify-center">
            {/* Placeholder for battle artwork */}
            <div className="w-48 h-48 bg-gradient-to-br from-yellow-300/40 to-red-800/60 rounded-lg flex items-center justify-center">
              <div className="text-6xl text-yellow-200/80">⚔️</div>
            </div>
          </div>
        </div>

        {/* Battle Round Banner */}
        <div className="relative z-10 bg-gradient-to-r from-red-900 via-red-800 to-red-900 px-12 py-4 border-2 border-yellow-400/50 shadow-2xl">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold tracking-widest text-yellow-200">
              BATTLE ROUND
            </div>
            <div className="text-4xl md:text-6xl font-bold text-yellow-300 mt-2">
              {battleRound.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Dark Angels */}
      <div className="flex-1 relative bg-gradient-to-bl from-gray-100 via-gray-200 to-gray-300 text-gray-900">
        {/* Light texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-bl from-green-100/30 via-transparent to-gray-400/40"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="relative z-10 p-8 h-full flex flex-col justify-between text-right">
          {/* Faction Name */}
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-4 text-gray-900">
              {rightFaction.name}
            </h1>
            <div className="text-sm tracking-widest text-gray-700 mb-8">
              DETACHMENT: <span className="text-gray-900">{rightFaction.detachment}</span>
            </div>
          </div>

          {/* Scores with circular timer element */}
          <div className="space-y-6">
            <div className="flex items-center justify-end space-x-8">
              {/* Circular timer element */}
              <div className="relative">
                <div className="w-24 h-24 border-4 border-gray-400 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-gray-600 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-end space-x-4">
                  <span className="text-gray-700 tracking-wider">LINCHPIN</span>
                  <span className="text-6xl font-bold text-gray-800">{rightFaction.linchpin}</span>
                </div>
                <div className="text-gray-600 tracking-widest text-xs">
                  VICTORY POINTS
                </div>
              </div>
              <div className="text-8xl font-bold text-gray-900">
                {rightFaction.victoryPoints}
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-8">
              <div className="text-gray-700 tracking-wider text-sm">
                SECONDARY
              </div>
              <div className="text-6xl font-bold text-gray-800">
                {rightFaction.secondary}
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-8">
              <div className="text-gray-700 tracking-wider text-sm">
                CHALLENGE
              </div>
              <div className="text-6xl font-bold text-gray-800">
                {rightFaction.challenge}
              </div>
            </div>
          </div>

          {/* Command Points */}
          <div className="bg-gray-300/50 border border-gray-500 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {rightFaction.commandPoints} COMMAND POINTS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}