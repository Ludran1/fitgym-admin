"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const DISPLAY_FORMAT = "dd/MM/yyyy";
const STORAGE_FORMAT = "yyyy-MM-dd";

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? parse(value, STORAGE_FORMAT, new Date()) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? format(parse(value, STORAGE_FORMAT, new Date()), DISPLAY_FORMAT) : placeholder}
          <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            const next = date ? format(date, STORAGE_FORMAT) : "";
            onChange?.(next);
            if (date) setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";
