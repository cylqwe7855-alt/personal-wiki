import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1 className="mw-page-title">Page Not Found</h1>
      <p>
        The wiki page you are looking for does not exist.
      </p>
      <p>
        <Link href="/">Return to Main Page</Link>
        {" | "}
        <Link href="/search">Search</Link>
      </p>
    </div>
  );
}
