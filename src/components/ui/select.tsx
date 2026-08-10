import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectContextValue {
	value?: string;
	onValueChange?: (value: string) => void;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	selectedText: React.ReactNode;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
	const context = React.useContext(SelectContext);
	if (!context) {
		throw new Error("Select components must be used within a <Select>");
	}
	return context;
}

export function SelectTrigger({
	className,
	children,
	onClick,
}: {
	className?: string;
	children?: React.ReactNode;
	onClick?: () => void;
}) {
	const { isOpen, setIsOpen } = useSelectContext();
	return (
		<button
			type="button"
			onClick={(e) => {
				setIsOpen(!isOpen);
				onClick?.();
			}}
			className={cn(
				"flex h-10 w-full items-center justify-between rounded-md border border-pharmako-border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-pharmako-text-muted focus:outline-none focus:ring-2 focus:ring-pharmako-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
		>
			{children}
			<ChevronDown className="ml-2 h-4 w-4 shrink-0 text-pharmako-text-muted opacity-50" />
		</button>
	);
}

export function SelectValue({
	children,
	placeholder,
}: {
	children?: React.ReactNode;
	placeholder?: string;
}) {
	const { selectedText, value } = useSelectContext();
	return (
		<span className="text-pharmako-text-primary block truncate">
			{value ? selectedText : (children || placeholder)}
		</span>
	);
}

export function SelectContent({
	children,
	className,
}: {
	children?: React.ReactNode;
	className?: string;
}) {
	const { isOpen } = useSelectContext();

	if (!isOpen) return null;

	return (
		<div
			className={cn(
				"absolute top-full left-0 z-50 mt-1 min-w-[8rem] w-full",
				"overflow-hidden rounded-lg border border-pharmako-border bg-white shadow-md",
				"animate-in fade-in-0 zoom-in-95 duration-150",
				className,
			)}
		>
			<div className="p-1 max-h-60 overflow-auto w-full">{children}</div>
		</div>
	);
}

export function SelectItem({
	className,
	value,
	children,
	onClick,
}: {
	className?: string;
	value: string;
	children?: React.ReactNode;
	onClick?: () => void;
}) {
	const { value: selectedValue, onValueChange, setIsOpen } = useSelectContext();
	const isSelected = selectedValue === value;

	return (
		<button
			type="button"
			onClick={(e) => {
				onValueChange?.(value);
				setIsOpen(false);
				onClick?.();
			}}
			className={cn(
				"relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
				"hover:bg-pharmako-primary-light hover:text-pharmako-primary-dark focus:bg-pharmako-primary-light focus:text-pharmako-primary-dark",
				isSelected && "bg-pharmako-primary-light text-pharmako-primary-dark font-medium",
				className,
			)}
		>
			{/* Checkmark for selected item */}
			<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
				{isSelected && (
					<svg
						width="15"
						height="15"
						viewBox="0 0 15 15"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4 fill-current"
					>
						<path
							d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
							fill="currentColor"
							fillRule="evenodd"
							clipRule="evenodd"
						></path>
					</svg>
				)}
			</span>
			<span className="block truncate">{children}</span>
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

	const currentValue = value !== undefined ? value : internalValue;

	const handleValueChange = (newValue: string) => {
		setInternalValue(newValue);
		onValueChange?.(newValue);
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

	// Extract selected text from children
	let selectedText: React.ReactNode = null;
	React.Children.forEach(children, (child) => {
		if (
			React.isValidElement(child) &&
			(child.type === SelectContent || String(child.type).includes("SelectContent"))
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
							(item.type === SelectItem || String(item.type).includes("SelectItem"))
						) {
							const itemElement = item as React.ReactElement<{
								value?: string;
								children?: React.ReactNode;
							}>;
							if (itemElement.props?.value === currentValue) {
								selectedText = itemElement.props?.children;
							}
						}
					},
				);
			}
		}
	});

	return (
		<SelectContext.Provider
			value={{
				value: currentValue,
				onValueChange: handleValueChange,
				isOpen,
				setIsOpen: disabled ? () => {} : setIsOpen,
				selectedText,
			}}
		>
			<div ref={containerRef} className={cn("relative w-full", className)}>
				{children}
			</div>
		</SelectContext.Provider>
	);
}
