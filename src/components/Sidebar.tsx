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

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = useAuthStore((s) => s.role) ?? "patient";

  const allowedLinks = navigationConfig.filter((i) => i.roles.includes(role));
  return (
    <motion.aside
      variants={sidebarContainerVariant}
      initial="hidden"
      animate="visible"
      className={`bg-luca-surface min-h-screen rounded-br-[5rem] ${isCollapsed ? "w-[4vw] transition-all duration-300" : "w-[15vw] transition-all duration-300 p-6 "}`}
    >
      <div
        className={`flex gap-6 items-center ${isCollapsed && "flex flex-col justify-center "}`}
      >
        <Image
          width={isCollapsed ? 30 : 50}
          height={isCollapsed ? 30 : 50}
          alt="logo"
          src={LucaBgWhiteWithoutTitle}
          className={`${isCollapsed && "mt-8"}`}
        />
        {!isCollapsed && (
          <motion.div
            variants={sidebarItemVariant}
            initial="hidden"
            animate="visible"
          >
            <h2 className="font-bold text-luca-primary-hover text-4xl tracking-tight">
              LucaMed
            </h2>
            <p className="text-luca-muted text-md font-semibold tracking-tight">
              Tu clinica virtual
            </p>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`rounded-full hover:bg-slate-200 p-1 transition-all ${isCollapsed ? "mb-2" : "ml-2"}`}
        >
          <TbLayoutSidebarLeftCollapseFilled
            className={`w-8 h-8 transition-all text-luca-primary-hover ${isCollapsed && "rotate-180"}`}
          />
        </button>
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
                className={`rounded-4xl ${!isCollapsed ? "py-3 px-8 gap-4" : "py-3 px-1 flex items-center justify-center w-[50%]"} text-luca-muted-dark font-semibold hover:bg-luca-primary hover:text-luca-fg-on-primary flex items-center ${isActive && "bg-luca-primary-hover text-luca-fg-on-primary"} transition-all duration-200`}
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
