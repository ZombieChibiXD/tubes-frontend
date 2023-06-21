import type { MachiningProject, ToolMaterial } from "$lib/types/global";

export const ToolMaterialWithProductWithItem : ToolMaterial[] = [
	{
		id: 1,
		name: 'Sample Material 1',
		description: 'Karbida is a material used for tools',
		created_at: '2021-10-01T00:00:00.000000Z',
		updated_at: '2023-06-20T20:32:50.000000Z',
		products: [
			{
				id: 1,
				code: 'WNGM 080408 NM LT 1025',
				name: null,
				min_cutting_speed: 165,
				max_cutting_speed: 280,
				created_at: '2021-10-01T00:00:00.000000Z',
				updated_at: '2021-10-01T00:00:00.000000Z',
				pivot: {
					tool_material_id: 1,
					tool_product_id: 1,
					id: 1,
					created_at: '2021-10-01T00:00:00.000000Z',
					updated_at: '2021-10-01T00:00:00.000000Z'
				},
				items: [
					{
						id: 1,
						tool_product_id: 1,
						item_code: 1,
						created_at: '2021-10-01T00:00:00.000000Z',
						updated_at: '2021-10-01T00:00:00.000000Z'
					},
					{
						id: 3,
						tool_product_id: 1,
						item_code: 2,
						created_at: '2021-10-01T00:00:00.000000Z',
						updated_at: '2021-10-01T00:00:00.000000Z'
					}
				]
			},
			{
				id: 2,
				code: 'WNGM 080408 NM LT 1000',
				name: null,
				min_cutting_speed: 180,
				max_cutting_speed: 245,
				created_at: '2021-10-01T00:00:00.000000Z',
				updated_at: '2021-10-01T00:00:00.000000Z',
				pivot: {
					tool_material_id: 1,
					tool_product_id: 2,
					id: 2,
					created_at: '2021-10-01T00:00:00.000000Z',
					updated_at: '2021-10-01T00:00:00.000000Z'
				},
				items: []
			}
		]
	},
	{
		id: 2,
		name: 'Sample Tool Material 2',
		description: 'Karbida is a material used for tools',
		created_at: '2023-06-20T20:20:50.000000Z',
		updated_at: '2023-06-20T20:20:50.000000Z',
		products: []
	}
];

export const MachiningProjects : MachiningProject[] = [
	{
		id: 1,
		tool_material_id: 1,
		tool_product_id: 1,
		tool_item_id: 1,
		workpiece_material: 'AISI 1018',
		machining_process: 'Roughing',
		cutting_speed: 165,
		depth_of_cut: 0.25,
		feeding: 0.25,
		early_tool_life: 60,
		is_active: true,
		created_at: '2021-10-01T00:00:00.000000Z',
		updated_at: '2021-10-01T00:00:00.000000Z'
	},
	{
		id: 2,
		tool_material_id: 1,
		tool_product_id: 2,
		tool_item_id: 2,
		workpiece_material: 'AISI 1020',
		machining_process: 'Roughing',
		cutting_speed: 165,
		depth_of_cut: 0.25,
		feeding: 0.25,
		early_tool_life: 60,
		is_active: false,
		created_at: '2021-10-01T00:00:00.000000Z',
		updated_at: '2021-10-01T00:00:00.000000Z'
	}
];

export const WorkpieceMaterials = [
    'AISI 1018',
    'AISI 1020',
];

export const MachiningProcesses = [
	'Roughing',
];

export const MachiningN = 0.25;
export const MachiningC = 700;