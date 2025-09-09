"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Skull, Heart, Shield, RotateCcw } from "lucide-react";
import * as allUnits from "@/lib/units";
import { FACTIONS, type Faction, THEMES } from "@/lib/factions";

type RosterManagerProps = {
  side: "left" | "right";
  faction?: string;
};

// Minimal unit shape used by the UI (structural typing)
type GenericUnit = {
  id: string;
  name: string;
  baseCost: number;
  modelsPerUnit: { min: number; max: number };
  wounds: number;
  toughness: number;
  save: number;
  invulnSave?: number;
  abilities?: string[];
};

type UnitInstance = {
  id: string;
  unitId: string;
  name: string;
  currentModels: number;
  totalModels: number;
  wounds: number;
  maxWounds: number;
  isDead: boolean;
};

export default function RosterManager({ side, faction }: RosterManagerProps) {
  const [units, setUnits] = useState<UnitInstance[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [newUnitName, setNewUnitName] = useState<string>("");
  const [selectedModelCount, setSelectedModelCount] = useState<number>(1);

  const factionKey = (faction || FACTIONS[0]) as Faction;
  const theme = THEMES[factionKey];

  const getUnitsModule = (f: Faction) => {
    switch (f) {
      case "Adeptus Custodes":
        return allUnits.custodes;
      case "Ultramarines":
        return allUnits.ultramarines;
      case "Chaos Marines":
        return allUnits.chaosMarines;
      case "Necrons":
        return allUnits.necrons;
      case "Tyranids":
        return allUnits.tyranids;
      default:
        return allUnits.custodes;
    }
  };

  const mod = getUnitsModule(factionKey);

  const addUnit = () => {
    if (!selectedUnitId) return;

    const unit = mod.getUnitById(selectedUnitId) as GenericUnit | undefined;
    if (!unit) return;

    const newUnit: UnitInstance = {
      id: `${selectedUnitId}-${Date.now()}`,
      unitId: selectedUnitId,
      name: newUnitName || unit.name,
      currentModels: selectedModelCount,
      totalModels: selectedModelCount,
      wounds: unit.wounds,
      maxWounds: unit.wounds,
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

  const getTotalPoints = () => {
    return units.reduce((total, unitInstance) => {
      const unit = mod.getUnitById(unitInstance.unitId) as any;
      if (!unit) return total;
      return total + mod.calculateUnitCost(unit, unitInstance.totalModels);
    }, 0);
  };

  const sortedUnits = [...(mod.UNITS as GenericUnit[])].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

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
  const primaryGradientDir =
    side === "right" ? "bg-gradient-to-l" : "bg-gradient-to-r";

  return (
    <Card
      className={`w-full relative overflow-hidden ${theme.plateBorder}`}
      style={{ backgroundColor: getBgColor() }}
    >
      <CardContent className="p-4 relative pb-6">
        <div className="mb-6">
          {/* Add Unit Section */}
          {/* Row 1: Unit + Add button */}
          <div className="flex items-end justify-between mb-6 gap-6">
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase">
                Unit
              </Label>
              <Select
                value={selectedUnitId}
                onValueChange={(unitId) => {
                  setSelectedUnitId(unitId);
                  const unit = mod.getUnitById(unitId) as
                    | GenericUnit
                    | undefined;
                  if (unit) setSelectedModelCount(unit.modelsPerUnit.min);
                }}
              >
                <SelectTrigger className="w-full h-9 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select unit…" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {sortedUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.baseCost}pts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={addUnit}
                disabled={!selectedUnitId}
                variant="outline"
                className={`h-9 px-4 bg-transparent text-white border ${theme.primaryBorder} hover:border-opacity-80 hover:bg-white/10`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </div>
          </div>

          {/* Row 2: Custom Name + Model Count */}
          <div className="flex items-end justify-between gap-6 mb-4">
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase">
                Custom Name
              </Label>
              <Input
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="Optional custom name"
                className="h-9 bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="text-right">
              <label className="text-sm font-bold tracking-[0.12em] text-gray-200 font-rajdhani uppercase text-right">
                Model Count
              </label>
              <div className="mt-2">
                <Select
                  value={selectedModelCount.toString()}
                  onValueChange={(count) =>
                    setSelectedModelCount(parseInt(count))
                  }
                  disabled={!selectedUnitId}
                >
                  <SelectTrigger className="w-32 h-9 bg-white/5 border-white/20 text-white">
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

          {/* Mini Summary */}
          <div
            className={`flex items-center justify-between mt-4 mb-4 p-3 ${primaryGradientDir} ${theme.primaryFrom} ${theme.primaryTo} border ${theme.primaryBorder} rounded`}
          >
            <div
              className={`text-sm font-rajdhani tracking-[0.12em] uppercase ${theme.primaryMutedText}`}
            >
              Total Units: {units.length}
            </div>
            <div
              className={`text-lg font-orbitron font-bold ${theme.primaryText}`}
            >
              {getTotalPoints()} Points
            </div>
          </div>
        </div>

        <Separator className="mb-6 opacity-40" />

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
                  className={`border transition-all duration-200 ${
                    unitInstance.isDead
                      ? "border-red-500/50 bg-red-900/20"
                      : `${theme.primaryBorder} ${primaryGradientDir} ${theme.primaryFrom} ${theme.primaryTo}`
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4
                          className={`font-bold font-rajdhani tracking-wide ${theme.primaryText}`}
                        >
                          {unitInstance.name}
                        </h4>
                        {/* Classification removed */}
                        {unitInstance.isDead && (
                          <Badge variant="destructive" className="text-xs">
                            <Skull className="w-3 h-3 mr-1" />
                            DESTROYED
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-orbitron font-bold ${theme.primaryText}`}
                        >
                          {points}pts
                        </span>
                        {unitInstance.isDead && (
                          <Button
                            onClick={() => reviveUnit(unitInstance)}
                            size="sm"
                            variant="outline"
                            className="text-green-400 border-green-400 hover:bg-green-400/10"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Revive
                          </Button>
                        )}
                        <Button
                          onClick={() => removeUnit(unitInstance.id)}
                          size="sm"
                          variant="destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                      {/* Active Models */}
                      <div>
                        <Label className="text-xs text-gray-400 font-rajdhani uppercase">
                          Active
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => killModel(unitInstance)}
                            disabled={unitInstance.currentModels === 0}
                            className="size-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span
                            className={`font-orbitron font-bold min-w-[30px] text-center ${theme.primaryText}`}
                          >
                            {unitInstance.currentModels}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addModel(unitInstance)}
                            disabled={
                              unitInstance.currentModels >=
                              unitInstance.totalModels
                            }
                            className="size-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Total Models */}
                      <div>
                        <Label className="text-xs font-rajdhani uppercase text-amber-300">
                          Total
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeTotalModels(unitInstance, -1)}
                            disabled={
                              unitInstance.totalModels <= unit.modelsPerUnit.min
                            }
                            className="size-8 p-0 text-amber-300 border-amber-400/50"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-orbitron font-bold min-w-[30px] text-center text-amber-300">
                            {unitInstance.totalModels}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeTotalModels(unitInstance, +1)}
                            disabled={
                              unitInstance.totalModels >= unit.modelsPerUnit.max
                            }
                            className="size-8 p-0 text-amber-300 border-amber-400/50"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Wounds */}
                      <div>
                        <Label className="text-xs text-gray-400 font-rajdhani uppercase">
                          Wounds
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => damageModel(unitInstance, 1)}
                            disabled={unitInstance.isDead}
                            className="size-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span
                            className={`font-orbitron font-bold min-w-[40px] text-center ${
                              isWounded ? "text-red-400" : theme.primaryText
                            }`}
                          >
                            {unitInstance.wounds}/{unitInstance.maxWounds}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => healModel(unitInstance)}
                            disabled={unitInstance.isDead || !isWounded}
                            className="size-8 p-0"
                          >
                            <Heart className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Save */}
                      <div>
                        <Label className="text-xs text-gray-400 font-rajdhani uppercase">
                          Save
                        </Label>
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span
                            className={`font-orbitron text-sm ${theme.primaryText}`}
                          >
                            {unit.save}+
                          </span>
                          {unit.invulnSave && (
                            <span className="font-orbitron text-sm text-yellow-400">
                              ({unit.invulnSave}++)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Toughness */}
                      <div>
                        <Label className="text-xs text-gray-400 font-rajdhani uppercase">
                          Toughness
                        </Label>
                        <div
                          className={`font-orbitron text-sm mt-1 ${theme.primaryText}`}
                        >
                          T{unit.toughness}
                        </div>
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
