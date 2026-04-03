import React from "react";
import WorkspaceClient from "./WorkspaceClient";

export default async function ProblemWorkspacePage({
  params,
}: {
  params: Promise<{ titleSlug: string }>;
}) {
  const { titleSlug } = await params;
  return <WorkspaceClient titleSlug={titleSlug} />;
}
