import { Modal } from "@heroui/react";
import type React from "react";

interface CreateCourseModalProps {
	triggerButton: React.ReactNode;
	children: React.ReactNode;
}

// Create course modal
export function CreateCourseModal({
	triggerButton,
	children,
}: CreateCourseModalProps) {
	return (
		<Modal>
			{triggerButton}
			<Modal.Backdrop variant="transparent">
				<Modal.Container size="lg">
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading className="text-gray-900 dark:text-white">
								講義の作成
							</Modal.Heading>
						</Modal.Header>
						<Modal.Body>{children}</Modal.Body>
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
}
