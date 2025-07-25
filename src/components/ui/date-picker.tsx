
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({ date, setDate, placeholder }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal border-[#62e3c8] text-[#62e3c8] hover:bg-[#62e3c8] hover:text-white",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder || "Sanani tanlang"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-lg border border-gray-200">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className="p-4"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              "hover:bg-[#62e3c8] hover:text-white rounded-md"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              "hover:bg-[#62e3c8] hover:text-white rounded-md",
              "aria-selected:bg-[#62e3c8] aria-selected:text-white"
            ),
            day_range_start: "day-range-start",
            day_range_end: "day-range-end",
            day_selected:
              "bg-[#62e3c8] text-white hover:bg-[#62e3c8] hover:text-white focus:bg-[#62e3c8] focus:text-white",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            caption_dropdowns: "flex gap-1",
            caption_dropdown_month: "relative",
            caption_dropdown_year: "relative",
            dropdown_month: "appearance-none bg-transparent border-none text-sm font-medium pr-8 py-1.5 rounded-md focus:ring-2 focus:ring-[#62e3c8] focus:outline-none",
            dropdown_year: "appearance-none bg-transparent border-none text-sm font-medium pr-8 py-1.5 rounded-md focus:ring-2 focus:ring-[#62e3c8] focus:outline-none",
            dropdown: "absolute z-10 bg-white shadow-lg rounded-md p-2 mt-1",
            // Add more custom classes as needed
          }}
        />
      </PopoverContent>
    </Popover>
  )
}