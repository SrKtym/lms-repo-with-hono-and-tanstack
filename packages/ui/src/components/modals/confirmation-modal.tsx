import { Modal } from "@heroui/react";
import { CancelButton, DefaultButton } from "../button";

interface ConfirmationModalProps {
	triggerButton: React.ReactNode;
	onConfirm?: () => void;
	title: string;
	children: React.ReactNode;
}

// Confirmation modal
export function ConfirmationModal({
	triggerButton,
	onConfirm,
	title,
	children,
}: ConfirmationModalProps) {
	return (
		<Modal>
			{triggerButton}
			<Modal.Backdrop variant="transparent">
				<Modal.Container size="lg">
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading>{title}</Modal.Heading>
						</Modal.Header>
						<Modal.Body>{children}</Modal.Body>
						<Modal.Footer>
							<div className="flex justify-end gap-2">
								<CancelButton slot="close">キャンセル</CancelButton>
								<DefaultButton onPress={onConfirm}>確定</DefaultButton>
							</div>
						</Modal.Footer>
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
}
