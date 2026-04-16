import { Modal } from "@heroui/react";

interface CreateAnnouncementModalProps {
	triggerButton: React.ReactNode;
	onCreateAnnouncement: (announcement: {
		title: string;
		content: string;
	}) => void;
}

export function CreateAnnouncementModal({
	triggerButton,
	onCreateAnnouncement,
}: CreateAnnouncementModalProps) {
	return (
		<Modal>
			{triggerButton}
			<Modal.Backdrop variant="transparent">
				<Modal.Container size="md">
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading className="text-gray-900 dark:text-white">
								お知らせの作成
							</Modal.Heading>
						</Modal.Header>
						<Modal.Body>
							{/* Form fields for title and content */}
							{/* On submit, call onCreateAnnouncement with the form data */}
						</Modal.Body>
						<Modal.Footer>
							{/* Submit button to create announcement */}
						</Modal.Footer>
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
}
