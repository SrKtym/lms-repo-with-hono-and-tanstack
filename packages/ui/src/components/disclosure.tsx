import { Disclosure } from "@heroui/react";
import { OutlineButton } from "./button";

interface DefaultDisclosureProps {
	title: string;
	children: React.ReactNode;
}

export function DefaultDisclosure({ title, children }: DefaultDisclosureProps) {
	return (
		<Disclosure>
			<Disclosure.Heading>
				<div className="flex items-center justify-center gap-2">
					<OutlineButton slot="trigger">
						{title}
						<Disclosure.Indicator />
					</OutlineButton>
				</div>
			</Disclosure.Heading>
			<Disclosure.Content>{children}</Disclosure.Content>
		</Disclosure>
	);
}
