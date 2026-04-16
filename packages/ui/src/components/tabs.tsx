import { Tabs } from "@heroui/react";

export function TabsForSubmissions({
	options,
	textTab,
	attachmentsTab,
}: {
	options: string[];
	textTab: React.ReactNode;
	attachmentsTab: React.ReactNode;
}) {
	return (
		<Tabs variant="secondary">
			<Tabs.ListContainer>
				<Tabs.List aria-label="Options">
					{options.map((option, index) => (
						<Tabs.Tab key={index} id={`tab${index + 1}`}>
							{option}
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs.ListContainer>
			{options.map((_, index) => (
				<Tabs.Panel key={index} id={`tab${index + 1}`}>
					{index === 0 ? textTab : index === 1 ? attachmentsTab : null}
				</Tabs.Panel>
			))}
		</Tabs>
	);
}

// コース情報用タブ
export function TabsForCourseInfo({
	options,
	announcementsTab,
	assignmentsTab,
	membersTab,
}: {
	options: string[];
	announcementsTab: React.ReactNode;
	assignmentsTab: React.ReactNode;
	membersTab: React.ReactNode;
}) {
	return (
		<Tabs variant="secondary">
			<Tabs.ListContainer>
				<Tabs.List aria-label="Options">
					{options.map((option, index) => (
						<Tabs.Tab key={index} id={`tab${index + 1}`}>
							{option}
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs.ListContainer>
			{options.map((_, index) => (
				<Tabs.Panel key={index} id={`tab${index + 1}`}>
					{index === 0
						? announcementsTab
						: index === 1
							? assignmentsTab
							: membersTab}
				</Tabs.Panel>
			))}
		</Tabs>
	);
}

// 2FA用タブ
export function TabsFor2fa({
	otpForm,
	totpForm,
}: {
	otpForm: React.ReactNode;
	totpForm: React.ReactNode;
}) {
	return (
		<Tabs>
			<Tabs.ListContainer>
				<Tabs.List aria-label="Options">
					<Tabs.Tab id="totp">TOTP</Tabs.Tab>
					<Tabs.Tab id="otp">OTP</Tabs.Tab>
				</Tabs.List>
			</Tabs.ListContainer>
			<Tabs.Panel id="totp">{totpForm}</Tabs.Panel>
			<Tabs.Panel id="otp">{otpForm}</Tabs.Panel>
		</Tabs>
	);
}
