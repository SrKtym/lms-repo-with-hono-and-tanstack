import { Button } from "@heroui/react";

// Default button component
export function DefaultButton(props: React.ComponentProps<typeof Button>) {
	return <Button variant="primary" {...props} />;
}

// Cancel button
export function CancelButton(props: React.ComponentProps<typeof Button>) {
	return <Button variant="tertiary" {...props} />;
}

// Danger button for critical actions
export function DangerButton(props: React.ComponentProps<typeof Button>) {
	return <Button variant="danger" {...props} />;
}

// Outline button
export function OutlineButton(props: React.ComponentProps<typeof Button>) {
	return (
		<Button fullWidth variant="outline" {...props}>
			{props.children}
		</Button>
	);
}

// Dropdown button
export function DropdownButton(props: React.ComponentProps<typeof Button>) {
	return <Button className="h-auto p-2" variant="secondary" {...props} />;
}

// Popover button
export function PopoverButton(props: React.ComponentProps<typeof Button>) {
	return (
		<Button isIconOnly className="h-auto p-2" variant="secondary" {...props} />
	);
}

// Back to top button
export function BackToTopButton() {
	return (
		<button
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
			className="w-full cursor-pointer bg-gray-500 px-3 py-2 text-white"
		>
			Back to Top
		</button>
	);
}
