"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SelectTrigger({
	className,
	children,
	onClick,
}: {
	className?: string;
	children?: React.ReactNode;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex h-10 w-full items-center justify-between rounded-lg border border-pharmako-border bg-white px-3 py-2 text-sm",
				"text-pharmako-text-primary",
				"focus:outline-none focus:ring-2 focus:ring-pharmako-primary/20 focus:border-pharmako-primary",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"hover:border-pharmako-primary/50 transition-colors",
				className,
			)}
		>
			{children}
			<ChevronDown className="ml-2 h-4 w-4 shrink-0 text-pharmako-text-muted" />
		</button>
	);
}

export function SelectValue({ children }: { children?: React.ReactNode }) {
	return <span className="text-pharmako-text-primary">{children}</span>;
}

export function SelectContent({
	children,
	className,
}: {
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"absolute top-full left-0 right-0 z-50 mt-1",
				"overflow-hidden rounded-lg border border-pharmako-border bg-white shadow-lg",
				"animate-in fade-in-0 zoom-in-95 duration-150",
				className,
			)}
		>
			<div className="p-1 max-h-60 overflow-auto">{children}</div>
		</div>
	);
}

export function SelectItem({
	value,
	children,
	onClick,
}: {
	value: string;
	children?: React.ReactNode;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			value={value}
			className="relative w-full cursor-pointer select-none rounded-md py-2 pl-8 pr-3 text-left text-sm hover:bg-pharmako-primary-light focus:bg-pharmako-primary-light outline-none"
		>
			{children}
		</button>
	);
}

interface SelectProps {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	children?: React.ReactNode;
	className?: string;
	disabled?: boolean;
	name?: string;
}

export function Select({
	value,
	defaultValue,
	onValueChange,
	children,
	className,
	disabled,
}: SelectProps) {
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const [isOpen, setIsOpen] = React.useState(false);
	const containerRef = React.useRef<HTMLDivElement>(null);

	const currentValue = value ?? internalValue;

	const handleSelect = (newValue: string) => {
		setInternalValue(newValue);
		onValueChange?.(newValue);
		setIsOpen(false);
	};

	// Close on click outside
	React.useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	// Get selected display text
	let selectedText = "Seleccionar";
	React.Children.forEach(children, (child) => {
		if (
			React.isValidElement(child) &&
			(child.type === SelectContent ||
				String(child.type).includes("SelectContent"))
		) {
			const childElement = child as React.ReactElement<{
				children?: React.ReactNode;
			}>;
			if (childElement.props?.children) {
				React.Children.forEach(
					childElement.props.children,
					(item: React.ReactNode) => {
						if (
							React.isValidElement(item) &&
							(item.type === SelectItem ||
								String(item.type).includes("SelectItem"))
						) {
							const itemElement = item as React.ReactElement<{
								value?: string;
								children?: React.ReactNode;
							}>;
							if (itemElement.props?.value === currentValue) {
								selectedText = String(itemElement.props?.children);
							}
						}
					},
				);
			}
		}
	});

	return (
		<div ref={containerRef} className={cn("relative", className)}>
			<SelectTrigger
				onClick={() => !disabled && setIsOpen(!isOpen)}
				className={cn(disabled && "opacity-50 cursor-not-allowed")}
			>
				<SelectValue>{selectedText}</SelectValue>
			</SelectTrigger>

			{isOpen && (
				<SelectContent>
					{/* Pass handleSelect to each SelectItem */}
					{React.Children.map(children, (child) => {
						if (
							React.isValidElement(child) &&
							(child.type === SelectItem ||
								String(child.type).includes("SelectItem"))
						) {
							const itemElement = child as React.ReactElement<{
								value?: string;
								children?: React.ReactNode;
							}>;
							return (
								<SelectItem
									key={itemElement.props?.value}
									value={itemElement.props?.value ?? ""}
									onClick={() => handleSelect(itemElement.props?.value ?? "")}
								>
									{itemElement.props?.children}
								</SelectItem>
							);
						}
						return child;
					})}
				</SelectContent>
			)}
		</div>
	);
}
