import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	pixelBasedPreset,
	Tailwind,
	Text,
} from "react-email";

interface BaseEmailTemplateProps {
	preview: string;
	title: string;
	children: React.ReactNode;
	email?: string;
}

export const BaseEmailTemplate = ({
	preview,
	title,
	children,
	email,
}: BaseEmailTemplateProps) => {
	return (
		<Html lang="ja">
			<Head />
			<Tailwind
				config={{
					presets: [pixelBasedPreset],
				}}
			>
				<Preview>{preview}</Preview>
				<Body className="bg-gray-50">
					{/* 明示的なピクセル値を伴うブラケット表記を使用（Tailwindの標準ユーティリティクラス（rounded-3xl、shadow-lg、space-y-6など）は使用不可 */}
					<Container className="mx-auto my-[40px] w-full max-w-[480px] rounded border border-solid border-gray-200 bg-white p-[24px]">
						<Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-bold text-gray-900">
							{title}
						</Heading>
						<div className="mb-[24px]">{children}</div>
						<Hr className="mx-0 my-[26px] w-full border border-solid border-gray-200" />
						{email && (
							<Text className="text-center text-[14px] leading-[24px] text-gray-500">
								このメールは{" "}
								<span className="font-medium text-blue-600">{email}</span>{" "}
								宛に送信されました。
								<br />
								もし意図しないメールである場合は、このメールを無視してください。
							</Text>
						)}
						<Text className="text-center text-[12px] leading-[24px] text-gray-400">
							&copy; {new Date().getFullYear()} LMS. All rights reserved.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default BaseEmailTemplate;
