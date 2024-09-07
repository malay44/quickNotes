import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const items = [
  {
    id: 1,
    name: "John Doe",
    subject: "Hello",
    text: "This is a test note",
    read: false,
    date: new Date(),
    labels: ["work", "personal"],
  },
  {
    id: 2,
    name: "Jane Doe",
    subject: "Hello",
    text: "This is a test note",
    read: false,
    date: new Date(),
    labels: ["work", "personal"],
  },
  {
    id: 3,
    name: "John Doe",
    subject: "Hello",
    text: "This is a test note",
    read: false,
    date: new Date(),
    labels: ["work", "personal"],
  },
  {
    id: 4,
    name: "John Doe",
    subject: "Hello",
    text: "This is a test note",
    read: false,
    date: new Date(),
    labels: ["work", "personal"],
  },
];

export function NoteList() {
  const note = {
    selected: 1,
  };

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              note.selected === item.id && "bg-muted"
            )}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.name}</div>
                  {!item.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    note.selected === item.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {item.text.substring(0, 300)}
            </div>
            {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <Badge key={label}>{label}</Badge>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
