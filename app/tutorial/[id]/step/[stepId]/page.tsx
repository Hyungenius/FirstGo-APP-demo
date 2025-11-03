import ClientStepDetail from "./ClientStepDetail";

export default async function StepDetailPage(
  ctx: { params: Promise<{ id: string; stepId: string }> } | { params: { id: string; stepId: string } }
) {
  const resolvedParams = (await (ctx as any).params) ?? (ctx as any).params;
  const id = resolvedParams?.id as string;
  const stepId = resolvedParams?.stepId as string;
  return <ClientStepDetail tutorialId={id} stepId={stepId} />;
}

