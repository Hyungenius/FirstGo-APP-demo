import ClientTutorialPage from "./ClientTutorialPage";

export default async function Page(ctx: { params: Promise<{ id: string }> } | { params: { id: string } }) {
  const resolvedParams = (await (ctx as any).params) ?? (ctx as any).params;
  const id = resolvedParams?.id as string;
  return <ClientTutorialPage tutorialId={id} />;
}


