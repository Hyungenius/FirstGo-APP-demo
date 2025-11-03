import ClientStepDetail from "./ClientStepDetail";
import type { RouteParamsWithStep } from "@/types/route";

export default async function StepDetailPage(ctx: RouteParamsWithStep) {
  const resolvedParams = "then" in ctx.params ? await ctx.params : ctx.params;
  const id = resolvedParams?.id as string;
  const stepId = resolvedParams?.stepId as string;
  return <ClientStepDetail tutorialId={id} stepId={stepId} />;
}

