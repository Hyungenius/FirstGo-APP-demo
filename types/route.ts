export type RouteParams =
  | { params: Promise<{ id: string }> }
  | { params: { id: string } };

export type RouteParamsWithStep =
  | { params: Promise<{ id: string; stepId: string }> }
  | { params: { id: string; stepId: string } };
