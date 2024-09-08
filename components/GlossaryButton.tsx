"use client";

import { Sparkles } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";
import { useFormState, useFormStatus } from "react-dom";
import { GlossaryState, identifyKeyTerms } from "@/Actions/actions";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setGlossary } from "@/Redux/notesSlice";
import { cn } from "@/lib/utils";

const initialState: GlossaryState = {
  text: "",
  terms: {},
};

export function GlossaryButton({
  text,
  noteId,
}: {
  text?: string;
  noteId?: string | null;
}) {
  const [state, formAction] = useFormState(identifyKeyTerms, initialState);

  const dispatch = useDispatch();

  useEffect(() => {
    if (state.terms && noteId) {
      dispatch(setGlossary({ id: noteId, glossary: state.terms }));
    }
  }, [dispatch, noteId, state.terms]);

  return (
    <form action={() => text && formAction({ text })}>
      <ActionButton>
        <Sparkles className="h-4 w-4" />
      </ActionButton>
    </form>
  );
}

function ActionButton(props: ButtonProps) {
  const { pending: isPending } = useFormStatus();
  return (
    <Button
      variant="outline"
      size="icon"
      disabled={isPending}
      className="h-10 w-10 disabled:opacity-100"
      {...props}
    >
      <Sparkles className={cn("h-4 w-4", isPending && "animate-ping")} />
    </Button>
  );
}
