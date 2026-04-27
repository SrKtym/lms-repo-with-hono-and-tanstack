import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "@lms-repo/ui/assets/icons/arrow-right";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { Link } from "@tanstack/react-router";
import { DeviceShowcase } from "@/components/public/device-showcase";
import { FeaturesSection } from "@/components/public/features-section";
import { Footer } from "@/components/public/footer";
import { HeroSection } from "@/components/public/hero-section";
import { VideoTutorial } from "@/components/public/video-tutorial";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="flex min-h-screen flex-col">
			<HeroSection>
				<Link to="/sign-in">
					<DefaultButton size="lg" className="flex items-center gap-2">
						はじめる
						<ArrowRight />
					</DefaultButton>
				</Link>
			</HeroSection>
			<FeaturesSection />
			<DeviceShowcase />
			<VideoTutorial />
			<Footer />
		</div>
	);
}
