import { useEffect, useRef } from "react";

export default function Contenteditable(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  const contentEditableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      contentEditableRef.current &&
      contentEditableRef.current.innerHTML !== props.value
    ) {
      contentEditableRef.current.innerHTML = props.value;
    }
  });

  return (
    <div
      contentEditable="true"
      ref={contentEditableRef}
      onInput={(event) => {
        const target = event.target as HTMLDivElement;
        props.onChange(target.innerHTML || "");
      }}
    />
  );
}
