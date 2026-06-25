"use client";

import { useState, useEffect, useRef } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import {
	MenuIcon,
	X,
	LogIn,
	Users,
	Mail,
	LayoutDashboard,
	Stethoscope,
	Pill,
	Building2,
	Home,
	ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

// ─────────────────────────────────────────────────────────────
// Animation Variants — same as landing page
// ─────────────────────────────────────────────────────────────
const HEADER_VARIANTS: Variants = {
	hidden: { opacity: 0, y: -20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
	},
};

const LINK_WRAPPER_VARIANTS: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.08, delayChildren: 0.2 },
	},
};

const LINK_ITEM_VARIANTS: Variants = {
	hidden: { opacity: 0, y: -8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
	},
};

// ─────────────────────────────────────────────────────────────
// macOS-style sidebar drawer
// ─────────────────────────────────────────────────────────────
function MacOSDrawer({
	onClose,
	links,
}: {
	onClose: () => void;
	links: Array<{ label: string; href: string; icon: React.ComponentType<{ className?: string }> }>;
}) {
	return (
		<>
			{/* Backdrop */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2 }}
				className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
				onClick={onClose}
			/>

			{/* Drawer panel */}
			<motion.aside
				initial={{ x: "-100%" }}
				animate={{ x: 0 }}
				exit={{ x: "-100%" }}
				transition={{ type: "spring", damping: 25, stiffness: 200 }}
				className="fixed left-0 top-0 bottom-0 w-20 bg-white/95 backdrop-blur-xl 
                   border-r border-slate-200/50 shadow-2xl z-50
                   flex flex-col items-center py-6 gap-2"
			>
				{/* Close button */}
				<button
					onClick={onClose}
					aria-label="Cerrar menú"
					className="size-10 flex items-center justify-center rounded-xl
                     bg-slate-100 hover:bg-slate-200 
                     transition-colors mb-4"
				>
					<X className="size-5 text-slate-600" />
				</button>

				{/* Navigation icons */}
				<nav
					aria-label="Navegación móvil"
					className="flex flex-col items-center gap-3 flex-1"
				>
					{links.map((link) => {
						const Icon = link.icon;
						return (
							<motion.a
								key={link.href}
								href={link.href}
								onClick={onClose}
								variants={LINK_ITEM_VARIANTS}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								className="size-12 flex items-center justify-center rounded-2xl
                           bg-slate-100 hover:bg-[#23dce1]/10 text-slate-600 hover:text-[#23dce1]
                           transition-all duration-200 shadow-sm hover:shadow-md"
								title={link.label}
								aria-label={link.label}
							>
								<Icon className="size-5" />
							</motion.a>
						);
					})}
				</nav>

				{/* Bottom accent line */}
				<div className="w-8 h-1 rounded-full bg-[#23dce1]/30" />
			</motion.aside>
		</>
	);
}

// ─────────────────────────────────────────────────────────────
// Animated header link — same as landing
// ─────────────────────────────────────────────────────────────
function AnimatedHeaderLink({
	href,
	label,
	icon: Icon,
}: {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}) {
	return (
		<motion.a
			href={href}
			variants={LINK_ITEM_VARIANTS}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.96 }}
			className="relative px-2 py-1 text-gray-500 font-medium 
                 transition-colors duration-200
                 hover:text-gray-700 
                 focus-visible:outline-none focus-visible:ring-2 
                 focus-visible:ring-luca-primary/30 focus-visible:ring-offset-2 
                 rounded-lg text-sm lg:text-base hidden lg:flex items-center gap-2"
		>
			<Icon className="size-4" />
			{label}
			{/* Underline animado */}
			<motion.span
				className="absolute -bottom-0.5 left-1/2 h-0.5 w-0 bg-[#23dce1] rounded-full"
				whileHover={{ width: "80%", x: "-40%", transition: { duration: 0.25 } }}
			/>
		</motion.a>
	);
}

// ─────────────────────────────────────────────────────────────
// Public Header — EXACT same as landing page
// ─────────────────────────────────────────────────────────────
export default function PublicHeader() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const [mounted, setMounted] = useState(false);
	const token = useAuthStore((state) => state.token);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Click outside listener for dropdown
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const isLoggedIn = mounted && !!token;

	const baseLinks = [
		{ label: "Inicio", href: "/", icon: Home },
		{ label: "Nosotros", href: "/#nosotros", icon: Users },
		{ label: "Contacto", href: "/#contacto", icon: Mail },
	];

	const authLink = isLoggedIn
		? { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }
		: { label: "Login", href: "/login", icon: LogIn };

	const directoryLinks = [
		{ label: "Doctores", href: "/doctors", icon: Stethoscope, desc: "Busca médicos y agendas" },
		{ label: "Farmacias", href: "/pharmacies", icon: Pill, desc: "Encuentra medicamentos y sucursales" },
		{ label: "Clínicas", href: "/clinics", icon: Building2, desc: "Centros médicos y laboratorios" },
	];

	const mobileLinks = [
		...baseLinks,
		authLink,
		...directoryLinks,
	];

	return (
		<>
			<AnimatePresence>
				{drawerOpen && (
					<MacOSDrawer
						onClose={() => setDrawerOpen(false)}
						links={mobileLinks}
					/>
				)}
			</AnimatePresence>

			{/* Header animado */}
			<motion.header
				initial="hidden"
				animate="visible"
				variants={HEADER_VARIANTS}
				className="w-full h-16 lg:h-20 flex items-center justify-center lg:justify-end 
                   px-4 sm:px-6 md:px-8 lg:px-12
                   bg-white/60 backdrop-blur-md
                "
			>
				{/* Mobile menu button */}
				<button
					aria-label="Abrir menú de navegación"
					onClick={() => setDrawerOpen(true)}
					className="lg:hidden absolute left-4 size-10 flex items-center justify-center 
                     rounded-xl bg-white/80 backdrop-blur-sm
                     hover:bg-slate-50 hover:shadow-md
                     transition-all duration-200
                     focus-visible:outline-none focus-visible:ring-2 
                     focus-visible:ring-luca-primary/30 focus-visible:ring-offset-2"
				>
					<MenuIcon className="size-5 text-gray-600" />
				</button>

				{/* Navigation links */}
				<motion.nav
					aria-label="Navegación principal"
					variants={LINK_WRAPPER_VARIANTS}
					className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10"
				>
					{baseLinks.map((link) => (
						<AnimatedHeaderLink
							key={link.href}
							href={link.href}
							label={link.label}
							icon={link.icon}
						/>
					))}

					{/* Directorio Dropdown Menu */}
					<div className="relative hidden lg:block" ref={dropdownRef}>
						<button
							onClick={() => setDropdownOpen(!dropdownOpen)}
							className={`px-2 py-1 text-gray-500 font-medium hover:text-gray-700 
                                      flex items-center gap-1.5 text-sm lg:text-base transition-colors rounded-lg
                                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23dce1]/20`}
						>
							<Building2 className="size-4" />
							<span>Directorio</span>
							<ChevronDown className={`size-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
						</button>

						<AnimatePresence>
							{dropdownOpen && (
								<motion.div
									initial={{ opacity: 0, y: 10, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: 10, scale: 0.95 }}
									transition={{ duration: 0.15, ease: "easeOut" }}
									className="absolute left-0 mt-2 w-80 bg-white border border-pharmako-border-soft rounded-2xl p-3 z-50 flex flex-col gap-1"
								>
									{directoryLinks.map((item) => {
										const Icon = item.icon;
										return (
											<a
												key={item.href}
												href={item.href}
												onClick={() => setDropdownOpen(false)}
												className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
											>
												<div className="p-2 text-pharmako-care rounded-lg group-hover:bg-pharmako-care group-hover:text-white transition-colors shrink-0">
													<Icon className="size-4" />
												</div>
												<div className="min-w-0">
													<p className="text-sm font-semibold text-gray-500 group-hover:text-pharmako-care transition-colors">
														{item.label}
													</p>
													<p className="text-xs text-pharmako-text-muted mt-0.5 line-clamp-1">
														{item.desc}
													</p>
												</div>
											</a>
										);
									})}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Login / Dashboard Link */}
					<AnimatedHeaderLink
						key={authLink.href}
						href={authLink.href}
						label={authLink.label}
						icon={authLink.icon}
					/>
				</motion.nav>
			</motion.header>
		</>
	);
}
