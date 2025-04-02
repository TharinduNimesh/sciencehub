import { z } from 'zod'

// Types
export type ClassMethod = 
  | "VirtualRecurringSeries"
  | "VirtualSingleSession"
  | "InPersonRecurringSeries"
  | "InPersonSingleSession"

export type DatePattern = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN"

// Date pattern options for recurring classes
export const datePatternOptions = [
  { label: "Every Monday", value: "MON" as DatePattern },
  { label: "Every Tuesday", value: "TUE" as DatePattern },
  { label: "Every Wednesday", value: "WED" as DatePattern },
  { label: "Every Thursday", value: "THU" as DatePattern },
  { label: "Every Friday", value: "FRI" as DatePattern },
  { label: "Every Saturday", value: "SAT" as DatePattern },
  { label: "Every Sunday", value: "SUN" as DatePattern },
]

// Schema for class creation/editing
export const createClassSchema = (isRecurringClass: boolean) => z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
  grade: z.number().min(6).max(11, "Please select a valid grade"),
  method: z.enum([
    "VirtualRecurringSeries",
    "VirtualSingleSession",
    "InPersonRecurringSeries",
    "InPersonSingleSession",
  ]),
  date: z.string().min(1, "Date is required").superRefine((val, ctx) => {
    if (isRecurringClass) {
      // For recurring classes, ensure it's a valid pattern
      const isValid = datePatternOptions.some(
        (option) => option.value === val
      );
      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a valid schedule pattern",
        });
      }
    } else {
      // For one-time classes, ensure it's a valid future date
      const date = new Date(val);
      const isValid = !isNaN(date.getTime()) && date >= new Date();

      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a valid future date",
        });
      }
    }
  }),
  tags: z.array(z.string()).min(1, "Select at least one tag"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
})