"use client";

import { useRouter } from "next/navigation";
import InputFirstThing from "@/components/InputFirstThing";

export default function HomeCreateStarter() {
  const router = useRouter();
  return (
    <InputFirstThing
      onCreated={(id) => router.push(`/tutorial/${id}`)}
      onError={() => {}}
    />
  );
}


