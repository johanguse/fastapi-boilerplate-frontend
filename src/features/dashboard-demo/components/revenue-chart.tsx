import { LineChart } from "lucide-react";

export function RevenueChart() {
  return (
    <div className="h-[300px] w-full">
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Revenue trend chart would be displayed here
          </p>
          <p className="text-xs text-muted-foreground">
            Line chart showing revenue growth over time
          </p>
        </div>
      </div>
    </div>
  );
}
