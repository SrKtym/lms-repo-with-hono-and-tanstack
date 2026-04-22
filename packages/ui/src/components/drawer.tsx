import { Drawer } from "@heroui/react";
import { CancelButton } from "./button";
import { CustomPagination } from "./pagination";
import { DataTable } from "./table";

export function CourseDrawer({
	triggerButton,
}: {
	triggerButton: React.ReactNode;
}) {
	return (
		<Drawer>
			{triggerButton}
			<Drawer.Backdrop variant="transparent">
				<Drawer.Content placement="right">
					<Drawer.Dialog className="w-full bg-white/90 backdrop-blur-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl dark:bg-gray-800/90">
						<Drawer.Header>
							<Drawer.Heading>講義一覧</Drawer.Heading>
						</Drawer.Header>
						<Drawer.Body>
							<DataTable columns={[]} rows={[]}>
								<CustomPagination />
							</DataTable>
						</Drawer.Body>
						<Drawer.Footer>
							<CancelButton slot="close">閉じる</CancelButton>
						</Drawer.Footer>
					</Drawer.Dialog>
				</Drawer.Content>
			</Drawer.Backdrop>
		</Drawer>
	);
}
