"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

type ValueStepperProps = {
  label: string;
  value: number;
  onInc: () => void;
  onDec: () => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  buttonClassName?: string;
};

export default function ValueStepper({
  label,
  value,
  onInc,
  onDec,
  disabled,
  className = "",
  labelClassName = "text-gray-400 text-sm font-bold font-rajdhani tracking-[0.12em] uppercase mt-2 min-h-[40px] flex items-center justify-center",
  valueClassName = "text-4xl font-black tracking-tighter tabular-nums text-white leading-none font-orbitron",
  buttonClassName = "",
}: ValueStepperProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Button
        onClick={onDec}
        disabled={disabled}
        size="sm"
        variant="outline"
        className={`h-8 w-8 p-0 flex-shrink-0 ${buttonClassName}`}
        aria-label={`${label} decrement`}
        title="Decrease"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="text-center flex-1">
        <div className={valueClassName}>{value}</div>
        <div className={labelClassName}>{label}</div>
      </div>
      <Button
        onClick={onInc}
        disabled={disabled}
        size="sm"
        variant="outline"
        className={`h-8 w-8 p-0 flex-shrink-0 ${buttonClassName}`}
        aria-label={`${label} increment`}
        title="Increase"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
