export interface NoteTextBlock {
  id: string;
  type: "text";
  align: "left" | "center" | "right";
  fontSize: number;
  value: TextBlockValue[];
}

export type TextBlockValue = [string, Array<"b" | "i" | "u" | undefined>];
