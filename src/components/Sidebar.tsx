"use client";
import { navigationConfig } from "@/config/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LucaBgWhiteWithoutTitle from "../../public/LucaBgWhiteWithoutTitle.png";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  sidebarContainerVariant,
  sidebarItemVariant,
} from "@/app/lib/animations";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  /** When true, renders inside a mobile drawer: no collapse toggle, no rounded corner, always visible. */
  inDrawer?: boolean;
}

export default function Sidebar({ inDrawer = false }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = useAuthStore((s) => s.role) ?? "patient";

  const allowedLinks = navigationConfig.filter((i) => i.roles.includes(role));
  return (
    <motion.aside
      variants={sidebarContainerVariant}
      initial="hidden"
      animate="visible"
      className={cn(
        "bg-luca-surface min-h-screen",
        !inDrawer && "rounded-br-[5rem] hidden lg:flex lg:flex-col",
        inDrawer && "flex flex-col",
        inDrawer ? "w-full" : isCollapsed ? "w-16 transition-all duration-300" : "w-60 transition-all duration-300 p-6"
      )}
    >
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "flex-col justify-center gap-2" : "gap-2"
        )}
      >
        <Image
          width={isCollapsed ? 30 : 44}
          height={isCollapsed ? 30 : 44}
          alt="logo"
          src={LucaBgWhiteWithoutTitle}
          className={cn(isCollapsed && "mt-8")}
        />
        {!isCollapsed && (
          <motion.div
            variants={sidebarItemVariant}
            initial="hidden"
            animate="visible"
            className="flex-1 min-w-0"
          >
            <h2 className="font-bold text-luca-primary-hover text-2xl tracking-tight truncate">
              LucaMed
            </h2>
            <p className="text-luca-muted text-sm font-semibold tracking-tight truncate">
              Tu clínica virtual
            </p>
          </motion.div>
        )}
        {!inDrawer && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "shrink-0 rounded-full hover:bg-slate-200 p-1 transition-all",
              isCollapsed ? "mb-2" : "ml-auto"
            )}
          >
            <TbLayoutSidebarLeftCollapseFilled
              className={cn(
                "w-7 h-7 transition-all text-luca-primary-hover",
                isCollapsed && "rotate-180"
              )}
            />
          </button>
        )}
      </div>
      <div
        className={`flex-1 overflow-y-auto ${isCollapsed && "flex flex-col justify-center"}`}
      >
        {" "}
        {allowedLinks.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname;
          return (
            <motion.div
              key={item.href}
              variants={sidebarItemVariant}
              className={`my-2 ${isCollapsed && "flex flex-col items-center justify-center"}`}
            >
              <Link
                href={item.href}
                key={item.href}
                className={`rounded-4xl ${!isCollapsed ? "py-3 px-8 gap-4" : "py-3 px-1 flex items-center justify-center w-[50%]"} font-semibold hover:bg-luca-primary hover:text-luca-fg-on-primary flex items-center ${isActive && "bg-luca-primary text-luca-fg-on-primary"} transition-all duration-200`}
              >
                <Icon className="w-6 h-6" />
                {!isCollapsed && <p>{item.title}</p>}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.aside>
  );
}
