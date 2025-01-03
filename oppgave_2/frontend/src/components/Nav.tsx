"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoPeopleCircleOutline } from "react-icons/io5";

export default function Nav() {
  const router = useRouter();

  // resette params når man klikker på logo - claude.ai
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <header>
      <Link href="/" onClick={handleLogoClick}>
        <h1 className="logo">
          <IoPeopleCircleOutline />
        </h1>
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
