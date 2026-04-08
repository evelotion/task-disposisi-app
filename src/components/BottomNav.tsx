"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Mencegah hydration mismatch error
  useEffect(() => {
    setMounted(true);
    const session = localStorage.getItem("user_session");
    if (session) {
      setUser(JSON.parse(session));
    }
  }, [pathname]);

  // Sembunyikan navigasi jika belum render, belum login, atau di halaman login
  if (!mounted || !user || pathname === "/login") return null;

  const isBos = user.role === "ADMIN" || user.role === "KADEP";

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  return (
    <div 
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {isBos ? (
          <>
            <NavItem href="/" icon={HomeIcon} label="Beranda" active={pathname === "/"} />
            <NavItem href="/admin" icon={PlusIcon} label="Disposisi" active={pathname === "/admin"} />
            <NavItem href="/api/export" icon={ChartIcon} label="Rekap" active={false} isNativeLink />
            <NavItem href="#" icon={LogoutIcon} label="Keluar" onClick={handleLogout} />
          </>
        ) : (
          <>
            <NavItem href="/my-tasks" icon={TaskIcon} label="Tugas Saya" active={pathname === "/my-tasks"} />
            <NavItem href="#" icon={LogoutIcon} label="Keluar" onClick={handleLogout} />
          </>
        )}
      </div>
    </div>
  );
}

// Komponen Reusable untuk Item Navigasi
function NavItem({ href, icon: Icon, label, active, onClick, isNativeLink }: any) {
  const content = (
    <div className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}>
      <Icon active={active} />
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </div>
  );

  if (onClick) return <button onClick={onClick} className="flex-1 h-full py-2 focus:outline-none active:scale-95 transition-transform">{content}</button>;
  if (isNativeLink) return <a href={href} className="flex-1 h-full py-2 active:scale-95 transition-transform">{content}</a>;
  return <Link href={href} className="flex-1 h-full py-2 active:scale-95 transition-transform">{content}</Link>;
}

// --- SVG ICONS ---
const HomeIcon = ({active}:any) => <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const PlusIcon = ({active}:any) => <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const ChartIcon = ({active}:any) => <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const TaskIcon = ({active}:any) => <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const LogoutIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
