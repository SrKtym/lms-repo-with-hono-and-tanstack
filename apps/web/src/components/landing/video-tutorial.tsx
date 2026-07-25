import { LazyMotionProvider } from "@lms-repo/ui/components/lazymotion-provider";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useState } from "react";
import { AssignmentScene } from "./assignment-scene";
import { MockHeader } from "./mock-header";
import { RegistrationScene } from "./registration-scene";
import { ScheduleScene } from "./schedule-scene";

export function VideoTutorial() {
	const stepCards = [
		{
			id: 0,
			title: "履修登録",
			description:
				"時間割上の「＋ボタン」を押すと講義の一覧を取得できます。そこから講義を選択して登録します。",
		},
		{
			id: 1,
			title: "スケジュールの作成",
			description:
				"「スケジュールを追加」ボタンを押すとスケジュール作成用のモーダルが開きます。ここで必要な情報を入力して作成します。",
		},
		{
			id: 2,
			title: "課題詳細ページの表示",
			description: "課題の詳細と提出エリア、コメントエリアを表示します。",
		},
	];
	const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
	const [path, setPath] = useState<string>("/register-courses");

	useEffect(() => {
		const durations = [5000, 5000, 5000] as const;
		// 各シーンの表示時間（5秒）
		const timer = setTimeout(() => {
			setActiveStep((prev) => {
				switch (prev) {
					case 0:
						setPath("/schedules");
						return 1;
					case 1:
						setPath("/course-list?course-id=abc&assignment-id=def");
						return 2;
					case 2:
						setPath("/register-courses");
						return 0;
				}
			});
		}, durations[activeStep]);
		return () => clearTimeout(timer);
	}, [activeStep]);

	return (
		<section className="px-4 py-20">
			<div className="container mx-auto max-w-6xl">
				<LazyMotionProvider>
					<m.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="mb-14 text-center"
					>
						<h2 className="mb-4 font-bold text-3xl text-gray-900 dark:text-white">
							チュートリアル
						</h2>
						<p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
							このアプリの使い方をアニメーションでご確認ください
						</p>
					</m.div>

					<div className="grid gap-10 lg:grid-cols-[2fr_0.8fr]">
						{/* 疑似ブラウザウィンドウ */}
						<m.div
							initial={{ opacity: 0, x: -24 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-slate-950"
						>
							<div className="border-slate-200 border-b px-5 py-4 dark:border-slate-800">
								<div className="flex items-center gap-2 text-slate-500 text-sm dark:text-slate-400">
									<div className="h-3 w-3 rounded-full bg-red-500" />
									<div className="h-3 w-3 rounded-full bg-yellow-500" />
									<div className="h-3 w-3 rounded-full bg-green-500" />
									<p className="ml-4 flex-1 overflow-hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-500 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
										https://lms-repo.com{path}
									</p>
								</div>
							</div>

							<div className="relative">
								<m.div
									initial={{ opacity: 0, scale: 0.98 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.45, ease: "easeOut" }}
									className="relative shadow-xl"
								>
									<div className="pointer-events-none relative h-[560px] overflow-hidden">
										{/* Background Gradient - HeroSection inspired */}
										<div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

										{/* Decorative Elements - HeroSection inspired */}
										<div className="pointer-events-none absolute inset-0 overflow-hidden">
											<div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl" />
											<div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
											<div className="absolute top-1/4 left-1/4 h-60 w-60 rounded-full bg-gradient-to-br from-blue-300/5 to-cyan-300/5 blur-2xl" />
										</div>
										{/* 3つのアニメーションが順番に表示される */}
										<AnimatePresence mode="wait">
											{activeStep === 0 && (
												<m.div
													key="registration"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													transition={{ duration: 0.35 }}
													className="absolute inset-0"
												>
													<MockHeader />
													<RegistrationScene />
												</m.div>
											)}

											{activeStep === 1 && (
												<m.div
													key="schedule"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													transition={{ duration: 0.35 }}
													className="absolute inset-0"
												>
													<MockHeader />
													<ScheduleScene />
												</m.div>
											)}

											{activeStep === 2 && (
												<m.div
													key="assignment"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													transition={{ duration: 0.35 }}
													className="absolute inset-0"
												>
													<MockHeader />
													<AssignmentScene />
												</m.div>
											)}
										</AnimatePresence>
									</div>
								</m.div>
							</div>
						</m.div>

						{/* 操作説明 */}
						<m.div
							initial={{ opacity: 0, x: 30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="space-y-6"
						>
							<h3 className="font-bold text-2xl text-foreground">
								各シーンの説明
							</h3>
							<div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
								{stepCards.map((card) => (
									<m.div
										key={card.id}
										initial={{ opacity: 0, y: 12 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.4, delay: 0.12 + card.id * 0.08 }}
										className={`rounded-3xl border px-4 py-4 transition ${
											activeStep === card.id
												? "border-primary bg-primary/5"
												: "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
										}`}
									>
										<div className="flex items-center justify-between gap-3">
											<div>
												<p className="font-semibold text-slate-900 text-sm dark:text-white">
													{card.title}
												</p>
												<p className="mt-1 text-slate-500 text-sm dark:text-slate-400">
													{card.description}
												</p>
											</div>
											<div
												className={`flex h-9 w-9 items-center justify-center rounded-full p-4 font-bold text-xs ${activeStep === card.id ? "bg-primary text-background" : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}
											>
												{card.id + 1}
											</div>
										</div>
									</m.div>
								))}
							</div>
						</m.div>
					</div>
				</LazyMotionProvider>
			</div>
		</section>
	);
}
