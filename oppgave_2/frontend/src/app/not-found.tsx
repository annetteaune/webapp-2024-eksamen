import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <h2>404 - Not Found</h2>
      <p>Fant ikke arrangementet</p>
      <Link href="/">Tilbake til forsiden</Link>
    </div>
  );
}
