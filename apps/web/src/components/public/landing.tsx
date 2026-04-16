import { ArrowRight } from "@lms-repo/ui/assets/icons/arrow-right";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { Link } from "@tanstack/react-router";
import { DeviceShowcase } from "./device-showcase";
import { FeaturesSection } from "./features-section";
import { Footer } from "./footer";
import { HeroSection } from "./hero-section";
import { VideoTutorial } from "./video-tutorial";

export default function Landing() {
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
