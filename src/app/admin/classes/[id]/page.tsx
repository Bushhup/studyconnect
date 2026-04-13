
// This dynamic route is deprecated to support static exports.
// Use /admin/class-portal?id=... instead.

export function generateStaticParams() {
  return [{ id: 'static' }];
}

export default function Page() {
  return null;
}
