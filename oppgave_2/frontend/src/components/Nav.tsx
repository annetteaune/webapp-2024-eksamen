import Link from "next/link";

export default function Nav() {
  return (
    <header>
      <Link href="/">
        <h1>LOGO</h1>
      </Link>
      <nav>
        <ul>
          <li>
            <Link href="/">Hjem</Link>
          </li>
          <li>
            <Link href="/admin">Admin</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
