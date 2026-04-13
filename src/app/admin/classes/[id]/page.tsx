import ClassDetailClient from './class-detail-client';

// Required for output: export with dynamic routes
export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ClassDetailClient id={resolvedParams.id} />;
}
