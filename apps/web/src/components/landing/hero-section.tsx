import { ArrowDown } from "@lms-repo/ui/assets/icons/arrow-down";
import * as m from "motion/react-m";
import { TypewriterText } from "./typewriter-text";

interface HeroSectionProps {
	children: React.ReactNode;
}

export function HeroSection({ children }: HeroSectionProps) {
	const features = [
		"時間割管理",
		"課題管理",
		"通知機能",
		"マルチデバイス",
	] as const;

	const typewriterText = [
		"manages enrolled courses",
		"manages your schedules",
		"manages your assignments",
	];

	return (
		<section className="relative flex min-h-screen items-center justify-center overflow-hidden">
			{/* Main Content */}
			<div className="relative z-10 container mx-auto px-4 py-20">
				<div className="mx-auto max-w-4xl text-center">
					<m.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="mb-8"
					>
						<div className="mb-8 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
							新しい学習体験へ
						</div>
					</m.div>

					<m.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white"
					>
						<TypewriterText texts={typewriterText} />
					</m.h1>

					<m.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="mx-auto mb-10 max-w-3xl text-lg text-gray-600 sm:text-xl dark:text-gray-300"
					>
						このアプリは大学生の学習をサポートすることを目的として開発されました。
						時間割の作成やスケジュールの管理、課題の管理をこれ一つで実現できます。
					</m.p>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="flex items-center justify-center"
					>
						{children}
					</m.div>

					{/* Feature Pills */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="mt-16 flex flex-wrap justify-center gap-4"
					>
						{features.map((feature) => (
							<div
								key={feature}
								className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md dark:bg-gray-800 dark:text-gray-300"
							>
								{feature}
							</div>
						))}
					</m.div>
				</div>
			</div>

			{/* Scroll Indicator */}
			<m.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.8 }}
				className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
			>
				<div className="animate-bounce">
					<ArrowDown className="text-gray-400" />
				</div>
			</m.div>
		</section>
	);
}
