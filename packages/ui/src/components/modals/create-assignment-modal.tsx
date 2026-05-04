import { Modal } from "@heroui/react";

interface CreateAssignmentModalProps {
	triggerButton: React.ReactNode;
	children: React.ReactNode;
}

export function CreateAssignmentModal({
	triggerButton,
	children,
}: CreateAssignmentModalProps) {
	return (
		<Modal>
			{triggerButton}
			<Modal.Backdrop variant="transparent">
				<Modal.Container size="md">
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading className="text-gray-900 dark:text-white">
								課題の作成
							</Modal.Heading>
						</Modal.Header>
						<Modal.Body>{children}</Modal.Body>
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
}
