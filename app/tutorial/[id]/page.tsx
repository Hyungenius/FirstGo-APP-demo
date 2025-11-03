import ClientTutorialPage from "./ClientTutorialPage";
import type { RouteParams } from "@/types/route";

export default async function Page(ctx: RouteParams) {
  const resolvedParams = "then" in ctx.params ? await ctx.params : ctx.params;
  const id = resolvedParams?.id as string;
  return <ClientTutorialPage tutorialId={id} />;
}


