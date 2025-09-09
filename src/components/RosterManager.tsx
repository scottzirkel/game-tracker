"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Skull, Heart, Shield, RotateCcw, Check, ChevronsUpDown } from "lucide-react";
import ValueStepper from "@/components/ValueStepper";
// Dynamic imports for better code splitting - units loaded per faction
import { FACTIONS, type Faction, THEMES } from "@/lib/factions";

type RosterManagerProps = {
  side: "left" | "right";
  faction?: string;
};

// Minimal unit shape used by the UI (structural typing)
type StatProfile = {
  name: string;
  movement?: number;
  wounds: number;
  toughness: number;
  save: number;
  invulnSave?: number;
  leadership?: number;
  objectiveControl?: number;
};

type GenericUnit = {
  id: string;
  name: string;
  baseCost: number;
  modelsPerUnit: { min: number; max: number };
  statProfiles: StatProfile[];
  keywords?: string[];
  abilities?: string[];
};

type UnitInstance = {
  id: string;
  unitId: string;
  name: string;
  currentModels: number;
  totalModels: number;
  wounds: number; // For single profile units (legacy support)
  maxWounds: number; // For single profile units (legacy support)
  profileWounds?: Record<string, number>; // wounds per profile name
  isDead: boolean;
};

export default function RosterManager({ side, faction }: RosterManagerProps) {
  const [units, setUnits] = useState<UnitInstance[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [newUnitName, setNewUnitName] = useState<string>("");
  const [selectedModelCount, setSelectedModelCount] = useState<number>(1);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [unitComboboxOpen, setUnitComboboxOpen] = useState<boolean>(false);
  const [mod, setMod] = useState<any>(null);

  // Generate storage key based on side and faction
  const storageKey = `warhammer-roster-${side}-${faction || 'default'}`;

  // Load roster from localStorage on mount
  useEffect(() => {
    try {
      const savedRoster = localStorage.getItem(storageKey);
      if (savedRoster) {
        const parsedRoster = JSON.parse(savedRoster);
        if (Array.isArray(parsedRoster)) {
          setUnits(parsedRoster);
        }
      }
    } catch (error) {
      console.warn('Failed to load roster from localStorage:', error);
    }
  }, [storageKey]);

  // Save roster to localStorage whenever units change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(units));
    } catch (error) {
      console.warn('Failed to save roster to localStorage:', error);
    }
  }, [units, storageKey]);

  const factionKey = (faction || FACTIONS[0]) as Faction;
  const theme = THEMES[factionKey];

  const getUnitsModule = async (f: Faction) => {
    switch (f) {
      case "Adeptus Custodes":
        return await import("@/lib/units/generated/custodes");
      case "Ultramarines":
        return await import("@/lib/units/generated/ultramarines");
      case "Chaos Marines":
        return await import("@/lib/units/generated/chaosMarines");
      case "Necrons":
        return await import("@/lib/units/generated/necrons");
      case "Tyranids":
        return await import("@/lib/units/generated/tyranids");
      default:
        return await import("@/lib/units/generated/custodes");
    }
  };

  // Load faction units dynamically
  useEffect(() => {
    const loadFactionData = async () => {
      const module = await getUnitsModule(factionKey);
      setMod(module);
    };
    loadFactionData();
  }, [factionKey]);

  const addUnit = () => {
    if (!selectedUnitId) return;

    const unit = mod.getUnitById(selectedUnitId) as GenericUnit | undefined;
    if (!unit) return;

    // Initialize wounds for each profile
    const profileWounds: Record<string, number> = {};
    unit.statProfiles.forEach(profile => {
      profileWounds[profile.name] = profile.wounds;
    });

    // For backward compatibility, use first profile for legacy wounds
    const firstProfile = unit.statProfiles[0];
    
    const newUnit: UnitInstance = {
      id: `${selectedUnitId}-${Date.now()}`,
      unitId: selectedUnitId,
      name: newUnitName || unit.name,
      currentModels: selectedModelCount,
      totalModels: selectedModelCount,
      wounds: firstProfile.wounds,
      maxWounds: firstProfile.wounds,
      profileWounds: profileWounds,
      isDead: false,
    };

    setUnits([...units, newUnit]);
    setNewUnitName("");
    setSelectedUnitId("");
    setSelectedModelCount(1);
  };

  const updateUnit = (unitId: string, updates: Partial<UnitInstance>) => {
    setUnits(
      units.map((unit) =>
        unit.id === unitId
          ? {
              ...unit,
              ...updates,
              isDead: (updates.currentModels ?? unit.currentModels) === 0,
            }
          : unit,
      ),
    );
  };

  const removeUnit = (unitId: string) => {
    setUnits(units.filter((unit) => unit.id !== unitId));
  };

  const killModel = (unitInstance: UnitInstance) => {
    if (unitInstance.currentModels > 0) {
      updateUnit(unitInstance.id, {
        currentModels: unitInstance.currentModels - 1,
        wounds: unitInstance.maxWounds, // Reset wounds on remaining model
      });
    }
  };

  const addModel = (unitInstance: UnitInstance) => {
    const unit = mod.getUnitById(unitInstance.unitId) as
      | GenericUnit
      | undefined;
    if (!unit || unitInstance.currentModels >= unit.modelsPerUnit.max) return;

    updateUnit(unitInstance.id, {
      currentModels: unitInstance.currentModels + 1,
      totalModels: Math.max(
        unitInstance.totalModels,
        unitInstance.currentModels + 1,
      ),
    });
  };

  const damageModel = (unitInstance: UnitInstance, damage: number) => {
    const newWounds = Math.max(0, unitInstance.wounds - damage);

    if (newWounds === 0) {
      // Model dies
      killModel(unitInstance);
    } else {
      updateUnit(unitInstance.id, { wounds: newWounds });
    }
  };

  const healModel = (unitInstance: UnitInstance) => {
    updateUnit(unitInstance.id, { wounds: unitInstance.maxWounds });
  };

  const reviveUnit = (unitInstance: UnitInstance) => {
    const unit = mod.getUnitById(unitInstance.unitId) as
      | GenericUnit
      | undefined;
    if (!unit) return;

    updateUnit(unitInstance.id, {
      currentModels: 1,
      wounds: unitInstance.maxWounds,
      isDead: false,
    });
  };

  const changeTotalModels = (unitInstance: UnitInstance, delta: number) => {
    const unit = mod.getUnitById(unitInstance.unitId) as
      | GenericUnit
      | undefined;
    if (!unit) return;

    const newTotal = Math.max(
      unit.modelsPerUnit.min,
      Math.min(unit.modelsPerUnit.max, unitInstance.totalModels + delta),
    );
    const newCurrent = Math.min(unitInstance.currentModels, newTotal);

    updateUnit(unitInstance.id, {
      totalModels: newTotal,
      currentModels: newCurrent,
    });
  };

  const startEditingName = (unitInstance: UnitInstance) => {
    setEditingUnitId(unitInstance.id);
    setEditingName(unitInstance.name);
  };

  const saveEditedName = (unitId: string) => {
    if (editingName.trim()) {
      updateUnit(unitId, { name: editingName.trim() });
    }
    setEditingUnitId(null);
    setEditingName("");
  };

  const cancelEditingName = () => {
    setEditingUnitId(null);
    setEditingName("");
  };

  const clearRoster = () => {
    setUnits([]);
  };

  const getTotalPoints = () => {
    return units.reduce((total, unitInstance) => {
      const unit = mod.getUnitById(unitInstance.unitId) as any;
      if (!unit) return total;
      return total + mod.calculateUnitCost(unit, unitInstance.totalModels);
    }, 0);
  };

  const sortedUnits = mod ? [...(mod.UNITS as GenericUnit[])]
    .sort((a, b) => a.name.localeCompare(b.name)) : [];

  const selectedUnit = sortedUnits.find(unit => unit.id === selectedUnitId);

  // Show loading state if module not loaded yet
  if (!mod) {
    return (
      <Card className={`w-full relative overflow-hidden ${theme.plateBorder}`}>
        <CardHeader className="border-b border-white/15 px-4 pb-3">
          <div className="flex items-center justify-center py-8">
            <div className="text-white font-rajdhani tracking-wide">
              Loading {factionKey} units...
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const getBgColor = () => {
    switch (factionKey) {
      case "Ultramarines":
        return "rgba(59, 130, 246, 0.03)";
      case "Adeptus Custodes":
        return "rgba(251, 191, 36, 0.03)";
      case "Chaos Marines":
        return "rgba(239, 68, 68, 0.03)";
      case "Necrons":
        return "rgba(16, 185, 129, 0.03)";
      case "Tyranids":
        return "rgba(168, 85, 247, 0.03)";
      default:
        return "rgba(23, 23, 23, 0.5)";
    }
  };
  
  const getInputPlaceholderColor = () => {
    switch (factionKey) {
      case "Ultramarines":
        return "placeholder:text-blue-300/60";
      case "Adeptus Custodes":
        return "placeholder:text-amber-300/60";
      case "Chaos Marines":
        return "placeholder:text-red-300/60";
      case "Necrons":
        return "placeholder:text-emerald-300/60";
      case "Tyranids":
        return "placeholder:text-purple-300/60";
      default:
        return "placeholder:text-gray-400";
    }
  };
  
  const getSelectPlaceholderClass = () => {
    switch (factionKey) {
      case "Ultramarines":
        return "data-[placeholder]:text-blue-300/60";
      case "Adeptus Custodes":
        return "data-[placeholder]:text-amber-300/60";
      case "Chaos Marines":
        return "data-[placeholder]:text-red-300/60";
      case "Necrons":
        return "data-[placeholder]:text-emerald-300/60";
      case "Tyranids":
        return "data-[placeholder]:text-purple-300/60";
      default:
        return "data-[placeholder]:text-gray-400";
    }
  };
  const primaryGradientDir =
    side === "right" ? "bg-gradient-to-l" : "bg-gradient-to-r";

  return (
    <Card
      className={`w-full relative overflow-hidden ${theme.plateBorder}`}
      style={{ backgroundColor: getBgColor() }}
    >
      <CardHeader className="border-b border-white/15 px-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black tracking-[0.15em] text-white font-orbitron uppercase">
              {factionKey}
            </h2>
            <p className="text-sm font-bold tracking-[0.20em] text-gray-400 font-rajdhani uppercase mt-1">
              Roster
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-orbitron font-bold text-white mb-1">
              {getTotalPoints()}
              <span className="text-xs text-gray-400 font-rajdhani uppercase tracking-wide ml-2">
                Points
              </span>
            </div>
            <div className="text-xs font-rajdhani tracking-[0.12em] uppercase text-gray-400">
              {units.length} Units
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 relative">
        <div className="mb-6">
          {/* Add Unit Section */}
          {/* Row 1: Unit Combobox + Add button */}
          <div className="flex items-end justify-between mb-6 gap-6">
            <div className="w-3/4 min-w-0">
              <Label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase">
                Unit
              </Label>
              <Popover open={unitComboboxOpen} onOpenChange={setUnitComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={unitComboboxOpen}
                    className="w-full h-9 justify-between bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    {selectedUnit ? (
                      <span className="truncate">
                        {selectedUnit.name} ({selectedUnit.baseCost}pts)
                      </span>
                    ) : (
                      <span className={getInputPlaceholderColor().replace('placeholder:', 'text-')}>
                        Select unit…
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search units..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No units found.</CommandEmpty>
                      <CommandGroup>
                        {sortedUnits.map((unit) => (
                          <CommandItem
                            key={unit.id}
                            value={unit.name}
                            onSelect={() => {
                              setSelectedUnitId(unit.id);
                              setUnitComboboxOpen(false);
                              
                              const selectedUnit = mod.getUnitById(unit.id) as GenericUnit | undefined;
                              if (selectedUnit) setSelectedModelCount(selectedUnit.modelsPerUnit.min);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedUnitId === unit.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {unit.name} ({unit.baseCost}pts)
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-1/4 flex-shrink-0 text-right">
              <Button
                onClick={addUnit}
                disabled={!selectedUnitId}
                variant="outline"
                className={`h-9 px-4 ml-auto bg-transparent text-white border ${theme.primaryBorder} hover:border-opacity-80 hover:bg-white/10`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </div>
          </div>

          {/* Row 2: Custom Name + Model Count */}
          <div className="flex items-end justify-between gap-6 mb-4">
            <div className="width-3/4 min-w-0">
              <Label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase">
                Custom Name
              </Label>
              <Input
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="Optional custom name"
                className={`h-9 w-full bg-white/5 border-white/20 text-white ${getInputPlaceholderColor()}`}
              />
            </div>
            <div className="w-1/4 text-right">
              <label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase text-right">
                Model Count
              </label>
              <Select
                value={selectedModelCount.toString()}
                onValueChange={(count) =>
                  setSelectedModelCount(parseInt(count))
                }
                disabled={!selectedUnitId}
              >
                <SelectTrigger className={`ml-auto w-32 h-9 bg-white/5 border-white/20 text-white ${getSelectPlaceholderClass()}`}>
                  <SelectValue placeholder="Count" />
                </SelectTrigger>
                <SelectContent>
                  {selectedUnitId &&
                    (() => {
                      const unit = mod.getUnitById(selectedUnitId) as
                        | GenericUnit
                        | undefined;
                      if (!unit) return null;
                      const options = [];
                      for (
                        let i = unit.modelsPerUnit.min;
                        i <= unit.modelsPerUnit.max;
                        i++
                      ) {
                        options.push(
                          <SelectItem key={i} value={i.toString()}>
                            {i} model{i > 1 ? "s" : ""}
                          </SelectItem>,
                        );
                      }
                      return options;
                    })()}
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        <div className="-mx-4 mb-6">
          <Separator className="opacity-40" />
        </div>

        {/* Units List */}
        <div className="space-y-4">
          {units.length === 0 ? (
            <div className="text-center py-8 text-gray-400 font-rajdhani tracking-wide">
              No units added yet
            </div>
          ) : (
            units.map((unitInstance) => {
              const unit = mod.getUnitById(unitInstance.unitId) as
                | GenericUnit
                | undefined;
              if (!unit) return null;

              const isWounded = unitInstance.wounds < unitInstance.maxWounds;
              const points = mod.calculateUnitCost(
                unit as any,
                unitInstance.totalModels,
              );

              return (
                <Card
                  key={unitInstance.id}
                  className={`border transition-all duration-200 relative overflow-hidden ${
                    unitInstance.isDead
                      ? "border-red-500/50 bg-red-900/20"
                      : `${theme.plateBorder} bg-transparent`
                  }`}
                >
                  {/* Skull watermark for destroyed units */}
                  {unitInstance.isDead && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                      <Skull className="h-[80%] w-auto text-red-500/15" />
                    </div>
                  )}
                  <CardHeader className="border-b border-white/15 px-4 pb-3">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        {editingUnitId === unitInstance.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => saveEditedName(unitInstance.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveEditedName(unitInstance.id);
                              } else if (e.key === 'Escape') {
                                cancelEditingName();
                              }
                            }}
                            className="text-lg font-bold font-rajdhani tracking-wide bg-white/10 border-white/30 text-white h-7 px-2"
                            autoFocus
                          />
                        ) : (
                          <h4
                            className="text-lg font-bold font-rajdhani tracking-wide text-white truncate cursor-pointer hover:text-gray-300 transition-colors"
                            title={`${unitInstance.name} (click to edit)`}
                            onClick={() => startEditingName(unitInstance)}
                          >
                            {unitInstance.name}
                          </h4>
                        )}
                      </div>
                      {/* Points in right corner */}
                      <div className="flex-shrink-0">
                        <div className="text-xl font-bold font-orbitron text-amber-200">
                          {points} pts
                        </div>
                      </div>
                    </div>
                    
                    {/* 40K Datasheet Style Stat Line - moved under name */}
                    <div className="space-y-3">
                      {unit.statProfiles.map((profile, profileIndex) => (
                        <div key={profileIndex} className="">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Movement */}
                            {profile.movement && (
                              <div className="flex flex-col items-center bg-white/10 text-white px-3 py-2 rounded min-w-[40px] border border-white/20">
                                <div className="text-[10px] font-bold uppercase leading-none mb-1">M</div>
                                <div className="text-sm font-bold leading-none">{profile.movement}"</div>
                              </div>
                            )}
                            
                            {/* Toughness */}
                            <div className="flex flex-col items-center bg-white/10 text-white px-3 py-2 rounded min-w-[40px] border border-white/20">
                              <div className="text-[10px] font-bold uppercase leading-none mb-1">T</div>
                              <div className="text-sm font-bold leading-none">{profile.toughness}</div>
                            </div>
                            
                            {/* Save */}
                            <div className="flex flex-col items-center bg-white/10 text-white px-3 py-2 rounded min-w-[40px] border border-white/20">
                              <div className="text-[10px] font-bold uppercase leading-none mb-1">SV</div>
                              <div className="text-sm font-bold leading-none">
                                {profile.save}+
                              </div>
                            </div>
                            
                            {/* Invulnerable Save */}
                            {profile.invulnSave && (
                              <div className="flex flex-col items-center bg-white/10 text-white px-3 py-2 rounded min-w-[40px] border border-white/20">
                                <div className="text-[10px] font-bold leading-none flex items-center justify-center mb-1">
                                  <Shield className="w-3 h-3" />
                                </div>
                                <div className="text-sm font-bold leading-none">
                                  {profile.invulnSave}++
                                </div>
                              </div>
                            )}
                            
                            {/* Wounds */}
                            <div className="flex flex-col items-center bg-white/10 text-white px-3 py-2 rounded min-w-[40px] border border-white/20">
                              <div className="text-[10px] font-bold uppercase leading-none mb-1">W</div>
                              <div className="text-sm font-bold leading-none">{profile.wounds}</div>
                            </div>
                            
                            {/* Leadership */}
                            {profile.leadership && (
                              <div className="flex flex-col items-center bg-white/10 text-white px-3 py-2 rounded min-w-[40px] border border-white/20">
                                <div className="text-[10px] font-bold uppercase leading-none mb-1">LD</div>
                                <div className="text-sm font-bold leading-none">{profile.leadership}+</div>
                              </div>
                            )}
                            
                            {/* Objective Control */}
                            {profile.objectiveControl !== undefined && (
                              <div className="flex flex-col items-center bg-white/10 text-white px-3 py-2 rounded min-w-[40px] border border-white/20">
                                <div className="text-[10px] font-bold uppercase leading-none mb-1">OC</div>
                                <div className="text-sm font-bold leading-none">{profile.objectiveControl}</div>
                              </div>
                            )}
                          </div>
                          
                          {/* Model Name under the stat blocks */}
                          <div className="text-xs font-bold text-gray-300 uppercase tracking-wide text-center">
                            {profile.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 py-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-1">
                      {/* Active Models */}
                      <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => killModel(unitInstance)}
                            disabled={unitInstance.isDead || unitInstance.currentModels === 0}
                            className={`size-8 p-0 bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <div className="text-center flex-1 flex flex-col items-center justify-center">
                            <div className={`text-2xl font-bold font-orbitron ${theme.primaryText}`}>
                              {unitInstance.currentModels}
                            </div>
                            <div className="text-xs text-gray-400 font-rajdhani tracking-[0.12em] uppercase">
                              Active
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addModel(unitInstance)}
                            disabled={unitInstance.isDead || unitInstance.currentModels >= unitInstance.totalModels}
                            className={`size-8 p-0 bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Total Models */}
                      <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeTotalModels(unitInstance, -1)}
                            disabled={unitInstance.isDead || unitInstance.totalModels <= unit.modelsPerUnit.min}
                            className={`size-8 p-0 bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <div className="text-center flex-1 flex flex-col items-center justify-center">
                            <div className={`text-2xl font-bold font-orbitron ${theme.primaryText}`}>
                              {unitInstance.totalModels}
                            </div>
                            <div className="text-xs text-gray-400 font-rajdhani tracking-[0.12em] uppercase">
                              Total
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeTotalModels(unitInstance, +1)}
                            disabled={unitInstance.isDead || unitInstance.totalModels >= unit.modelsPerUnit.max}
                            className={`size-8 p-0 bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Wounds - Multiple profiles or single profile */}
                      <div className="flex justify-center">
                        {unit.statProfiles.length > 1 ? (
                          // Multi-profile wound tracking
                          <div className="flex flex-col items-center gap-2">
                            {unit.statProfiles.map((profile, profileIndex) => {
                              const profileWounds = unitInstance.profileWounds?.[profile.name] || profile.wounds;
                              const isProfileWounded = profileWounds < profile.wounds;
                              
                              return (
                                <div key={profileIndex} className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (unitInstance.profileWounds) {
                                        const newWounds = Math.max(0, profileWounds - 1);
                                        updateUnit(unitInstance.id, {
                                          profileWounds: {
                                            ...unitInstance.profileWounds,
                                            [profile.name]: newWounds
                                          }
                                        });
                                      }
                                    }}
                                    disabled={unitInstance.isDead}
                                    className="size-6 p-0 bg-transparent dark:bg-transparent text-white hover:bg-white/10 border border-white/30"
                                  >
                                    <Minus className="w-2 h-2" />
                                  </Button>
                                  <div className="text-center flex flex-col items-center justify-center min-w-[60px]">
                                    <div className={`text-lg font-bold font-orbitron ${isProfileWounded ? "text-red-400" : theme.primaryText}`}>
                                      {profileWounds}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-rajdhani tracking-wide uppercase truncate max-w-[60px]" title={profile.name}>
                                      {profile.name.split(' ')[0]}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (unitInstance.profileWounds) {
                                        updateUnit(unitInstance.id, {
                                          profileWounds: {
                                            ...unitInstance.profileWounds,
                                            [profile.name]: profile.wounds
                                          }
                                        });
                                      }
                                    }}
                                    disabled={unitInstance.isDead || !isProfileWounded}
                                    className="size-6 p-0 bg-transparent dark:bg-transparent text-white hover:bg-white/10 border border-white/30"
                                  >
                                    <Heart className="w-2 h-2" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          // Single profile wound tracking (existing)
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => damageModel(unitInstance, 1)}
                              disabled={unitInstance.isDead}
                              className={`size-8 p-0 bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <div className="text-center flex-1 flex flex-col items-center justify-center">
                              <div
                                className={`text-2xl font-bold font-orbitron ${isWounded ? "text-red-400" : theme.primaryText}`}
                              >
                                {unitInstance.wounds}
                              </div>
                              <div className="text-xs text-gray-400 font-rajdhani tracking-[0.12em] uppercase">
                                Wounds
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => healModel(unitInstance)}
                              disabled={unitInstance.isDead || !isWounded}
                              className={`size-8 p-0 bg-transparent dark:bg-transparent text-white hover:bg-white/10 border ${theme.primaryBorder}`}
                            >
                              <Heart className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Abilities */}
                    {unit.abilities && unit.abilities.length > 0 && (
                      <div className="mt-3">
                        <Label className="text-xs text-gray-400 font-rajdhani uppercase">
                          Abilities
                        </Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {unit.abilities.map((ability, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {ability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="justify-between items-center border-t border-white/15 px-4 py-3">
                    {/* Keywords on the left */}
                    <div className="flex-1 min-w-0 mr-4">
                      {unit.keywords && unit.keywords.length > 0 && (
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          <span className="font-bold">Keywords:</span>{' '}
                          <span>{unit.keywords.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Buttons on the right - always reserve space for revive button */}
                    <div className="flex gap-2 flex-shrink-0 min-w-[140px] justify-end">
                      {unitInstance.isDead ? (
                        <Button
                          onClick={() => reviveUnit(unitInstance)}
                          size="sm"
                          variant="outline"
                          className="text-green-400 border-green-400 hover:bg-green-400/10"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Revive
                        </Button>
                      ) : (
                        <div className="w-[68px]"></div>
                      )}
                      <Button
                        onClick={() => removeUnit(unitInstance.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        Remove
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Bottom hazard stripe */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-2 ${theme.accentHazard} [background-image:repeating-linear-gradient(45deg,#f59e0b_0_12px,#111827_12px_24px)]`}
      />
    </Card>
  );
}
