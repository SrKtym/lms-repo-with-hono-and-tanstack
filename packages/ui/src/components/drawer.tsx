import { Drawer } from "@heroui/react";
import { CancelButton } from "./button";

interface Column {
	id: string;
	name: string;
}

interface CourseDrawerProps {
	triggerButton: React.ReactNode;
	columns: Column[];
	rows: any[];
}

export function CourseDrawer({
	triggerButton,
	columns,
	rows,
}: CourseDrawerProps) {
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
							<div className="space-y-4">
								<div className="overflow-x-auto">
									<table className="w-full border-collapse">
										<thead>
											<tr>
												{columns.map((column) => (
													<th
														key={column.id}
														className="border border-gray-300 bg-gray-50 p-2 text-left font-medium text-sm dark:border-gray-600 dark:bg-gray-800"
													>
														{column.name}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{rows.map((row) => (
												<tr
													key={row.id}
													className="hover:bg-gray-50 dark:hover:bg-gray-700"
												>
													{columns.map((column) => (
														<td
															key={column.id}
															className="border border-gray-300 p-2 text-sm dark:border-gray-600"
														>
															{row[column.id]}
														</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
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
