"use client";

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  color: "emerald" | "amber" | "blue" | "stone";
}

interface ActivityTimelineProps {
  items: ActivityItem[];
}

const colorClasses = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  stone: "bg-stone-400",
};

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-stone-700">Actividad</h3>
      <div className="flex flex-col gap-3 pl-1">
        {items.map((item, i) => (
          <div key={item.id} className="flex items-start gap-3 relative">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className={`w-2 h-2 rounded-full ${colorClasses[item.color]}`} />
              {i < items.length - 1 && (
                <div className="w-px h-8 bg-stone-200 mt-1" />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 pb-4">
              <p className="text-sm text-stone-600 leading-snug">{item.text}</p>
              <span className="text-xs text-stone-400 mt-0.5">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
