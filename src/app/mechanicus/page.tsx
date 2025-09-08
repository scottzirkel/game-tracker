'use client';

import { useState } from 'react';

export default function MechanicusTracker() {
  const [battleRound, setBattleRound] = useState(1);
  const [leftFaction] = useState({
    name: 'MECHANICUS',
    detachment: 'HALOSCREED BATTLE CLADE',
    victoryPoints: 3,
    primaryLinchpin: 0,
    secondary: 3,
    commandPoints: 0
  });
  
  const [rightFaction] = useState({
    name: 'ADEPTUS CUSTODES',
    detachment: 'SOLAR SPEARHEAD',
    victoryPoints: 5,
    primaryLinchpin: 0,
    secondary: 5,
    commandPoints: 1
  });

  return (
    <div className="h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white relative overflow-hidden" id="mechanicus-tracker">
      {/* Background artwork areas */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-br from-red-600/20 via-orange-500/10 to-transparent"></div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-yellow-600/20 via-orange-400/10 to-transparent"></div>
      
      {/* Battle Round Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="text-center bg-gradient-to-r from-gray-700/80 via-gray-600/90 to-gray-700/80 px-8 py-3 border border-gray-500/50 backdrop-blur-sm">
          <div className="text-xl font-bold tracking-widest text-gray-300 mb-1">BATTLE</div>
          <div className="text-3xl font-bold tracking-widest text-white">ROUND</div>
        </div>
      </div>

      {/* Command Points - Top Corners */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-gray-700/80 border border-gray-500 px-3 py-2 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold">{leftFaction.commandPoints}</div>
          <div className="text-xs tracking-wider">COMMAND POINTS</div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gray-700/80 border border-gray-500 px-3 py-2 text-center backdrop-blur-sm">
          <div className="text-2xl font-bold">{rightFaction.commandPoints}</div>
          <div className="text-xs tracking-wider">COMMAND POINTS</div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-full max-w-6xl">
          
          {/* Faction Names and Victory Points */}
          <div className="flex items-center justify-between mb-8">
            
            {/* Left Faction - Mechanicus */}
            <div className="text-left flex-1">
              <div className="bg-gradient-to-r from-gray-600/80 to-green-700/60 p-4 border border-gray-500/50 backdrop-blur-sm">
                <div className="text-2xl font-bold tracking-wider mb-1">{leftFaction.name}</div>
                <div className="text-sm tracking-widest text-gray-300">{leftFaction.detachment}</div>
              </div>
            </div>

            {/* Victory Points Center */}
            <div className="flex items-center justify-center space-x-12 mx-8">
              <div className="text-center">
                <div className="text-8xl font-bold text-white bg-gray-700/50 px-6 py-4 border border-gray-500/50 backdrop-blur-sm">
                  {leftFaction.victoryPoints}
                </div>
                <div className="text-sm tracking-widest text-gray-400 mt-2">VICTORY POINTS</div>
              </div>
              
              <div className="text-center">
                <div className="text-8xl font-bold text-white bg-gray-700/50 px-6 py-4 border border-gray-500/50 backdrop-blur-sm">
                  {rightFaction.victoryPoints}
                </div>
                <div className="text-sm tracking-widest text-gray-400 mt-2">VICTORY POINTS</div>
              </div>
            </div>

            {/* Right Faction - Adeptus Custodes */}
            <div className="text-right flex-1">
              <div className="bg-gradient-to-l from-gray-600/80 to-green-700/60 p-4 border border-gray-500/50 backdrop-blur-sm">
                <div className="text-2xl font-bold tracking-wider mb-1">{rightFaction.name}</div>
                <div className="text-sm tracking-widest text-gray-300">{rightFaction.detachment}</div>
              </div>
            </div>
          </div>

          {/* Objective Bars */}
          <div className="space-y-4">
            
            {/* Primary / Linchpin Bar */}
            <div className="flex items-center space-x-4">
              {/* Left Side */}
              <div className="flex-1 bg-gradient-to-r from-green-700 to-green-600 px-6 py-3 border border-green-500">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-6">
                    <span className="text-white font-bold tracking-wider">PRIMARY</span>
                    <span className="text-green-200 font-bold tracking-wider">LINCHPIN</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{leftFaction.primaryLinchpin}</div>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex-1 bg-gradient-to-l from-green-700 to-green-600 px-6 py-3 border border-green-500">
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-white">{rightFaction.primaryLinchpin}</div>
                  <div className="flex space-x-6">
                    <span className="text-green-200 font-bold tracking-wider">LINCHPIN</span>
                    <span className="text-white font-bold tracking-wider">PRIMARY</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Bar */}
            <div className="flex items-center space-x-4">
              {/* Left Side */}
              <div className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 px-6 py-3 border border-gray-500">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-6">
                    <span className="text-white font-bold tracking-wider">SECONDARY</span>
                    <span className="text-gray-300 font-bold tracking-wider">TACTICAL MISSION TOTAL</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{leftFaction.secondary}</div>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex-1 bg-gradient-to-l from-gray-700 to-gray-600 px-6 py-3 border border-gray-500">
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-white">{rightFaction.secondary}</div>
                  <div className="flex space-x-6">
                    <span className="text-gray-300 font-bold tracking-wider">TACTICAL MISSION TOTAL</span>
                    <span className="text-white font-bold tracking-wider">SECONDARY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dice/Timer Icon Area */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-4 opacity-60">
              <div className="w-12 h-12 bg-gray-600/50 border border-gray-500 rounded-sm flex items-center justify-center">
                <div className="text-2xl">⚀</div>
              </div>
              <div className="w-12 h-12 bg-gray-600/50 border border-gray-500 rounded-sm flex items-center justify-center">
                <div className="text-2xl">⏱</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}